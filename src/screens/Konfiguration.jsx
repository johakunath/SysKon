import React, { useState, useEffect, useRef } from 'react'
import { applyAdminConfig, makeDefaultAdminConfig } from '../data/adminConfig.js'
import { PRESETS } from '../data/presets.js'
import { FOERDERUNG_ART_LABEL } from '../data/annahmen.js'
import { pruefeBedingung } from '../logic/engine.js'
import { num, euro, VARIANTEN_NAME, korridorTitel, kundenPreviewText } from './format.js'
import Ampel from '../components/Ampel.jsx'
import RoutingBadge from '../components/RoutingBadge.jsx'

const TECHNOLOGIEPFAD_PREVIEW = {
  hybrid: 'Hybrid',
  monoenergetisch: 'monoenergetisch',
  sonstig: 'anderer Pfad',
  unentschieden: 'noch offen (Hybrid angenommen)',
}

const SEKTION_KURZ = {
  A: 'Gebäude',
  B: 'Wärme',
  C: 'Bestand',
  D: 'Temperatur',
  E: 'Heizraum',
  F: 'Aufstellung',
  G: 'Schall',
  H: 'Elektro',
  I: 'Förderung',
  J: 'Betrieb',
  K: 'Vertrag',
}

const DEFAULT_EFFECTIVE_SEKTIONEN = applyAdminConfig(makeDefaultAdminConfig()).sektionen

function Gespraechshinweis({ text }) {
  if (!text) return null
  return (
    <aside className="gespraechshinweis" aria-label="Gesprächshinweis">
      {text}
    </aside>
  )
}

function kurzerHinweis(frage) {
  return kuerzen(kundenPreviewText(frage.hinweisKurz ?? ''), 150)
}

function kuerzen(text, max) {
  if (text.length <= max) return text
  const gekuerzt = text.slice(0, max - 1)
  const letzterSatz = Math.max(gekuerzt.lastIndexOf('.'), gekuerzt.lastIndexOf(';'))
  if (letzterSatz > 140) return `${gekuerzt.slice(0, letzterSatz + 1)}`
  return `${gekuerzt.trim()}...`
}

function formatMenge(menge, einheit) {
  const wert = typeof menge === 'number' ? num(menge) : menge
  return [wert, einheit].filter(Boolean).join(' ')
}

// Ein Punkt statt zwei getrennter, teils redundanter Listen (Gesprächsrisiken +
// Offene Punkte). Warnungen tragen die konkrete, kundensicher entschärfte
// Formulierung; fehlende Kundendaten haben keinen Status und landen daher
// hinter den Warnungen (stabile Sortierung).
const KRITIKALITAET_RANG = { rot: 0, orange: 1, gelb: 2 }
function kombiniereOffenePunkte(ergebnis, scope) {
  const risiken = ergebnis.warnungen.map(w => ({ text: kundenPreviewText(w.text), status: w.status }))
  const offeneDaten = scope.offenePunkte
    .filter(p => p.titel === 'Offene Kundendaten')
    .map(p => ({ text: kundenPreviewText(p.text), status: null }))
  return [...risiken, ...offeneDaten].sort(
    (a, b) => (KRITIKALITAET_RANG[a.status] ?? 3) - (KRITIKALITAET_RANG[b.status] ?? 3)
  )
}

// On-demand-Tiefenhilfe (Review B2): macht das autorisierte, bisher nur im Admin
// sichtbare Wissen (tooltip + Sales-Playbook) per Hover/Focus zugänglich. Nutzt die
// vorhandene .tooltip-CSS; bewusst KEIN aria-expanded/Disclosure (frühere UX-Entscheidung).
function FrageHilfe({ frage }) {
  const pb = frage.playbook ?? {}
  const hatInhalt = frage.tooltip || pb.warum || pb.warnsignale || pb.einordnung
  if (!hatInhalt) return null
  return (
    <span className="tooltip-wrap">
      <button type="button" className="tooltip" aria-label={`Hilfe zu: ${frage.label}`}>?</button>
      <span className="tooltip-text" role="tooltip">
        {frage.tooltip ? <span className="tt-zeile">{frage.tooltip}</span> : null}
        {pb.warum ? <span className="tt-zeile"><strong>Warum:</strong> {pb.warum}</span> : null}
        {pb.warnsignale ? <span className="tt-zeile"><strong>Warnsignale:</strong> {pb.warnsignale}</span> : null}
        {pb.einordnung ? <span className="tt-zeile"><strong>Einordnung:</strong> {pb.einordnung}</span> : null}
      </span>
    </span>
  )
}

