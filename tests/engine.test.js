// Isolierte Unit-Tests für Engine-Mechanik (SK-19).
// Integration gegen echte Presets: tests/presets.test.js.

import { describe, it, expect } from 'vitest'
import { berechne, dqScore, pruefeBedingung, STATUS_ORDER } from '../src/logic/engine.js'
import { PRESETS } from '../src/data/presets.js'
import { WP_PRODUKT_REFERENZ, STROMBESCHAFFUNG_MODELL, ANNAHMEN } from '../src/data/annahmen.js'
import { KATALOG } from '../src/data/katalog.js'
import { BERECHNUNGS_DOMAENEN, SERVICEGRENZE, AUFSTELLVARIANTEN, AUFSTELLUNG_VARIANTEN_MAPPING } from '../src/logic/calc.js'
import { QUELLENTYPEN, FELD_PROVENIENZ, VERTRAUEN_WERTE, AKTUALITAET_WERTE } from '../src/data/provenienz.js'
import { ALLE_FRAGEN } from '../src/data/fragen.js'
import { ARTIKEL } from '../src/data/artikel.js'

describe('pruefeBedingung', () => {
  it('!= trifft nicht bei undefiniert, null oder leerem Feld', () => {
    const b = { feld: 'x', op: '!=', wert: 'y' }
    expect(pruefeBedingung(b, {})).toBe(false)
    expect(pruefeBedingung(b, { x: undefined })).toBe(false)
    expect(pruefeBedingung(b, { x: null })).toBe(false)
    expect(pruefeBedingung(b, { x: '' })).toBe(false)
  })

  it('!= trifft bei gesetztem, abweichendem Wert', () => {
    expect(pruefeBedingung({ feld: 'x', op: '!=', wert: 'y' }, { x: 'z' })).toBe(true)
    expect(pruefeBedingung({ feld: 'x', op: '!=', wert: 'y' }, { x: 'y' })).toBe(false)
  })

  it('= vergleicht exakt', () => {
    expect(pruefeBedingung({ feld: 'x', op: '=', wert: 'a' }, { x: 'a' })).toBe(true)
    expect(pruefeBedingung({ feld: 'x', op: '=', wert: 'a' }, { x: 'b' })).toBe(false)
    expect(pruefeBedingung({ feld: 'x', op: '=', wert: 'a' }, {})).toBe(false)
  })

  it('Zahlenoperatoren (> >= < <=) vergleichen korrekt, trifft nicht bei leerem Feld', () => {
    expect(pruefeBedingung({ feld: 'n', op: '>', wert: 5 }, { n: 6 })).toBe(true)
    expect(pruefeBedingung({ feld: 'n', op: '>', wert: 5 }, { n: 5 })).toBe(false)
    expect(pruefeBedingung({ feld: 'n', op: '>=', wert: 5 }, { n: 5 })).toBe(true)
    expect(pruefeBedingung({ feld: 'n', op: '<', wert: 5 }, { n: 4 })).toBe(true)
    expect(pruefeBedingung({ feld: 'n', op: '<=', wert: 5 }, { n: 5 })).toBe(true)
    expect(pruefeBedingung({ feld: 'n', op: '>', wert: 5 }, {})).toBe(false)
  })

  it('in / nicht_in prüfen Array-Mitgliedschaft', () => {
    expect(pruefeBedingung({ feld: 'x', op: 'in', wert: ['a', 'b'] }, { x: 'a' })).toBe(true)
    expect(pruefeBedingung({ feld: 'x', op: 'in', wert: ['a', 'b'] }, { x: 'c' })).toBe(false)
    expect(pruefeBedingung({ feld: 'x', op: 'nicht_in', wert: ['a', 'b'] }, { x: 'c' })).toBe(true)
    expect(pruefeBedingung({ feld: 'x', op: 'nicht_in', wert: ['a', 'b'] }, { x: 'a' })).toBe(false)
  })

  it('und / oder verknüpfen Teilbedingungen', () => {
    const und = { und: [{ feld: 'a', op: '=', wert: '1' }, { feld: 'b', op: '=', wert: '2' }] }
    expect(pruefeBedingung(und, { a: '1', b: '2' })).toBe(true)
    expect(pruefeBedingung(und, { a: '1', b: 'x' })).toBe(false)

    const oder = { oder: [{ feld: 'a', op: '=', wert: '1' }, { feld: 'b', op: '=', wert: '2' }] }
    expect(pruefeBedingung(oder, { a: '1', b: 'x' })).toBe(true)
    expect(pruefeBedingung(oder, { a: 'x', b: 'x' })).toBe(false)
  })
})

describe('dqScore', () => {
  it('leere Eingaben → 0 %', () => {
    expect(dqScore({})).toBe(0)
  })

  it("'unbekannt' zählt nicht als beantwortet und liefert keine DQ-Punkte", () => {
    // ww_enthalten (dq: 2) mit 'unbekannt' darf jahresverbrauch-Punkte nicht erhöhen
    const ohne = { jahresverbrauch: 300 }
    const mitUnbekannt = { jahresverbrauch: 300, ww_enthalten: 'unbekannt' }
    expect(dqScore(ohne)).toBe(dqScore(mitUnbekannt))
  })

  it('mehr beantwortete Pflichtfelder → höherer Score', () => {
    const wenig = { gebaeudetyp: 'freistehend' }
    const mehr = { gebaeudetyp: 'freistehend', flaeche: 1000, jahresverbrauch: 200 }
    expect(dqScore(mehr)).toBeGreaterThan(dqScore(wenig))
  })

  it('Score liegt immer zwischen 0 und 100', () => {
    expect(dqScore({})).toBeGreaterThanOrEqual(0)
    expect(dqScore({ gebaeudetyp: 'freistehend', flaeche: 1000 })).toBeLessThanOrEqual(100)
  })

  it('ordnet Datenlage als Sales-Check mit priorisierten fehlenden Daten ein', () => {
    const erg = berechne({ gebaeudetyp: 'freistehend' })
    expect(erg.datenlage.stufe).toBe('duenn')
    expect(erg.datenlage.aktion).toContain('wichtigsten fehlenden Daten')
    expect(erg.datenlage.fehlendeFokusDaten.length).toBeGreaterThan(0)
    expect(erg.datenlage.fehlendeFokusDaten[0].dq).toBeGreaterThanOrEqual(erg.datenlage.fehlendeFokusDaten.at(-1).dq)
  })
})

