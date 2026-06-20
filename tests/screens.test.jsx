// Render-Smoke-Test: alle 5 Screens müssen mit dem Referenzfall fehlerfrei rendern.
// Fängt Laufzeitfehler in der UI ohne Browser ab (ReactDOMServer).

import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { ANNAHMEN } from '../src/data/annahmen.js'
import { applyAdminConfig, makeDefaultAdminConfig } from '../src/data/adminConfig.js'
import { PRESETS } from '../src/data/presets.js'
import { berechne } from '../src/logic/engine.js'
import App from '../src/App.jsx'
import Konfiguration from '../src/screens/Konfiguration.jsx'
import Ergebnis from '../src/screens/Ergebnis.jsx'
import Handover from '../src/screens/Handover.jsx'
import Annahmen from '../src/screens/Annahmen.jsx'
import Testfaelle from '../src/screens/Testfaelle.jsx'

const noop = () => {}

describe('Screens rendern mit jedem Preset', () => {
  it('App-Shell rendert mit Referenzfall', () => {
    const html = renderToString(<App />)
    expect(html).toContain('Systempaket-Konfigurator')
    expect(html).not.toContain('Handover</button>')
  })

  it('Konfiguration rendert Auswahlfragen als erklärte Radio-Liste mit kompaktem Gesprächshinweis', () => {
    const eingaben = { ...PRESETS[0].eingaben }
    const ergebnis = berechne(eingaben)
    const html = renderToString(
      <Konfiguration
        eingaben={eingaben}
        setEingaben={noop}
        annahmen={{ ...ANNAHMEN }}
        ergebnis={ergebnis}
        setScreen={noop}
      />
    )
    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('id="gebaeudetyp-freistehend"')
    expect(html).toContain('class="antwort-hinweis"')
    expect(html).toContain('class="gespraechshinweis"')
    expect(html).not.toMatch(/<aside class="gespraechshinweis"[^>]*>\s*<strong>/)
    expect(html).not.toContain('aria-expanded=')
    expect(html).not.toContain('Hilfetext anzeigen')
    expect(html).toContain('class="frage-kopf"')
  })

  it('Konfiguration zeigt den gewählten Technologiepfad in der kundenfähigen Umfangs-Vorschau', () => {
    const eingaben = { ...PRESETS[0].eingaben, technologiepfad: 'monoenergetisch' }
    const ergebnis = berechne(eingaben)
    const html = renderToString(
      <Konfiguration
        eingaben={eingaben}
        setEingaben={noop}
        annahmen={{ ...ANNAHMEN }}
        ergebnis={ergebnis}
        setScreen={noop}
      />
    )
    const rechteVorschau = html.slice(html.indexOf('<aside class="spalte-rechts">'))
    expect(html).toContain('monoenergetisch')
    expect(html).toContain('außerhalb MVP v0.1')
    expect(rechteVorschau).toContain('Umfangs-Vorschau')
    expect(rechteVorschau).toContain('Luft-Wasser-Wärmepumpen-Kaskade')
    expect(rechteVorschau).not.toMatch(/€|CAPEX|Netto|Brutto|Förderung|Marge/)
  })

  it('Analyse-Kundensicht zeigt nur den preisfreien Umfang ohne interne Flächen', () => {
    const eingaben = { ...PRESETS[0].eingaben }
    const ergebnis = berechne(eingaben)
    const html = renderToString(
      <Ergebnis
        eingaben={eingaben}
        annahmen={{ ...ANNAHMEN }}
        ergebnis={ergebnis}
        sichtModus="kunde"
      />
    )

    expect(html).toContain('Kundenumfang')
    expect(html).toContain('Hersteller')
    expect(html).toContain('Produkt')
    expect(html).toContain('Größe / Leistung')
    expect(html).toContain('Annahmen')
    expect(html).toContain('Ausschlüsse')
    expect(html).toContain('Offene Punkte')
    // SK-85: Kundensicht blendet interne Flächen vollständig aus (kein Tab, keine Preise)
    expect(html).not.toContain('Interner Umfang')
    expect(html).not.toContain('Lösung &amp; Umfang')
    expect(html).not.toContain('Prüfpunkte')
    expect(html).not.toContain('CAPEX-Kennzahlen')
    expect(html).not.toMatch(/€|CAPEX|Netto|Brutto|Förderung|Marge/)
  })

  it('Analyse-Internsicht zeigt konsolidierte Vorlösung, LV/CAPEX und Prüfpunkte mit einem Disclaimer', () => {
    const eingaben = { ...PRESETS[0].eingaben }
    const ergebnis = berechne(eingaben)
    const html = renderToString(
      <Ergebnis
        eingaben={eingaben}
        annahmen={{ ...ANNAHMEN }}
        ergebnis={ergebnis}
        sichtModus="intern"
      />
    )

    // SK-86: zwei konsolidierte Tabs statt vier
    expect(html).toContain('Lösung &amp; Umfang')
    expect(html).toContain('Prüfpunkte')
    // Internsicht zeigt CAPEX-Detail
    expect(html).toContain('CAPEX-Kennzahlen')
    expect(html).toMatch(/CAPEX|Netto/)
    // SK-87: Disclaimer erscheint genau einmal (dedupliziert)
    expect(html.match(/Nicht als Zusage lesen/g)?.length ?? 0).toBe(1)
  })

  it('Admin-Konfiguration rendert Tabs, Import/Export und read-only Regeln', () => {
    const adminConfig = makeDefaultAdminConfig()
    const effective = applyAdminConfig(adminConfig)
    const eingaben = { ...PRESETS[0].eingaben }
    const ergebnis = berechne(eingaben, {
      annahmen: effective.annahmen,
      katalog: effective.katalog,
      fragen: effective.alleFragen,
    })
    const html = renderToString(
      <Annahmen
        adminConfig={adminConfig}
        setAdminConfig={noop}
        resetAdminConfig={noop}
        ergebnis={ergebnis}
        sektionen={effective.sektionen}
        katalog={effective.katalog}
      />
    )

    expect(html).toContain('Admin-Konfiguration &amp; Governance')
    expect(html).toContain('Annahmen')
    expect(html).toContain('Fragen')
    expect(html).toContain('Katalog')
    expect(html).toContain('Governance')
    expect(html).toContain('Import/Export')
    expect(html).toContain('Demo-Defaults')
    expect(html).not.toContain('contenteditable')
  })

  it('Admin-Overrides wirken auf Konfiguration und Kundenumfang', () => {
    const adminConfig = makeDefaultAdminConfig()
    adminConfig.fragen.gebaeudetyp.label = 'Welche Gebäudelage kommt aus Admin?'
    adminConfig.katalog.wp.positionen.wp_modul.kunde.titel = 'Admin-Wärmepumpenpaket'
    const effective = applyAdminConfig(adminConfig)
    const eingaben = { ...PRESETS[0].eingaben }
    const ergebnis = berechne(eingaben, {
      annahmen: effective.annahmen,
      katalog: effective.katalog,
      fragen: effective.alleFragen,
    })
    const html = renderToString(
      <Konfiguration
        eingaben={eingaben}
        setEingaben={noop}
        annahmen={effective.annahmen}
        ergebnis={ergebnis}
        setScreen={noop}
        sektionen={effective.sektionen}
      />
    )

    expect(html).toContain('Welche Gebäudelage kommt aus Admin?')
    expect(html).toContain('Admin-Wärmepumpenpaket')
  })

  for (const preset of PRESETS) {
    it(`alle 5 Screens rendern fehlerfrei: ${preset.id}`, () => {
      const eingaben = { ...preset.eingaben }
      const ergebnis = berechne(eingaben)
      const props = {
        eingaben, setEingaben: noop,
        annahmen: { ...ANNAHMEN }, setAnnahmen: noop,
        ergebnis, setScreen: noop,
      }
      for (const Screen of [Konfiguration, Ergebnis, Handover, Annahmen, Testfaelle]) {
        const html = renderToString(<Screen {...props} />)
        expect(html.length).toBeGreaterThan(100)
      }
    })
  }
})
