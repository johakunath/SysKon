// SK-102: Artikelstamm, EK/VK-Kette und simulierter DATANORM-Import.

import { describe, it, expect } from 'vitest'
import { ARTIKEL, RABATTGRUPPEN, LIEFERANTEN, DATANORM_UPDATE_DEMO } from '../src/data/artikel.js'
import { artikelKalkulation, findeArtikel, rabattFuer, wendeDatanormUpdateAn } from '../src/logic/artikelPreise.js'
import { applyAdminConfig, applyDatanormDemoImport, makeDefaultAdminConfig, mergeWithDefaults, validateAdminConfig } from '../src/data/adminConfig.js'

describe('SK-102: Artikelstamm', () => {
  it('alle Artikel haben Pflichtfelder und einen bekannten Lieferanten', () => {
    const lieferantIds = new Set(LIEFERANTEN.map(l => l.id))
    for (const a of ARTIKEL) {
      expect(a.artikelnummer, 'artikelnummer').toBeTruthy()
      expect(lieferantIds.has(a.lieferant), `Lieferant von ${a.artikelnummer}`).toBe(true)
      expect(typeof a.listenpreis).toBe('number')
      expect(a.listenpreis).toBeGreaterThan(0)
      expect(a.kurztext.length).toBeGreaterThan(0)
      expect(a.langtext.length).toBeGreaterThan(0)
    }
  })

  it('Artikelnummern sind eindeutig', () => {
    const nummern = ARTIKEL.map(a => a.artikelnummer)
    expect(new Set(nummern).size).toBe(nummern.length)
  })

  it('Rabattgruppen der Artikel existieren beim jeweiligen Lieferanten', () => {
    for (const a of ARTIKEL) {
      if (a.rabattgruppe == null) continue
      expect(RABATTGRUPPEN[a.lieferant]?.gruppen?.[a.rabattgruppe],
        `Rabattgruppe ${a.rabattgruppe} von ${a.artikelnummer}`).toBeDefined()
    }
  })
})

describe('SK-102: EK/VK-Kette (artikelPreise)', () => {
  it('Gruppenrabatt schlägt Generalrabatt', () => {
    const wp = findeArtikel('WT-WP20-R290', ARTIKEL)
    expect(rabattFuer(wp, RABATTGRUPPEN)).toBe(RABATTGRUPPEN.wt_nord.gruppen.WP)
  })

  it('ohne Rabattgruppe greift der Generalrabatt', () => {
    const artikel = [{ artikelnummer: 'X-1', lieferant: 'wt_nord', rabattgruppe: 'GIBT_ES_NICHT', listenpreis: 100 }]
    expect(rabattFuer(artikel[0], RABATTGRUPPEN)).toBe(RABATTGRUPPEN.wt_nord.generalrabatt)
  })

  it('Kalkulation: Listenpreis − Rabatt = EK; EK × (1+Aufschlag) = VK', () => {
    const kalk = artikelKalkulation('WT-WP20-R290', ARTIKEL, RABATTGRUPPEN, 0.18)
    expect(kalk.listenpreis).toBe(26600)
    expect(kalk.ek).toBeCloseTo(26600 * 0.7, 6)
    expect(kalk.vk).toBeCloseTo(26600 * 0.7 * 1.18, 6)
  })

  it('unbekannte Artikelnummer liefert null', () => {
    expect(artikelKalkulation('GIBT-ES-NICHT', ARTIKEL, RABATTGRUPPEN, 0.18)).toBeNull()
  })
})