describe('Status-Verschlechterung', () => {
  it('STATUS_ORDER ist aufsteigend: gruen < gelb < orange < rot', () => {
    expect(STATUS_ORDER.indexOf('gruen')).toBeLessThan(STATUS_ORDER.indexOf('gelb'))
    expect(STATUS_ORDER.indexOf('gelb')).toBeLessThan(STATUS_ORDER.indexOf('orange'))
    expect(STATUS_ORDER.indexOf('orange')).toBeLessThan(STATUS_ORDER.indexOf('rot'))
  })

  it('schlechteste Stufe mehrerer Regeln gewinnt', () => {
    const regeln = [
      { id: 'T1', wenn: { feld: 'a', op: '=', wert: 'x' }, dann: { typ: 'status', wert: 'gelb' }, begruendung: '' },
      { id: 'T2', wenn: { feld: 'b', op: '=', wert: 'y' }, dann: { typ: 'status', wert: 'orange' }, begruendung: '' },
    ]
    const erg = berechne({ a: 'x', b: 'y' }, { regeln, katalog: [] })
    expect(erg.status).toBe('orange')
    expect(erg.statusQuellen).toHaveLength(2)
  })

  it('Status verbessert sich nie – rot bleibt rot auch wenn grün-Regel feuert', () => {
    const regeln = [
      { id: 'T1', wenn: { feld: 'a', op: '=', wert: 'x' }, dann: { typ: 'status', wert: 'rot' }, begruendung: '' },
      { id: 'T2', wenn: { feld: 'b', op: '=', wert: 'y' }, dann: { typ: 'status', wert: 'gruen' }, begruendung: '' },
    ]
    const erg = berechne({ a: 'x', b: 'y' }, { regeln, katalog: [] })
    expect(erg.status).toBe('rot')
  })

  it('ohne Regeln ist Status gruen', () => {
    const erg = berechne({}, { regeln: [], katalog: [] })
    expect(erg.status).toBe('gruen')
  })

  it('liefert eine Gesprächskorridor-Semantik zum Status', () => {
    const erg = berechne({ anzahl_heizkreise: 4 })
    expect(erg.status).toBe('rot')
    expect(erg.statusKorridor.titel).toBe('Kein Standardfit')
    expect(erg.statusKorridor.aktion).toContain('Sonderfall')
  })
})

describe('Warnungen: Status-Annotation', () => {
  it('warn+status in einer Regel → Warnung erhält den korrelierten Status', () => {
    const regeln = [
      { id: 'T-WARN-ST', wenn: { feld: 'a', op: '=', wert: 'x' },
        dann: [
          { typ: 'warn', kategorie: 'engineering', text: 'Engineering erforderlich.' },
          { typ: 'status', wert: 'orange' },
        ], begruendung: '' },
    ]
    const erg = berechne({ a: 'x' }, { regeln, katalog: [] })
    expect(erg.warnungen).toHaveLength(1)
    expect(erg.warnungen[0].status).toBe('orange')
  })

  it('warn ohne korrelierte status-Regel → status ist null', () => {
    const regeln = [
      { id: 'T-WARN-ONLY', wenn: { feld: 'a', op: '=', wert: 'x' },
        dann: { typ: 'warn', kategorie: 'hinweis', text: 'Nur Hinweis.' }, begruendung: '' },
    ]
    const erg = berechne({ a: 'x' }, { regeln, katalog: [] })
    expect(erg.warnungen[0].status).toBeNull()
  })
})

describe('exclude > require', () => {
  it('exclude schlägt require beim selben Modul', () => {
    const regeln = [
      { id: 'R-REQ', wenn: { feld: 'a', op: '=', wert: 'x' },
        dann: { typ: 'require', modul: 'testmodul' }, begruendung: '' },
      { id: 'R-EXC', wenn: { feld: 'b', op: '=', wert: 'y' },
        dann: { typ: 'exclude', ziel: 'modul', wert: 'testmodul' }, begruendung: '' },
    ]
    const erg = berechne({ a: 'x', b: 'y' }, { regeln, katalog: [] })
    expect(erg.required).not.toContain('testmodul')
    expect(erg.konflikte.length).toBeGreaterThan(0)
  })

  it('exclude entfernt auch require-Kontext vor dem LV-Aufbau', () => {
    const regeln = [
      { id: 'R-REQ', wenn: { feld: 'a', op: '=', wert: 'x' },
        dann: { typ: 'require', modul: 'testmodul' }, begruendung: '' },
      { id: 'R-EXC', wenn: { feld: 'b', op: '=', wert: 'y' },
        dann: { typ: 'exclude', ziel: 'modul', wert: 'testmodul' }, begruendung: '' },
    ]
    const katalog = [
      { id: 'testmodul', pakettyp: 'Test', gruppe: 'Test',
        bedingung: { feld: 'require_testmodul', op: '=', wert: true },
        positionen: [
          { id: 'test_position', text: 'Konfliktposition', menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_hydraulik' }, foerder: 'f_install', tag: 'capex',
            begruendung: 'Darf bei exclude-Konflikt nicht im LV landen.' },
        ] },
    ]

    const erg = berechne({ a: 'x', b: 'y' }, { regeln, katalog })

    expect(erg.required).not.toContain('testmodul')
    expect(erg.lv.positionen.map(p => p.id)).not.toContain('test_position')
  })

  it('require ohne exclude bleibt in required', () => {
    const regeln = [
      { id: 'R-REQ', wenn: { feld: 'a', op: '=', wert: 'x' },
        dann: { typ: 'require', modul: 'testmodul' }, begruendung: '' },
    ]
    const erg = berechne({ a: 'x' }, { regeln, katalog: [] })
    expect(erg.required).toContain('testmodul')
    expect(erg.konflikte).toHaveLength(0)
  })
})

