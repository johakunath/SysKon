import React, { useMemo, useState } from 'react'
import { applyAdminConfig, loadAdminConfig, makeDefaultAdminConfig, saveAdminConfig, touchAdminConfig } from './data/adminConfig.js'
import { loadAngebote, neueAngebotId, saveAngebote } from './data/angebote.js'
import { PRESETS, DEFAULT_PRESET_ID } from './data/presets.js'
import { DEMO_FOOTER } from './data/texte.js'
import { berechne } from './logic/engine.js'
import Konfiguration from './screens/Konfiguration.jsx'
import Pruefpunkte from './screens/Pruefpunkte.jsx'
import Ergebnis from './screens/Ergebnis.jsx'
import Annahmen from './screens/Annahmen.jsx'
import Strategie from './screens/Strategie.jsx'

// Prüfpunkte ist ein interner Zwischenschritt und wird in der Kundensicht ausgeblendet.
const MAIN_SCREENS = [
  ['konfiguration', 'Angebot erstellen'],
  ['pruefpunkte', 'Prüfpunkte'],
  ['ergebnis', 'Angebot'],
]

export default function App() {
  const [screen, setScreen] = useState('konfiguration')
  const [sichtModus, setSichtModus] = useState('intern')
  const [eingaben, setEingaben] = useState(
    () => ({ ...PRESETS.find(p => p.id === DEFAULT_PRESET_ID).eingaben })
  )
  const [adminConfig, setAdminConfigState] = useState(loadAdminConfig)
  const [angebote, setAngeboteState] = useState(loadAngebote)
  const [aktivesAngebotId, setAktivesAngebotIdState] = useState(() => {
    try { return localStorage.getItem('syskon_aktives_angebot_id') ?? null } catch { return null }
  })
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

  const setAktivesAngebotId = (id) => {
    setAktivesAngebotIdState(id)
    try {
      if (id) localStorage.setItem('syskon_aktives_angebot_id', id)
      else localStorage.removeItem('syskon_aktives_angebot_id')
    } catch {}
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
    artikel: effectiveConfig.artikel,
    rabattgruppen: effectiveConfig.rabattgruppen,
    komponenten: effectiveConfig.komponenten,
  }), [eingaben, annahmen, effectiveConfig.katalog, effectiveConfig.alleFragen, effectiveConfig.artikel, effectiveConfig.rabattgruppen, effectiveConfig.komponenten])

  const props = {
    eingaben, setEingaben, annahmen, setAnnahmen, ergebnis, setScreen,
    sichtModus,
    sektionen: effectiveConfig.sektionen,
    katalog: effectiveConfig.katalog,
    artikel: effectiveConfig.artikel,
    rabattgruppen: effectiveConfig.rabattgruppen,
    komponenten: effectiveConfig.komponenten,
    datanorm: effectiveConfig.datanorm,
    adminConfig,
    setAdminConfig,
    resetAdminConfig,
    governance: effectiveConfig.governance,
    angebote, aktivesAngebotId, gespraechsErgebnis, setGespraechsErgebnis,
    onAngebotSpeichern, onAngebotLaden, onAngebotDuplizieren,
  }

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <img className="brand-logo" src="/systempaket-logo.svg" alt="" aria-hidden="true" />
          <strong>Systempaket-Konfigurator</strong>
        </div>
        <nav className="tabs">
          {MAIN_SCREENS
            .filter(([id]) => id !== 'pruefpunkte' || sichtModus === 'intern')
            .map(([id, label]) => (
              <button key={id} className={`tab${screen === id ? ' aktiv' : ''}`} onClick={() => setScreen(id)}>
                {label}
              </button>
            ))}
        </nav>
        <div className="sicht-toggle no-print" role="group" aria-label="Sichtmodus">
          <button
            className={sichtModus === 'kunde' ? 'aktiv' : ''}
            onClick={() => {
              setSichtModus('kunde')
              if (screen === 'pruefpunkte') setScreen('ergebnis')
            }}
            title="Kundensicht: Umfang für das Kundengespräch – ohne interne Kalkulation"
          >
            Kundensicht
          </button>
          <button
            className={sichtModus === 'intern' ? 'aktiv' : ''}
            onClick={() => setSichtModus('intern')}
            title="Interne Sicht: Interne Details, Kalkulation und Prüfpunkte"
          >
            Interne Sicht
          </button>
        </div>
        <button
          className={`admin-toggle no-print${screen === 'strategie' ? ' aktiv' : ''}`}
          onClick={() => setScreen('strategie')}
          title="Warum SysKon: Einordnung, Scope und Architektur"
        >
          Strategie
        </button>
        <button
          className={`admin-toggle no-print${screen === 'annahmen' ? ' aktiv' : ''}`}
          onClick={() => setScreen('annahmen')}
          title="Admin-Bereich öffnen"
        >
          ⚙ Admin
        </button>
      </header>

      {screen === 'konfiguration' && <Konfiguration {...props} />}
      {screen === 'pruefpunkte' && (sichtModus === 'intern' ? <Pruefpunkte {...props} /> : <Ergebnis {...props} />)}
      {screen === 'ergebnis' && <Ergebnis {...props} />}
      {screen === 'annahmen' && <Annahmen {...props} />}
      {screen === 'strategie' && <Strategie />}

      <footer className="fussnote no-print">{DEMO_FOOTER}</footer>
    </div>
  )
}
