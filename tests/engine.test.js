// Isolierte Unit-Tests für Engine-Mechanik (SK-19).
// Integration gegen echte Presets: tests/presets.test.js.

import { describe, it, expect } from 'vitest'
import { berechne, dqScore, pruefeBedingung, STATUS_ORDER } from '../src/logic/engine.js'

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
    expect(erg.statusKorridor.titel).toBe('Kein Standardfit im MVP')
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
            kosten: { typ: 'fix', annahme: 'k_install' }, foerder: 'f_install', tag: 'capex',
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
    expect(erg.derived.aufstellung_empfohlen).toBe('fundament')
    expect(erg.derived.aufstellung_abweichung).toMatchObject({
      gewaehlt: 'einhausung',
      empfohlen: 'fundament',
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
    expect(erg.derived.aufstellung_empfohlen).toBe('fundament')
    expect(erg.derived.aufstellung_viable.map(v => v.variante)).toEqual(['fundament'])
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
})