describe('Aufstellungs-Empfehlung', () => {
  const basis = {
    gebaeudetyp: 'freistehend',
    heizraum_vorhanden: 'ja',
    heizraum_groesse_ok: 'ja',
    zugang_ok: 'ja',
    aussenflaeche_vorhanden: 'ja',
    aussenflaeche_m2: 80,
    aussenflaeche_typ: 'hof',
    aussenflaeche_laenge_m: 12,
    aussenflaeche_breite_m: 5,
    zugang_logistik: 'einfach',
    platz_prioritaet: 'kosten_min',
    heizlast_bekannt: 'ja',
    heizlast_kw: 100,
    aufstellvariante: 'einhausung',
    abstand_fenster: 25,
    gebietstyp: 'WA',
  }

  it('empfiehlt standardmäßig die günstigste tragfähige Variante, ohne die Auswahl zu überschreiben', () => {
    const erg = berechne(basis)
    expect(erg.derived.aufstellung_empfohlen).toBe('aussen_offen')
    expect(erg.derived.aufstellung_abweichung).toMatchObject({
      gewaehlt: 'einhausung',
      empfohlen: 'aussen_offen',
      gewaehlt_viable: true,
    })
  })

  it('eskaliert bei Heizraumrestriktion auf die günstigste tragfähige Container-Variante', () => {
    const erg = berechne({
      ...basis,
      heizraum_groesse_ok: 'nein',
      platz_prioritaet: 'heizraum_entlasten',
      aufstellvariante: 'kompakt_container',
      kran_zugang: 'ja',
    })
    expect(erg.derived.aufstellung_empfohlen).toBe('kompakt_container')
    expect(erg.derived.aufstellung_viable.map(v => v.variante)).not.toContain('fundament')
  })

  it('berücksichtigt strukturierte Maße bei der Variantenempfehlung', () => {
    const erg = berechne({
      ...basis,
      aussenflaeche_m2: 20,
      aussenflaeche_laenge_m: 4,
      aussenflaeche_breite_m: 2.2,
      aufstellvariante: 'fundament',
    })
    // aussen_offen (flaecheMin 6, laengeMin 2.5, breiteMin 1.5) und fundament (flaecheMin 8, laengeMin 3, breiteMin 2)
    // sind beide tragfähig; einhausung (breiteMin 2.5 > 2.2) und Container (flaecheMin >= 30) fallen raus.
    expect(erg.derived.aufstellung_empfohlen).toBe('aussen_offen')
    expect(erg.derived.aufstellung_viable.map(v => v.variante)).toEqual(['aussen_offen', 'fundament'])
  })

  it('übernimmt Schall- und Flächensperren in den Placement-Korridor', () => {
    const erg = berechne({
      ...basis,
      aussenflaeche_m2: 20,
      aussenflaeche_laenge_m: 8,
      aussenflaeche_breite_m: 4,
    })
    expect(erg.excluded.aufstellvariante).toContain('kompakt_container')
    expect(erg.derived.aufstellung_viable.map(v => v.variante)).not.toContain('kompakt_container')
    expect(erg.derived.aufstellung_blockierte_varianten.kompakt_container).toEqual(
      expect.arrayContaining(['durch Schall- oder Flächenregel gesperrt'])
    )
  })

  it('eskaliert eine durch Placement-Maße blockierte gewählte Variante vor dem LV-Aufbau', () => {
    const erg = berechne({
      ...basis,
      aussenflaeche_m2: 50,
      aussenflaeche_laenge_m: 8,
      aussenflaeche_breite_m: 4,
      aufstellvariante: 'vollcontainer',
    })

    expect(STATUS_ORDER.indexOf(erg.status)).toBeGreaterThanOrEqual(STATUS_ORDER.indexOf('orange'))
    expect(erg.excluded.aufstellvariante).toContain('vollcontainer')
    expect(erg.warnungen).toEqual(expect.arrayContaining([
      expect.objectContaining({
        regelId: 'SYS',
        status: 'orange',
        text: expect.stringContaining('nutzbare Länge unter 10 m'),
      }),
    ]))
    expect(erg.derived.aufstellung_abweichung).toMatchObject({
      gewaehlt: 'vollcontainer',
      gewaehlt_viable: false,
    })
    expect(erg.lv.positionen.map(p => p.id)).not.toContain('aufst_voll')
  })
})

describe('KundenScope', () => {
  it('liefert einen kundenfähigen Umfang ohne interne Preisfelder', () => {
    const erg = berechne(PRESETS.find(p => p.id === 'referenz').eingaben)
    const scope = erg.kundenScope
    const positionen = scope.gruppen.flatMap(g => g.positionen)

    expect(scope.gruppen.length).toBeGreaterThan(0)
    expect(positionen.length).toBeGreaterThan(0)
    expect(positionen[0]).toEqual(expect.objectContaining({
      titel: expect.any(String),
      hersteller: expect.any(String),
      produkt: expect.any(String),
      leistungsklasse: expect.any(String),
      leistungsumfang: expect.any(String),
    }))
    for (const position of positionen) {
      expect(Object.keys(position)).not.toEqual(expect.arrayContaining(['einzel', 'betrag', 'foerderanteil']))
    }
    expect(JSON.stringify(scope)).not.toMatch(/€|CAPEX|Netto|Brutto|Förderung|Marge/)
  })

  it('führt Annahmen, Ausschlüsse und offene Punkte als Kundensicht-Struktur', () => {
    const erg = berechne({
      ...PRESETS.find(p => p.id === 'tf3').eingaben,
      aussenflaeche_m2: 20,
    })

    expect(erg.kundenScope.annahmen.length).toBeGreaterThan(0)
    expect(erg.kundenScope.ausschluesse.length).toBeGreaterThan(0)
    expect(erg.kundenScope.offenePunkte.length).toBeGreaterThan(0)
    expect(erg.kundenScope.ausschluesse[0]).toEqual(expect.objectContaining({
      titel: expect.any(String),
      text: expect.any(String),
    }))
  })
})

