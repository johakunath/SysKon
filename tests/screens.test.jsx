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
    expect(html).toContain('Projektentwicklungs-Konfigurator')
    expect(html).toContain('Demo-Prototyp')
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
