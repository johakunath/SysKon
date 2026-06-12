// Deklarative Regel-Engine + LV-Aufbau (HANDOVER §2.2, §2.3).
// Kein React. Die Engine ist generisch – Fachlogik lebt in src/data/.
//
// Ablauf von berechne():
//   1. Zwischenergebnisse ableiten (calc.js) + DQ-Score
//   2. Regeln in Schleife auswerten bis Fixpunkt (require/exclude/warn/status)
//      Konflikt: exclude schlägt require; Status nimmt die schlechteste Stufe.
//      Sonderfall (dokumentiert): ist die GEWÄHLTE Aufstellvariante gesperrt,
//      ergänzt die Engine Warnung SYS-EXCLUDE und Status orange.
//   3. LV aus dem Katalog bauen, Kosten/Förderung/Energie/Kennzahlen rechnen
//   4. Handover-Daten (fehlende Daten, Prüfpunkte, Empfehlung) zusammenstellen

import { ANNAHMEN } from '../data/annahmen.js'
import { REGELN } from '../data/regeln.js'
import { KATALOG } from '../data/katalog.js'
import { ALLE_FRAGEN } from '../data/fragen.js'
import { ableiten, zahl } from './calc.js'

export const STATUS_ORDER = ['gruen', 'gelb', 'orange', 'rot']
export const STATUS_LABEL = {
  gruen: 'Richt-LV-fähig',
  gelb: 'PE-Prüfung',
  orange: 'Engineering-Prüfung',
  rot: 'nicht standardfähig',
}

const schlechter = (a, b) =>
  STATUS_ORDER[Math.max(STATUS_ORDER.indexOf(a), STATUS_ORDER.indexOf(b))]

// Wert-Dereferenzierung: '@feld' liest aus Kontext (Eingaben+Zwischenergebnisse),
// dann aus den Annahmen (z. B. '@flaeche_min_container').
function deref(wert, ctx, annahmen) {
  if (typeof wert === 'string' && wert.startsWith('@')) {
    const k = wert.slice(1)
    return ctx[k] !== undefined ? ctx[k] : annahmen[k]
  }
  return wert
}

export function pruefeBedingung(b, ctx, annahmen = ANNAHMEN) {
  if (!b) return true
  if (b.und) return b.und.every(x => pruefeBedingung(x, ctx, annahmen))
  if (b.oder) return b.oder.some(x => pruefeBedingung(x, ctx, annahmen))
  const ist = ctx[b.feld]
  const soll = deref(b.wert, ctx, annahmen)
  switch (b.op) {
    case '=': return ist === soll
    // '!=' nur bei beantwortetem Feld: ein leeres Feld ist „unbekannt", kein Negativ-Treffer
    case '!=': return ist !== undefined && ist !== null && ist !== '' && ist !== soll
    case '>': return zahl(ist) !== null && zahl(ist) > zahl(soll)
    case '>=': return zahl(ist) !== null && zahl(ist) >= zahl(soll)
    case '<': return zahl(ist) !== null && zahl(ist) < zahl(soll)
    case '<=': return zahl(ist) !== null && zahl(ist) <= zahl(soll)
    case 'in': return Array.isArray(soll) && soll.includes(ist)
    case 'nicht_in': return Array.isArray(soll) && !soll.includes(ist)
    case 'nicht_leer': return Array.isArray(ist) && ist.length > 0
    default: return false
  }
}

const beantwortet = (w) => w !== undefined && w !== null && w !== '' && w !== 'unbekannt'

// Datenqualität: gewichteter Anteil beantworteter sichtbarer Pflichtfragen.
// 'unbekannt' zählt als beantwortet, liefert aber keine Punkte (HANDOVER §2.6).
export function dqScore(eingaben, annahmen = ANNAHMEN) {
  let gesamt = 0, erreicht = 0
  for (const f of ALLE_FRAGEN) {
    if (!f.dq) continue
    if (f.sichtbar && !pruefeBedingung(f.sichtbar, eingaben, annahmen)) continue
    gesamt += f.dq
    if (beantwortet(eingaben[f.id])) erreicht += f.dq
  }
  return gesamt ? Math.round((100 * erreicht) / gesamt) : 0
}

