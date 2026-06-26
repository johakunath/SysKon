import React, { useState, useEffect, useRef } from 'react'
import { applyAdminConfig, makeDefaultAdminConfig } from '../data/adminConfig.js'
import { PRESETS } from '../data/presets.js'
import { FOERDERUNG_ART_LABEL } from '../data/annahmen.js'
import { pruefeBedingung } from '../logic/engine.js'
import { num, euro, VARIANTEN_NAME, korridorTitel, kundenPreviewText } from './format.js'
import Ampel from '../components/Ampel.jsx'
import ScopeListe from '../components/ScopeListe.jsx'

const TECHNOLOGIEPFAD_PREVIEW = {
  hybrid: 'Hybrid',
  monoenergetisch: 'monoenergetisch',
  sonstig: 'anderer Pfad',
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
              Plausibilitätsbereich: {frage.min}-{frage.max?.toLocaleString('de-DE')} {frage.einheit} (Demo-Annahme)
            </span>
          )}
        </div>
        <Gespraechshinweis text={gespraechshinweis} />
      </div>
    </div>
  )
}

function UmfangsVorschau({ scope }) {
  const positionen = scope.gruppen.flatMap(gruppe => gruppe.positionen.map(pos => ({ ...pos, gruppe: gruppe.name })))
  return (
    <div className="preview-block">
      <h4>Leistungen</h4>
      <ul className="preview-positionen">
        {positionen.slice(0, 10).map(pos => (
          <li key={`${pos.gruppe}-${pos.id}`}>
            <span>
              <strong>{pos.titel}</strong>
              <small>{pos.produkt} · {pos.leistungsklasse}</small>
            </span>
            <em>{formatMenge(pos.menge, pos.einheit)}</em>
          </li>
        ))}
        {positionen.length > 10 ? <li className="preview-mehr">Weitere Leistungen <em>{positionen.length - 10}</em></li> : null}
      </ul>
    </div>
  )
}

function PreviewScope({ titel, eintraege, max }) {
  if (!eintraege.length) return null
  return (
    <div className="preview-block">
      <h4>{titel}</h4>
      <ScopeListe eintraege={eintraege} preview max={max} listenklasse="preview-scope" strongTitel={false} />
    </div>
  )
}

