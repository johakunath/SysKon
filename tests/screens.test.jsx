// Render-Smoke-Test: alle 5 Screens müssen mit dem Referenzfall fehlerfrei rendern.
// Fängt Laufzeitfehler in der UI ohne Browser ab (ReactDOMServer).

import { describe, it, expect } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { ANNAHMEN } from '../src/data/annahmen.js'
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


  it('Konfiguration rendert Auswahlfragen als erklärte Radio-Liste mit Tooltip am Label', () => {
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
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('class="frage-kopf"')
  })

  it('Konfiguration zeigt den gewählten Technologiepfad in der Live-Analyse', () => {
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
    expect(html).toContain('monoenergetisch')
    expect(html).toContain('außerhalb MVP v0.1')
  })

  it('Analyse startet mit einem kundenfaehigen Umfang ohne Preise', () => {
    const eingaben = { ...PRESETS[0].eingaben }
    const ergebnis = berechne(eingaben)
    const html = renderToString(
      <Ergebnis
        eingaben={eingaben}
        annahmen={{ ...ANNAHMEN }}
        ergebnis={ergebnis}
      />
    )

    expect(html).toContain('Kundenumfang')
    expect(html).toContain('Hersteller')
    expect(html).toContain('Produkt')
    expect(html).toContain('Größe / Leistung')
    expect(html).toContain('Annahmen')
    expect(html).toContain('Ausschlüsse')
    expect(html).toContain('Offene Punkte')
    expect(html).toContain('Interner Umfang')
    expect(html).not.toContain('Enthaltener Umfang und CAPEX-Indikation')
    expect(html).not.toMatch(/€|CAPEX|Netto|Brutto|Förderung|Marge/)
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
