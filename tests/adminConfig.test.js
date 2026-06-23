import { describe, it, expect } from 'vitest'
import {
  applyAdminConfig,
  makeDefaultAdminConfig,
  mergeWithDefaults,
  validateAdminConfig,
} from '../src/data/adminConfig.js'
import { berechne } from '../src/logic/engine.js'
import { PRESETS } from '../src/data/presets.js'

describe('Admin-Konfiguration', () => {
  it('liefert valide Demo-Defaults', () => {
    const config = makeDefaultAdminConfig()
    expect(validateAdminConfig(config)).toEqual([])
    expect(config).toEqual(expect.objectContaining({
      version: expect.any(Number),
      annahmen: expect.any(Object),
      fragen: expect.any(Object),
      katalog: expect.any(Object),
      governance: expect.any(Object),
    }))
  })

  it('weist nicht-finite Annahmen ab', () => {
    const config = makeDefaultAdminConfig()
    config.annahmen.wp_modul_kw = Number.NaN
    expect(validateAdminConfig(config).join(' ')).toContain('wp_modul_kw')
  })

  it('weist entfernte Frage- und Options-IDs ab', () => {
    const config = makeDefaultAdminConfig()
    delete config.fragen.gebaeudetyp
    delete config.fragen.technologiepfad.optionen.hybrid
    const errors = validateAdminConfig(config).join(' ')
    expect(errors).toContain('gebaeudetyp')
    expect(errors).toContain('technologiepfad.hybrid')
  })

  it('wendet Frage- und Options-Overrides auf das effektive Modell an', () => {
    const config = makeDefaultAdminConfig()
    config.fragen.gebaeudetyp.label = 'Welche Gebäudelage testet Admin?'
    config.fragen.gebaeudetyp.optionen.freistehend.hinweis = 'Admin-Hinweis sichtbar.'
    const effective = applyAdminConfig(config)
    const frage = effective.alleFragen.find(f => f.id === 'gebaeudetyp')

    expect(frage.label).toBe('Welche Gebäudelage testet Admin?')
    expect(frage.optionen.find(o => o.wert === 'freistehend').hinweis).toBe('Admin-Hinweis sichtbar.')
  })

  it('wendet Katalog-Kundendaten auf den Kundenumfang an', () => {
    const config = makeDefaultAdminConfig()
    config.katalog.wp.positionen.wp_modul.kunde.titel = 'Admin-WP-Kaskade'
    const effective = applyAdminConfig(config)
    const erg = berechne(PRESETS.find(p => p.id === 'referenz').eingaben, {
      annahmen: effective.annahmen,
      katalog: effective.katalog,
      fragen: effective.alleFragen,
    })

    expect(JSON.stringify(erg.kundenScope)).toContain('Admin-WP-Kaskade')
  })

  it('ergänzt alte oder partielle Imports mit Defaults', () => {
    const merged = mergeWithDefaults({ governance: { versionLabel: 'Import' } })
    expect(validateAdminConfig(merged)).toEqual([])
    expect(merged.governance.versionLabel).toBe('Import')
    expect(merged.fragen.gebaeudetyp.label).toEqual(expect.any(String))
  })

  it('importieren-Pfad: alte Konfig ohne neue Frage wird durch Merge migriert', () => {
    const old = makeDefaultAdminConfig()
    delete old.fragen.ww_speicher_typ
    const merged = mergeWithDefaults(old)
    expect(validateAdminConfig(merged)).toEqual([])
    expect(merged.fragen.ww_speicher_typ).toBeDefined()
  })
})
