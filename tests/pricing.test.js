import { describe, it, expect } from 'vitest'
import { berechne } from '../src/logic/engine.js'
import { ANNAHMEN } from '../src/data/annahmen.js'
import {
  annuitaetenfaktor, contractingPreise, irr, kapitalwert,
  loeseApMargeFuerIrr, preisgleitformelBauen, preisgleitWert, EFFIZIENZRISIKO_TEXT,
} from '../src/logic/pricing.js'
import { PRESETS } from '../src/data/presets.js'

const referenz = PRESETS.find(p => p.eingaben?.technologiepfad === 'hybrid')?.eingaben
  ?? { technologiepfad: 'hybrid', flaeche: '1000', sanierungsstand: 'teilsaniert', ww_enthalten: 'ja' }

describe('Pricing / Contracting (WP8)', () => {
  it('Annuitätenfaktor: Zinssatz 0 verteilt linear, sonst > 1/n', () => {
    expect(annuitaetenfaktor(0, 10)).toBeCloseTo(0.1, 6)
    expect(annuitaetenfaktor(0.06, 15)).toBeGreaterThan(1 / 15)
    expect(annuitaetenfaktor(0.06, 0)).toBe(0)
  })

  it('Grundpreis = Kapitaldienst + OPEX, ohne Marge', () => {
    const p = berechne(referenz).pricing
    const af = annuitaetenfaktor(ANNAHMEN.kapitalkostensatz, p.laufzeit)
    expect(p.kapitaldienstPa).toBeCloseTo(p.capex * af, 4)
    expect(p.grundpreisPa).toBeCloseTo(p.kapitaldienstPa + p.opexPa, 4)
  })

  it('IRR: Kapitalwert bei IRR ist ~0; Annuität reproduziert ihren Zinssatz', () => {
    const cf = [-1000, 300, 300, 300, 300]
    const r = irr(cf)
    expect(kapitalwert(r, cf)).toBeCloseTo(0, 4)
    // Eine Zahlung CF = capex·AF(i,n) ergibt IRR = i.
    const n = 15, i = 0.08
    const zahlung = 1000 * annuitaetenfaktor(i, n)
    expect(irr([-1000, ...Array(n).fill(zahlung)])).toBeCloseTo(i, 4)
  })

  it('AP-Marge wird iterativ auf die Ziel-IRR gelöst (erreichte IRR ≈ Ziel)', () => {
    const p = berechne(referenz).pricing
    expect(p.margeGedeckelt).toBe(false)
    expect(p.erreichteIrr).toBeCloseTo(ANNAHMEN.ziel_irr, 3)
    // Arbeitspreis nutzt die gelöste (effektive) Marge, nicht den Fallback.
    expect(p.arbeitspreisMwh).toBeCloseTo(p.variabelProMwh * (1 + p.effektiveMarge), 4)
    // Höhere Ziel-IRR (Ambition) braucht eine höhere Marge.
    expect(p.margeAmbition).toBeGreaterThan(p.margeZiel)
  })

  it('loeseApMargeFuerIrr meldet bereitsErreicht, wenn Ziel-IRR ≤ Kapitalkostensatz', () => {
    const args = { capex: 100000, kapitaldienstPa: 100000 * annuitaetenfaktor(0.06, 15), variableKostenPa: 10000, laufzeit: 15 }
    expect(loeseApMargeFuerIrr({ ...args, zielIrr: 0.05 }).bereitsErreicht).toBe(true)
    expect(loeseApMargeFuerIrr({ ...args, zielIrr: 0.13 }).marge).toBeGreaterThan(0)
    // Ohne variable Kosten ist keine Lösung möglich.
    expect(loeseApMargeFuerIrr({ ...args, variableKostenPa: 0, zielIrr: 0.13 })).toBeNull()
  })

  it('Preisgleitformel: Festanteil + Index-Gewichte summieren zu 1', () => {
    const f = preisgleitformelBauen(ANNAHMEN)
    expect(f.gewichtSumme).toBe(1)
    expect(f.festanteil).toBe(ANNAHMEN.pg_fest)
    expect(berechne(referenz).kundenScope.contracting.preisgleitformel.gewichtSumme).toBe(1)
  })

  it('preisgleitWert: Basisjahr ⇒ Faktor 1; höhere Indizes ⇒ Faktor > 1', () => {
    const f = preisgleitformelBauen(ANNAHMEN)
    expect(preisgleitWert(f)).toBeCloseTo(1, 6)
    expect(preisgleitWert(f, { lohn: 110, strom: 120, gas: 115, invest: 105 })).toBeGreaterThan(1)
  })

  it('Effizienzrisiko ist parameterisiert (Default Techem)', () => {
    const def = berechne(referenz).kundenScope.contracting.vertragsparameter.effizienzrisiko
    expect(def).toBe(EFFIZIENZRISIKO_TEXT.techem)
    const kunde = berechne({ ...referenz, effizienzrisiko: 'kunde' }).kundenScope.contracting.vertragsparameter.effizienzrisiko
    expect(kunde).toBe(EFFIZIENZRISIKO_TEXT.kunde)
  })

  it('längere Laufzeit senkt den Grundpreis; leere Laufzeit fällt auf Default', () => {
    const kurz = berechne({ ...referenz, vertragslaufzeit: '10' }).pricing.grundpreisPa
    const lang = berechne({ ...referenz, vertragslaufzeit: '20' }).pricing.grundpreisPa
    expect(lang).toBeLessThan(kurz)
    expect(berechne(referenz).pricing.laufzeit).toBe(ANNAHMEN.vertragslaufzeit_default)
  })

  it('Kundensicht trägt KEINE Commercial-Interna (Boundary-Guard)', () => {
    const c = berechne(referenz).kundenScope.contracting
    const flach = JSON.stringify(c).toLowerCase()
    for (const key of ['marge', 'capex', 'irr', 'rendite', 'einkauf']) {
      expect(flach, `kundenScope.contracting darf "${key}" nicht enthalten`).not.toContain(key)
    }
    expect(c).toEqual(expect.objectContaining({
      grundpreis_pa: expect.any(Number),
      grundpreis_monat: expect.any(Number),
      laufzeit: expect.any(Number),
      preisgleitformel: expect.any(Object),
      vertragsparameter: expect.any(Object),
      enthalteneServices: expect.any(Array),
    }))
  })

  it('bleibt robust ohne ableitbaren Wärmebedarf (AP/IRR = null)', () => {
    const res = contractingPreise({
      lv: { netto: 0 }, opex: { summe_pa: 0 }, energie: null,
      derived: { waermebedarf_mwh: null }, eingaben: {}, annahmen: ANNAHMEN,
    })
    expect(res.kunde.arbeitspreis_mwh).toBeNull()
    expect(res.intern.erreichteIrr).toBeNull()
    expect(res.intern.effektiveMarge).toBe(ANNAHMEN.ap_marge)
    expect(res.kunde.grundpreis_pa).toBe(0)
  })
})
