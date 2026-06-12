import React, { useEffect, useRef, useState } from 'react'
import { SEKTIONEN } from '../data/fragen.js'
import { PRESETS } from '../data/presets.js'
import { pruefeBedingung, STATUS_LABEL } from '../logic/engine.js'
import { euro, num, VARIANTEN_NAME } from './format.js'

function Tooltip({ text }) {
  const [offen, setOffen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!offen) return undefined
    const schliesseBeiAussenklick = (event) => {
      if (!ref.current?.contains(event.target)) setOffen(false)
    }
    document.addEventListener('pointerdown', schliesseBeiAussenklick)
    return () => document.removeEventListener('pointerdown', schliesseBeiAussenklick)
  }, [offen])

  return (
    <span className="tooltip-wrap" ref={ref}>
      <button
        type="button"
        className={`tooltip${offen ? ' offen' : ''}`}
        aria-label="Hilfetext anzeigen"
        aria-expanded={offen}
        onClick={() => setOffen(v => !v)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setOffen(false)
        }}
      >
        ⓘ
      </button>
      <span className="tooltip-text" role="tooltip">{text}</span>
    </span>
  )
}

function Frage({ frage, wert, onChange, gesperrt }) {
  const invalide = frage.typ === 'zahl' && wert !== undefined && wert !== '' && (
    (frage.min !== undefined && wert < frage.min) ||
    (frage.max !== undefined && wert > frage.max)
  )

  return (
    <div className="frage">
      <label>
        <span className="frage-label">
          {frage.label}
          {frage.einheit ? <span className="einheit"> ({frage.einheit})</span> : null}
          {frage.tooltip ? <Tooltip text={frage.tooltip} /> : null}
        </span>
        {frage.typ === 'zahl' ? (
          <input
            type="number"
            value={wert ?? ''}
            min={frage.min}
            max={frage.max}
            className={invalide ? 'input-error' : undefined}
            onChange={e => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
          />
        ) : (
          <select value={wert ?? ''} onChange={e => onChange(e.target.value || undefined)}>
            <option value="">– bitte wählen –</option>
            {frage.optionen.map(o => (
              <option key={o.wert} value={o.wert} disabled={gesperrt?.includes(o.wert)}>
                {o.label}{gesperrt?.includes(o.wert) ? ' · gesperrt' : ''}
              </option>
            ))}
          </select>
        )}
        {invalide && (
          <span className="input-hinweis">
            Plausibilitätsbereich: {frage.min}–{frage.max?.toLocaleString('de-DE')} {frage.einheit} (Demo-Annahme)
          </span>
        )}
      </label>
    </div>
  )
}

export default function Konfiguration({ eingaben, setEingaben, annahmen, ergebnis, setScreen }) {
  const sichtbar = (f) => !f.sichtbar || pruefeBedingung(f.sichtbar, eingaben, annahmen)
  const beantwortet = (f) => {
    const w = eingaben[f.id]
    return w !== undefined && w !== null && w !== '' && w !== 'unbekannt'
  }
  const fortschritt = (s) => {
    const fragen = s.fragen.filter(f => f.dq > 0 && sichtbar(f))
    const fertig = fragen.filter(beantwortet).length
    return { fertig, gesamt: fragen.length, komplett: fertig === fragen.length && fragen.length > 0 }
  }

  const ladePreset = (id) => {
    const p = PRESETS.find(x => x.id === id)
    if (p) setEingaben({ ...p.eingaben })
  }

  const gesperrteVarianten = ergebnis.excluded.aufstellvariante ?? []
  const d = ergebnis.derived

  return (
    <div className="drei-spalten">
      <aside className="spalte-links">
        <div className="karte sektion-nav">
          <div className="preset-zeile">
            <select onChange={e => e.target.value && ladePreset(e.target.value)} defaultValue="">
              <option value="" disabled>Preset laden …</option>
              {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <h4>Abschnitte</h4>
          {SEKTIONEN.map(s => {
            const fp = fortschritt(s)
            return (
              <a
                key={s.id}
                className={`sektion-anker${fp.komplett ? ' komplett' : ''}`}
                href={`#sek-${s.id}`}
                onClick={e => {
                  e.preventDefault()
                  document.getElementById(`sek-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <span>{s.id} · {s.titel}</span>
                <span className={`fortschritt${fp.komplett ? ' ok' : ''}`}>
                  {fp.komplett ? '✓' : `${fp.fertig}/${fp.gesamt}`}
                </span>
              </a>
            )
          })}
        </div>
      </aside>

      <main className="spalte-mitte">
        {SEKTIONEN.map(s => {
          const fragenSichtbar = s.fragen.filter(sichtbar)
          if (fragenSichtbar.length === 0) return null
          return (
            <div key={s.id} id={`sek-${s.id}`} className="karte sek-block">
              <h2>{s.id} · {s.titel}</h2>
              {fragenSichtbar.map(f => (
                <Frage
                  key={f.id}
                  frage={f}
                  wert={eingaben[f.id]}
                  gesperrt={f.id === 'aufstellvariante' ? gesperrteVarianten : null}
                  onChange={(wert) => setEingaben({ ...eingaben, [f.id]: wert })}
                />
              ))}
              {s.id === 'F' && gesperrteVarianten.length > 0 && (
                <p className="warnbox">
                  Gesperrte Aufstellvarianten: {gesperrteVarianten.map(v => VARIANTEN_NAME[v]).join(', ')} (Schall oder Fläche, R05/R07).
                </p>
              )}
              {s.id === 'C' && eingaben.technologiepfad === 'monoenergetisch' && (
                <p className="warnbox">Monoenergetischer Pfad ist in v0.1 nur ein Roadmap-Platzhalter (Status rot, R17).</p>
              )}
            </div>
          )
        })}
      </main>

      <aside className="spalte-rechts">
        <div className="karte live">
          <h3>Live-Ergebnis</h3>
          <div className="status-zeile">
            <span className={`ampel gross ${ergebnis.status ?? 'unbekannt'}`} />
            <div>
              <strong>{STATUS_LABEL[ergebnis.status]}</strong>
              <div className="hinweis">{ergebnis.statusQuellen.length
                ? `ausgelöst durch ${[...new Set(ergebnis.statusQuellen.filter(q => q.wert === ergebnis.status).map(q => q.regelId))].join(', ')}`
                : 'keine Regel verschlechtert den Status'}</div>
            </div>
          </div>

          <div className="dq">
            <div className="dq-label">Datenqualität: <strong>{ergebnis.dq} %</strong>{ergebnis.dq < annahmen.dq_schwelle ? ' – kein belastbares Richt-LV' : ''}</div>
            <div className="dq-balken"><div style={{ width: `${ergebnis.dq}%` }} /></div>
          </div>

          <div className="mini-fakten">
            <div><span>Heizlast</span><strong>{num(d.heizlast_effektiv)} kW</strong></div>
            <div><span>WP-Kaskade</span><strong>{d.wp_module} × {annahmen.wp_modul_kw} kW</strong></div>
            <div><span>Netto-LV</span><strong>{euro(ergebnis.lv.netto)}</strong></div>
          </div>

          {ergebnis.warnungen.length > 0 && (
            <>
              <h4>Hinweise ({ergebnis.warnungen.length})</h4>
              <ul className="warnliste">
                {ergebnis.warnungen.slice(0, 4).map((w, i) => <li key={i}>{w.regelId}: {w.text}</li>)}
                {ergebnis.warnungen.length > 4 && <li>… alle im <a onClick={() => setScreen('ergebnis')}>Ergebnis</a></li>}
              </ul>
            </>
          )}
          <button className="primaer" onClick={() => setScreen('ergebnis')}>Zum Ergebnis →</button>
        </div>
      </aside>
    </div>
  )
}