describe('WP12: Mehr-Gebäude-Blocker (R19)', () => {
  const referenz = PRESETS.find(p => p.id === 'referenz').eingaben

  it('mehr als ein Gebäude ist rot mit Sales-sicherem Hinweis (R19)', () => {
    const erg = berechne({ ...referenz, anzahl_gebaeude: 2 })
    expect(erg.status).toBe('rot')
    expect(erg.statusQuellen.some(q => q.regelId === 'R19' && q.wert === 'rot')).toBe(true)
    expect(erg.warnungen.map(w => w.regelId)).toContain('R19')
  })

  it('ein Gebäude oder leeres Feld feuert R19 nicht', () => {
    expect(berechne({ ...referenz, anzahl_gebaeude: 1 }).gefeuert).not.toContain('R19')
    expect(berechne(referenz).gefeuert).not.toContain('R19')
  })
})

describe('WP12: Vorlauftemperatur-Korridor (R09/R20/R21)', () => {
  const referenz = PRESETS.find(p => p.id === 'referenz').eingaben

  it('56–65 °C: Hinweis ohne Statusverschlechterung (R09)', () => {
    const basis = berechne({ ...referenz, vorlauftemp_klasse: '51-55' })
    const erg = berechne({ ...referenz, vorlauftemp_klasse: '61-65' })
    expect(erg.status).toBe(basis.status)
    const r09 = erg.warnungen.find(w => w.regelId === 'R09')
    expect(r09).toBeTruthy()
    expect(r09.status).toBeNull()
    expect(erg.statusQuellen.some(q => q.regelId === 'R09')).toBe(false)
  })

  it('66–70 °C: gelb mit interner Klärung statt Fachprüfung (R20)', () => {
    const erg = berechne({ ...referenz, vorlauftemp_klasse: '66-70' })
    expect(erg.gefeuert).toContain('R20')
    expect(erg.statusQuellen.some(q => q.regelId === 'R20' && q.wert === 'gelb')).toBe(true)
    expect(STATUS_ORDER.indexOf(erg.status)).toBeGreaterThanOrEqual(STATUS_ORDER.indexOf('gelb'))
  })

  it('über 70 °C: orange Fachprüfung (R21)', () => {
    const erg = berechne({ ...referenz, vorlauftemp_klasse: '>70' })
    expect(erg.gefeuert).toContain('R21')
    expect(erg.statusQuellen.some(q => q.regelId === 'R21' && q.wert === 'orange')).toBe(true)
    expect(STATUS_ORDER.indexOf(erg.status)).toBeGreaterThanOrEqual(STATUS_ORDER.indexOf('orange'))
  })
})

describe('WP12 SK-76: Hard-Blocker-Warnungen (R04/R16/R17)', () => {
  const referenz = PRESETS.find(p => p.id === 'referenz').eingaben

  it('R04: mehr als 2 Raumheizkreise → rot + Sales-sicherer Hinweis', () => {
    const erg = berechne({ ...referenz, anzahl_heizkreise: 3 })
    expect(erg.status).toBe('rot')
    expect(erg.statusQuellen.some(q => q.regelId === 'R04' && q.wert === 'rot')).toBe(true)
    expect(erg.warnungen.map(w => w.regelId)).toContain('R04')
  })

  it('R16: keine Außenfläche → rot + Sales-sicherer Hinweis', () => {
    const erg = berechne({ ...referenz, aussenflaeche_vorhanden: 'nein' })
    expect(erg.status).toBe('rot')
    expect(erg.statusQuellen.some(q => q.regelId === 'R16' && q.wert === 'rot')).toBe(true)
    expect(erg.warnungen.map(w => w.regelId)).toContain('R16')
  })

  it('R17: nicht-Hybrid → rot + Sales-sicherer Hinweis', () => {
    const erg = berechne({ ...referenz, technologiepfad: 'monoenergetisch' })
    expect(erg.status).toBe('rot')
    expect(erg.statusQuellen.some(q => q.regelId === 'R17' && q.wert === 'rot')).toBe(true)
    expect(erg.warnungen.map(w => w.regelId)).toContain('R17')
  })
})

describe('WP12 SK-78: FWS/Speicher-Varianten und Puffer-Sizing', () => {
  const basis = {
    ...PRESETS.find(p => p.id === 'referenz').eingaben,
    ww_bereitung: 'zentral',
  }

  it('ww_speicher_typ=speicher → LV enthält Brauchwasserspeicher (speicher_ww_modul)', () => {
    const erg = berechne({ ...basis, ww_speicher_typ: 'speicher' })
    expect(erg.lv.positionen.some(p => p.id === 'speicher_ww_modul')).toBe(true)
    expect(erg.lv.positionen.some(p => p.id === 'fws_modul')).toBe(false)
  })

  it('ww_speicher_typ=fws → LV enthält Frischwasserstation (fws_modul)', () => {
    const erg = berechne({ ...basis, ww_speicher_typ: 'fws' })
    expect(erg.lv.positionen.some(p => p.id === 'fws_modul')).toBe(true)
    expect(erg.lv.positionen.some(p => p.id === 'speicher_ww_modul')).toBe(false)
  })

  it('ww_speicher_typ=unbekannt → Fallback auf Speicher-Variante', () => {
    const erg = berechne({ ...basis, ww_speicher_typ: 'unbekannt' })
    expect(erg.lv.positionen.some(p => p.id === 'speicher_ww_modul')).toBe(true)
  })

  it('kein ww_speicher_typ → Fallback auf Speicher-Variante', () => {
    const { ww_speicher_typ: _, ...ohneTyp } = basis
    const erg = berechne(ohneTyp)
    expect(erg.lv.positionen.some(p => p.id === 'speicher_ww_modul')).toBe(true)
  })

  it('puffer_empfehlung_liter > 0 in abgeleiteten Feldern', () => {
    const erg = berechne(basis)
    expect(erg.derived.puffer_empfehlung_liter).toBeGreaterThan(0)
  })
})