export function sichtbareFragen(eingaben, annahmen = ANNAHMEN) {
  return ALLE_FRAGEN.filter(f => !f.sichtbar || pruefeBedingung(f.sichtbar, eingaben, annahmen))
}

const FELD_LABEL = Object.fromEntries(ALLE_FRAGEN.map(f => [f.id, f.label]))
FELD_LABEL.schall_ampel_aktiv = 'Schall-Ampel'

function kriteriumText(b) {
  const label = FELD_LABEL[b.feld] ?? b.feld
  const wert = Array.isArray(b.wert) ? b.wert.join('/') : String(b.wert)
  const op = { '=': '=', '!=': '≠', '<=': '≤', '>=': '≥', '<': '<', '>': '>', in: '∈', nicht_in: '∉' }[b.op] ?? b.op
  return `${label} ${op} ${wert}`
}

export function berechne(eingaben, opts = {}) {
  const annahmen = opts.annahmen ?? ANNAHMEN
  const regeln = opts.regeln ?? REGELN
  const katalog = opts.katalog ?? KATALOG

  // 1. Zwischenergebnisse + DQ
  const derived = ableiten(eingaben, annahmen)
  const dq = dqScore(eingaben, annahmen)
  const ctx = { ...derived, ...eingaben, dq_score: dq }

  // 2. Regel-Fixpunkt
  let status = 'gruen'
  const warnungen = []
  const required = new Set()
  const excluded = {} // ziel -> Set(werte)
  const gefeuert = []
  const statusQuellen = []
  let stabil = false
  for (let i = 0; i < 10 && !stabil; i++) {
    const vorher = JSON.stringify([...required, gefeuert.length])
    for (const regel of regeln) {
      if (gefeuert.includes(regel.id)) continue
      if (!pruefeBedingung(regel.wenn, ctx, annahmen)) continue
      gefeuert.push(regel.id)
      const wirkungen = Array.isArray(regel.dann) ? regel.dann : [regel.dann]
      for (const w of wirkungen) {
        if (w.typ === 'require') {
          required.add(w.modul)
          ctx['require_' + w.modul] = true
        } else if (w.typ === 'exclude') {
          const werte = [].concat(deref(w.wert, ctx, annahmen) ?? [])
          ;(excluded[w.ziel] ??= new Set())
          werte.forEach(v => excluded[w.ziel].add(v))
        } else if (w.typ === 'warn') {
          warnungen.push({ regelId: regel.id, kategorie: w.kategorie ?? 'hinweis', text: w.text })
        } else if (w.typ === 'status') {
          const wert = deref(w.wert, ctx, annahmen)
          if (STATUS_ORDER.includes(wert)) {
            statusQuellen.push({ regelId: regel.id, wert, begruendung: regel.begruendung })
            status = schlechter(status, wert)
          }
        }
      }
    }
    stabil = vorher === JSON.stringify([...required, gefeuert.length])
  }

  // Konfliktauflösung: exclude schlägt require
  const konflikte = []
  for (const modul of [...required]) {
    if (excluded.modul?.has(modul)) {
      required.delete(modul)
      konflikte.push(`Modul „${modul}" war erzwungen, ist aber gesperrt (exclude schlägt require).`)
    }
  }
  // Gewählte Aufstellvariante gesperrt → Engineering (SYS-EXCLUDE)
  const variantenSperre = excluded.aufstellvariante ?? new Set()
  if (eingaben.aufstellvariante && variantenSperre.has(eingaben.aufstellvariante)) {
    status = schlechter(status, 'orange')
    warnungen.push({ regelId: 'SYS', kategorie: 'engineering',
      text: 'Die gewählte Aufstellvariante ist gesperrt (Schall oder Fläche) – Variante wechseln oder Engineering-Prüfung.' })
  }

  // Jede Warnung mit dem korrelierten Status aus statusQuellen anreichern.
  // Regeln, die warn+status koppeln, tragen denselben regelId in beiden Arrays.
  // SYS-EXCLUDE hat keinen statusQuellen-Eintrag, erhält status direkt.
  const statusByRegel = Object.fromEntries(statusQuellen.map(s => [s.regelId, s.wert]))
  statusByRegel['SYS'] = 'orange'
  for (const w of warnungen) {
    w.status = statusByRegel[w.regelId] ?? null
  }

  // 3. LV bauen
  const lvPositionen = []
  const opexPositionen = []
  for (const paket of katalog) {
    if (paket.bedingung && !pruefeBedingung(paket.bedingung, ctx, annahmen)) continue
    let positionen = paket.positionen
    let varianteName = null
    if (paket.varianten) {
      const gewaehlt = paket.varianten.find(v => v.wert === eingaben[paket.variantenFeld]) ?? paket.varianten[0]
      positionen = gewaehlt.positionen
      varianteName = gewaehlt.name
    }
    for (const pos of positionen) {
      const menge = zahl(deref(pos.menge, ctx, annahmen)) ?? 0
      let einzel = 0
      if (pos.kosten.typ === 'fix') einzel = pos.kosten.annahme ? annahmen[pos.kosten.annahme] : 0
      else if (pos.kosten.typ === 'je_modul') einzel = annahmen[pos.kosten.annahme] * annahmen.wp_modul_kw
      const eintrag = {
        id: pos.id, paket: paket.id, pakettyp: paket.pakettyp, gruppe: paket.gruppe,
        variante: varianteName, text: pos.text, menge, einheit: pos.einheit,
        einzel, betrag: einzel * menge,
        foerderanteil: annahmen[pos.foerder] ?? 0, tag: pos.tag,
        begruendung: pos.begruendung, pruefpflichtig: !!pos.pruefpflichtig,
        erzwungen: paket.bedingung?.feld?.startsWith?.('require_') ? 'R03' : null,
      }
      if (pos.tag === 'opex') opexPositionen.push({ ...eintrag, prozent: pos.kosten.typ === 'prozent_lv' ? annahmen[pos.kosten.annahme] : null })
      else lvPositionen.push(eintrag)
    }
  }

  const zwischensumme = lvPositionen.reduce((s, p) => s + p.betrag, 0)
  const contingency = zwischensumme * annahmen.contingency
  const brutto = zwischensumme + contingency
  const foerderfaehig = lvPositionen.reduce((s, p) => s + p.betrag * p.foerderanteil, 0)
  const foerderAktiv = eingaben.foerderung_annahme !== 'nein'
  const foerderung = foerderAktiv ? foerderfaehig * annahmen.foerderquote : 0
  const netto = brutto - foerderung

  for (const p of opexPositionen) {
    if (p.prozent != null) p.betrag = (brutto * p.prozent) / 100
    else p.betrag = p.einzel * p.menge
  }
  const opexSumme = opexPositionen.reduce((s, p) => s + p.betrag, 0)

  // 4. Kennzahlen, Energie, Handover
  const we = zahl(eingaben.wohneinheiten)
  const flaeche = zahl(eingaben.flaeche)
  const energie = derived.energie
  const kennzahlen = {
    je_we: we ? netto / we : null,
    je_m2: flaeche ? netto / flaeche : null,
    je_kw: derived.wp_kw ? netto / derived.wp_kw : null,
    waermekosten_mwh: energie && derived.waermebedarf_mwh
      ? (energie.kosten_strom + energie.kosten_gas + opexSumme) / derived.waermebedarf_mwh : null,
  }

  const statusLevel = { gruen: 1, gelb: 2, orange: 4, rot: 5 }[status]
  const peScore = Math.min(5, statusLevel + (warnungen.length >= 3 ? 1 : 0))

  const r11 = regeln.find(r => r.id === 'R11')
  const gruenKriterien = (r11?.wenn?.und ?? []).map(b => ({
    text: kriteriumText(b), erfuellt: pruefeBedingung(b, ctx, annahmen),
  }))

  const fehlendeDaten = sichtbareFragen(eingaben, annahmen)
    .filter(f => f.dq > 0 && !beantwortet(eingaben[f.id]))
    .map(f => ({ sektion: f.sektion, label: f.label }))

  return {
    derived, dq, status, statusLabel: STATUS_LABEL[status], statusQuellen,
    warnungen, gefeuert, konflikte,
    required: [...required],
    excluded: Object.fromEntries(Object.entries(excluded).map(([k, v]) => [k, [...v]])),
    lv: { positionen: lvPositionen, zwischensumme, contingency, brutto, foerderfaehig, foerderung, netto },
    opex: { positionen: opexPositionen, summe_pa: opexSumme },
    energie, kennzahlen, peScore, gruenKriterien, fehlendeDaten,
  }
}