function AufstelloptionenPreview({ viable, schallJeVariante, istIntern }) {
  if (!viable || viable.length === 0) return null
  return (
    <div className="preview-block">
      <h4>Aufstelloptionen</h4>
      <ul className="aufstelloptionen-liste">
        {viable.slice(0, 4).map(v => {
          const schall = schallJeVariante?.[v.variante]
          return (
            <li key={v.variante} className="aufstelloption-zeile">
              <span className="aufstelloption-label">{v.label}</span>
              <span className="aufstelloption-meta">
                {istIntern && v.kosten > 0 ? <span className="aufstelloption-kosten">+{euro(v.kosten)}</span> : null}
                {schall ? <Ampel status={schall.ampel} groesse="klein" /> : null}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function AngebotSnapshot({ ergebnis, sichtModus, annahmen }) {
  const lv = ergebnis.lv
  const pricing = ergebnis.pricing
  const istIntern = sichtModus === 'intern'
  if (!lv?.netto) return null

  const foerderart = FOERDERUNG_ART_LABEL

  const capexPos = lv.positionen.filter(p => p.tag === 'capex' && p.betrag > 0)
  const komponentenNamen = (ergebnis.kundenScope?.gruppen ?? [])
    .flatMap(g => g.positionen.map(p => p.titel))
    .slice(0, 8)
  const capexGruppen = Object.entries(
    capexPos.reduce((acc, p) => {
      acc[p.gruppe] = (acc[p.gruppe] || 0) + p.betrag
      return acc
    }, {})
  )

  return (
    <div className="preview-block">
      <h4>Angebots-Snapshot <span className="hinweis-inline">(Demo)</span></h4>
      <div className="mini-fakten">
        {pricing?.grundpreisPa > 0 && (
          <div><span>Grundpreis</span><strong>{euro(pricing.grundpreisPa / 12)} / Monat</strong></div>
        )}
        {pricing?.arbeitspreisMwh != null && (
          <div><span>Arbeitspreis</span><strong>{euro(pricing.arbeitspreisMwh)} / MWh</strong></div>
        )}
        {lv.foerderung > 0 && (
          <div><span>Förderung</span><strong>{foerderart}</strong></div>
        )}
        {istIntern && lv.netto > 0 && (
          <div><span>CapEx (netto)</span><strong>{euro(lv.netto)}</strong></div>
        )}
        {istIntern && lv.foerderung > 0 && (
          <div><span>Förderbetrag</span><strong>−{euro(lv.foerderung)}</strong></div>
        )}
      </div>
      {lv.foerderung > 0 && (
        <p className="hinweis">Indikativ, kein Rechtsanspruch.</p>
      )}
      {istIntern ? (
        capexGruppen.length > 0 && (
          <div className="mini-fakten snapshot-komponenten">
            {capexGruppen.map(([gruppe, betrag]) => (
              <div key={gruppe}><span>{gruppe}</span><strong>{euro(betrag)}</strong></div>
            ))}
          </div>
        )
      ) : (
        komponentenNamen.length > 0 && (
          <ul className="snapshot-komponenten-liste">
            {komponentenNamen.map(name => <li key={name}>{name}</li>)}
          </ul>
        )
      )}
    </div>
  )
}

function RisikoFlags({ warnungen }) {
  const flags = warnungen.filter(w => w.status === 'rot' || w.status === 'orange').slice(0, 3)
  if (flags.length === 0) return null
  return (
    <div className="preview-block">
      <h4>Gesprächsrisiken</h4>
      <ul className="risiko-liste">
        {flags.map((w, i) => (
          <li key={i} className={`risiko-flag status-${w.status}`}>
            <Ampel status={w.status} groesse="klein" />
            <span>{kundenPreviewText(w.text)}</span>
          </li>
        ))}
      </ul>
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
  const wichtigsteOffenePunkte = scope.offenePunkte.slice(0, 3)
  const technologiepfadPreview = TECHNOLOGIEPFAD_PREVIEW[eingaben.technologiepfad] ?? 'nicht gewählt'
  const technologiepfadHinweis = eingaben.technologiepfad && eingaben.technologiepfad !== 'hybrid'
    ? 'außerhalb MVP v0.1'
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
                  gesperrt={f.id === 'aufstellvariante' ? gesperrteVarianten : null}
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
            </div>
          )
        })}
      </main>

      <aside className="spalte-rechts">
        <div className="karte live kunden-preview">
          <h3>Gesprächs-Vorschau</h3>
          <p className="hinweis">Lösungskorridor für das Kundengespräch. Richtpreis-Indikation und Detailkalkulation vollständig im Angebot (Internsicht).</p>

          <div className="status-zeile kompakt">
            <Ampel status={ergebnis.status} groesse="gross" />
            <div>
              <strong>{korridorTitel(ergebnis)}</strong>
              <div className="hinweis">{kundenPreviewText(ergebnis.statusKorridor?.aktion)}</div>
            </div>
          </div>
          {ergebnis.statusKorridor?.bedeutung && (
            <p className="naechster-schritt">{ergebnis.statusKorridor.bedeutung}</p>
          )}

          <div className="dq">
            <div className="dq-label">Datenlage: <strong>{ergebnis.dq} %</strong> · {ergebnis.datenlage?.titel}</div>
            <div className="dq-balken"><div style={{ width: `${ergebnis.dq}%` }} /></div>
          </div>

          <div className="preview-block">
            <h4>Lösungs-Vorschau</h4>
            <div className="mini-fakten">
              <div><span>Pfad</span><strong>{technologiepfadPreview}</strong></div>
              {technologiepfadHinweis ? <div><span>Einordnung</span><strong>{technologiepfadHinweis}</strong></div> : null}
              <div><span>Heizlast</span><strong>{num(d.heizlast_effektiv)} kW</strong></div>
              {d.wp_kw ? <div><span>WP-Kaskade</span><strong>{d.wp_module} × {annahmen.wp_modul_kw} kW</strong></div> : null}
              <div>
                <span>Aufstellung</span>
                <strong>{d.aufstellung_empfohlen_label ?? VARIANTEN_NAME[eingaben.aufstellvariante] ?? '–'}</strong>
              </div>
            </div>
            {d.aufstellung_abweichung ? (
              <p className="hinweis">Gewählte Variante weicht von der Empfehlung ab.</p>
            ) : null}
          </div>

          <AufstelloptionenPreview viable={d.aufstellung_viable} schallJeVariante={d.schall_je_variante} istIntern={sichtModus === 'intern'} />

          <AngebotSnapshot ergebnis={ergebnis} sichtModus={sichtModus} annahmen={annahmen} />

          <RisikoFlags warnungen={ergebnis.warnungen} />

          <UmfangsVorschau scope={scope} />
          <PreviewScope titel="Annahmen" eintraege={scope.annahmen} max={3} />
          <PreviewScope titel="Offene Punkte" eintraege={wichtigsteOffenePunkte} max={3} />

          <button className="primaer" onClick={() => setScreen('ergebnis')}>Zum Angebot →</button>
        </div>
      </aside>
    </div>
  )
}
