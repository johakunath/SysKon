import React from 'react'
import { SEKTIONEN as DEFAULT_SEKTIONEN } from '../data/fragen.js'
import { HANDOVER_FOOTNOTE } from '../data/texte.js'
import { euro, korridorTitel } from './format.js'
import Ampel from '../components/Ampel.jsx'

// Hidden reference surface: kept for deferred internal print/checklist reuse,
// but intentionally not routed in the visible demo flow.
const EMPFEHLUNG = {
  gruen: 'Analyse plausibel. Annahmen, Aufstellvariante und Vor-Ort-Aufnahme intern weiter prüfen.',
  gelb: 'Interne Prüfung: offene Punkte klären (siehe Prüfliste), bevor Umfang oder CAPEX nach außen genutzt werden.',
  orange: 'Fachprüfung erforderlich, bevor ein belastbarer Richtumfang möglich ist. Fall nicht im Standardprozess weiterführen.',
  rot: 'Nicht standardfähig. Als Sonderfall behandeln oder zurückstellen; Begründung siehe Statusregeln.',
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
  pe: 'Interne Fachprüfung',
  engineering: 'Technik',
  foerderung: 'Förderprüfung',
  hinweis: '—',
}

const NAECHSTER_SCHRITT = {
  gruen: 'Analyse intern prüfen und Vor-Ort-Aufnahme vorbereiten',
  gelb: 'Offene Prüfpunkte klären und Annahmen schärfen',
  orange: 'Fachprüfung einleiten – Fall nicht im Standardprozess',
  rot: 'Als Sonderfall behandeln oder zurückstellen',
  unbekannt: 'Konfiguration vervollständigen, bevor die Analyse nutzbar ist',
}

export default function Handover({ ergebnis, sektionen = DEFAULT_SEKTIONEN }) {
  const sektionsTitel = Object.fromEntries(sektionen.map(s => [s.id, s.titel]))

  return (
    <div className="seite druckbereich">
      <div className="karte">
        <div className="druckkopf">
          <h2>Interne Prüfnotiz (nicht im Demo-Fluss)</h2>
          <button className="primaer no-print" onClick={() => window.print()}>Prüfliste exportieren</button>
        </div>
        <p>
          <Ampel status={ergebnis.status} groesse="klein" />
          <strong> Status: {korridorTitel(ergebnis)}</strong> · Datenlage {ergebnis.dq} % ·
          Interner Prüfaufwand: {ergebnis.peScore}/5 (keine LV-Kostenposition) ·
          Netto-LV {euro(ergebnis.lv.netto)}
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
              <div className="table-scroll">
                <table className="pruef-tabelle">
                  <thead>
                    <tr><th>Prüfpunkt</th><th>Owner</th><th>Ergebnis</th></tr>
                  </thead>
                  <tbody>
                    {ergebnis.warnungen.map((w, i) => (
                      <tr key={i}>
                        <td>{w.text}</td>
                        <td>{KAT_OWNER[w.kategorie] ?? '—'}</td>
                        <td><Ampel status={w.status ?? 'gelb'} groesse="klein" /> offen</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          {ergebnis.konflikte.map((k, i) => <p key={i} className="warnbox">{k}</p>)}
        </div>
      </div>

      <p className="fussnote">{HANDOVER_FOOTNOTE}</p>
    </div>
  )
}