function Frage({ frage, wert, onChange, gesperrt, zeigeHilfe }) {
  const istSelect = frage.typ === 'select'
  const gespraechshinweis = kurzerHinweis(frage)
  const invalide = frage.typ === 'zahl' && wert !== undefined && wert !== '' && (
    (frage.min !== undefined && wert < frage.min) ||
    (frage.max !== undefined && wert > frage.max)
  )

  return (
    <div className="frage">
      <div className="frage-kopf">
        {istSelect ? (
          <span className="frage-label" id={`${frage.id}-label`}>
            {frage.label}
            {frage.einheit ? <span className="einheit"> ({frage.einheit})</span> : null}
          </span>
        ) : (
          <label className="frage-label" htmlFor={frage.id}>
            {frage.label}
            {frage.einheit ? <span className="einheit"> ({frage.einheit})</span> : null}
          </label>
        )}
        {zeigeHilfe ? <FrageHilfe frage={frage} /> : null}
      </div>
      <div className={`frage-inhalt${gespraechshinweis ? '' : ' ohne-hinweis'}`}>
        <div className="frage-feld">
          {frage.typ === 'zahl' ? (
            <input
              id={frage.id}
              type="number"
              value={wert ?? ''}
              min={frage.min}
              max={frage.max}
              className={invalide ? 'input-error' : undefined}
              onChange={e => onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
            />
          ) : (
            <div className="antwort-liste" role="radiogroup" aria-labelledby={`${frage.id}-label`}>
              {frage.optionen.map(o => (
                <label
                  key={o.wert}
                  className={`antwort-option${wert === o.wert ? ' aktiv' : ''}${gesperrt?.includes(o.wert) ? ' gesperrt' : ''}`}
                  htmlFor={`${frage.id}-${o.wert}`}
                >
                  <input
                    id={`${frage.id}-${o.wert}`}
                    name={frage.id}
                    type="radio"
                    value={o.wert}
                    checked={wert === o.wert}
                    disabled={gesperrt?.includes(o.wert)}
                    onChange={() => onChange(o.wert)}
                  />
                  <span className="antwort-text">
                    <span className="antwort-label">{o.label}{gesperrt?.includes(o.wert) ? ' · gesperrt' : ''}</span>
                    <span className="antwort-hinweis">{o.hinweis}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          {invalide && (
            <span className="input-hinweis">
              Plausibilitätsbereich: {frage.min}-{frage.max?.toLocaleString('de-DE')} {frage.einheit} (Annahme)
            </span>
          )}
        </div>
        <Gespraechshinweis text={gespraechshinweis} />
      </div>
    </div>
  )
}

function UmfangsVorschau({ scope, lvPositionen, lv, istIntern }) {
  const positionen = scope.gruppen.flatMap(gruppe => gruppe.positionen.map(pos => ({ ...pos, gruppe: gruppe.name })))
  const preisJeId = new Map((lvPositionen ?? []).filter(p => p.betrag > 0).map(p => [p.id, p.betrag]))
  return (
    <div className="preview-block">
      <h4>Leistungen</h4>
      <ul className="preview-positionen">
        {positionen.map(pos => {
          const preis = istIntern ? preisJeId.get(pos.id) : null
          return (
            <li key={`${pos.gruppe}-${pos.id}`}>
              <span>
                <strong>{pos.titel}</strong>
                <small>
                  {pos.produkt}
                  {pos.leistungsklasse && pos.leistungsklasse !== 'projektbezogener Leistungsumfang' ? ` · ${pos.leistungsklasse}` : ''}
                </small>
              </span>
              {preis ? <em>{euro(preis)}</em> : pos.menge > 1 ? <em>{formatMenge(pos.menge, pos.einheit)}</em> : null}
            </li>
          )
        })}
      </ul>
      {istIntern && lv?.netto > 0 && (
        <div className="mini-fakten leistungen-summe">
          <div><span>CapEx (netto)</span><strong>{euro(lv.netto)}</strong></div>
          {lv.foerderung > 0 && (
            <div><span>Förderbetrag</span><strong>−{euro(lv.foerderung)}</strong></div>
          )}
        </div>
      )}
    </div>
  )
}


function AufstelloptionenPreview({ viable, schallJeVariante, istIntern }) {
  if (!viable || viable.length === 0) return null
  const guenstigsteKosten = istIntern ? Math.min(...viable.map(v => v.kosten ?? Infinity)) : null
  return (
    <div className="preview-block">
      <h4>Aufstelloptionen</h4>
      <ul className="aufstelloptionen-liste">
        {viable.slice(0, 4).map(v => {
          const schall = schallJeVariante?.[v.variante]
          const istGuenstigste = istIntern && v.kosten === guenstigsteKosten
          return (
            <li key={v.variante} className="aufstelloption-zeile">
              <span className="aufstelloption-label">{v.label}</span>
              <span className="aufstelloption-meta">
                {istIntern && v.kosten > 0 ? (
                  <span className={`aufstelloption-kosten${istGuenstigste ? ' guenstigste' : ''}`}>
                    +{euro(v.kosten)}
                  </span>
                ) : null}
                {schall ? (
                  <span className="aufstelloption-schall" title="Schall-Einordnung">
                    <Ampel status={schall.ampel} groesse="klein" />
                  </span>
                ) : null}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Money Shot der Demo (DEMO_BRIEF): Contracting-Preis, Komponenten und Förderung
// live und zuoberst. AP in €/MWh (PO-Entscheidung: €/MWh statt ct/kWh beibehalten).
function AngebotSnapshot({ ergebnis }) {
  const lv = ergebnis.lv
  const pricing = ergebnis.pricing
  if (!lv?.netto) return null

  const foerderart = FOERDERUNG_ART_LABEL

  return (
    <div className="preview-block snapshot-block">
      <div className="snapshot-preise">
        {pricing?.grundpreisPa > 0 && (
          <div className="snapshot-preis">
            <span>Grundpreis</span>
            <strong>{euro(pricing.grundpreisPa / 12)} <em>/ Monat</em></strong>
            <small>{euro(pricing.grundpreisPa)} p.a.</small>
          </div>
        )}
        {pricing?.arbeitspreisMwh != null && (
          <div className="snapshot-preis">
            <span>Arbeitspreis</span>
            <strong>{euro(pricing.arbeitspreisMwh)} <em>/ MWh</em></strong>
            <small>verbrauchsabhängig</small>
          </div>
        )}
      </div>
      <div className="mini-fakten">
        {lv.foerderung > 0 && (
          <div><span>Förderung</span><strong>{foerderart}</strong></div>
        )}
      </div>
    </div>
  )
}

function StatusUndOffenePunkte({ ergebnis, punkte, istIntern = false }) {
  return (
    <div className="preview-block status-block" id="offene-punkte-block">
      <h4>Offene Punkte</h4>
      {/* SK-105: Routing als Sales-Einordnung; Ampel/Status bleiben darunter. */}
      <div className="routing-zeile">
        <RoutingBadge routing={ergebnis.routing} istIntern={istIntern} />
        <span className="hinweis">{kundenPreviewText(ergebnis.routing?.naechsteAktion)}</span>
      </div>
      <div className="status-zeile kompakt">
        <Ampel status={ergebnis.status} groesse="klein" />
        <div>
          <strong>{korridorTitel(ergebnis)}</strong>
          <div className="hinweis">{kundenPreviewText(ergebnis.statusKorridor?.aktion)}</div>
        </div>
      </div>
      <div className="dq">
        <div className="dq-label">Datenlage: <strong>{ergebnis.dq} %</strong> · {ergebnis.datenlage?.titel}</div>
        <div className="dq-balken"><div style={{ width: `${ergebnis.dq}%` }} /></div>
      </div>
      {punkte.length > 0 && (
        <ul className="risiko-liste">
          {punkte.slice(0, 5).map((p, i) => (
            <li key={i} className={`risiko-flag${p.status ? ` status-${p.status}` : ''}`}>
              <Ampel status={p.status ?? 'unbekannt'} groesse="klein" />
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Konfiguration({ eingaben, setEingaben, annahmen, ergebnis, setScreen, sektionen = DEFAULT_EFFECTIVE_SEKTIONEN, sichtModus = 'kunde' }) {
  const sichtbar = (f) => !f.sichtbar || pruefeBedingung(f.sichtbar, eingaben, annahmen)
  const beantwortet = (f) => {
    const w = eingaben[f.id]
    return w !== undefined && w !== null && w !== '' && w !== 'unbekannt'
  }
  const fortschritt = (s) => {
    const fragen = s.fragen.filter(f => f.dq > 0 && sichtbar(f))
    const fertig = fragen.filter(beantwortet).length
    return { fertig, gesamt: fragen.length, komplett: fertig === fragen.length && fragen.length > 0 }
  }

  const ladePreset = (id) => {
    const p = PRESETS.find(x => x.id === id)
    if (p) setEingaben({ ...p.eingaben })
  }

  const [aktiveSektionId, setAktiveSektionId] = useState(null)
  const sektionenRef = useRef(sektionen)
  sektionenRef.current = sektionen

  useEffect(() => {
    const ids = sektionenRef.current.map(s => s.id)
    const observer = new IntersectionObserver(
      (entries) => {
        const sichtbareEintraege = entries.filter(e => e.isIntersecting)
        if (sichtbareEintraege.length > 0) {
          const oberste = sichtbareEintraege.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          const id = oberste.target.id.replace('sek-', '')
          if (ids.includes(id)) setAktiveSektionId(id)
        }
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
    )
    ids.forEach(id => {
      const el = document.getElementById(`sek-${id}`)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const gesperrteVarianten = ergebnis.excluded.aufstellvariante ?? []
  const d = ergebnis.derived
  const scope = ergebnis.kundenScope
  const offenePunkteKombiniert = kombiniereOffenePunkte(ergebnis, scope)
  const technologiepfadPreview = TECHNOLOGIEPFAD_PREVIEW[eingaben.technologiepfad] ?? 'nicht gewählt'
  const technologiepfadHinweis = eingaben.technologiepfad && eingaben.technologiepfad !== 'hybrid'
    ? 'außerhalb des aktuellen Standards'
    : null

  return (
    <div className="drei-spalten">
      <aside className="spalte-links">
        <div className="karte sektion-nav">
          <div className="preset-zeile">
            <select onChange={e => e.target.value && ladePreset(e.target.value)} defaultValue="">
              <option value="" disabled>Preset laden ...</option>
              {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <h4>Abschnitte</h4>
          {sektionen.map(s => {
            const fp = fortschritt(s)
            return (
              <a
                key={s.id}
                className={`sektion-anker${fp.komplett ? ' komplett' : ''}${aktiveSektionId === s.id ? ' aktiv' : ''}`}
                href={`#sek-${s.id}`}
                onClick={e => {
                  e.preventDefault()
                  document.getElementById(`sek-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <span className="sektion-text">
                  <span className="sektion-code">{s.id}</span>
                  <span className="sektion-titel">{SEKTION_KURZ[s.id] ?? s.titel}</span>
                </span>
                <span className={`fortschritt${fp.komplett ? ' ok' : ''}`}>
                  {fp.komplett ? '✓' : `${fp.fertig}/${fp.gesamt}`}
                </span>
              </a>
            )
          })}
        </div>
      </aside>

      <main className="spalte-mitte">
        {sektionen.map(s => {
          const fragenSichtbar = s.fragen.filter(sichtbar)
          if (fragenSichtbar.length === 0) return null
          return (
            <div key={s.id} id={`sek-${s.id}`} className="karte sek-block">
              <h2>{s.id} · {s.titel}</h2>
              {fragenSichtbar.map(f => (
                <Frage
                  key={f.id}
                  frage={f}
                  wert={eingaben[f.id]}
                  gesperrt={
                    f.id === 'aufstellvariante' ? gesperrteVarianten : null
                  }
                  zeigeHilfe={sichtModus === 'intern'}
                  onChange={(wert) => setEingaben({ ...eingaben, [f.id]: wert })}
                />
              ))}
              {s.id === 'F' && gesperrteVarianten.length > 0 && (
                <p className="warnbox">
                  Gesperrte Aufstellvarianten: {gesperrteVarianten.map(v => VARIANTEN_NAME[v]).join(', ')} (Schall oder Fläche, R05/R07).
                </p>
              )}
              {s.id === 'F' && d.aufstellung_begruendung && (
                <div className={d.aufstellung_empfohlen ? 'empfehlungsbox' : 'warnbox'}>
                  <strong>Placement-Empfehlung:</strong> {d.aufstellung_begruendung}
                  {d.aufstellung_abweichung ? (
                    <div className="hinweis">
                      Gewählt ist {d.aufstellung_abweichung.gewaehlt_label}; empfohlen ist {d.aufstellung_abweichung.empfohlen_label}
                      {d.aufstellung_abweichung.kosten_delta > 0 ? ' (mehr interner Zusatzaufwand).' : '.'}
                    </div>
                  ) : null}
                </div>
              )}
              {s.id === 'C' && eingaben.technologiepfad === 'monoenergetisch' && (
                <p className="warnbox">Monoenergetischer Pfad ist in v0.1 nur ein Roadmap-Platzhalter (Status rot, R17).</p>
              )}
              {s.id === 'K' && parseInt(eingaben.vertragslaufzeit) > 10 && (
                <p className="warnbox">
                  Laufzeit über 10 Jahre impliziert Individualvertrag (AVB-Standard). Das Angebot zeigt beide Varianten – als Prüfpunkt R22 sichtbar.
                </p>
              )}
            </div>
          )
        })}
      </main>

      <aside className="spalte-rechts">
        {/* Reihenfolge = DEMO_BRIEF-Skizze: Angebots-Snapshot (Money Shot) zuerst,
            dann Status + nächster Schritt, danach Diagnostik. Nichts eingeklappt –
            Sales soll im Live-Gespräch nicht klicken müssen. */}
        <div className="karte live kunden-preview">
          <div className="vorschau-titel-zeile">
            <h3>Angebots-Vorschau</h3>
            {offenePunkteKombiniert.length > 0 && (
              <button
                type="button"
                className="risiko-badge"
                onClick={() => document.getElementById('offene-punkte-block')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                ⚠ {offenePunkteKombiniert.length} offene {offenePunkteKombiniert.length === 1 ? 'Punkt' : 'Punkte'}
              </button>
            )}
          </div>

          <AngebotSnapshot ergebnis={ergebnis} />

          <button className="primaer" onClick={() => setScreen('ergebnis')}>Zum Angebot →</button>

          <div className="preview-block loesungs-block">
            <h4>Lösungs-Vorschau</h4>
            <div className="mini-fakten">
              <div><span>Pfad</span><strong>{technologiepfadPreview}</strong></div>
              {technologiepfadHinweis ? <div><span>Einordnung</span><strong>{technologiepfadHinweis}</strong></div> : null}
              <div><span>Heizlast</span><strong>{num(d.heizlast_effektiv)} kW</strong></div>
              {d.wp_kw ? <div><span>Wärmepumpen-Kaskade</span><strong>{d.wp_module} × {annahmen.wp_modul_kw} kW</strong></div> : null}
              <div>
                <span>Aufstellung</span>
                <strong>{d.aufstellung_empfohlen_label ?? VARIANTEN_NAME[eingaben.aufstellvariante] ?? '–'}</strong>
              </div>
            </div>
            {d.aufstellung_abweichung ? (
              <p className="hinweis">Gewählte Variante weicht von der Empfehlung ab.</p>
            ) : null}

            <AufstelloptionenPreview viable={d.aufstellung_viable} schallJeVariante={d.schall_je_variante} istIntern={sichtModus === 'intern'} />

            <UmfangsVorschau scope={scope} lvPositionen={ergebnis.lv.positionen} lv={ergebnis.lv} istIntern={sichtModus === 'intern'} />
          </div>

          <StatusUndOffenePunkte ergebnis={ergebnis} punkte={offenePunkteKombiniert} istIntern={sichtModus === 'intern'} />
        </div>
      </aside>
    </div>
  )
}
