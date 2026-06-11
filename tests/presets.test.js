// Validierung der Regel-Engine gegen die 4 Testfälle (HANDOVER §6/§17)
// und den Demo-Referenzfall (§3.3). Pflicht nach jeder Logik-/Datenänderung.

import { describe, it, expect } from 'vitest'
import { berechne } from '../src/logic/engine.js'
import { PRESETS } from '../src/data/presets.js'

const lauf = (id) => berechne(PRESETS.find(p => p.id === id).eingaben)

describe('Presets gegen HANDOVER-Erwartungen', () => {
  it('alle Presets liefern den erwarteten Status', () => {
    for (const p of PRESETS) {
      const erg = berechne(p.eingaben)
      expect(erg.status, `${p.id}: ${p.erwartung.hinweis}`).toBe(p.erwartung.status)
    }
  })

  it('Referenzfall: 4 × 20-kW-Module, Schall grün, DQ hoch, Speicher/WW erzwungen', () => {
    const erg = lauf('referenz')
    expect(erg.derived.wp_module).toBe(4)
    expect(erg.derived.wp_kw).toBe(80)
    expect(erg.derived.schall_ampel_aktiv).toBe('gruen')
    expect(erg.dq).toBeGreaterThanOrEqual(90)
    expect(erg.required).toContain('speicher_ww')
    expect(erg.lv.positionen.some(p => p.id === 'speicher_ww_modul')).toBe(true)
    expect(erg.lv.netto).toBeGreaterThan(0)
    expect(erg.lv.foerderung).toBeGreaterThan(0)
  })

  it('Testfall 1: gelb, Einhausung möglich, Kessel- und Netzprüfung (R01, R08)', () => {
    const erg = lauf('tf1')
    expect(erg.status).toBe('gelb')
    expect(erg.excluded.aufstellvariante ?? []).not.toContain('einhausung')
    expect(erg.warnungen.map(w => w.regelId)).toContain('R01')
    expect(erg.warnungen.map(w => w.regelId)).toContain('R08')
    expect(erg.derived.schall_ampel_aktiv).toBe('gruen')
  })

  it('Testfall 2: Kompakt-Container nicht gesperrt, entlastet engen Heizraum (R15 greift nicht)', () => {
    const erg = lauf('tf2')
    expect(erg.status).toBe('gelb')
    expect(erg.excluded.aufstellvariante ?? []).not.toContain('kompakt_container')
    expect(erg.gefeuert).not.toContain('R15')
    expect(erg.lv.positionen.some(p => p.id === 'aufst_kompakt')).toBe(true)
  })

  it('Testfall 3: orange (Engineering), Container gesperrt, DQ unter 60 %', () => {
    const erg = lauf('tf3')
    expect(erg.status).toBe('orange')
    expect(erg.dq).toBeLessThan(60)
    expect(erg.excluded.aufstellvariante).toContain('kompakt_container')
    expect(erg.excluded.aufstellvariante).toContain('vollcontainer')
    expect(erg.gefeuert).toContain('R06')
    expect(erg.gefeuert).toContain('R10')
    expect(erg.gefeuert).toContain('R15')
  })

  it('Testfall 4: rot wegen mehr als zwei Heizkreisen (R04)', () => {
    const erg = lauf('tf4')
    expect(erg.status).toBe('rot')
    expect(erg.statusQuellen.some(q => q.regelId === 'R04' && q.wert === 'rot')).toBe(true)
  })

  it('unbeantworteter Technologiepfad ist nicht rot (R17 feuert nur bei Antwort)', () => {
    const eingaben = { ...PRESETS.find(p => p.id === 'referenz').eingaben }
    delete eingaben.technologiepfad
    const erg = berechne(eingaben)
    expect(erg.gefeuert).not.toContain('R17')
    expect(erg.status).not.toBe('rot')
    // aber: explizit gewählter Pfad außerhalb MVP bleibt rot
    const rot = berechne({ ...eingaben, technologiepfad: 'monoenergetisch' })
    expect(rot.gefeuert).toContain('R17')
    expect(rot.status).toBe('rot')
  })

  it('Engine-Mechanik: exclude schlägt require, Status nimmt schlechteste Stufe', () => {
    const erg = lauf('tf3')
    // R11 (grün) feuert nicht, schlechtere Stufen dominieren
    expect(erg.statusQuellen.every(q => q.regelId !== 'R11')).toBe(true)
    // Förderlogik: fossile Einheit mit 0 % Förderanteil im LV
    const fossil = lauf('referenz').lv.positionen.find(p => p.id === 'fossil_bestand')
    expect(fossil.foerderanteil).toBe(0)
  })
})
