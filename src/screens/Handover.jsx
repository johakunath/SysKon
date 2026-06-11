import React from 'react'
import { SEKTIONEN } from '../data/fragen.js'
import { STATUS_LABEL } from '../logic/engine.js'
import { euro } from './format.js'

const EMPFEHLUNG = {
  gruen: 'Richt-LV versandfähig. Übergabe an PE zur Bestätigung der Aufstellvariante und Terminierung der Vor-Ort-Aufnahme.',
  gelb: 'PE-Prüfung: offene Punkte klären (siehe Prüfliste), danach Richt-LV finalisieren. Kein Versand vor Klärung.',
  orange: 'Engineering-Prüfung erforderlich, bevor ein belastbares Richt-LV möglich ist. Fall nicht im Standardprozess weiterführen.',
  rot: 'Nicht standardfähig im MVP. Als Engineering-Sonderfall behandeln oder zurückstellen; Begründung siehe Statusregeln.',
}

const FOTOS_DOKUMENTE = [
  'Fotos Heizraum (Übersicht, Kessel, Typenschild, Platzreserven)',
  'Fotos geplante Außenaufstellfläche inkl. Umfeld/Nachbarbebauung',
  'Foto Zählerschrank / Hausanschluss',
  'Wärme-/Gasabrechnungen der letzten 2–3 Jahre',
  'Grundriss/Lageplan (falls vorhanden)',
  'Wartungsprotokolle Bestandskessel (falls vorhanden)',
]

export default function Handover({ ergebnis }) {
  const kategorien = [
    ['pe', 'PE-Prüfpunkte'],
    ['engineering', 'Engineering-Prüfpunkte'],
    ['foerderung', 'Förderprüfung'],
    ['hinweis', 'Sonstige Hinweise'],
  ]
  const sektionsTitel = Object.fromEntries(SEKTIONEN.map(s => [s.id, s.titel]))

  return (
    <div className="seite druckbereich">
      <div className="karte">
        <div className="druckkopf">
          <h2>Planungs-/Engineering-Handover</h2>
          <button className="primaer no-print" onClick={() => window.print()}>Drucken / PDF</button>
        </div>
        <p>
          <span className={`ampel klein ${ergebnis.status ?? 'unbekannt'}`} />
          <strong> Status: {STATUS_LABEL[ergebnis.status]}</strong> · Datenqualität {ergebnis.dq} % ·
          interner PE-Aufwandsscore {ergebnis.peScore}/5 (keine LV-Kostenposition) ·
          Netto-LV {euro(ergebnis.lv.netto)} (Demo)
        </p>
        <p className="warnbox">Empfehlung: {EMPFEHLUNG[ergebnis.status]}</p>
      </div>

      <div className="karten-reihe">
        <div className="karte">
          <h3>Fehlende Daten ({ergebnis.fehlendeDaten.length})</h3>
          {ergebnis.fehlendeDaten.length === 0
            ? <p className="hinweis">Alle Pflichtfragen beantwortet.</p>
            : (
              <ul className="checkliste">
                {ergebnis.fehlendeDaten.map((f, i) => (
                  <li key={i}><strong>{f.sektion}</strong> ({sektionsTitel[f.sektion]}): {f.label}</li>
                ))}
              </ul>
            )}
        </div>

        <div className="karte">
          <h3>Benötigte Fotos & Dokumente</h3>
          <ul className="checkliste">
            {FOTOS_DOKUMENTE.map((t, i) => <li key={i}>☐ {t}</li>)}
          </ul>
        </div>

        <div className="karte">
          <h3>Prüfpunkte aus Regeln</h3>
          {kategorien.map(([kat, titel]) => {
            const eintraege = ergebnis.warnungen.filter(w => w.kategorie === kat)
            if (!eintraege.length) return null
            return (
              <div key={kat}>
                <h4>{titel}</h4>
                <ul className="checkliste">
                  {eintraege.map((w, i) => <li key={i}>☐ {w.text} <span className="hinweis">({w.regelId})</span></li>)}
                </ul>
              </div>
            )
          })}
          {ergebnis.warnungen.length === 0 && <p className="hinweis">Keine Prüfpunkte ausgelöst.</p>}
          {ergebnis.konflikte.map((k, i) => <p key={i} className="warnbox">{k}</p>)}
        </div>
      </div>

      <p className="fussnote">
        Demo-Prototyp: alle Werte sind Demo-Annahmen, Schallwerte sind eine Demo-Abschätzung,
        Förderlogik ist Demo-Logik (keine Förderberatung).
      </p>
    </div>
  )
}