describe('WP12 SK-77: WP-Produktstamm Referenz', () => {
  it('WP_PRODUKT_REFERENZ hat alle Pflichtfelder', () => {
    expect(WP_PRODUKT_REFERENZ).toBeDefined()
    expect(typeof WP_PRODUKT_REFERENZ.hersteller).toBe('string')
    expect(typeof WP_PRODUKT_REFERENZ.produktfamilie).toBe('string')
    expect(typeof WP_PRODUKT_REFERENZ.leistungsklasse_je_modul_kw).toBe('number')
    expect(WP_PRODUKT_REFERENZ.kaskade_min).toBeGreaterThanOrEqual(1)
    expect(WP_PRODUKT_REFERENZ.kaskade_max).toBeGreaterThanOrEqual(WP_PRODUKT_REFERENZ.kaskade_min)
    expect(typeof WP_PRODUKT_REFERENZ.cop_referenz_a2w35).toBe('number')
    expect(typeof WP_PRODUKT_REFERENZ.vorlauf_max_technisch_c).toBe('number')
    expect(typeof WP_PRODUKT_REFERENZ.aussentemp_min_c).toBe('number')
    expect(typeof WP_PRODUKT_REFERENZ.sizing_korridor).toBe('string')
  })

  it('wp_modul Katalog-Position hat Buderus/Dreammaker-Referenz', () => {
    const wp = KATALOG.find(p => p.id === 'wp')
    const pos = wp?.positionen.find(p => p.id === 'wp_modul')
    expect(pos).toBeDefined()
    expect(pos.kunde.hersteller).toContain('Buderus')
    expect(pos.kunde.produkt).toContain('Logatherm')
  })

  it('wp_modul kundenScope leistungsumfang enthält abgeleiteten Korridor aus Annahmen', () => {
    const { ANNAHMEN } = require('../src/data/annahmen.js')
    const referenz = PRESETS.find(p => p.id === 'referenz').eingaben
    const erg = berechne(referenz)
    const wpGruppe = erg.kundenScope.gruppen.find(g => g.name === 'Wärmepumpenpaket')
    const wpPos = wpGruppe?.positionen.find(p => p.id === 'wp_modul')
    expect(wpPos).toBeDefined()
    const expectedMax = `${ANNAHMEN.wp_module_max * ANNAHMEN.wp_modul_kw} kW`
    expect(wpPos.leistungsumfang).toContain(expectedMax)
    expect(wpPos.leistungsumfang).toContain(`${ANNAHMEN.wp_modul_kw} kW`)
  })

  it('Leistungsklasse stimmt mit ANNAHMEN.wp_modul_kw überein', async () => {
    const { ANNAHMEN } = await import('../src/data/annahmen.js')
    expect(WP_PRODUKT_REFERENZ.leistungsklasse_je_modul_kw).toBe(ANNAHMEN.wp_modul_kw)
    expect(WP_PRODUKT_REFERENZ.kaskade_max).toBe(ANNAHMEN.wp_module_max)
  })
})

describe('WP12 SK-81: Berechnungs- und Output-Grenzen', () => {
  const referenz = PRESETS.find(p => p.id === 'referenz').eingaben

  it('BERECHNUNGS_DOMAENEN hat die vier Domänen', () => {
    expect(BERECHNUNGS_DOMAENEN).toBeDefined()
    expect(Object.keys(BERECHNUNGS_DOMAENEN)).toEqual(
      expect.arrayContaining(['invest', 'cop_jaz', 'betriebsfuehrung', 'wartung_instandsetzung'])
    )
    for (const d of Object.values(BERECHNUNGS_DOMAENEN)) {
      expect(typeof d.beschreibung).toBe('string')
      expect(typeof d.quellen).toBe('string')
    }
  })

  it('SERVICEGRENZE ist definiert und enthält vor_heizkreisverteiler', () => {
    expect(SERVICEGRENZE).toBeDefined()
    expect(SERVICEGRENZE.typ).toBe('vor_heizkreisverteiler')
    expect(Array.isArray(SERVICEGRENZE.optionen)).toBe(true)
    expect(SERVICEGRENZE.optionen).toContain('vor_heizkreisverteiler')
  })

  it('opex-Positionen haben bereich-Feld (betriebsfuehrung oder wartung_instandsetzung)', () => {
    const erlaubte = new Set(['betriebsfuehrung', 'wartung_instandsetzung'])
    for (const paket of KATALOG) {
      const positionen = paket.positionen ?? paket.varianten?.flatMap(v => v.positionen) ?? []
      for (const pos of positionen) {
        if (pos.tag === 'opex') {
          expect(erlaubte.has(pos.bereich),
            `opex-Position "${pos.id}" hat kein gültiges bereich-Feld`).toBe(true)
        }
      }
    }
  })

  it('bereichsSummen in berechne()-Ergebnis', () => {
    const erg = berechne(referenz)
    expect(erg.bereichsSummen).toBeDefined()
    expect(typeof erg.bereichsSummen.invest).toBe('number')
    expect(typeof erg.bereichsSummen.betriebsfuehrung_pa).toBe('number')
    expect(typeof erg.bereichsSummen.wartung_instandsetzung_pa).toBe('number')
    expect(erg.bereichsSummen.invest).toBeGreaterThan(0)
  })

  it('bereichsSummen.betriebsfuehrung_pa + wartung_instandsetzung_pa ≈ opex.summe_pa', () => {
    const erg = berechne(referenz)
    const s = erg.bereichsSummen
    expect(s.betriebsfuehrung_pa + s.wartung_instandsetzung_pa).toBeCloseTo(erg.opex.summe_pa, 2)
  })

  it('kundenScope enthält keine interne Marge/CAPEX/IRR-Felder', () => {
    const erg = berechne(referenz)
    const scope = JSON.stringify(erg.kundenScope)
    expect(scope).not.toContain('marge')
    expect(scope).not.toContain('irr')
    expect(scope).not.toContain('brutto_lv')
  })
})

