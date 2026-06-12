import React, { useState } from 'react'
import { LV_GRUPPEN } from '../data/katalog.js'
import { STATUS_LABEL } from '../logic/engine.js'
import { euro, num, prozent, VARIANTEN_NAME } from './format.js'

function exportLvCsv(lv, annahmen) {
  const kopf = ['Gruppe', 'Position', 'Menge', 'Einheit', 'Einzelpreis (€)', 'Betrag (€)', 'Förderfähig (%)', 'Prüfpflichtig']
  const zeilen = lv.positionen.map(p => [
    p.gruppe, p.text, p.menge, p.einheit,
    p.einzel.toFixed(2), p.betrag.toFixed(2),
    (p.foerderanteil * 100).toFixed(0),
    p.pruefpflichtig ? 'ja' : ''
  ])
  const summen = [
    ['', 'Zwischensumme', '', '', '', lv.zwischensumme.toFixed(2), '', ''],
    ['', `Contingency (${Math.round(annahmen.contingency * 100)} %)`, '', '', '', lv.contingency.toFixed(2), '', ''],
    ['', 'Brutto-LV-Kosten', '', '', '', lv.brutto.toFixed(2), '', ''],
    ['', 'Förderung (Demo)', '', '', '', (-lv.foerderung).toFixed(2), '', ''],
    ['', 'Netto-LV-Kosten', '', '', '', lv.netto.toFixed(2), '', ''],
  ]
  const escape = v => `"${String(v).replace(/"/g, '""')}"`
  const csv = [kopf, ...zeilen, ...summen].map(r => r.map(escape).join(';')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'richt-lv.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const NAECHSTE_AKTION = {
  gruen: 'Richt-LV versandfähig – Handover an PE freigeben',
  gelb: 'Offene Punkte im Handover klären, dann Richt-LV finalisieren',
  orange: 'Engineering-Prüfung erforderlich – Fall nicht im Standardprozess',
  rot: 'Engineering-Sonderfall – zurückstellen oder separat behandeln',
  unbekannt: 'Konfiguration unvollständig – Pflichtfragen ausfüllen',
}

export default function Ergebnis({ eingaben, annahmen, ergebnis }) {
  const [tab, setTab] = useState('konfiguration')
  const d = ergebnis.derived
  const lv = ergebnis.lv

  const gruppen = LV_GRUPPEN
    .map(g => ({ name: g, positionen: lv.positionen.filter(p => p.gruppe === g) }))
    .filter(g => g.positionen.length > 0)

  const blocker = ergebnis.warnungen.filter(w => w.status === 'rot' || w.status === 'orange')
  const hinweise = ergebnis.warnungen.filter(w => w.status !== 'rot' && w.status !== 'orange')

  return (
    <div className="seite">
      <div className={`summary-strip status-${ergebnis.status ?? 'unbekannt'} no-print`}>
        <span className={`ampel gross ${ergebnis.status ?? 'unbekannt'}`} />
        <div className="summary-mitte">
          <strong>{STATUS_LABEL[ergebnis.status]}</strong>
          <span className="summary-detail">{d.wp_module} × {annahmen.wp_modul_kw} kW · Netto-LV {euro(lv.netto)}</span>
        </div>
        <div className="summary-aktion">{NAECHSTE_AKTION[ergebnis.status ?? 'unbekannt']}</div>
      </div>

      <div className="tabs-sekundaer no-print">
        {[['konfiguration', 'Konfigurationsergebnis'], ['lv', 'Leistungsverzeichnis'], ['kosten', 'Kostenübersicht']].map(([id, label]) => (
          <button key={id} className={tab === id ? 'tab aktiv' : 'tab'} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'konfiguration' && (
        <div className="karten-reihe">
          <div className="karte">
            <h3>Empfohlene Lösung</h3>
            <table className="fakten">
              <tbody>
                <tr><td>Technologiepfad</td><td><strong>Hybrid: Luft-Wasser-WP + Gas-Bestandskessel</strong></td></tr>
                <tr><td>WP-Kaskade</td><td><strong>{d.wp_module} × {annahmen.wp_modul_kw} kW = {d.wp_kw} kW</strong> ({d.heizlast_methode})</td></tr>
                <tr><td>Heizlast</td><td>{num(d.heizlast_effektiv)} kW {d.heizlast_geschaetzt ? '(geschätzt, R14)' : '(Eingabe)'}</td></tr>
                <tr><td>WP-Deckungsanteil</td><td>{prozent(annahmen.wp_deckungsanteil)} der Wärmemenge, Rest Gas-Bestandskessel</td></tr>
                <tr><td>Aufstellvariante</td><td><strong>{VARIANTEN_NAME[eingaben.aufstellvariante] ?? '–'}</strong></td></tr>
                <tr><td>Status</td><td>
                  <span className={`ampel klein ${ergebnis.status ?? 'unbekannt'}`} />
                  <strong> {STATUS_LABEL[ergebnis.status]}</strong>
                </td></tr>
                <tr><td>Datenqualität</td><td>{ergebnis.dq} %</td></tr>
                <tr><td>Interne Prüfung (PE-Aufwand)</td><td>Score {ergebnis.peScore} von 5 – keine LV-Kostenposition</td></tr>
              </tbody>
            </table>
          </div>

          <div className="karte">
            <h3>Warum diese Lösung passt</h3>
            <ul className="kriterien">
              {ergebnis.gruenKriterien.map((k, i) => (
                <li key={i} className={k.erfuellt ? 'ok' : 'fehlt'}>{k.erfuellt ? '✓' : '✗'} {k.text}</li>
              ))}
            </ul>
            <div className="status-hierarchie">
              <div><span className="sh-label">Gesamtstatus</span><span className={`ampel klein ${ergebnis.status ?? 'unbekannt'}`} /> <strong>{STATUS_LABEL[ergebnis.status]}</strong></div>
              {blocker.length > 0 && <div><span className="sh-label">Blocker</span><span className="sh-wert">{blocker.length} Prüfpunkte</span></div>}
              {hinweise.length > 0 && <div><span className="sh-label">Hinweise</span><span className="sh-wert">{hinweise.length} Hinweise</span></div>}
            </div>
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
            <h3>Schall-Vorprüfung (Demo-Abschätzung)</h3>
            <p className="hinweis">Lp = LW<sub>Kaskade</sub> − 20·log₁₀(r) − 8 − Abschlag · keine rechtsverbindliche Schallberechnung.</p>
            <table className="fakten">
              <tbody>
                <tr><td>LW Kaskade ({d.wp_module} Module)</td><td>{num(d.schall_lw_kaskade, 1)} dB(A)</td></tr>
                <tr><td>Nachtgrenzwert ({eingaben.gebietstyp ?? '–'})</td><td>{d.schall_grenzwert ?? '–'} dB(A)</td></tr>
              </tbody>
            </table>
            <table className="lv">
              <thead><tr><th>Variante</th><th>Pegel am Immissionsort</th><th>Ampel</th></tr></thead>
              <tbody>
                {Object.entries(d.schall_je_variante).map(([v, s]) => (
                  <tr key={v} className={v === eingaben.aufstellvariante ? 'gewaehlt' : ''}>
                    <td>{VARIANTEN_NAME[v]}{v === eingaben.aufstellvariante ? ' (gewählt)' : ''}</td>
                    <td>{num(s.lp, 1)} dB(A) (−{s.abschlag} dB)</td>
                    <td><span className={`ampel klein ${s.ampel ?? 'unbekannt'}`} /> {s.ampel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'lv' && (
        <div className="karte">
          <h3>Richt-Leistungsverzeichnis (Demo, ohne Marge)</h3>
          <table className="lv">
            <thead>
              <tr><th>Position</th><th>Menge</th><th>Einheit</th><th>Einzel</th><th>Betrag</th><th>förderfähig</th><th>prüfpflichtig</th></tr>
            </thead>
            <tbody>
              {gruppen.map(g => (
                <React.Fragment key={g.name}>
                  <tr className="gruppe"><td colSpan="7">{g.name}</td></tr>
                  {g.positionen.map(p => (
                    <React.Fragment key={p.id}>
                      <tr>
                        <td>
                          <details>
                            <summary>{p.text}</summary>
                            <div className="begruendung">Begründung: {p.begruendung}{p.erzwungen ? ` · erzwungen durch ${p.erzwungen}` : ''} · {p.tag.toUpperCase()}</div>
                          </details>
                        </td>
                        <td className="r">{num(p.menge)}</td>
                        <td>{p.einheit}</td>
                        <td className="r">{euro(p.einzel)}</td>
                        <td className="r">{euro(p.betrag)}</td>
                        <td className="r">{prozent(p.foerderanteil)}</td>
                        <td>{p.pruefpflichtig ? 'ja' : '–'}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
              <tr className="summe"><td colSpan="4">Zwischensumme</td><td className="r">{euro(lv.zwischensumme)}</td><td colSpan="2" /></tr>
              <tr><td colSpan="4">Contingency ({Math.round(annahmen.contingency * 100)} %)</td><td className="r">{euro(lv.contingency)}</td><td colSpan="2" /></tr>
              <tr className="summe"><td colSpan="4">Brutto-LV-Kosten</td><td className="r">{euro(lv.brutto)}</td><td colSpan="2" /></tr>
              <tr><td colSpan="4">Förderung ({prozent(annahmen.foerderquote)} auf förderfähigen Anteil, Demo)</td><td className="r">−{euro(lv.foerderung)}</td><td colSpan="2" /></tr>
              <tr className="summe"><td colSpan="4">Netto-LV-Kosten</td><td className="r">{euro(lv.netto)}</td><td colSpan="2" /></tr>
            </tbody>
          </table>
          <div className="lv-aktionen no-print">
            <p className="hinweis">Jede Position aufklappen für die Begründung. Keine Marge, kein Kundenangebot.</p>
            <button onClick={() => exportLvCsv(lv, annahmen)}>CSV herunterladen</button>
          </div>
        </div>
      )}

      {tab === 'kosten' && (
        <div className="karten-reihe">
          <div className="karte">
            <h3>Investition (einmalig)</h3>
            <table className="fakten">
              <tbody>
                <tr><td>Brutto-LV-Kosten</td><td className="r"><strong>{euro(lv.brutto)}</strong></td></tr>
                <tr><td>förderfähiger Anteil</td><td className="r">{euro(lv.foerderfaehig)}</td></tr>
                <tr><td>Förderung ({prozent(annahmen.foerderquote)}, Demo)</td><td className="r">−{euro(lv.foerderung)}</td></tr>
                <tr className="summe"><td>Netto-LV-Kosten</td><td className="r"><strong>{euro(lv.netto)}</strong></td></tr>
                <tr><td>je Wohneinheit</td><td className="r">{euro(ergebnis.kennzahlen.je_we)}</td></tr>
                <tr><td>je m² beheizte Fläche</td><td className="r">{euro(ergebnis.kennzahlen.je_m2)}</td></tr>
                <tr><td>je kW WP-Leistung</td><td className="r">{euro(ergebnis.kennzahlen.je_kw)}</td></tr>
              </tbody>
            </table>
            <p className="warnbox">Keine Marge, kein Kundenangebot – Richt-LV für die Projektentwicklung (Stufe 1).</p>
          </div>

          <div className="karte">
            <h3>Energieindikation p.a. (Demo)</h3>
            {ergebnis.energie ? (
              <table className="fakten">
                <tbody>
                  <tr><td>Wärmebedarf</td><td className="r">{num(ergebnis.energie.bedarf)} MWh/a</td></tr>
                  <tr><td>davon WP ({prozent(annahmen.wp_deckungsanteil)})</td><td className="r">{num(ergebnis.energie.wp_waerme)} MWh/a</td></tr>
                  <tr><td>Strom WP (JAZ {annahmen.jaz})</td><td className="r">{num(ergebnis.energie.strom_mwh)} MWh/a · {euro(ergebnis.energie.kosten_strom)}</td></tr>
                  <tr><td>Gas Bestandskessel (η {annahmen.kessel_eta})</td><td className="r">{num(ergebnis.energie.gas_mwh)} MWh/a · {euro(ergebnis.energie.kosten_gas)}</td></tr>
                  <tr><td>Wärmekostenindikation</td><td className="r">{num(ergebnis.kennzahlen.waermekosten_mwh)} €/MWh</td></tr>
                </tbody>
              </table>
            ) : <p className="hinweis">Kein Wärmebedarf ableitbar – Verbrauch oder Fläche erfassen.</p>}
          </div>

          <div className="karte">
            <h3>Laufende Kosten p.a. (Opex)</h3>
            <table className="fakten">
              <tbody>
                {ergebnis.opex.positionen.map(p => (
                  <tr key={p.id}><td>{p.text}</td><td className="r">{euro(p.betrag)}</td></tr>
                ))}
                <tr className="summe"><td>Summe Opex</td><td className="r">{euro(ergebnis.opex.summe_pa)}</td></tr>
              </tbody>
            </table>
            <p className="hinweis">CapEx-/Opex-Tags je Position bereiten Stufe 2 (Grundpreis/Arbeitspreis) vor.</p>
          </div>
        </div>
      )}
    </div>
  )
}
