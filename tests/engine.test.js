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
