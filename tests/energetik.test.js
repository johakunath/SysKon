// Tests für die Folge-PR der Energetik-/Architektur-Review-Empfehlungen
// (C1 WP-Volllaststunden, C2 JAZ je VL-Klasse, C4 Sensitivität, A6 LV-Gruppierung).

import { describe, it, expect } from 'vitest'
import { berechne } from '../src/logic/engine.js'
import { ANNAHMEN } from '../src/data/annahmen.js'
import { PRESETS } from '../src/data/presets.js'
import { resolveJaz } from '../src/logic/calc.js'
import { gruppiereNachGruppe } from '../src/logic/lv.js'

const base = PRESETS.find(p => p.id === 'referenz').eingaben

describe('C2: JAZ je Vorlauftemperatur-Klasse', () => {
  it('niedrigere VL-Temperatur ⇒ höhere JAZ ⇒ weniger WP-Strom', () => {
    const kalt = berechne({ ...base, vorlauftemp_klasse: '<=45' }).energie
    const heiss = berechne({ ...base, vorlauftemp_klasse: '61-65' }).energie
    expect(kalt.jaz).toBeGreaterThan(heiss.jaz)
    expect(kalt.strom_mwh).toBeLessThan(heiss.strom_mwh)
  })

  it('56-60 bleibt 3,3 (Referenz unverändert); Unbekannt/fehlend fällt auf Fallback', () => {
    expect(resolveJaz(ANNAHMEN, '56-60')).toBe(3.3)
    expect(resolveJaz(ANNAHMEN, 'unbekannt')).toBe(ANNAHMEN.jaz)
    expect(resolveJaz(ANNAHMEN, undefined)).toBe(ANNAHMEN.jaz)
    expect(berechne(base).energie.jaz).toBe(3.3)
  })

  it('lehnt nicht-positive/leere JAZ-Overrides ab (kein Infinity)', () => {
    expect(resolveJaz({ jaz: 3.3, jaz_le45: 0 }, '<=45')).toBe(3.3)   // 0 → Fallback
    expect(resolveJaz({ jaz: 3.3, jaz_le45: -2 }, '<=45')).toBe(3.3)  // negativ → Fallback
    expect(resolveJaz({ jaz: 0 }, 'unbekannt')).toBe(3.3)            // Fallback selbst 0 → harter Default
    const e = berechne({ ...base, vorlauftemp_klasse: '<=45' }, { annahmen: { ...ANNAHMEN, jaz_le45: 0 } }).energie
    expect(Number.isFinite(e.strom_mwh)).toBe(true)
  })
})

describe('C1: WP-Volllaststunden', () => {
  it('werden abgeleitet und sind plausibel (> 0); jaz_effektiv gesetzt', () => {
    const d = berechne(base).derived
    expect(d.wp_volllaststunden).toBeGreaterThan(0)
    expect(d.jaz_effektiv).toBe(3.3)
  })
})

describe('C4: Sensitivität Energie-Split ↔ IRR', () => {
  it('liefert drei Szenarien; höhere WP-Deckung ⇒ niedrigere IRR (Basis-Marge fix)', () => {
    const s = berechne(base).pricing.sensitivitaet
    expect(s).toHaveLength(3)
    expect(s[1].basis).toBe(true)
    expect(s[0].deckungsanteil).toBeLessThan(s[2].deckungsanteil)
    expect(s[0].erreichteIrr).toBeGreaterThan(s[2].erreichteIrr)
  })
})

describe('A6: gruppiereNachGruppe', () => {
  it('ordnet nach LV_GRUPPEN und filtert leere Gruppen', () => {
    const g = gruppiereNachGruppe([
      { gruppe: 'Hydraulik', id: 'a' },
      { gruppe: 'Wärmepumpenpaket', id: 'b' },
    ])
    expect(g.map(x => x.name)).toEqual(['Wärmepumpenpaket', 'Hydraulik'])
    expect(g.every(x => x.positionen.length > 0)).toBe(true)
  })

  it('ergänzt extraGruppen am Ende der Reihenfolge', () => {
    const g = gruppiereNachGruppe(
      [{ gruppe: 'Service / Betrieb (p.a.)', id: 's' }],
      ['Service / Betrieb (p.a.)'],
    )
    expect(g).toHaveLength(1)
    expect(g[0].name).toBe('Service / Betrieb (p.a.)')
  })
})
