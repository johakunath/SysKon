import React from 'react'
import { SEKTIONEN } from '../data/fragen.js'
import { STATUS_LABEL } from '../logic/engine.js'
import { euro } from './format.js'

const EMPFEHLUNG = {
  gruen: 'Richt-LV versandfähig. Übergabe an PE zur Bestätigung der Aufstellvariante und Terminierung der Vor-Ort-Aufnahme.',
  gelb: 'Interne Prüfung: offene Punkte klären (siehe Prüfliste), danach Richt-LV finalisieren. Kein Versand vor Klärung.',
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

const KAT_OWNER = {
  pe: 'PE / Technik',
  engineering: 'Technik',
  foerderung: 'Förderung / PE',
  hinweis: '—',
}

const NAECHSTER_SCHRITT = {
  gruen: 'Handover an PE freigeben und Vor-Ort-Aufnahme terminieren',
  gelb: 'Offene Prüfpunkte klären (siehe Tabelle), dann Richt-LV finalisieren',
  orange: 'Engineering-Prüfung einleiten – Fall nicht im Standardprozess',
  rot: 'Als Engineering-Sonderfall behandeln oder zurückstellen',
  unbekannt: 'Konfiguration vervollständigen bevor Handover möglich',
}

export default function Handover({ ergebnis }) {
  const sektionsTitel = Object.fromEntries(SEKTIONEN.map(s => [s.id, s.titel]))

  return (
    <div className="seite druckbereich">
      <div className="karte">
        <div className="druckkopf">
          <h2>Planungs-/Engineering-Handover</h2>
          <button className="primaer no-print" onClick={() => window.print()}>Handover exportieren</button>
        </div>
        <p>
          <span className={`ampel klein ${ergebnis.status ?? 'unbekannt'}`} />
          <strong> Status: {STATUS_LABEL[ergebnis.status]}</strong> · Datenqualität {ergebnis.dq} % ·
          Interner Prüfaufwand: {ergebnis.peScore}/5 (keine LV-Kostenposition) ·
          Netto-LV {euro(ergebnis.lv.netto)} (Demo)
        </p>
        <div className="naechster-schritt">
          <span className="ns-label">Nächster Schritt</span>
          {NAECHSTER_SCHRITT[ergebnis.status ?? 'unbekannt']}
        </div>
        <p className="hinweis">{EMPFEHLUNG[ergebnis.status]}</p>
      </div>

      <div className="karten-reihe">
        <div className="karte">
          <h3>Pflichtdaten vollständig?</h3>
          {ergebnis.fehlendeDaten.length === 0
            ? <p className="okbox">✓ Alle Pflichtfragen beantwortet.</p>
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
          {ergebnis.warnungen.length === 0
            ? <p className="hinweis">Keine Prüfpunkte ausgelöst.</p>
            : (
              <table className="pruef-tabelle">
                <thead>
                  <tr><th>Prüfpunkt</th><th>Owner</th><th>Ergebnis</th></tr>
                </thead>
                <tbody>
                  {ergebnis.warnungen.map((w, i) => (
                    <tr key={i}>
                      <td>{w.text}</td>
                      <td>{KAT_OWNER[w.kategorie] ?? '—'}</td>
                      <td><span className={`ampel klein ${w.status ?? 'gelb'}`} /> offen</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
