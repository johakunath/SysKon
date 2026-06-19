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
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'analyse-richt-lv.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const NAECHSTE_AKTION = {
  gruen: 'Analyse plausibel: intern mit Annahmen und Prüfpunkten weiterbearbeiten',
  gelb: 'Interne Prüfpunkte klären und Annahmen vor der nächsten Runde schärfen',
  orange: 'Fachprüfung einplanen, bevor Umfang oder Kosten kommuniziert werden',
  rot: 'Nicht als Standardfall behandeln; separaten Lösungsweg prüfen',
  unbekannt: 'Pflichtfragen ergänzen, damit die Analyse belastbarer wird',
}

const LIMITS = [
  'Interne Demo-Annahme, kein Kundenangebot und keine Marge.',
  'Keine rechtsverbindliche Schall-, Förder- oder Ausführungsplanung.',
  'Kosten dienen nur als interne Richtindikation für den nächsten Prüf- und Gesprächsschritt.',
]

function AnalyseKpi({ label, value, note }) {
  return (
    <div className="analyse-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  )
}

export default function Ergebnis({ eingaben, annahmen, ergebnis }) {
  const [tab, setTab] = useState('vorloesung')
  const d = ergebnis.derived
  const lv = ergebnis.lv

  const gruppen = LV_GRUPPEN
    .map(g => ({ name: g, positionen: lv.positionen.filter(p => p.gruppe === g) }))
    .filter(g => g.positionen.length > 0)

  const blocker = ergebnis.warnungen.filter(w => w.status === 'rot' || w.status === 'orange')
  const hinweise = ergebnis.warnungen.filter(w => w.status !== 'rot' && w.status !== 'orange')
  const scopeKurz = gruppen.slice(0, 5).map(g => g.name).join(', ')

  return (
    <div className="seite">
      <div className={`summary-strip status-${ergebnis.status ?? 'unbekannt'} no-print`}>
        <span className={`ampel gross ${ergebnis.status ?? 'unbekannt'}`} />
        <div className="summary-mitte">
          <strong>Analyse: {STATUS_LABEL[ergebnis.status]}</strong>
          <span className="summary-detail">{d.wp_module} × {annahmen.wp_modul_kw} kW · CAPEX-Indikation netto {euro(lv.netto)}</span>
        </div>
        <div className="summary-aktion">{NAECHSTE_AKTION[ergebnis.status ?? 'unbekannt']}</div>
      </div>

      <div className="tabs-sekundaer no-print">
        {[['vorloesung', 'Vorlösung'], ['umfang', 'Umfang & CAPEX'], ['pruefpunkte', 'Prüfpunkte']].map(([id, label]) => (
          <button key={id} className={tab === id ? 'tab aktiv' : 'tab'} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'vorloesung' && (
        <div className="analyse-grid">
          <div className="karte analyse-hauptkarte">
            <h3>Vorlösung für die interne Analyse</h3>
            <div className="analyse-kpis">
              <AnalyseKpi label="Technologiepfad" value="Hybrid: Luft-Wasser-WP + Gas-Bestandskessel" />
              <AnalyseKpi label="WP-Kaskade" value={`${d.wp_module} × ${annahmen.wp_modul_kw} kW = ${d.wp_kw} kW`} note={d.heizlast_methode} />
              <AnalyseKpi label="Aufstellung" value={VARIANTEN_NAME[eingaben.aufstellvariante] ?? 'nicht gewählt'} />
              <AnalyseKpi label="Netto-CAPEX" value={euro(lv.netto)} note="Richtwert, Demo" />
            </div>
            <div className="table-scroll">
              <table className="fakten">
                <tbody>
                  <tr><td>Heizlast</td><td>{num(d.heizlast_effektiv)} kW {d.heizlast_geschaetzt ? '(geschätzt, R14)' : '(Eingabe)'}</td></tr>
                  <tr><td>WP-Deckungsanteil</td><td>{prozent(annahmen.wp_deckungsanteil)} der Wärmemenge, Rest Gas-Bestandskessel</td></tr>
                  <tr><td>Analyse-Status</td><td>
                    <span className={`ampel klein ${ergebnis.status ?? 'unbekannt'}`} />
                    <strong> {STATUS_LABEL[ergebnis.status]}</strong>
                  </td></tr>
                  <tr><td>Datenlage</td><td>{ergebnis.dq} % · interne Orientierung, kein Freigabekriterium</td></tr>
                  <tr><td>Prüfaufwand</td><td>Score {ergebnis.peScore} von 5 · keine LV-Kostenposition</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="karte">
            <h3>Warum diese Vorlösung passt</h3>
            <ul className="kriterien">
              {ergebnis.gruenKriterien.map((k, i) => (
                <li key={i} className={k.erfuellt ? 'ok' : 'fehlt'}>{k.erfuellt ? '✓' : '×'} {k.text}</li>
              ))}
            </ul>
            <div className="status-hierarchie">
              <div><span className="sh-label">Analyse-Status</span><span className={`ampel klein ${ergebnis.status ?? 'unbekannt'}`} /> <strong>{STATUS_LABEL[ergebnis.status]}</strong></div>
              {blocker.length > 0 && <div><span className="sh-label">Blocker</span><span className="sh-wert">{blocker.length} Prüfpunkte</span></div>}
              {hinweise.length > 0 && <div><span className="sh-label">Hinweise</span><span className="sh-wert">{hinweise.length} Hinweise</span></div>}
            </div>
          </div>

          <div className="karte">
            <h3>Annahmen & Grenzen</h3>
            <ul className="checkliste">
              {LIMITS.map(limit => <li key={limit}>{limit}</li>)}
            </ul>
            <p className="hinweis">Enthaltener Umfang: {scopeKurz}{gruppen.length > 5 ? ' …' : ''}</p>
          </div>
        </div>
      )}

      {tab === 'umfang' && (
        <div className="analyse-umfang">
          <div className="karte">
            <h3>Enthaltener Umfang und CAPEX-Indikation</h3>
            <div className="table-scroll">
              <table className="lv">
                <thead>
                  <tr><th>Position</th><th>Menge</th><th>Einheit</th><th>Einzel</th><th>Betrag</th><th>förderfähig</th><th>prüfpflichtig</th></tr>
                </thead>
                <tbody>
                  {gruppen.map(g => (
                    <React.Fragment key={g.name}>
                      <tr className="gruppe"><td colSpan="7">{g.name}</td></tr>
                      {g.positionen.map(p => (
                        <tr key={p.id}>
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
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="summe"><td colSpan="4">Zwischensumme</td><td className="r">{euro(lv.zwischensumme)}</td><td colSpan="2" /></tr>
                  <tr><td colSpan="4">Contingency ({Math.round(annahmen.contingency * 100)} %)</td><td className="r">{euro(lv.contingency)}</td><td colSpan="2" /></tr>
                  <tr className="summe"><td colSpan="4">Brutto-LV-Kosten</td><td className="r">{euro(lv.brutto)}</td><td colSpan="2" /></tr>
                  <tr><td colSpan="4">Förderung ({prozent(annahmen.foerderquote)} auf förderfähigen Anteil, Demo)</td><td className="r">−{euro(lv.foerderung)}</td><td colSpan="2" /></tr>
                  <tr className="summe"><td colSpan="4">Netto-CAPEX-Indikation</td><td className="r">{euro(lv.netto)}</td><td colSpan="2" /></tr>
                </tbody>
              </table>
            </div>
            <div className="lv-aktionen no-print">
              <p className="hinweis">Positionen aufklappen für Begründung. Interner Richtumfang ohne Marge und ohne Kundenangebots-Charakter.</p>
              <button onClick={() => exportLvCsv(lv, annahmen)}>CSV herunterladen</button>
            </div>
          </div>

          <div className="karten-reihe">
            <div className="karte">
              <h3>CAPEX-Kennzahlen</h3>
              <table className="fakten">
                <tbody>
                  <tr><td>Brutto-LV-Kosten</td><td className="r"><strong>{euro(lv.brutto)}</strong></td></tr>
                  <tr><td>förderfähiger Anteil</td><td className="r">{euro(lv.foerderfaehig)}</td></tr>
                  <tr><td>Förderung ({prozent(annahmen.foerderquote)}, Demo)</td><td className="r">−{euro(lv.foerderung)}</td></tr>
                  <tr className="summe"><td>Netto-CAPEX-Indikation</td><td className="r"><strong>{euro(lv.netto)}</strong></td></tr>
                  <tr><td>je Wohneinheit</td><td className="r">{euro(ergebnis.kennzahlen.je_we)}</td></tr>
                  <tr><td>je m² beheizte Fläche</td><td className="r">{euro(ergebnis.kennzahlen.je_m2)}</td></tr>
                  <tr><td>je kW WP-Leistung</td><td className="r">{euro(ergebnis.kennzahlen.je_kw)}</td></tr>
                </tbody>
              </table>
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
              <h3>Laufende Kosten p.a. (OPEX)</h3>
              <table className="fakten">
                <tbody>
                  {ergebnis.opex.positionen.map(p => (
                    <tr key={p.id}><td>{p.text}</td><td className="r">{euro(p.betrag)}</td></tr>
                  ))}
                  <tr className="summe"><td>Summe OPEX</td><td className="r">{euro(ergebnis.opex.summe_pa)}</td></tr>
                </tbody>
              </table>
              <p className="hinweis">CAPEX-/OPEX-Tags bereiten Stufe 2 vor; Werte bleiben Demo-Indikationen.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'pruefpunkte' && (
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
            <h3>Schall-Vorprüfung (Demo-Abschätzung)</h3>
            <p className="hinweis">Lp = LW<sub>Kaskade</sub> − 20·log₁₀(r) − 8 − Abschlag · keine rechtsverbindliche Schallberechnung.</p>
            <div className="table-scroll">
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

          <div className="karte">
            <h3>Nicht als Zusage lesen</h3>
            <ul className="checkliste">
              {LIMITS.map(limit => <li key={limit}>{limit}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
