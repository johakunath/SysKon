import { describe, it, expect } from 'vitest'
import { berechne } from '../src/logic/engine.js'
import { ANNAHMEN } from '../src/data/annahmen.js'
import { ARTIKEL, RABATTGRUPPEN } from '../src/data/artikel.js'
import { KOMPONENTEN } from '../src/data/komponenten.js'
import { komponenteGeeignet, komponentenAuswahl } from '../src/logic/komponenten.js'
import { artikelKalkulation } from '../src/logic/artikelPreise.js'
import { PRESETS } from '../src/data/presets.js'

const referenz = PRESETS.find(p => p.id === 'referenz').eingaben

// Erwarteter VK der günstigsten WP (wt_aero_20, WT-WP20-R290):
// Listenpreis 26.600 × (1 − 0.30) × (1 + 0.18)
const VK_WP_GUENSTIGSTE = 26600 * 0.70 * (1 + ANNAHMEN.vk_aufschlag_material)

describe('Komponenten-Layer (SK-103)', () => {
  it('günstigste WP-Komponente (wt_aero_20) wird automatisch gewählt', () => {
    const erg = berechne(referenz)
    const wp = erg.lv.positionen.find(p => p.id === 'wp_modul')
    expect(wp.komponente).toBeTruthy()
    expect(wp.komponente.gewaehlt.id).toBe('wt_aero_20')
    expect(wp.einzel).toBeCloseTo(VK_WP_GUENSTIGSTE, 2)
    // komponentenAuswahl im Ergebnis vorhanden
    const ka = erg.komponentenAuswahl.waermepumpe
    expect(ka).toBeTruthy()
    expect(ka.kandidaten.length).toBe(3)
    expect(ka.kandidaten[0].delta_vk).toBe(0)
    expect(ka.ueberschrieben).toBe(false)
  })

  it('valide Override hebt günstigste Wahl auf und setzt ueberschrieben', () => {
    const erg = berechne({ ...referenz, komponente_waermepumpe: 'st_silent_20' })
    const wp = erg.lv.positionen.find(p => p.id === 'wp_modul')
    expect(wp.komponente.gewaehlt.id).toBe('st_silent_20')
    expect(wp.komponente.ueberschrieben).toBe(true)
    const vkSilent = 31500 * 0.75 * (1 + ANNAHMEN.vk_aufschlag_material)
    expect(wp.einzel).toBeCloseTo(vkSilent, 2)
    // Netto muss höher sein als mit günstigster Wahl
    const ergAuto = berechne(referenz)
    expect(erg.lv.netto).toBeGreaterThan(ergAuto.lv.netto)
  })

  it('ungültige Override-ID → Fallback auf günstigste + KOMP-Warnung', () => {
    const erg = berechne({ ...referenz, komponente_waermepumpe: 'gibt_es_nicht' })
    const wp = erg.lv.positionen.find(p => p.id === 'wp_modul')
    expect(wp.komponente.gewaehlt.id).toBe('wt_aero_20')
    expect(erg.warnungen.some(w => w.regelId === 'KOMP')).toBe(true)
  })

  it('leere Komponenten-Liste → 0 € + KOMP-Warnung', () => {
    const erg = berechne(referenz, { komponenten: [] })
    const wp = erg.lv.positionen.find(p => p.id === 'wp_modul')
    expect(wp.einzel).toBe(0)
    expect(erg.warnungen.some(w => w.regelId === 'KOMP')).toBe(true)
  })

  it('Speicher: BWS (typ speicher) und FWS (typ fws) werden korrekt gefiltert', () => {
    const ctx = { ww_speicher_typ: 'speicher', heizlast_effektiv: 60, technologiepfad: 'hybrid' }
    const bws = KOMPONENTEN.filter(k => k.typ === 'speicher' && komponenteGeeignet(k, ctx))
    expect(bws.every(k => k.eignung.ww_speicher_typ === 'speicher')).toBe(true)
    expect(bws.length).toBe(2) // wt_bws_800 + dm_bws_900

    const ctxFws = { ...ctx, ww_speicher_typ: 'fws' }
    const fws = KOMPONENTEN.filter(k => k.typ === 'speicher' && komponenteGeeignet(k, ctxFws))
    expect(fws.every(k => k.eignung.ww_speicher_typ === 'fws')).toBe(true)
    expect(fws.length).toBe(2) // wt_fws_40 + dm_fws_45
  })

  it('kandidaten sind aufsteigend nach VK sortiert; delta_vk[0] = 0', () => {
    const ctx = { heizlast_effektiv: 60, technologiepfad: 'hybrid', aufstellvariante: null }
    const auswahl = komponentenAuswahl({
      typ: 'waermepumpe', komponenten: KOMPONENTEN, ctx, override: null,
      artikel: ARTIKEL, rabattgruppen: RABATTGRUPPEN, aufschlag: ANNAHMEN.vk_aufschlag_material,
    })
    expect(auswahl).toBeTruthy()
    expect(auswahl.kandidaten[0].delta_vk).toBe(0)
    for (let i = 1; i < auswahl.kandidaten.length; i++) {
      expect(auswahl.kandidaten[i].vk).toBeGreaterThanOrEqual(auswahl.kandidaten[i - 1].vk)
    }
    // WT-Artikel müssen günstigste bleiben (Preiskorridor-Test)
    expect(auswahl.kandidaten[0].id).toBe('wt_aero_20')
  })

  it('unentschieden → R23 gelb, kein R17, Hybrid-LV wird gerechnet', () => {
    const erg = berechne({ ...referenz, technologiepfad: 'unentschieden' })
    expect(erg.warnungen.some(w => w.regelId === 'R23')).toBe(true)
    expect(erg.warnungen.some(w => w.regelId === 'R17')).toBe(false)
    // Status mindestens gelb (R23), aber nicht rot (R17 feuert nicht)
    expect(['gelb', 'orange', 'rot'].includes(erg.status)).toBe(true)
    expect(erg.status).not.toBe('rot')
    // WP-Modul ist im LV (Hybrid-Pfad wird gerechnet)
    expect(erg.lv.positionen.find(p => p.id === 'wp_modul')).toBeTruthy()
  })

  it('WT-Speicher bleiben günstigste je Typ (Preiskorridor-Invariante)', () => {
    const aufschlag = ANNAHMEN.vk_aufschlag_material
    const bwsGK = artikelKalkulation('WT-PS-BWS800', ARTIKEL, RABATTGRUPPEN, aufschlag)
    const fwsGK = artikelKalkulation('WT-FWS-40', ARTIKEL, RABATTGRUPPEN, aufschlag)
    const dmBws = artikelKalkulation('ST-BWS-900', ARTIKEL, RABATTGRUPPEN, aufschlag)
    const dmFws = artikelKalkulation('ST-FWS-45', ARTIKEL, RABATTGRUPPEN, aufschlag)
    expect(bwsGK.vk).toBeLessThan(dmBws.vk)
    expect(fwsGK.vk).toBeLessThan(dmFws.vk)
  })

  it('Regelung: günstigste Auto-Wahl ist Standard, Override auf KI teurer', () => {
    const erg = berechne(referenz)
    const reg = erg.lv.positionen.find(p => p.id === 'regelung_modul')
    expect(reg.komponente.gewaehlt.id).toBe('regelung_std')
    const ka = erg.komponentenAuswahl.regelung
    expect(ka).toBeTruthy()
    expect(ka.kandidaten.length).toBe(2)
    expect(ka.kandidaten[0].delta_vk).toBe(0)

    const ergKi = berechne({ ...referenz, komponente_regelung: 'regelung_ki' })
    const regKi = ergKi.lv.positionen.find(p => p.id === 'regelung_modul')
    expect(regKi.komponente.gewaehlt.id).toBe('regelung_ki')
    expect(regKi.komponente.ueberschrieben).toBe(true)
    expect(regKi.einzel).toBeGreaterThan(reg.einzel)
  })

  it('Monitoring: günstigste Auto-Wahl ist Basic, Override auf Plus teurer', () => {
    const erg = berechne(referenz)
    const mon = erg.lv.positionen.find(p => p.id === 'monitoring_modul')
    expect(mon.komponente.gewaehlt.id).toBe('mon_basic')

    const ergPlus = berechne({ ...referenz, komponente_monitoring: 'mon_plus' })
    const monPlus = ergPlus.lv.positionen.find(p => p.id === 'monitoring_modul')
    expect(monPlus.komponente.gewaehlt.id).toBe('mon_plus')
    expect(monPlus.einzel).toBeGreaterThan(mon.einzel)
  })

  it('ungültige Regelung-Override → Fallback auf günstigste + KOMP-Warnung', () => {
    const erg = berechne({ ...referenz, komponente_regelung: 'gibt_es_nicht' })
    const reg = erg.lv.positionen.find(p => p.id === 'regelung_modul')
    expect(reg.komponente.gewaehlt.id).toBe('regelung_std')
    expect(erg.warnungen.some(w => w.regelId === 'KOMP')).toBe(true)
  })

  it('veraltete Eingabefelder (smartcontrol_variante/monitoring_variante) brechen die Berechnung nicht', () => {
    // Gespeicherte ältere Angebote können diese entfernten Felder noch enthalten.
    const alt = { ...referenz, smartcontrol_variante: 'ki', monitoring_variante: 'plus' }
    const erg = berechne(alt)
    // Berechnung läuft normal; Regelung/Monitoring fallen auf die günstigste Auto-Wahl zurück.
    expect(erg.lv.positionen.find(p => p.id === 'regelung_modul').komponente.gewaehlt.id).toBe('regelung_std')
    expect(erg.lv.positionen.find(p => p.id === 'monitoring_modul').komponente.gewaehlt.id).toBe('mon_basic')
    expect(Number.isFinite(erg.lv.netto)).toBe(true)
  })
})
