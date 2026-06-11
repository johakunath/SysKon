import React, { useState } from 'react'
import { SEKTIONEN } from '../data/fragen.js'
import { PRESETS } from '../data/presets.js'
import { pruefeBedingung, STATUS_LABEL } from '../logic/engine.js'
import { euro, num, VARIANTEN_NAME } from './format.js'

function Frage({ frage, wert, onChange, gesperrt }) {
  return (
    <div className="frage">
      <label>
        <span className="frage-label">
          {frage.label}
          {frage.einheit ? <span className="einheit"> ({frage.einheit})</span> : null}
          {frage.tooltip ? <span className="tooltip" title={frage.tooltip}> ⓘ</span> : null}
        </span>
        {frage.typ === 'zahl' ? (
          <input
            type="number"
            value={wert ?? ''}
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
      </label>
    </div>
  )
}

export default function Konfiguration({ eingaben, setEingaben, annahmen, ergebnis, setScreen }) {
  const [aktiv, setAktiv] = useState('A')

  const sichtbar = (f) => !f.sichtbar || pruefeBedingung(f.sichtbar, eingaben, annahmen)
  const beantwortet = (f) => {
    const w = eingaben[f.id]
    return w !== undefined && w !== null && w !== '' && w !== 'unbekannt'
  }
  const fortschritt = (s) => {
    const fragen = s.fragen.filter(f => f.dq > 0 && sichtbar(f))
    const fertig = fragen.filter(beantwortet).length
    return `${fertig}/${fragen.length}`
  }

  const ladePreset = (id) => {
    const p = PRESETS.find(x => x.id === id)
    if (p) setEingaben({ ...p.eingaben })
  }

  const sektion = SEKTIONEN.find(s => s.id === aktiv)
  const gesperrteVarianten = ergebnis.excluded.aufstellvariante ?? []
  const d = ergebnis.derived

  // Paketstack: LV-Gruppen mit Summen
  const stack = []
  for (const p of ergebnis.lv.positionen) {
    const e = stack.find(x => x.gruppe === p.gruppe)
    if (e) e.summe += p.betrag
    else stack.push({ gruppe: p.gruppe, summe: p.betrag })
  }

  return (
    <div className="drei-spalten">
      <aside className="spalte-links">
        <div className="karte">
          <h3>Startkonfiguration</h3>
          <select value="" onChange={e => e.target.value && ladePreset(e.target.value)}>
            <option value="">Preset laden …</option>
            {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="hinweis">Presets sind gespeicherte Eingabesätze – Demos starten nie leer.</p>
        </div>
        <div className="karte">
          <h3>Eingabesektionen</h3>
          {SEKTIONEN.map(s => (
            <button
              key={s.id}
              className={aktiv === s.id ? 'sektion aktiv' : 'sektion'}
              onClick={() => setAktiv(s.id)}
            >
              <span>{s.id} · {s.titel}</span>
              <span className="fortschritt">{fortschritt(s)}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="spalte-mitte">
        <div className="karte">
          <h2>{sektion.id} · {sektion.titel}</h2>
          {sektion.fragen.filter(sichtbar).map(f => (
            <Frage
              key={f.id}
              frage={f}
              wert={eingaben[f.id]}
              gesperrt={f.id === 'aufstellvariante' ? gesperrteVarianten : null}
              onChange={(wert) => setEingaben({ ...eingaben, [f.id]: wert })}
            />
          ))}
          {sektion.id === 'F' && gesperrteVarianten.length > 0 && (
            <p className="warnbox">
              Gesperrte Aufstellvarianten: {gesperrteVarianten.map(v => VARIANTEN_NAME[v]).join(', ')} (Schall oder Fläche, R05/R07).
            </p>
          )}
          {sektion.id === 'C' && eingaben.technologiepfad === 'monoenergetisch' && (
            <p className="warnbox">Monoenergetischer Pfad ist in v0.1 nur ein Roadmap-Platzhalter (Status rot, R17).</p>
          )}
        </div>
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
            <div><span>WP-Kaskade</span><strong>{d.wp_module} × {annahmen.wp_modul_kw} kW = {d.wp_kw} kW</strong></div>
            <div><span>Wärmebedarf</span><strong>{num(d.waermebedarf_mwh)} MWh/a</strong></div>
            <div>
              <span>Schall am Immissionsort</span>
              <strong>
                <span className={`ampel klein ${d.schall_ampel_aktiv ?? 'unbekannt'}`} />
                {d.schall_lp_aktiv != null ? `${num(d.schall_lp_aktiv, 1)} dB(A) / Grenze ${d.schall_grenzwert}` : 'unvollständig'}
              </strong>
            </div>
          </div>

          <h4>Paketstack</h4>
          <table className="stack">
            <tbody>
              {stack.map(s => (
                <tr key={s.gruppe}><td>{s.gruppe}</td><td className="r">{euro(s.summe)}</td></tr>
              ))}
              <tr><td>Contingency ({Math.round(annahmen.contingency * 100)} %)</td><td className="r">{euro(ergebnis.lv.contingency)}</td></tr>
              <tr className="summe"><td>Brutto-LV</td><td className="r">{euro(ergebnis.lv.brutto)}</td></tr>
              <tr><td>Förderung (Demo)</td><td className="r">−{euro(ergebnis.lv.foerderung)}</td></tr>
              <tr className="summe"><td>Netto-LV</td><td className="r">{euro(ergebnis.lv.netto)}</td></tr>
            </tbody>
          </table>

          {ergebnis.warnungen.length > 0 && (
            <>
              <h4>Hinweise ({ergebnis.warnungen.length})</h4>
              <ul className="warnliste">
                {ergebnis.warnungen.slice(0, 4).map((w, i) => <li key={i}>{w.regelId}: {w.text}</li>)}
                {ergebnis.warnungen.length > 4 && <li>… alle im <a onClick={() => setScreen('handover')}>Handover</a></li>}
              </ul>
            </>
          )}
          <button className="primaer" onClick={() => setScreen('ergebnis')}>Zum Ergebnis →</button>
        </div>
      </aside>
    </div>
  )
}
