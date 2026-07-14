import React from 'react'
import { euro, num, VARIANTEN_NAME } from './format.js'
import Ampel from '../components/Ampel.jsx'

// Interner Zwischenschritt zwischen "Angebot erstellen" und "Angebot":
// Prüfpunkte, Schall-Vorprüfung und Placement-Korridor (vorher Sub-Tab in Ergebnis.jsx).
// Nur in der Internsicht geroutet (App.jsx).
export default function Pruefpunkte({ eingaben, ergebnis }) {
  const d = ergebnis.derived

  return (
    <div className="seite">
      <div className="analyse-grid">
        <div className="karte">
          <h3>Prüfpunkte und Hinweise</h3>
          {ergebnis.warnungen.length > 0 ? (
            <ul className="warnliste">
              {ergebnis.warnungen.map((w, i) => (
                <li key={i}><strong>{w.regelId}</strong>: {w.text}</li>
              ))}
            </ul>
          ) : <p className="okbox">Keine Regelhinweise in dieser Konfiguration.</p>}
          {ergebnis.statusQuellen.length > 0 && (
            <details className="regel-nachweis">
              <summary>Regel-Nachweis ({ergebnis.statusQuellen.length})</summary>
              <ul className="warnliste">
                {ergebnis.statusQuellen.map((q, i) => (
                  <li key={i}><strong>{q.regelId} → {q.wert}</strong>: {q.begruendung}</li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="karte">
          <h3>Schall-Vorprüfung (Abschätzung)</h3>
          <p className="hinweis">Lp = LW<sub>Kaskade</sub> − 20·log₁₀(r) − 8 − Abschlag · keine rechtsverbindliche Schallberechnung.</p>
          <div className="table-scroll">
            <table className="fakten">
              <tbody>
                <tr><td>LW Kaskade ({d.wp_module} Module)</td><td>{num(d.schall_lw_kaskade, 1)} dB(A)</td></tr>
                <tr><td>Nachtgrenzwert ({eingaben.gebietstyp ?? '–'})</td><td>{d.schall_grenzwert ?? '–'} dB(A)</td></tr>
              </tbody>
            </table>
            <table className="lv schall-tabelle">
              <thead><tr><th>Variante</th><th>Pegel am Immissionsort</th><th>Ampel</th></tr></thead>
              <tbody>
                {Object.entries(d.schall_je_variante).map(([v, s]) => (
                  <tr key={v} className={v === eingaben.aufstellvariante ? 'gewaehlt' : ''}>
                    <td>{VARIANTEN_NAME[v]}{v === eingaben.aufstellvariante ? ' (gewählt)' : ''}</td>
                    <td>{num(s.lp, 1)} dB(A) (−{s.abschlag} dB)</td>
                    <td><Ampel status={s.ampel} groesse="klein" /> {s.ampel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="karte">
          <h3>Placement-Korridor</h3>
          <p className="hinweis">{d.aufstellung_begruendung}</p>
          {d.aufstellung_viable?.length > 0 ? (
            <ul className="checkliste">
              {d.aufstellung_viable.map(v => (
                <li key={v.variante}>{v.label}: {euro(v.kosten)} Zusatz-CAPEX · Schall {v.schall}</li>
              ))}
            </ul>
          ) : <p className="warnbox">Keine tragfähige Aufstellvariante im aktuellen Korridor.</p>}
        </div>
      </div>
    </div>
  )
}
