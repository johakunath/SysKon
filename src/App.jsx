import React, { useMemo, useState } from 'react'
import { applyAdminConfig, loadAdminConfig, makeDefaultAdminConfig, saveAdminConfig, touchAdminConfig } from './data/adminConfig.js'
import { PRESETS, DEFAULT_PRESET_ID } from './data/presets.js'
import { berechne } from './logic/engine.js'
import Konfiguration from './screens/Konfiguration.jsx'
import Ergebnis from './screens/Ergebnis.jsx'
import Annahmen from './screens/Annahmen.jsx'
import Testfaelle from './screens/Testfaelle.jsx'

const MAIN_SCREENS = [
  ['konfiguration', 'Konfiguration'],
  ['ergebnis', 'Analyse'],
]
const ADMIN_SCREENS = [
  ['annahmen', 'Annahmen & Regeln'],
  ['testfaelle', 'Testfälle'],
]

export default function App() {
  const [screen, setScreen] = useState('konfiguration')
  const [adminModus, setAdminModus] = useState(false)
  const [sichtModus, setSichtModus] = useState('kunde')
  const [eingaben, setEingaben] = useState(
    () => ({ ...PRESETS.find(p => p.id === DEFAULT_PRESET_ID).eingaben })
  )
  const [adminConfig, setAdminConfigState] = useState(loadAdminConfig)
  const effectiveConfig = useMemo(() => applyAdminConfig(adminConfig), [adminConfig])
  const annahmen = effectiveConfig.annahmen

  const setAdminConfig = (next) => {
    setAdminConfigState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      const touched = touchAdminConfig(resolved)
      saveAdminConfig(touched)
      return touched
    })
  }

  const setAnnahmen = (next) => {
    setAdminConfig(prev => ({
      ...prev,
      annahmen: typeof next === 'function' ? next(prev.annahmen) : next,
    }))
  }

  const resetAdminConfig = () => {
    const defaults = makeDefaultAdminConfig()
    saveAdminConfig(defaults)
    setAdminConfigState(defaults)
  }

  const ergebnis = useMemo(() => berechne(eingaben, {
    annahmen,
    katalog: effectiveConfig.katalog,
    fragen: effectiveConfig.alleFragen,
  }), [eingaben, annahmen, effectiveConfig.katalog, effectiveConfig.alleFragen])

  const props = {
    eingaben, setEingaben, annahmen, setAnnahmen, ergebnis, setScreen,
    sichtModus,
    sektionen: effectiveConfig.sektionen,
    katalog: effectiveConfig.katalog,
    adminConfig,
    setAdminConfig,
    resetAdminConfig,
    governance: effectiveConfig.governance,
  }

  const visibleScreens = adminModus ? [...MAIN_SCREENS, ...ADMIN_SCREENS] : MAIN_SCREENS

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <img className="brand-logo" src="/systempaket-logo.svg" alt="" aria-hidden="true" />
          <strong>Systempaket-Konfigurator</strong>
        </div>
        <nav className="tabs">
          {visibleScreens.map(([id, label]) => (
            <button key={id} className={`tab${screen === id ? ' aktiv' : ''}${ADMIN_SCREENS.some(s => s[0] === id) ? ' tab-admin' : ''}`} onClick={() => setScreen(id)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="sicht-toggle no-print" role="group" aria-label="Sichtmodus">
          <button
            className={sichtModus === 'kunde' ? 'aktiv' : ''}
            onClick={() => setSichtModus('kunde')}
            title="Kundensicht: nur der preisfreie Umfang"
          >
            Kundensicht
          </button>
          <button
            className={sichtModus === 'intern' ? 'aktiv' : ''}
            onClick={() => setSichtModus('intern')}
            title="Internsicht: Vorlösung, LV/CAPEX und Prüfpunkte"
          >
            Internsicht
          </button>
        </div>
        <button
          className={`admin-toggle no-print${adminModus ? ' aktiv' : ''}`}
          onClick={() => {
            setAdminModus(m => !m)
            if (adminModus && ADMIN_SCREENS.some(s => s[0] === screen)) setScreen('konfiguration')
          }}
          title="Admin-Bereich ein-/ausblenden"
        >
          ⚙
        </button>
      </header>

      {screen === 'konfiguration' && <Konfiguration {...props} />}
      {screen === 'ergebnis' && <Ergebnis {...props} />}
      {screen === 'annahmen' && <Annahmen {...props} />}
      {screen === 'testfaelle' && <Testfaelle {...props} />}

      <footer className="fussnote no-print">
        Interner Demo-Prototyp für erfahrene Sales-/KAM-Nutzer (Configure-to-Order, Stufe 1).
        Keine Marge, kein Kundenangebot, keine rechtsverbindliche Schall- oder Förderberechnung. Roadmap: Stufe 2
        (Grundpreis/Arbeitspreis, Ziel-IRR), monoenergetischer Pfad, Preisgleitformeln, BEG-Kostendeckel.
      </footer>
    </div>
  )
}