describe('SK-102: simulierter DATANORM-Import (wendeDatanormUpdateAn)', () => {
  it('überschreibt Listenpreise, ergänzt neue Artikel und aktualisiert Rabattgruppen', () => {
    const erg = wendeDatanormUpdateAn(ARTIKEL, RABATTGRUPPEN, DATANORM_UPDATE_DEMO)
    expect(erg.unveraendert).toBe(false)
    expect(erg.log.aktualisiert.length).toBe(Object.keys(DATANORM_UPDATE_DEMO.preisaenderungen).length)
    expect(erg.log.neu.map(n => n.artikelnummer)).toEqual(DATANORM_UPDATE_DEMO.neueArtikel.map(a => a.artikelnummer))
    expect(erg.log.rabattgruppenGeaendert.length).toBeGreaterThan(0)

    const wp = erg.artikel.find(a => a.artikelnummer === 'WT-WP20-R290')
    expect(wp.listenpreis).toBe(DATANORM_UPDATE_DEMO.preisaenderungen['WT-WP20-R290'])
    expect(wp.preisstand).toBe(DATANORM_UPDATE_DEMO.preisstand)
    expect(erg.rabattgruppen.gh_sued.gruppen.MSR).toBe(0.22)
    // Basisdaten bleiben unverändert (reine Funktion).
    expect(ARTIKEL.find(a => a.artikelnummer === 'WT-WP20-R290').listenpreis).toBe(26600)
  })

  it('zweiter Lauf auf aktualisiertem Stand meldet keine Änderungen', () => {
    const erster = wendeDatanormUpdateAn(ARTIKEL, RABATTGRUPPEN, DATANORM_UPDATE_DEMO)
    const zweiter = wendeDatanormUpdateAn(erster.artikel, erster.rabattgruppen, DATANORM_UPDATE_DEMO)
    expect(zweiter.unveraendert).toBe(true)
  })
})

describe('SK-102: Artikel im Admin-Config-Roundtrip', () => {
  it('Default-Config enthält Artikel, Rabattgruppen und DATANORM-Metadaten', () => {
    const config = makeDefaultAdminConfig()
    expect(Object.keys(config.artikel).length).toBe(ARTIKEL.length)
    expect(config.rabattgruppen.wt_nord.gruppen.WP).toBe(RABATTGRUPPEN.wt_nord.gruppen.WP)
    expect(config.datanorm.preisstand).toBe('2026-01-15')
    expect(validateAdminConfig(config)).toEqual([])
  })

  it('Listenpreis-Override wirkt auf den effektiven Artikelstamm', () => {
    const config = makeDefaultAdminConfig()
    config.artikel['WT-WP20-R290'].listenpreis = 30000
    const effective = applyAdminConfig(config)
    expect(effective.artikel.find(a => a.artikelnummer === 'WT-WP20-R290').listenpreis).toBe(30000)
  })

  it('applyDatanormDemoImport persistiert Preise, neue Artikel und Log in der Config', () => {
    const erg = applyDatanormDemoImport(makeDefaultAdminConfig())
    expect(erg.unveraendert).toBe(false)
    const effective = applyAdminConfig(erg.config)
    expect(effective.artikel.find(a => a.artikelnummer === 'WT-WP20-R290').listenpreis)
      .toBe(DATANORM_UPDATE_DEMO.preisaenderungen['WT-WP20-R290'])
    expect(effective.artikel.some(a => a.artikelnummer === 'GH-SH-K3')).toBe(true)
    expect(effective.rabattgruppen.gh_sued.gruppen.MSR).toBe(0.22)
    expect(erg.config.datanorm.preisstand).toBe(DATANORM_UPDATE_DEMO.preisstand)
    expect(erg.config.datanorm.log[0].unveraendert).toBe(false)
    expect(validateAdminConfig(erg.config)).toEqual([])

    // Zweiter Import: keine Änderungen, aber Log-Eintrag.
    const zweiter = applyDatanormDemoImport(erg.config)
    expect(zweiter.unveraendert).toBe(true)
    expect(zweiter.config.datanorm.log[0].unveraendert).toBe(true)
  })

  it('ungültige Rabattsätze werden von validateAdminConfig gemeldet', () => {
    const config = makeDefaultAdminConfig()
    config.rabattgruppen.wt_nord.gruppen.WP = 1.5
    expect(validateAdminConfig(config).some(e => e.includes('Rabattgruppe'))).toBe(true)
  })

  it('mergeWithDefaults ergänzt fehlende Artikel-Abschnitte (alte gespeicherte Configs)', () => {
    const merged = mergeWithDefaults({ annahmen: { strompreis_wp: 250 } })
    expect(Object.keys(merged.artikel).length).toBe(ARTIKEL.length)
    expect(merged.rabattgruppen.gh_sued.generalrabatt).toBe(RABATTGRUPPEN.gh_sued.generalrabatt)
    expect(merged.artikelNeu).toEqual([])
  })
})
