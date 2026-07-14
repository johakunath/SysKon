import React, { useState, useEffect } from 'react'
import { gruppiereNachGruppe } from '../logic/lv.js'
import { FOERDERUNG_ART_LABEL } from '../data/annahmen.js'
import { euro, num, prozent, VARIANTEN_NAME, korridorTitel } from './format.js'
import { CONTRACTING_DEMO_HINWEIS } from '../data/texte.js'
import Ampel from '../components/Ampel.jsx'
import ScopeListe from '../components/ScopeListe.jsx'

function exportLvCsv(lv, annahmen) {
  const kopf = ['Gruppe', 'Position', 'Artikelnummer', 'Menge', 'Einheit', 'Listenpreis (€)', 'EK (€)', 'Einzelpreis (€)', 'Betrag (€)', 'Förderfähig (%)', 'Prüfpflichtig']
  const zeilen = lv.positionen.map(p => [
    p.gruppe, p.text, p.artikel?.artikelnummer ?? '', p.menge, p.einheit,
    p.artikel ? p.artikel.listenpreis.toFixed(2) : '',
    p.artikel ? p.artikel.ek.toFixed(2) : '',
    p.einzel.toFixed(2), p.betrag.toFixed(2),
    (p.foerderanteil * 100).toFixed(0),
    p.pruefpflichtig ? 'ja' : ''
  ])
  const summen = [
    ['', 'Zwischensumme', '', '', '', '', '', '', lv.zwischensumme.toFixed(2), '', ''],
    ['', `Contingency (${Math.round(annahmen.contingency * 100)} %)`, '', '', '', '', '', '', lv.contingency.toFixed(2), '', ''],
    ['', 'Brutto-LV-Kosten', '', '', '', '', '', '', lv.brutto.toFixed(2), '', ''],
    ['', 'Förderung (Demo)', '', '', '', '', '', '', (-lv.foerderung).toFixed(2), '', ''],
    ['', 'Netto-LV-Kosten', '', '', '', '', '', '', lv.netto.toFixed(2), '', ''],
  ]
  const escape = v => `"${String(v).replace(/"/g, '""')}"`
  const csv = [kopf, ...zeilen, ...summen].map(r => r.map(escape).join(';')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'angebot-kalkulation.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const ICON_PROPS = { viewBox: '0 0 16 16', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

function IconSpeichern() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2 2h9l3 3v9H2V2Z" />
      <path d="M4.5 2v4h6V2M4.5 14v-4.5h7V14" />
    </svg>
  )
}
function IconDuplizieren() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="2.5" y="4.5" width="8" height="9" rx="1" />
      <path d="M5.5 4.5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1.5" />
    </svg>
  )
}
function IconExport() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 1.5v7.5M5 6.5 8 9.5 11 6.5" />
      <path d="M2.5 11v2.5h11V11" />
    </svg>
  )
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

