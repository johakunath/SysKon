import { describe, it, expect } from 'vitest'
import { berechne } from '../src/logic/engine.js'
import { ANNAHMEN } from '../src/data/annahmen.js'
import { annuitaetenfaktor, contractingPreise } from '../src/logic/pricing.js'
import { PRESETS } from '../src/data/presets.js'

// Eine grüne Referenzkonfiguration aus den Presets als Basis.
const referenz = PRESETS.find(p => p.eingaben?.technologiepfad === 'hybrid')?.eingaben
  ?? { technologiepfad: 'hybrid', flaeche: '1000', sanierungsstand: 'teilsaniert', ww_enthalten: 'ja' }

describe('Pricing / Contracting (WP8)', () => {
  it('Annuitätenfaktor: Zinssatz 0 verteilt linear, sonst > 1/n', () => {
    expect(annuitaetenfaktor(0, 10)).toBeCloseTo(0.1, 6)
    expect(annuitaetenfaktor(0.06, 15)).toBeGreaterThan(1 / 15)
    expect(annuitaetenfaktor(0.06, 0)).toBe(0)
  })

  it('Grundpreis = Kapitaldienst + OPEX, ohne Marge; Annuität trägt keine Marge', () => {
    const r = berechne(referenz)
    const p = r.pricing
    const af = annuitaetenfaktor(ANNAHMEN.kapitalkostensatz, p.laufzeit)
    expect(p.kapitaldienstPa).toBeCloseTo(p.capex * af, 4)
    expect(p.grundpreisPa).toBeCloseTo(p.kapitaldienstPa + p.opexPa, 4)
  })

  it('Arbeitspreis = variable Energiekosten/MWh × (1 + AP-Marge)', () => {
    const r = berechne(referenz)
    const p = r.pricing
    if (p.variabelProMwh != null) {
      expect(p.arbeitspreisMwh).toBeCloseTo(p.variabelProMwh * (1 + ANNAHMEN.ap_marge), 4)
      expect(p.arbeitspreisMwh).toBeGreaterThan(p.variabelProMwh)
    }
  })

  it('Preisgleitformel-Gewichte summieren zu 1', () => {
    const r = berechne(referenz)
    expect(r.kundenScope.contracting.preisgleitformel.gewichtSumme).toBe(1)
  })

  it('längere Laufzeit senkt den Grundpreis', () => {
    const kurz = berechne({ ...referenz, vertragslaufzeit: '10' }).pricing.grundpreisPa
    const lang = berechne({ ...referenz, vertragslaufzeit: '20' }).pricing.grundpreisPa
    expect(lang).toBeLessThan(kurz)
  })

  it('leere Laufzeit fällt auf den Default zurück', () => {
    expect(berechne(referenz).pricing.laufzeit).toBe(ANNAHMEN.vertragslaufzeit_default)
    expect(berechne({ ...referenz, vertragslaufzeit: '20' }).pricing.laufzeit).toBe(20)
  })

  it('Kundensicht trägt KEINE Commercial-Interna (Boundary-Guard)', () => {
    const c = berechne(referenz).kundenScope.contracting
    const flach = JSON.stringify(c).toLowerCase()
    for (const key of ['marge', 'capex', 'irr', 'rendite', 'einkauf']) {
      expect(flach, `kundenScope.contracting darf "${key}" nicht enthalten`).not.toContain(key)
    }
    // Positiv: kundensichere Felder sind vorhanden.
    expect(c).toEqual(expect.objectContaining({
      grundpreis_pa: expect.any(Number),
      grundpreis_monat: expect.any(Number),
      laufzeit: expect.any(Number),
      preisgleitformel: expect.any(Object),
      vertragsparameter: expect.any(Object),
      enthalteneServices: expect.any(Array),
    }))
  })

  it('bleibt robust ohne ableitbaren Wärmebedarf (AP/variabel = null)', () => {
    const res = contractingPreise({
      lv: { netto: 0 }, opex: { summe_pa: 0 }, energie: null,
      derived: { waermebedarf_mwh: null }, eingaben: {}, annahmen: ANNAHMEN,
    })
    expect(res.kunde.arbeitspreis_mwh).toBeNull()
    expect(res.intern.zielrenditeIndikation).toBeNull()
    expect(res.kunde.grundpreis_pa).toBe(0)
  })
})
