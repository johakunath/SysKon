import React, { useMemo, useState } from 'react'
import { applyAdminConfig, loadAdminConfig, makeDefaultAdminConfig, saveAdminConfig, touchAdminConfig } from './data/adminConfig.js'
import { loadAngebote, neueAngebotId, saveAngebote } from './data/angebote.js'
import { PRESETS, DEFAULT_PRESET_ID } from './data/presets.js'
import { DEMO_FOOTER } from './data/texte.js'
import { berechne } from './logic/engine.js'
import Konfiguration from './screens/Konfiguration.jsx'
import Ergebnis from './screens/Ergebnis.jsx'
import Annahmen from './screens/Annahmen.jsx'

const MAIN_SCREENS = [
  ['konfiguration', 'Angebot erstellen'],
  ['ergebnis', 'Angebot'],
]
const ADMIN_SCREENS = [
  ['annahmen', 'Admin'],
]

export default function App() {
  const [screen, setScreen] = useState('konfiguration')
  const [adminModus, setAdminModus] = useState(false)
  const [sichtModus, setSichtModus] = useState('kunde')
  const [eingaben, setEingaben] = useState(
    () => ({ ...PRESETS.find(p => p.id === DEFAULT_PRESET_ID).eingaben })
  )
  const [adminConfig, setAdminConfigState] = useState(loadAdminConfig)
  const [angebote, setAngeboteState] = useState(loadAngebote)
  const [aktivesAngebotId, setAktivesAngebotId] = useState(null)
  const [gespraechsErgebnis, setGespraechsErgebnis] = useState({ status: 'offen', kommentar: '' })
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

  const setAngebote = (next) => {
    setAngeboteState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next
      saveAngebote(resolved)
      return resolved
    })
  }

  const onAngebotSpeichern = (name) => {
    const id = aktivesAngebotId ?? neueAngebotId()
    const eintrag = {
      id,
      name: name?.trim() || `Angebot ${new Date().toLocaleDateString('de-DE')}`,
      erstelltAm: new Date().toISOString(),
      eingaben: { ...eingaben },
      gespraechsErgebnis: { ...gespraechsErgebnis },
    }
    setAngebote(prev => {
      const idx = prev.findIndex(a => a.id === id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = eintrag
        return next
      }
      return [...prev, eintrag]
    })
    setAktivesAngebotId(id)
  }

  const onAngebotLaden = (id) => {
    const a = angebote.find(a => a.id === id)
    if (!a) return
    setEingaben({ ...a.eingaben })
    setGespraechsErgebnis({ ...a.gespraechsErgebnis })
    setAktivesAngebotId(id)
  }

  const onAngebotDuplizieren = () => {
    const aktiv = angebote.find(a => a.id === aktivesAngebotId)
    const basisName = aktiv ? aktiv.name : `Angebot ${new Date().toLocaleDateString('de-DE')}`
    const eintrag = {
      id: neueAngebotId(),
      name: `Kopie von ${basisName}`,
      erstelltAm: new Date().toISOString(),
      eingaben: { ...eingaben },
      gespraechsErgebnis: { status: 'offen', kommentar: '' },
    }
    setAngebote(prev => [...prev, eintrag])
    setAktivesAngebotId(eintrag.id)
    setGespraechsErgebnis({ status: 'offen', kommentar: '' })
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
    angebote, aktivesAngebotId, gespraechsErgebnis, setGespraechsErgebnis,
    onAngebotSpeichern, onAngebotLaden, onAngebotDuplizieren,
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

      <footer className="fussnote no-print">{DEMO_FOOTER}</footer>
    </div>
  )
}
