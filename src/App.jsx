import React, { useMemo, useState } from 'react'
import { ANNAHMEN } from './data/annahmen.js'
import { PRESETS, DEFAULT_PRESET_ID } from './data/presets.js'
import { berechne, STATUS_LABEL } from './logic/engine.js'
import { euro, AMPEL_FARBE } from './screens/format.js'
import Konfiguration from './screens/Konfiguration.jsx'
import Ergebnis from './screens/Ergebnis.jsx'
import Handover from './screens/Handover.jsx'
import Annahmen from './screens/Annahmen.jsx'
import Testfaelle from './screens/Testfaelle.jsx'

const SCREENS = [
  ['konfiguration', '1 · Konfiguration'],
  ['ergebnis', '2 · Ergebnis'],
  ['handover', '3 · Handover'],
  ['annahmen', '4 · Annahmen & Regeln'],
  ['testfaelle', '5 · Testfälle'],
]

export default function App() {
  const [screen, setScreen] = useState('konfiguration')
  const [eingaben, setEingaben] = useState(
    () => ({ ...PRESETS.find(p => p.id === DEFAULT_PRESET_ID).eingaben })
  )
  const [annahmen, setAnnahmen] = useState({ ...ANNAHMEN })

  const ergebnis = useMemo(() => berechne(eingaben, { annahmen }), [eingaben, annahmen])

  const props = { eingaben, setEingaben, annahmen, setAnnahmen, ergebnis, setScreen }

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <strong>Projektentwicklungs-Konfigurator</strong>
          <span className="badge demo">Demo-Prototyp v0.1 · alle Werte sind Demo-Annahmen</span>
        </div>
        <nav className="tabs">
          {SCREENS.map(([id, label]) => (
            <button key={id} className={screen === id ? 'tab aktiv' : 'tab'} onClick={() => setScreen(id)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="kopf-status">
          <span className="ampel" style={{ background: AMPEL_FARBE[ergebnis.status] }} />
          <span>{STATUS_LABEL[ergebnis.status]}</span>
          <span className="kopf-netto">{euro(ergebnis.lv.netto)} netto</span>
        </div>
      </header>

      {screen === 'konfiguration' && <Konfiguration {...props} />}
      {screen === 'ergebnis' && <Ergebnis {...props} />}
      {screen === 'handover' && <Handover {...props} />}
      {screen === 'annahmen' && <Annahmen {...props} />}
      {screen === 'testfaelle' && <Testfaelle {...props} />}

      <footer className="fussnote no-print">
        Interner Demo-Prototyp (Configure-to-Order, Stufe 1). Keine Marge, kein Kundenangebot,
        keine rechtsverbindliche Schall- oder Förderberechnung. Roadmap: Stufe 2
        (Grundpreis/Arbeitspreis, Ziel-IRR), monoenergetischer Pfad, Preisgleitformeln, BEG-Kostendeckel.
      </footer>
    </div>
  )
}