describe('WP12 SK-79: Aufstellung & Schallschutzkonzept', () => {
  const basis = {
    aussenflaeche_vorhanden: 'ja',
    aussenflaeche_m2: 40,
    aussenflaeche_laenge_m: 8,
    aussenflaeche_breite_m: 5,
    technologiepfad: 'hybrid',
    heizlast_bekannt: 'ja',
    heizlast_kw: 80,
    gebietstyp: 'WA',
    abstand_fenster: 20,
  }

  it('AUFSTELLVARIANTEN enthält aussen_offen', () => {
    expect(AUFSTELLVARIANTEN).toContain('aussen_offen')
    expect(AUFSTELLVARIANTEN[0]).toBe('aussen_offen')
    expect(AUFSTELLVARIANTEN).toHaveLength(5)
  })

  it('AUFSTELLUNG_VARIANTEN_MAPPING hat alle 5 Varianten mit Entscheidungsdokumentation', () => {
    expect(AUFSTELLUNG_VARIANTEN_MAPPING).toBeDefined()
    for (const v of AUFSTELLVARIANTEN) {
      expect(AUFSTELLUNG_VARIANTEN_MAPPING[v], `fehlend: ${v}`).toBeDefined()
      expect(typeof AUFSTELLUNG_VARIANTEN_MAPPING[v].roberts_draft).toBe('string')
      expect(typeof AUFSTELLUNG_VARIANTEN_MAPPING[v].entscheidung).toBe('string')
    }
  })

  it('aussen_offen Katalog-Position existiert und hat gültige kunde-Felder', () => {
    const paket = KATALOG.find(p => p.id === 'aufstellung')
    const variante = paket?.varianten.find(v => v.wert === 'aussen_offen')
    expect(variante).toBeDefined()
    const pos = variante.positionen[0]
    expect(pos.id).toBe('aufst_aussen_offen')
    expect(pos.tag).toBe('capex')
    expect(typeof pos.kunde.titel).toBe('string')
    expect(typeof pos.kunde.hersteller).toBe('string')
    expect(typeof pos.kunde.produkt).toBe('string')
    expect(typeof pos.kunde.leistungsumfang).toBe('string')
  })

  it('berechne() mit aussen_offen enthält aufst_aussen_offen im LV', () => {
    const erg = berechne({ ...basis, aufstellvariante: 'aussen_offen' })
    const posIds = erg.lv.positionen.map(p => p.id)
    expect(posIds).toContain('aufst_aussen_offen')
    expect(posIds).not.toContain('aufst_fundament')
  })

  it('Rockwool-Schallschutzzaun und ATEC-Schallberechnung sind als Katalog-Positionen vorhanden', () => {
    const ids = KATALOG.flatMap(p =>
      p.positionen?.map(pos => pos.id) ??
      p.varianten?.flatMap(v => v.positionen.map(pos => pos.id)) ?? []
    )
    expect(ids).toContain('schallschutzzaun_pos')
    expect(ids).toContain('atec_schall_pos')
  })

  it('ATEC und Rockwool-Zaun erscheinen im LV bei hoher Schallsensibilität + offener Aufstellung', () => {
    const erg = berechne({
      ...basis,
      aufstellvariante: 'aussen_offen',
      schallsensibilitaet: 'hoch',
    })
    const posIds = erg.lv.positionen.map(p => p.id)
    expect(posIds).toContain('atec_schall_pos')
    expect(posIds).toContain('schallschutzzaun_pos')
  })

  it('schall_je_variante enthält aussen_offen mit abschlag 0 (ohne Schallhaube)', () => {
    const erg = berechne({ ...basis, aufstellvariante: 'aussen_offen' })
    const je = erg.derived.schall_je_variante
    expect(je.aussen_offen).toBeDefined()
    expect(je.aussen_offen.abschlag).toBe(0)
    expect(typeof je.aussen_offen.lp).toBe('number')
  })
})