function ContractingKarte({ contracting, foerderart }) {
  if (!contracting) return null
  const c = contracting
  const pg = c.preisgleitformel
  const avb = c.avbAlternative
  return (
    <div className="karte analyse-hauptkarte">
      <h3>Richtpreis-Angebot (Demo)</h3>
      <p className="hinweis">{CONTRACTING_DEMO_HINWEIS}</p>
      <div className="analyse-kpis">
        <AnalyseKpi label="Grundpreis" value={`${euro(c.grundpreis_monat)} / Monat`} note={`${euro(c.grundpreis_pa)} p.a.`} />
        <AnalyseKpi label="Arbeitspreis" value={c.arbeitspreis_mwh != null ? `${euro(c.arbeitspreis_mwh)} / MWh` : '–'} note="verbrauchsabhängig" />
        <AnalyseKpi label="Vertragslaufzeit" value={`${c.laufzeit} Jahre`} />
        {foerderart && <AnalyseKpi label="Förderung" value={foerderart} note="Indikativ, kein Rechtsanspruch" />}
      </div>
      {avb && (
        <div className="karte" style={{ marginTop: '0.75rem' }}>
          <h4>AVB-Variante (10 Jahre, immer verfügbar)</h4>
          <table className="fakten">
            <tbody>
              <tr><td>Grundpreis</td><td className="r">{euro(avb.grundpreis_monat)} / Monat ({euro(avb.grundpreis_pa)} p.a.)</td></tr>
              <tr><td>Arbeitspreis</td><td className="r">{avb.arbeitspreis_mwh != null ? `${euro(avb.arbeitspreis_mwh)} / MWh` : '–'}</td></tr>
              <tr><td>Laufzeit</td><td className="r">{avb.laufzeit} Jahre</td></tr>
            </tbody>
          </table>
          <p className="hinweis">AVB-Fernwärme-konforme Alternative (Demo). Angebot zeigt beide Varianten – keine Rechtsprüfung.</p>
        </div>
      )}
      <div className="karten-reihe">
        <div className="karte">
          <h4>Preisgleitformel (Demo)</h4>
          {pg ? (
            <>
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
            </>
          ) : (
            <p className="hinweis">Individualvertrag: freie Preisanpassung ohne §24-Formel (Demo). Details im Vertragsentwurf zu klären.</p>
          )}
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

function KundenScope({ scope, foerderart }) {
  return (
    <div className="kundenumfang">
      <ContractingKarte contracting={scope.contracting} foerderart={foerderart} />
      <div className="karte analyse-hauptkarte">
        <h3>Kundenumfang</h3>
        <div className="kunden-gruppen">
          {scope.gruppen.map(gruppe => (
            <section key={gruppe.name} className="kunden-gruppe">
              <h4>{gruppe.name}</h4>
              <div className="kunden-positionen">
                {gruppe.positionen.map(pos => (
                  <article key={pos.id} className="kunden-position">
                    <div className="kunden-position-kopf">
                      <strong>{pos.titel}</strong>
                      {pos.pruefpflichtig && <span className="kunden-badge warn">prüfen</span>}
                    </div>
                    <dl>
                      {pos.artikelnummer && <div><dt>Artikelnummer</dt><dd>{pos.artikelnummer}</dd></div>}
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

function AngebotDokumentKopf({ name, datum }) {
  return (
    <div className="angebot-dok-kopf">
      <img className="angebot-dok-logo" src="/systempaket-logo.svg" alt="" aria-hidden="true" />
      <div className="angebot-dok-meta">
        <span className="angebot-dok-label">Richtpreis-Angebot (Demo)</span>
        <strong className="angebot-dok-name">{name}</strong>
        <span className="angebot-dok-datum">{datum}</span>
      </div>
    </div>
  )
}

export default function Ergebnis({
  eingaben, setEingaben, annahmen, ergebnis, sichtModus = 'kunde', setScreen,
  angebote = [], aktivesAngebotId = null,
  gespraechsErgebnis, setGespraechsErgebnis,
  onAngebotSpeichern, onAngebotLaden, onAngebotDuplizieren,
}) {
  const [gespeichert, setGespeichert] = useState(false)
  const [lvAlleOffen, setLvAlleOffen] = useState(true)
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

  const gruppen = gruppiereNachGruppe(lv.positionen)
  const kundenInfoJeId = new Map(kundenScope.gruppen.flatMap(g => g.positionen.map(pos => [pos.id, pos])))

  const blocker = ergebnis.warnungen.filter(w => w.status === 'rot' || w.status === 'orange')
  const hinweise = ergebnis.warnungen.filter(w => w.status !== 'rot' && w.status !== 'orange')
  const summaryAktion = istKunde
    ? 'Offene Pflichtdaten und Regelhinweise priorisieren, bevor der Kundenumfang weitergegeben wird.'
    : ergebnis.statusKorridor?.aktion
  const summaryDetail = istKunde
    ? `${kundenScope.gruppen.length} Umfangsgruppen · keine Preisansicht`
    : `${d.wp_module} × ${annahmen.wp_modul_kw} kW · Netto-CAPEX ${euro(lv.netto)} (Demo)`

  return (
    <div className="seite">
    <div className="ergebnis-layout">
      <div className="ergebnis-hauptspalte">

      {!istKunde && (
        <div className="print-header print-only">
          <div>
            <strong>Richtpreis-Angebot (Demo)</strong>
            <span className="print-angebot-name">{angebotName}</span>
          </div>
          <small>{new Date().toLocaleDateString('de-DE')}</small>
        </div>
      )}

      {istKunde && (
        <>
          <AngebotDokumentKopf
            name={angebotName}
            datum={new Date().toLocaleDateString('de-DE')}
          />
          <KundenScope
            scope={kundenScope}
            foerderart={lv.foerderung > 0 ? FOERDERUNG_ART_LABEL : null}
          />
        </>
      )}

      {!istKunde && (<>
        <div className="analyse-grid">
          <div className="karte analyse-hauptkarte">
            <h3>Vorlösung für Sales</h3>
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
                </tbody>
              </table>
            </div>
          </div>

          <div className="karte">
            <h3>Warum dieser Status entsteht</h3>
            <ul className="kriterien">
              {ergebnis.standardKriterien.map((k, i) => (
                <li key={i} className={k.erfuellt ? 'ok' : 'fehlt'}>{k.erfuellt ? '✓' : '×'} {k.text}</li>
              ))}
            </ul>
            <div className="status-hierarchie">
              {blocker.length > 0 && <div><span className="sh-label">Blocker</span><span className="sh-wert">{blocker.length} Prüfpunkte</span></div>}
              {hinweise.length > 0 && <div><span className="sh-label">Hinweise</span><span className="sh-wert">{hinweise.length} Hinweise</span></div>}
            </div>
            {(blocker.length > 0 || hinweise.length > 0) && setScreen ? (
              <button type="button" className="link-button no-print" onClick={() => setScreen('pruefpunkte')}>
                Zu den Prüfpunkten →
              </button>
            ) : null}
          </div>
        </div>

        {ergebnis.komponentenAuswahl && Object.keys(ergebnis.komponentenAuswahl).length > 0 && (
          <div className="karte">
            <h3>Komponenten-Auswahl (Demo)</h3>
            <p className="hinweis">Die Engine wählt die günstigste geeignete Komponente. Auswahl hier überschreibt die Position im LV und die Preisberechnung live.</p>
            {Object.entries(ergebnis.komponentenAuswahl).map(([typ, auswahl]) => {
              const { gewaehlt, kandidaten, ueberschrieben, ungueltigeWahl } = auswahl
              const aktuellerWert = eingaben?.['komponente_' + typ] ?? 'auto'
              const tk = gewaehlt.technik
              const technikHinweis = [
                tk.leistung_kw ? `${tk.leistung_kw} kW` : null,
                tk.schallleistung_dba ? `${tk.schallleistung_dba} dB(A)` : null,
                tk.volumen_l ? `${tk.volumen_l} l` : null,
                tk.durchfluss_l_min ? `${tk.durchfluss_l_min} l/min` : null,
              ].filter(Boolean).join(' · ')
              return (
                <div key={typ} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {typ === 'waermepumpe' ? 'Wärmepumpe' : 'Speicher / Warmwasser'}
                  </label>
                  <select
                    value={aktuellerWert}
                    onChange={e => setEingaben?.({ ...eingaben, ['komponente_' + typ]: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="auto">Automatisch (günstigste): {gewaehlt.titel} – {euro(gewaehlt.vk)}</option>
                    {kandidaten.filter(k => k.id !== 'auto').map(k => (
                      <option key={k.id} value={k.id}>
                        {k.hersteller.split(' (')[0]} {k.modell} – {euro(k.vk)}{k.delta_vk > 0 ? ` (+${euro(k.delta_vk)})` : ''} · {
                          [k.technik.leistung_kw ? `${k.technik.leistung_kw} kW` : null, k.technik.schallleistung_dba ? `${k.technik.schallleistung_dba} dB(A)` : null, k.technik.volumen_l ? `${k.technik.volumen_l} l` : null, k.technik.durchfluss_l_min ? `${k.technik.durchfluss_l_min} l/min` : null].filter(Boolean).join(' · ')
                        }
                      </option>
                    ))}
                  </select>
                  {technikHinweis && <small style={{ color: 'var(--c-hinweis, #888)' }}>{ueberschrieben ? 'Manuell: ' : 'Automatisch: '}{gewaehlt.hersteller.split(' (')[0]} {gewaehlt.modell} · {technikHinweis}</small>}
                  {ungueltigeWahl && <p className="hinweis" style={{ color: 'var(--c-warn)' }}>Vorherige Wahl nicht geeignet – auf günstigste zurückgestellt.</p>}
                </div>
              )
            })}
          </div>
        )}

        <div className="analyse-umfang">
          <div className="karte">
            <div className="lv-titel-zeile">
              <h3>Leistungsverzeichnis</h3>
              <button type="button" className="lv-toggle-all no-print" onClick={() => setLvAlleOffen(o => !o)}>
                {lvAlleOffen ? 'Alle einklappen' : 'Alle aufklappen'}
              </button>
            </div>
            <div className="table-scroll">
              <table className="lv">
                <thead>
                  <tr><th>Position</th><th>Menge</th><th>Einzel</th><th>Betrag</th><th>förderfähig</th><th>prüfpflichtig</th></tr>
                </thead>
                <tbody>
                  {gruppen.map(g => (
                    <React.Fragment key={g.name}>
                      <tr className="gruppe"><td colSpan="6">{g.name}</td></tr>
                      {g.positionen.map(p => {
                        const kunde = kundenInfoJeId.get(p.id)
                        const istPauschal = p.menge === 1
                        return (
                          <tr key={p.id}>
                            <td>
                              <details open={lvAlleOffen}>
                                <summary>{p.text}{p.artikel ? <> <code className="lv-artikelnummer">{p.artikel.artikelnummer}</code></> : null}</summary>
                                <div className="begruendung">
                                  {kunde && (
                                    <p className="begruendung-kunde">
                                      {kunde.hersteller} · {kunde.produkt}{kunde.leistungsklasse ? ` · ${kunde.leistungsklasse}` : ''}
                                      {kunde.leistungsumfang ? <><br />{kunde.leistungsumfang}</> : null}
                                    </p>
                                  )}
                                  {p.artikel && (
                                    <p className="begruendung-intern">
                                      Artikel {p.artikel.artikelnummer} · {p.artikel.lieferantName} · Listenpreis {euro(p.artikel.listenpreis)}
                                      {' '}− {prozent(p.artikel.rabatt)} Rabatt{p.artikel.rabattgruppe ? ` (Gruppe ${p.artikel.rabattgruppe})` : ' (Generalrabatt)'} = EK {euro(p.artikel.ek)}
                                      {' '}× {prozent(p.artikel.aufschlag)} Aufschlag = VK {euro(p.artikel.vk)} · Preisstand {p.artikel.preisstand ?? '–'}
                                    </p>
                                  )}
                                  {p.anfahrt && (
                                    <p className="begruendung-intern">
                                      {p.anfahrt.partner ?? 'Kein Partner gewählt'} · {num(p.anfahrt.km_einfach)} km einfach × 2 × {num(p.anfahrt.fahrten)} Fahrten
                                      {' '}· {p.anfahrt.quelle === 'plz_demo' ? 'PLZ-Distanz (Demo für Kartendienst-Fahrstrecke)' : 'Fallback-Distanz (PLZ/Partner fehlt)'}
                                    </p>
                                  )}
                                  <p className="begruendung-intern">Begründung: {p.begruendung}{p.erzwungen ? ` · erzwungen durch ${p.erzwungen}` : ''} · {p.tag.toUpperCase()}</p>
                                </div>
                              </details>
                            </td>
                            <td className="r">{istPauschal ? '–' : `${num(p.menge)} ${p.einheit}`}</td>
                            <td className="r">{istPauschal ? '–' : euro(p.einzel)}</td>
                            <td className="r">{euro(p.betrag)}</td>
                            <td className="r">{prozent(p.foerderanteil)}</td>
                            <td>{p.pruefpflichtig ? 'ja' : '–'}</td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  ))}
                  <tr className="summe"><td colSpan="3">Zwischensumme</td><td className="r">{euro(lv.zwischensumme)}</td><td colSpan="2" /></tr>
                  <tr><td colSpan="3">Contingency ({Math.round(annahmen.contingency * 100)} %)</td><td className="r">{euro(lv.contingency)}</td><td colSpan="2" /></tr>
                  <tr className="summe"><td colSpan="3">Brutto-LV-Kosten</td><td className="r">{euro(lv.brutto)}</td><td colSpan="2" /></tr>
                  <tr><td colSpan="3">Förderung ({prozent(annahmen.foerderquote)} auf förderfähigen Anteil, Demo)</td><td className="r">−{euro(lv.foerderung)}</td><td colSpan="2" /></tr>
                  <tr className="summe"><td colSpan="3">Netto-CAPEX-Indikation</td><td className="r">{euro(lv.netto)}</td><td colSpan="2" /></tr>
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

            {/* Demo-Polish: Commercial direkt neben CAPEX – Kalkulationstiefe für
                die Engineer-Zielgruppe nebeneinander. */}
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
              {ergebnis.pricing.sensitivitaet?.length > 0 && (
                <>
                  <h4>Sensitivität Energie-Split → IRR (Basis-Marge fix)</h4>
                  <table className="fakten">
                    <thead>
                      <tr><th>WP-Deckung</th><th className="r">var. Kosten p.a.</th><th className="r">erreichte IRR</th></tr>
                    </thead>
                    <tbody>
                      {ergebnis.pricing.sensitivitaet.map((s, i) => (
                        <tr key={i} className={s.basis ? 'gewaehlt' : ''}>
                          <td>{prozent(s.deckungsanteil)}{s.basis ? ' (Basis)' : ''}</td>
                          <td className="r">{euro(s.variableKostenPa)}</td>
                          <td className="r">{s.erreichteIrr != null ? prozent(s.erreichteIrr) : '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              <p className="hinweis">Marge nur auf den Arbeitspreis (keine Marge auf CAPEX/Grundpreis). AP-Marge iterativ auf die Ziel-IRR gelöst (Cashflow-IRR). „Gedeckelt": Ziel-IRR auch bei Maximalmarge nicht erreichbar. Sensitivität: WP-Deckungsanteil ±10 %-Punkte bei konstanter Basis-Marge und CAPEX. Nicht in der Kundensicht.</p>
            </div>

            <div className="karte">
              <h3>Energieindikation p.a. (Demo)</h3>
              {ergebnis.energie ? (
                <table className="fakten">
                  <tbody>
                    <tr><td>Wärmebedarf</td><td className="r">{num(ergebnis.energie.bedarf)} MWh/a</td></tr>
                    <tr><td>davon WP ({prozent(annahmen.wp_deckungsanteil)})</td><td className="r">{num(ergebnis.energie.wp_waerme)} MWh/a</td></tr>
                    <tr><td>Strom WP (JAZ {num(d.jaz_effektiv, 1)}, je VL-Temp.)</td><td className="r">{num(ergebnis.energie.strom_mwh)} MWh/a · {euro(ergebnis.energie.kosten_strom)}</td></tr>
                    <tr><td>Gas Bestandskessel (η {annahmen.kessel_eta})</td><td className="r">{num(ergebnis.energie.gas_mwh)} MWh/a · {euro(ergebnis.energie.kosten_gas)}</td></tr>
                    <tr><td>WP-Volllaststunden</td><td className="r">{num(d.wp_volllaststunden)} h/a</td></tr>
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
                    <tr key={p.id}>
                      <td>{p.text}{p.artikel ? <> <code className="lv-artikelnummer">{p.artikel.artikelnummer}</code></> : null}</td>
                      <td className="r">{euro(p.betrag)}</td>
                    </tr>
                  ))}
                  <tr className="summe"><td>Summe OPEX</td><td className="r">{euro(ergebnis.opex.summe_pa)}</td></tr>
                </tbody>
              </table>
              <p className="hinweis">CAPEX-/OPEX-Tags bereiten Stufe 2 vor; Werte bleiben Demo-Indikationen.</p>
            </div>
          </div>

          {ergebnis.pricingVarianten?.dual && ergebnis.pricingVarianten.individual && (
            <div className="karte">
              <h3>Angebotsvarianten (intern, Demo)</h3>
              <p className="hinweis">Laufzeit über 10 Jahre impliziert Individualvertrag. Beide Varianten sind dem Kunden gegenüber zeigbar (Demo, keine Rechtsprüfung).</p>
              <div className="table-scroll">
                <table className="fakten">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="r">AVB-Fernwärme ({ergebnis.pricingVarianten.avb.laufzeit} J)</th>
                      <th className="r">Individualvertrag ({ergebnis.pricingVarianten.individual.laufzeit} J)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Grundpreis p.a.</td><td className="r">{euro(ergebnis.pricingVarianten.avb.grundpreisPa)}</td><td className="r">{euro(ergebnis.pricingVarianten.individual.grundpreisPa)}</td></tr>
                    <tr><td>Grundpreis / Monat</td><td className="r">{euro(ergebnis.pricingVarianten.avb.grundpreisMonat)}</td><td className="r">{euro(ergebnis.pricingVarianten.individual.grundpreisMonat)}</td></tr>
                    <tr><td>Arbeitspreis / MWh</td><td className="r">{ergebnis.pricingVarianten.avb.arbeitspreisMwh != null ? euro(ergebnis.pricingVarianten.avb.arbeitspreisMwh) : '–'}</td><td className="r">{ergebnis.pricingVarianten.individual.arbeitspreisMwh != null ? euro(ergebnis.pricingVarianten.individual.arbeitspreisMwh) : '–'}</td></tr>
                    <tr><td>Preisanpassung</td><td className="r">AVBFernwärme §24 (Demo)</td><td className="r">individuell vereinbart (Demo)</td></tr>
                    <tr><td>Ziel-IRR</td><td className="r">{ergebnis.pricingVarianten.avb.erreichteIrr != null ? prozent(ergebnis.pricingVarianten.avb.erreichteIrr) : '–'}</td><td className="r">{ergebnis.pricingVarianten.individual.erreichteIrr != null ? prozent(ergebnis.pricingVarianten.individual.erreichteIrr) : '–'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </>)}

      </div>

      <aside className="ergebnis-aktionsspalte no-print">
        <div className="karte aktionen-karte">
          <h3>Aktionen</h3>
          <div className="angebot-speichern-reihe">
            <input
              type="text"
              className="angebot-name-input"
              value={angebotName}
              onChange={e => setAngebotName(e.target.value)}
              placeholder={`Angebot ${new Date().toLocaleDateString('de-DE')}`}
              aria-label="Angebotsname"
            />
            <button onClick={handleSpeichern} className={gespeichert ? 'btn-erfolg btn-icon' : 'btn-icon'}>
              {gespeichert ? <>✓ Gespeichert</> : <><IconSpeichern /> Speichern</>}
            </button>
            <button onClick={onAngebotDuplizieren} className="btn-icon"><IconDuplizieren /> Duplizieren</button>
            <button onClick={() => window.print()} className="btn-icon"><IconExport /> Als PDF exportieren</button>
          </div>
          {angebote.length > 0 && (
            <div className="angebot-varianten">
              <strong className="varianten-label">Gespeicherte Varianten ({angebote.length})</strong>
              <ul className="varianten-liste">
                {angebote.map(a => (
                  <li key={a.id} className={`variante-zeile${a.id === aktivesAngebotId ? ' aktiv' : ''}`}>
                    <span className="variante-name">{a.name}</span>
                    <small className="variante-datum">{new Date(a.erstelltAm).toLocaleDateString('de-DE')}</small>
                    <button onClick={() => onAngebotLaden?.(a.id)} disabled={a.id === aktivesAngebotId}>
                      {a.id === aktivesAngebotId ? 'Aktiv' : 'Laden'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={`karte status-karte status-${ergebnis.status ?? 'unbekannt'}`}>
          <div className="status-zeile">
            <Ampel status={ergebnis.status} groesse="gross" />
            <div>
              <strong>Status: {korridorTitel(ergebnis)}</strong>
              <div className="hinweis">{summaryDetail}</div>
            </div>
          </div>
          <p className="summary-aktion">{summaryAktion}</p>
        </div>

        {!istKunde && (
          <div className="karte">
            <h3>Datenlage &amp; Prüfaufwand</h3>
            <table className="fakten">
              <tbody>
                <tr><td>Datenlage</td><td className="r">{ergebnis.dq} %</td></tr>
                <tr><td>Prüfaufwand</td><td className="r">Score {ergebnis.peScore}/5</td></tr>
              </tbody>
            </table>
            <p className="hinweis">{ergebnis.datenlage?.aktion}</p>
            {ergebnis.datenlage?.fehlendeFokusDaten?.length > 0 ? (
              <ul className="checkliste">
                {ergebnis.datenlage.fehlendeFokusDaten.map(f => (
                  <li key={f.id}><strong>{f.sektion}</strong>: {f.label}</li>
                ))}
              </ul>
            ) : <p className="okbox">Keine gewichteten Pflichtdaten offen.</p>}
          </div>
        )}

        <div className="karte gespraech-karte">
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
      </aside>
    </div>
    </div>
  )
}
