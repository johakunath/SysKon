import React from 'react'
import { ANNAHMEN, ANNAHMEN_META } from '../data/annahmen.js'
import { REGELN } from '../data/regeln.js'
import { bedingungText, wirkungText } from './format.js'

export default function Annahmen({ annahmen, setAnnahmen, ergebnis }) {
  const setze = (key, wert) => setAnnahmen({ ...annahmen, [key]: wert })

  return (
    <div className="seite">
      <div className="karte">
        <div className="druckkopf">
          <h2>Annahmen & Regeln</h2>
          <button onClick={() => setAnnahmen({ ...ANNAHMEN })}>Auf Demo-Werte zurücksetzen</button>
        </div>
        <p className="hinweis">
          Alle Werte sind editierbare <strong>Demo-Annahmen</strong> – Änderungen rechnen sofort live neu
          (sichtbar im Live-Panel und Ergebnis). Ein echter Admin-Bereich ist später nur ein Editor
          über diese drei Datenebenen (Annahmen, Regeln, Katalog). Preisgleitformeln und BEG-Kostendeckel: Roadmap.
        </p>
      </div>

      <div className="karten-reihe">
        {ANNAHMEN_META.map(gruppe => (
          <div className="karte" key={gruppe.gruppe}>
            <h3>{gruppe.gruppe}</h3>
            <table className="fakten">
              <tbody>
                {gruppe.felder.map(([key, label, einheit]) => (
                  <tr key={key}>
                    <td>{label} <span className="einheit">({einheit})</span></td>
                    <td className="r">
                      <input
                        className="inline-zahl"
                        type="number"
                        step="any"
                        value={annahmen[key]}
                        onChange={e => setze(key, e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="karte">
        <h3>Regelsatz v0.1 (deklarativ, {REGELN.length} Regeln)</h3>
        <p className="hinweis">
          Jede Regel: WENN Bedingung DANN Wirkung (require / exclude / warn / status).
          Konfliktauflösung: exclude schlägt require; Status nimmt immer die schlechteste Stufe.
          „Ausgelöst" zeigt, welche Regeln bei der aktuellen Konfiguration feuern.
        </p>
        <table className="lv">
          <thead>
            <tr><th>Nr</th><th>Wenn</th><th>Dann</th><th>Begründung</th><th>Ausgelöst</th></tr>
          </thead>
          <tbody>
            {REGELN.map(r => (
              <tr key={r.id} className={ergebnis.gefeuert.includes(r.id) ? 'gewaehlt' : ''}>
                <td><strong>{r.id}</strong></td>
                <td className="code">{bedingungText(r.wenn)}</td>
                <td className="code">{wirkungText(r.dann)}</td>
                <td>{r.begruendung}</td>
                <td>{ergebnis.gefeuert.includes(r.id) ? '● ja' : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hinweis">
          R18 ist eine Demo-Abschätzung, keine rechtsverbindliche Schallberechnung.
          Regeln liegen als Daten in <code>src/data/regeln.js</code>, nicht im Code.
        </p>
      </div>
    </div>
  )
}