describe('WP12 SK-75: Datenquellen & Provenienzmodell', () => {
  const PFLICHT_FELDER = ['quelle', 'erfassungsweg', 'aktualitaet', 'vertrauen', 'skalierbar', 'kundenAnnahme', 'followUp']

  it('QUELLENTYPEN hat die 6 erwarteten Quellentypen', () => {
    const keys = Object.keys(QUELLENTYPEN)
    expect(keys).toContain('tes_abrechnung')
    expect(keys).toContain('asset_manager')
    expect(keys).toContain('stammdaten')
    expect(keys).toContain('kunde_manuell')
    expect(keys).toContain('sales_manuell')
    expect(keys).toContain('abschaetzung')
  })

  it('QUELLENTYPEN-Einträge haben label, beschreibung und skalierbar', () => {
    for (const [id, typ] of Object.entries(QUELLENTYPEN)) {
      expect(typeof typ.label, id).toBe('string')
      expect(typeof typ.beschreibung, id).toBe('string')
      expect(typeof typ.skalierbar, id).toBe('boolean')
    }
  })

  it('mindestens 3 skalierbare Quellentypen vorhanden', () => {
    const skalierbar = Object.values(QUELLENTYPEN).filter(t => t.skalierbar)
    expect(skalierbar.length).toBeGreaterThanOrEqual(3)
  })

  it('FELD_PROVENIENZ-Einträge haben alle Pflichtfelder', () => {
    for (const [id, eintrag] of Object.entries(FELD_PROVENIENZ)) {
      for (const feld of PFLICHT_FELDER) {
        expect(eintrag, `${id}.${feld}`).toHaveProperty(feld)
      }
    }
  })

  it('vertrauen-Werte sind nur hoch/mittel/niedrig', () => {
    for (const [id, eintrag] of Object.entries(FELD_PROVENIENZ)) {
      expect(VERTRAUEN_WERTE, `vertrauen ungültig: ${id}=${eintrag.vertrauen}`).toContain(eintrag.vertrauen)
    }
  })

  it('aktualitaet-Werte sind nur aktuell/historisch/einmalig/berechnet', () => {
    for (const [id, eintrag] of Object.entries(FELD_PROVENIENZ)) {
      expect(AKTUALITAET_WERTE, `aktualitaet ungültig: ${id}=${eintrag.aktualitaet}`).toContain(eintrag.aktualitaet)
    }
  })

  it('quelle-Werte referenzieren nur bekannte QUELLENTYPEN', () => {
    const gueltig = Object.keys(QUELLENTYPEN)
    for (const [id, eintrag] of Object.entries(FELD_PROVENIENZ)) {
      const quellen = Array.isArray(eintrag.quelle) ? eintrag.quelle : [eintrag.quelle]
      for (const q of quellen) {
        expect(gueltig, `unbekannte quelle in ${id}: ${q}`).toContain(q)
      }
    }
  })

  it('alle dq>0-Felder haben einen FELD_PROVENIENZ-Eintrag', () => {
    const dqFelder = ALLE_FRAGEN.filter(f => f.dq > 0).map(f => f.id)
    const fehlend = dqFelder.filter(id => !FELD_PROVENIENZ[id])
    expect(fehlend).toEqual([])
  })

  it('mindestens 15 Felder sind als skalierbar markiert', () => {
    const skalierbar = Object.values(FELD_PROVENIENZ).filter(e => e.skalierbar)
    expect(skalierbar.length).toBeGreaterThanOrEqual(15)
  })

  it('tes_abrechnung und asset_manager kommen als Zielquelle vor', () => {
    const ersteQuellen = Object.values(FELD_PROVENIENZ).map(e =>
      Array.isArray(e.quelle) ? e.quelle[0] : e.quelle
    )
    expect(ersteQuellen).toContain('tes_abrechnung')
    expect(ersteQuellen).toContain('asset_manager')
  })

  it('jahresverbrauch hat tes_abrechnung als Zielquelle mit hoch Vertrauen', () => {
    const e = FELD_PROVENIENZ.jahresverbrauch
    const erstQuelle = Array.isArray(e.quelle) ? e.quelle[0] : e.quelle
    expect(erstQuelle).toBe('tes_abrechnung')
    expect(e.vertrauen).toBe('hoch')
    expect(e.skalierbar).toBe(true)
  })

  it('sanierungsstand hat niedrig Vertrauen und einen followUp-Hinweis', () => {
    const e = FELD_PROVENIENZ.sanierungsstand
    expect(e.vertrauen).toBe('niedrig')
    expect(typeof e.followUp).toBe('string')
    expect(e.followUp.length).toBeGreaterThan(0)
  })
})

describe('WP12 SK-80: Messkonzept & Strombeschaffung', () => {
  it('KATALOG enthält ein Paket mit id messkonzept', () => {
    const paket = KATALOG.find(p => p.id === 'messkonzept')
    expect(paket).toBeDefined()
    expect(paket.gruppe).toBe('Messkonzept')
  })

  it('messkonzept_basis Position existiert im messkonzept-Paket (SK-102: Artikelpreis)', () => {
    const paket = KATALOG.find(p => p.id === 'messkonzept')
    const pos = paket.positionen.find(p => p.id === 'messkonzept_basis')
    expect(pos).toBeDefined()
    expect(pos.kosten.typ).toBe('artikel')
    expect(pos.kosten.artikel).toBe('GH-MK-Z2R')
    expect(pos.foerder).toBe('f_messkonzept')
    expect(pos.tag).toBe('capex')
  })

  it('Messkonzept-Zählerset ist als Artikel mit positivem Listenpreis gepflegt (SK-102)', () => {
    const artikel = ARTIKEL.find(a => a.artikelnummer === 'GH-MK-Z2R')
    expect(artikel).toBeDefined()
    expect(typeof artikel.listenpreis).toBe('number')
    expect(artikel.listenpreis).toBeGreaterThan(0)
  })

  it('ANNAHMEN.f_messkonzept ist 0 (kein BEG-Fördergegenstand)', () => {
    expect(ANNAHMEN.f_messkonzept).toBe(0)
  })

  it('STROMBESCHAFFUNG_MODELL hat alle Pflichtfelder', () => {
    expect(STROMBESCHAFFUNG_MODELL).toBeDefined()
    expect(STROMBESCHAFFUNG_MODELL.modell).toBe('wp_sondertarif')
    expect(STROMBESCHAFFUNG_MODELL.strompreis_annahme).toBe('strompreis_wp')
    expect(STROMBESCHAFFUNG_MODELL.preisgleitformel_anteil).toBe('pg_strom')
    expect(STROMBESCHAFFUNG_MODELL.messkonzept_voraussetzung).toBe('messkonzept_basis')
  })

  it('Engine-Output für Referenz-Preset enthält messkonzept_basis in lv.positionen', () => {
    const preset = PRESETS.find(p => p.id === 'referenz') ?? PRESETS[0]
    const result = berechne(preset.eingaben)
    const posIds = result.lv.positionen.map(p => p.id)
    expect(posIds).toContain('messkonzept_basis')
  })
})

