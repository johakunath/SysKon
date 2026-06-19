import React, { useState } from 'react'
import { berechne } from '../logic/engine.js'
import { euro, VARIANTEN_NAME } from './format.js'

const SPEICHER_KEY = 'syskon_testfaelle_v1'

const lade = () => {
  try { return JSON.parse(localStorage.getItem(SPEICHER_KEY)) ?? [] } catch { return [] }
}
const speichere = (faelle) => localStorage.setItem(SPEICHER_KEY, JSON.stringify(faelle))

// Vergleichsgrößen eines Rechenlaufs (Referenzlauf vs. aktueller Lauf)
const snapshot = (erg, eingaben) => ({
  status: erg.status,
  dq: erg.dq,
  brutto: Math.round(erg.lv.brutto),
  foerderung: Math.round(erg.lv.foerderung),
  netto: Math.round(erg.lv.netto),
  wp_module: erg.derived.wp_module,
  variante: eingaben.aufstellvariante ?? '–',
  warnungen: erg.warnungen.length,
})

const FELDER = [
  ['status', 'Status', v => v],
  ['dq', 'DQ %', v => v],
  ['wp_module', 'WP-Module', v => v],
  ['variante', 'Aufstellvariante', v => VARIANTEN_NAME[v] ?? v],
  ['brutto', 'Brutto-LV', euro],
  ['foerderung', 'Förderung', euro],
  ['netto', 'Netto-LV', euro],
  ['warnungen', 'Hinweise', v => v],
]

export default function Testfaelle({ eingaben, setEingaben, annahmen, ergebnis, setScreen, katalog, sektionen }) {
  const [faelle, setFaelle] = useState(lade)
  const [name, setName] = useState('')
  const [lauf, setLauf] = useState(null) // { datum, ergebnisse: {id: snapshot} }

  const aktualisiere = (neu) => { setFaelle(neu); speichere(neu) }

  const speichernAktuell = () => {
    const fall = {
      id: 'tf_' + Date.now(),
      name: name.trim() || `Testfall vom ${new Date().toLocaleString('de-DE')}`,
      datum: new Date().toISOString().slice(0, 10),
      eingaben: { ...eingaben },
      referenz: snapshot(ergebnis, eingaben),
    }
    aktualisiere([...faelle, fall])
    setName('')
  }

  const rechenlauf = () => {
    const ergebnisse = {}
    const fragen = sektionen?.flatMap(s => s.fragen.map(f => ({ ...f, sektion: s.id })))
    for (const f of faelle) {
      const erg = berechne(f.eingaben, { annahmen, katalog, fragen })
      ergebnisse[f.id] = snapshot(erg, f.eingaben)
    }
    setLauf({ datum: new Date().toLocaleString('de-DE'), ergebnisse })
  }

  const alsReferenz = () => {
    if (!lauf) return
    aktualisiere(faelle.map(f => lauf.ergebnisse[f.id] ? { ...f, referenz: lauf.ergebnisse[f.id] } : f))
    setLauf(null)
  }

  const abweichungen = lauf
    ? faelle.filter(f => lauf.ergebnisse[f.id] &&
        FELDER.some(([k]) => lauf.ergebnisse[f.id][k] !== f.referenz[k])).length
    : 0

  return (
    <div className="seite">
      <div className="admin-banner no-print">
        ⚙ Admin-Bereich · Testfälle werden lokal im Browser gespeichert. Nur für Demo-Validierung.
      </div>
      <div className="karte">
        <h2>Test- & Validierungsumgebung</h2>
        <p className="hinweis">
          Konfigurationen als Testfälle speichern (lokal im Browser). Nach Änderungen an Annahmen
          oder Regeln einen Rechenlauf starten: alle Testfälle werden neu berechnet und tabellarisch
          mit ihrem Referenzlauf verglichen – so fallen unbeabsichtigte Ergebnisänderungen sofort auf.
        </p>
        <div className="zeile">
          <input
            placeholder="Name für aktuellen Testfall"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button className="primaer" onClick={speichernAktuell}>Aktuelle Konfiguration speichern</button>
          <button onClick={rechenlauf} disabled={!faelle.length}>Rechenlauf starten ({faelle.length} Fälle)</button>
          {lauf && <button onClick={alsReferenz}>Lauf als neue Referenz übernehmen</button>}
        </div>
        {lauf && (
          <p className={abweichungen ? 'warnbox' : 'okbox'}>
            Rechenlauf {lauf.datum}: {abweichungen === 0
              ? 'keine Abweichungen gegenüber den Referenzläufen.'
              : `${abweichungen} Testfall/Testfälle mit Abweichungen (rot markiert).`}
          </p>
        )}
      </div>

      {faelle.length === 0 ? (
        <div className="karte"><p className="hinweis">
          Noch keine Testfälle gespeichert. Auf Screen 1 ein Preset laden, ggf. anpassen, dann hier speichern.
        </p></div>
      ) : faelle.map(f => {
        const akt = lauf?.ergebnisse[f.id]
        return (
          <div className="karte" key={f.id}>
            <div className="druckkopf">
              <h3>{f.name} <span className="hinweis">(Referenzlauf vom {f.datum})</span></h3>
              <div>
                <button onClick={() => { setEingaben({ ...f.eingaben }); setScreen('konfiguration') }}>In Konfigurator laden</button>{' '}
                <button onClick={() => aktualisiere(faelle.filter(x => x.id !== f.id))}>Löschen</button>
              </div>
            </div>
            <table className="lv">
              <thead>
                <tr><th>Größe</th><th>Referenzlauf</th>{akt && <th>aktueller Lauf</th>}{akt && <th>Abweichung</th>}</tr>
              </thead>
              <tbody>
                {FELDER.map(([key, label, fmt]) => {
                  const diff = akt && akt[key] !== f.referenz[key]
                  return (
                    <tr key={key} className={diff ? 'diff' : ''}>
                      <td>{label}</td>
                      <td>{fmt(f.referenz[key])}</td>
                      {akt && <td>{fmt(akt[key])}</td>}
                      {akt && <td>{diff ? '⚠ geändert' : '–'}</td>}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
