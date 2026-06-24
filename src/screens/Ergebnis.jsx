import React, { useState, useEffect } from 'react'
import { LV_GRUPPEN } from '../data/katalog.js'
import { euro, num, prozent, VARIANTEN_NAME, korridorTitel } from './format.js'
import { CONTRACTING_DEMO_HINWEIS } from '../data/texte.js'
import Ampel from '../components/Ampel.jsx'
import ScopeListe from '../components/ScopeListe.jsx'

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

function AnalyseKpi({ label, value, note }) {
  return (
    <div className="analyse-kpi">
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  )
}

function ContractingKarte({ contracting }) {
  if (!contracting) return null
  const c = contracting
  const pg = c.preisgleitformel
  return (
    <div className="karte analyse-hauptkarte">
      <h3>Richtpreis-Angebot (Demo)</h3>
      <p className="hinweis">{CONTRACTING_DEMO_HINWEIS}</p>
      <div className="analyse-kpis">
        <AnalyseKpi label="Grundpreis" value={`${euro(c.grundpreis_monat)} / Monat`} note={`${euro(c.grundpreis_pa)} p.a.`} />
        <AnalyseKpi label="Arbeitspreis" value={c.arbeitspreis_mwh != null ? `${euro(c.arbeitspreis_mwh)} / MWh` : '–'} note="verbrauchsabhängig" />
        <AnalyseKpi label="Vertragslaufzeit" value={`${c.laufzeit} Jahre`} />
      </div>
      <div className="karten-reihe">
        <div className="karte">
          <h4>Preisgleitformel (Demo)</h4>
          <table className="fakten">
            <tbody>
              <tr><td>Festanteil</td><td className="r">{prozent(pg.festanteil)}</td></tr>
              {pg.komponenten.map(k => (
                <tr key={k.schluessel}><td>{k.label}</td><td className="r">{prozent(k.gewicht)}</td></tr>
              ))}
              <tr className="summe"><td>Basisjahr</td><td className="r">{pg.basisjahr}</td></tr>
            </tbody>
          </table>
          <p className="hinweis">AVBFernwärme §24-orientiert (Demo): Festanteil + gewichtete Indizes. Reale Indexreihen und rechtliche Prüfung sind offen.</p>
        </div>
        <div className="karte">
          <h4>Vertragsparameter</h4>
          <table className="fakten">
            <tbody>
              <tr><td>Servicegrenze</td><td>{c.vertragsparameter.servicegrenze}</td></tr>
              <tr><td>Effizienzrisiko</td><td>{c.vertragsparameter.effizienzrisiko}</td></tr>
              <tr><td>Preisanpassung</td><td>{c.vertragsparameter.preisanpassung}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="karte">
          <h4>Enthaltene Services</h4>
          {c.enthalteneServices.length > 0 ? (
            <ul className="checkliste">
              {c.enthalteneServices.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          ) : <p className="hinweis">Im aktuellen Demo-Scope keine separaten Serviceposten.</p>}
        </div>
      </div>
    </div>
  )
}

function KundenScope({ scope }) {
  return (
    <div className="kundenumfang">
      <ContractingKarte contracting={scope.contracting} />
      <div className="karte analyse-hauptkarte">
        <h3>Kundenumfang</h3>
        <p className="hinweis">
          Verständliche Komponenten- und Leistungsübersicht für das Kundengespräch. Ohne Preise und ohne interne Kalkulation.
        </p>
        <div className="kunden-gruppen">
          {scope.gruppen.map(gruppe => (
            <section key={gruppe.name} className="kunden-gruppe">
              <h4>{gruppe.name}</h4>
              <div className="kunden-positionen">
                {gruppe.positionen.map(pos => (
                  <article key={pos.id} className="kunden-position">
                    <div className="kunden-position-kopf">
                      <strong>{pos.titel}</strong>
                      {pos.pruefpflichtig ? <span className="kunden-badge warn">prüfen</span> : <span className="kunden-badge">enthalten</span>}
                    </div>
                    <dl>
                      <div><dt>Hersteller</dt><dd>{pos.hersteller}</dd></div>
                      <div><dt>Produkt</dt><dd>{pos.produkt}</dd></div>
                      <div><dt>Größe / Leistung</dt><dd>{pos.leistungsklasse}</dd></div>
                      <div><dt>Menge</dt><dd>{num(pos.menge)} {pos.einheit}</dd></div>
                    </dl>
                    <p>{pos.leistungsumfang}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="karten-reihe">
        <div className="karte">
          <h3>Annahmen</h3>
          <ScopeListe eintraege={scope.annahmen} preview />
        </div>

        <div className="karte">
          <h3>Ausschlüsse</h3>
          <ScopeListe eintraege={scope.ausschluesse} preview leer="Keine kundenseitigen Ausschlüsse im aktuellen Demo-Korridor." />
        </div>

        <div className="karte">
          <h3>Offene Punkte</h3>
          <ScopeListe eintraege={scope.offenePunkte} preview leer="Keine priorisierten offenen Punkte für diese Kundensicht." />
        </div>
      </div>
    </div>
  )
}

export default function Ergebnis({
  eingaben, annahmen, ergebnis, sichtModus = 'kunde',
  angebote = [], aktivesAngebotId = null,
  gespraechsErgebnis, setGespraechsErgebnis,
  onAngebotSpeichern, onAngebotLaden, onAngebotDuplizieren,
}) {
  const [internTab, setInternTab] = useState('loesung')
  const [gespeichert, setGespeichert] = useState(false)
  const [angebotName, setAngebotName] = useState(() => {
    const aktiv = angebote.find(a => a.id === aktivesAngebotId)
    return aktiv?.name ?? `Angebot ${new Date().toLocaleDateString('de-DE')}`
  })

  useEffect(() => {
    const aktiv = angebote.find(a => a.id === aktivesAngebotId)
    setAngebotName(aktiv?.name ?? `Angebot ${new Date().toLocaleDateString('de-DE')}`)
  }, [aktivesAngebotId, angebote])

  const handleSpeichern = () => {
    onAngebotSpeichern?.(angebotName)
    setGespeichert(true)
    setTimeout(() => setGespeichert(false), 2000)
  }
  const d = ergebnis.derived
  const lv = ergebnis.lv
  const kundenScope = ergebnis.kundenScope
  const istKunde = sichtModus === 'kunde'

  const gruppenNamen = [...new Set([...LV_GRUPPEN, ...lv.positionen.map(p => p.gruppe)])]
  const gruppen = gruppenNamen
    .map(g => ({ name: g, positionen: lv.positionen.filter(p => p.gruppe === g) }))
    .filter(g => g.positionen.length > 0)

  const blocker = ergebnis.warnungen.filter(w => w.status === 'rot' || w.status === 'orange')
  const hinweise = ergebnis.warnungen.filter(w => w.status !== 'rot' && w.status !== 'orange')
  const scopeKurz = gruppen.slice(0, 5).map(g => g.name).join(', ')
  const summaryAktion = istKunde
    ? 'Offene Pflichtdaten und Regelhinweise priorisieren, bevor der Kundenumfang weitergegeben wird.'
    : ergebnis.statusKorridor?.aktion
  const summaryDetail = istKunde
    ? `${kundenScope.gruppen.length} Umfangsgruppen · keine Preisansicht`
    : `${d.wp_module} × ${annahmen.wp_modul_kw} kW · Netto-CAPEX ${euro(lv.netto)} (Demo)`

  return (
    <div className="seite">
      <div className={`summary-strip status-${ergebnis.status ?? 'unbekannt'} no-print`}>
        <Ampel status={ergebnis.status} groesse="gross" />
        <div className="summary-mitte">
          <strong>Gesprächskorridor: {korridorTitel(ergebnis)}</strong>
          <span className="summary-detail">{summaryDetail}</span>
        </div>
        <div className="summary-aktion">{summaryAktion}</div>
      </div>

      <div className="angebot-aktionsbar no-print">
        <div className="angebot-speichern-reihe">
          <input
            type="text"
            className="angebot-name-input"
            value={angebotName}
            onChange={e => setAngebotName(e.target.value)}
            placeholder={`Angebot ${new Date().toLocaleDateString('de-DE')}`}
            aria-label="Angebotsname"
          />
          <button onClick={handleSpeichern} className={gespeichert ? 'btn-erfolg' : ''}>
            {gespeichert ? 'Gespeichert ✓' : 'Speichern'}
          </button>
          <button onClick={onAngebotDuplizieren}>Duplizieren</button>
          <button onClick={() => window.print()}>Als PDF exportieren</button>
        </div>
        {angebote.length > 0 && (
          <div className="angebot-varianten">
            <strong className="varianten-label">Gespeicherte Varianten ({angebote.length})</strong>
            <ul className="varianten-liste">
              {angebote.slice(0, 10).map(a => (
                <li key={a.id} className={`variante-zeile${a.id === aktivesAngebotId ? ' aktiv' : ''}`}>
                  <span className="variante-name">{a.name}</span>
                  <small className="variante-datum">{new Date(a.erstelltAm).toLocaleDateString('de-DE')}</small>
                  <button onClick={() => onAngebotLaden?.(a.id)} disabled={a.id === aktivesAngebotId}>
                    {a.id === aktivesAngebotId ? 'Aktiv' : 'Laden'}
                  </button>
                </li>
              ))}
              {angebote.length > 10 && (
                <li className="hinweis variante-mehr">… {angebote.length - 10} weitere Varianten</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="print-header print-only">
        <div>
          <strong>Richtpreis-Angebot (Demo)</strong>
          <span className="print-angebot-name">{angebotName}</span>
        </div>
        <small>{new Date().toLocaleDateString('de-DE')}</small>
      </div>

      {istKunde && <KundenScope scope={kundenScope} />}

      {!istKunde && (
        <div className="tabs-sekundaer no-print">
          {[['loesung', 'Lösung & Umfang'], ['pruefpunkte', 'Prüfpunkte']].map(([id, label]) => (
            <button key={id} className={internTab === id ? 'tab aktiv' : 'tab'} onClick={() => setInternTab(id)}>{label}</button>
          ))}
        </div>
      )}

      {!istKunde && internTab === 'loesung' && (<>
        <div className="analyse-grid">
          <div className="karte analyse-hauptkarte">
            <h3>Vorlösung für Sales/KAM</h3>
            <div className="analyse-kpis">
              <AnalyseKpi label="Technologiepfad" value="Hybrid: Luft-Wasser-WP + Gas-Bestandskessel" />
              <AnalyseKpi label="WP-Kaskade" value={`${d.wp_module} × ${annahmen.wp_modul_kw} kW = ${d.wp_kw} kW`} note={d.heizlast_methode} />
              <AnalyseKpi
                label="Aufstellung"
                value={VARIANTEN_NAME[eingaben.aufstellvariante] ?? 'nicht gewählt'}
                note={d.aufstellung_empfohlen_label ? `Empfohlen: ${d.aufstellung_empfohlen_label}` : null}
              />
              <AnalyseKpi label="Netto-CAPEX" value={euro(lv.netto)} note="Richtwert, Demo" />
            </div>
            <div className="table-scroll">
              <table className="fakten">
                <tbody>
                  <tr><td>Heizlast</td><td>{num(d.heizlast_effektiv)} kW {d.heizlast_geschaetzt ? '(geschätzt, R14)' : '(Eingabe)'}</td></tr>
                  <tr><td>WP-Deckungsanteil</td><td>{prozent(annahmen.wp_deckungsanteil)} der Wärmemenge, Rest Gas-Bestandskessel</td></tr>
                  <tr><td>Placement-Empfehlung</td><td>{d.aufstellung_begruendung ?? 'noch nicht ableitbar'}</td></tr>
                  {d.aufstellung_abweichung ? (
                    <tr><td>Aufstell-Abweichung</td><td>
                      Gewählt: {d.aufstellung_abweichung.gewaehlt_label}; empfohlen: {d.aufstellung_abweichung.empfohlen_label}
                      {d.aufstellung_abweichung.kosten_delta > 0 ? ` (${euro(d.aufstellung_abweichung.kosten_delta)} mehr Zusatz-CAPEX).` : '.'}
                    </td></tr>
                  ) : null}
                  <tr><td>Gesprächskorridor</td><td>
                    <Ampel status={ergebnis.status} groesse="klein" />
                    <strong> {korridorTitel(ergebnis)}</strong>
                    <div className="hinweis">{ergebnis.statusKorridor?.bedeutung}</div>
                  </td></tr>
                  <tr><td>Datenlage</td><td>{ergebnis.dq} % · {ergebnis.datenlage?.titel}<div className="hinweis">{ergebnis.datenlage?.aktion}</div></td></tr>
                  <tr><td>Prüfaufwand</td><td>Score {ergebnis.peScore} von 5 · keine LV-Kostenposition</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="karte">
            <h3>Warum dieser Korridor entsteht</h3>
            <ul className="kriterien">
              {ergebnis.standardKriterien.map((k, i) => (
                <li key={i} className={k.erfuellt ? 'ok' : 'fehlt'}>{k.erfuellt ? '✓' : '×'} {k.text}</li>
              ))}
            </ul>
            <div className="status-hierarchie">
              <div><span className="sh-label">Gesprächskorridor</span><Ampel status={ergebnis.status} groesse="klein" /> <strong>{korridorTitel(ergebnis)}</strong></div>
              {blocker.length > 0 && <div><span className="sh-label">Blocker</span><span className="sh-wert">{blocker.length} Prüfpunkte</span></div>}
              {hinweise.length > 0 && <div><span className="sh-label">Hinweise</span><span className="sh-wert">{hinweise.length} Hinweise</span></div>}
            </div>
          </div>

          <div className="karte">
            <h3>Datenlage als Sales-Check</h3>
            <p className="hinweis">{ergebnis.datenlage?.bedeutung}</p>
            {ergebnis.datenlage?.fehlendeFokusDaten?.length > 0 ? (
              <ul className="checkliste">
                {ergebnis.datenlage.fehlendeFokusDaten.map(f => (
                  <li key={f.id}><strong>{f.sektion}</strong>: {f.label}</li>
                ))}
              </ul>
            ) : <p className="okbox">Keine gewichteten Pflichtdaten offen.</p>}
          </div>

          <div className="karte">
            <h3>Enthaltener Umfang (Kurz)</h3>
            <p className="hinweis">{scopeKurz}{gruppen.length > 5 ? ' …' : ''}</p>
          </div>
        </div>

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
              <p className="hinweis">Positionen aufklappen für Begründung. Sales-interner Richtumfang (Richtpreise, Demo).</p>
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

            <div className="karte">
              <h3>Commercial / Pricing (intern, Demo)</h3>
              <table className="fakten">
                <tbody>
                  <tr><td>Netto-CAPEX</td><td className="r">{euro(ergebnis.pricing.capex)}</td></tr>
                  <tr><td>Kapitaldienst p.a. ({prozent(annahmen.kapitalkostensatz)}, {ergebnis.pricing.laufzeit} J)</td><td className="r">{euro(ergebnis.pricing.kapitaldienstPa)}</td></tr>
                  <tr><td>fixer Service p.a. (OPEX)</td><td className="r">{euro(ergebnis.pricing.opexPa)}</td></tr>
                  <tr className="summe"><td>Grundpreis p.a.</td><td className="r"><strong>{euro(ergebnis.pricing.grundpreisPa)}</strong></td></tr>
                  <tr><td>variable Energiekosten</td><td className="r">{ergebnis.pricing.variabelProMwh != null ? `${euro(ergebnis.pricing.variabelProMwh)} /MWh` : '–'}</td></tr>
                  <tr><td>AP-Marge (auf Ziel-IRR gelöst)</td><td className="r">{prozent(ergebnis.pricing.effektiveMarge)}{ergebnis.pricing.margeGedeckelt ? ' ⚠︎ gedeckelt' : ''}</td></tr>
                  <tr><td>AP-Marge absolut</td><td className="r">{ergebnis.pricing.apMargeAbsolutPa != null ? `${euro(ergebnis.pricing.apMargeAbsolutPa)} p.a.` : '–'}</td></tr>
                  <tr className="summe"><td>Arbeitspreis</td><td className="r"><strong>{ergebnis.pricing.arbeitspreisMwh != null ? `${euro(ergebnis.pricing.arbeitspreisMwh)} /MWh` : '–'}</strong></td></tr>
                  <tr><td>erreichte IRR</td><td className="r">{ergebnis.pricing.erreichteIrr != null ? prozent(ergebnis.pricing.erreichteIrr) : '–'} (Ziel {prozent(ergebnis.pricing.zielIrr)})</td></tr>
                  <tr><td>Marge Ziel / Ambition</td><td className="r">{ergebnis.pricing.margeZiel != null ? prozent(ergebnis.pricing.margeZiel) : '–'} / {ergebnis.pricing.margeAmbition != null ? prozent(ergebnis.pricing.margeAmbition) : '–'}</td></tr>
                </tbody>
              </table>
              <p className="hinweis">Marge nur auf den Arbeitspreis (keine Marge auf CAPEX/Grundpreis). AP-Marge iterativ auf die Ziel-IRR gelöst (Cashflow-IRR). „Gedeckelt": Ziel-IRR auch bei Maximalmarge nicht erreichbar. Nicht in der Kundensicht.</p>
            </div>
          </div>
        </div>
      </>)}

      {!istKunde && internTab === 'pruefpunkte' && (
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
            ) : <p className="warnbox">Keine tragfähige Aufstellvariante im aktuellen Demo-Korridor.</p>}
          </div>

        </div>
      )}

      <div className="karte gespraech-karte no-print">
        <h3>Gesprächsergebnis</h3>
        <div className="gespraech-felder">
          <div className="gespraech-feld">
            <label htmlFor="gespraech-status">Status</label>
            <select
              id="gespraech-status"
              value={gespraechsErgebnis?.status ?? 'offen'}
              onChange={e => setGespraechsErgebnis?.(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="offen">Offen</option>
              <option value="interessiert">Interessiert</option>
              <option value="folgetermin">Folgetermin vereinbart</option>
              <option value="nicht_weiterverfolgt">Nicht weiterverfolgt</option>
            </select>
          </div>
          <div className="gespraech-feld gespraech-feld-kommentar">
            <label htmlFor="gespraech-kommentar">Kommentar</label>
            <textarea
              id="gespraech-kommentar"
              maxLength={200}
              rows={3}
              value={gespraechsErgebnis?.kommentar ?? ''}
              onChange={e => setGespraechsErgebnis?.(prev => ({ ...prev, kommentar: e.target.value }))}
              placeholder="Gesprächsnotiz (max. 200 Zeichen)"
            />
            <small className="zeichen-zaehler">{(gespraechsErgebnis?.kommentar ?? '').length}/200</small>
          </div>
        </div>
        <p className="hinweis">Wird beim Speichern mit dem Angebot abgelegt. Kein CRM-Ersatz.</p>
      </div>
    </div>
  )
}