describe('SK-102: Artikelpreise, Installations-Einzelpositionen & Anfahrt', () => {
  const referenz = PRESETS.find(p => p.id === 'referenz').eingaben

  it('Artikel-Position trägt VK als Einzelpreis und die Kalkulationsfelder', () => {
    const erg = berechne(referenz)
    const wp = erg.lv.positionen.find(p => p.id === 'wp_modul')
    expect(wp.artikel).toBeTruthy()
    expect(wp.artikel.artikelnummer).toBe('WT-WP20-R290')
    // Listenpreis − 30 % (Gruppe WP) = EK; × 18 % Aufschlag = VK
    expect(wp.einzel).toBeCloseTo(26600 * 0.7 * (1 + ANNAHMEN.vk_aufschlag_material), 4)
    expect(wp.artikel.ek).toBeCloseTo(26600 * 0.7, 4)
    expect(wp.betrag).toBeCloseTo(wp.einzel * erg.derived.wp_module, 4)
  })

  it('unbekannte Artikelnummer: 0 € und KAT-Warnung', () => {
    const katalog = [{
      id: 'test', pakettyp: 'Basis', gruppe: 'Test',
      positionen: [{ id: 'test_pos', text: 'Test', menge: 1, einheit: 'Stk',
        kosten: { typ: 'artikel', artikel: 'GIBT-ES-NICHT' }, foerder: 'f_wp', tag: 'capex' }],
    }]
    const erg = berechne({}, { regeln: [], katalog })
    const pos = erg.lv.positionen.find(p => p.id === 'test_pos')
    expect(pos.einzel).toBe(0)
    expect(erg.warnungen.some(w => w.regelId === 'KAT' && w.text.includes('GIBT-ES-NICHT'))).toBe(true)
  })

  it('Anfahrt: Menge = km gesamt, Einzelpreis = km-Satz + Stundensatz ÷ Geschwindigkeit', () => {
    const erg = berechne(referenz)
    const anfahrt = erg.lv.positionen.find(p => p.id === 'anfahrt')
    expect(anfahrt).toBeDefined()
    expect(anfahrt.menge).toBe(erg.derived.anfahrt_km_gesamt)
    expect(anfahrt.einzel).toBeCloseTo(
      ANNAHMEN.anfahrt_km_satz + ANNAHMEN.monteur_stundensatz / ANNAHMEN.anfahrt_geschwindigkeit_kmh, 6)
    expect(anfahrt.anfahrt.quelle).toBe('plz_demo')
    expect(anfahrt.anfahrt.partner).toContain('Nord')
  })

  it('Installations-Einzelpositionen ersetzen die Pauschale; WP-Montage skaliert je Modul', () => {
    const erg = berechne(referenz)
    const ids = erg.lv.positionen.map(p => p.id)
    for (const id of ['inst_baustelle', 'inst_wp_montage', 'inst_hydraulik', 'inst_elektro',
      'inst_kleinmaterial', 'inst_ibn', 'inst_doku', 'inst_projektierung', 'inst_einweisung', 'inst_vertrieb']) {
      expect(ids, id).toContain(id)
    }
    expect(ids).not.toContain('install_ibn')
    const montage = erg.lv.positionen.find(p => p.id === 'inst_wp_montage')
    expect(montage.menge).toBe(erg.derived.wp_module)
    expect(montage.betrag).toBeCloseTo(ANNAHMEN.k_inst_wp_montage_je_modul * erg.derived.wp_module, 4)
  })

  it('bedingte Demontagen: Öltank nur bei oeltank_vorhanden=ja, Kessel nur bei kessel_nutzbar=nein', () => {
    const ohne = berechne(referenz)
    expect(ohne.lv.positionen.some(p => p.id === 'inst_demontage_oeltank')).toBe(false)
    expect(ohne.lv.positionen.some(p => p.id === 'inst_demontage_gaskessel')).toBe(false)

    const mit = berechne({ ...referenz, oeltank_vorhanden: 'ja', kessel_nutzbar: 'nein' })
    const oeltank = mit.lv.positionen.find(p => p.id === 'inst_demontage_oeltank')
    expect(oeltank.betrag).toBe(ANNAHMEN.k_inst_demontage_oeltank)
    expect(mit.lv.positionen.some(p => p.id === 'inst_demontage_gaskessel')).toBe(true)
    expect(mit.lv.positionen.some(p => p.id === 'inst_demontage_abgas')).toBe(true)
  })

  it('Service-OpEx: Wartungsvertrag = Artikel-VK je WP-Modul × Modulanzahl', () => {
    const erg = berechne(referenz)
    const service = erg.opex.positionen.find(p => p.id === 'om_basis')
    expect(service.artikel.artikelnummer).toBe('WT-SV-BASIS')
    expect(service.menge).toBe(erg.derived.wp_module)
    // Listenpreis 1410 − 10 % (Gruppe SERVICE) = EK; × 18 % Aufschlag = VK
    expect(service.betrag).toBeCloseTo(1410 * 0.9 * (1 + ANNAHMEN.vk_aufschlag_material) * erg.derived.wp_module, 4)
  })

  it('ohne PLZ/Partner: Anfahrt über Fallback-Distanz, Position bleibt im LV', () => {
    const eingaben = { ...referenz }
    delete eingaben.projekt_plz
    delete eingaben.installationspartner
    const erg = berechne(eingaben)
    const anfahrt = erg.lv.positionen.find(p => p.id === 'anfahrt')
    expect(anfahrt.anfahrt.quelle).toBe('fallback')
    expect(anfahrt.menge).toBe(Math.round(ANNAHMEN.anfahrt_fallback_km * 2 * ANNAHMEN.anfahrt_fahrten))
  })

  it('Referenzfall: Installationsgruppe liegt nahe der früheren 60-k€-Pauschale', () => {
    const erg = berechne(referenz)
    const summe = erg.lv.positionen
      .filter(p => p.gruppe === 'Installation / Inbetriebnahme')
      .reduce((s, p) => s + p.betrag, 0)
    expect(summe).toBeGreaterThan(50000)
    expect(summe).toBeLessThan(75000)
  })
})
