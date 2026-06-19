// Deklarative Regel-Engine + LV-Aufbau (HANDOVER §2.2, §2.3).
// Kein React. Die Engine ist generisch – Fachlogik lebt in src/data/.
//
// Ablauf von berechne():
//   1. Zwischenergebnisse ableiten (calc.js) + DQ-Score
//   2. Regeln in Schleife auswerten bis Fixpunkt (require/exclude/warn/status)
//      Konflikt: exclude schlägt require; Status nimmt die schlechteste Stufe.
//      Sonderfall (dokumentiert): ist die GEWÄHLTE Aufstellvariante gesperrt
//      oder im Placement-Korridor blockiert, ergänzt die Engine Warnung SYS
//      und Status orange.
//   3. LV aus dem Katalog bauen, Kosten/Förderung/Energie/Kennzahlen rechnen
//   4. Sales-/Prüfdaten (fehlende Daten, Prüfpunkte, Empfehlung) zusammenstellen

import { ANNAHMEN } from '../data/annahmen.js'
import { REGELN } from '../data/regeln.js'
import { KATALOG, LV_GRUPPEN } from '../data/katalog.js'
import { ALLE_FRAGEN } from '../data/fragen.js'
import { ableiten, aufstellungEmpfehlung, zahl } from './calc.js'

export const STATUS_ORDER = ['gruen', 'gelb', 'orange', 'rot']
export const STATUS_LABEL = {
  gruen: 'Richtindikation möglich',
  gelb: 'interne Klärung nötig',
  orange: 'Fachprüfung nötig',
  rot: 'nicht standardfähig',
}

export const STATUS_KORRIDOR = {
  gruen: {
    titel: 'Gesprächsfähige Richtindikation',
    bedeutung: 'Der Fall wirkt im Demo-Korridor plausibel; Annahmen und Prüfpunkte bleiben intern sichtbar.',
    aktion: 'Mit Annahmen weiterarbeiten und die nächsten Standort- und Verbrauchsdaten gezielt schärfen.',
  },
  gelb: {
    titel: 'Gespräch mit offenen Klärpunkten',
    bedeutung: 'Der Fall bleibt besprechbar, braucht aber interne Klärung oder bessere Daten vor externer Nutzung.',
    aktion: 'Offene Pflichtdaten und Regelhinweise priorisieren, bevor Umfang oder CAPEX weitergegeben werden.',
  },
  orange: {
    titel: 'Nur mit Fachprüfung weiterführen',
    bedeutung: 'Mindestens ein Thema liegt außerhalb des einfachen Standardkorridors.',
    aktion: 'Fachprüfung einplanen und keine belastbare Richtindikation nach außen verwenden.',
  },
  rot: {
    titel: 'Kein Standardfit im MVP',
    bedeutung: 'Der aktuelle MVP-Standardpfad passt nicht; das ist kein Angebots- oder Umsetzungsurteil.',
    aktion: 'Sonderfall markieren, Alternativpfad prüfen oder den Fall zurückstellen.',
  },
  unbekannt: {
    titel: 'Noch kein Gesprächskorridor',
    bedeutung: 'Es fehlen Pflichtdaten, bevor die Demo sinnvoll eingeordnet werden kann.',
    aktion: 'Konfiguration vervollständigen und anschließend erneut einordnen.',
  },
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
// 'unbekannt' gilt als unzureichende Antwort und liefert keine DQ-Punkte (HANDOVER §2.6).
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

function datenlageEinordnung(dq, fehlendeDaten, schwelle) {
  const stufe = dq >= 80 ? 'stark' : dq >= schwelle ? 'arbeitsfaehig' : 'duenn'
  const texte = {
    stark: {
      titel: 'starke Gesprächsdaten',
      bedeutung: 'Die wichtigsten sichtbaren Pflichtdaten sind weitgehend vorhanden.',
      aktion: 'Annahmen sichtbar halten und nur die offenen Detailpunkte nachziehen.',
    },
    arbeitsfaehig: {
      titel: 'arbeitsfähige Datenlage',
      bedeutung: 'Die Demo ist als interne Orientierung nutzbar, enthält aber noch Annahmen.',
      aktion: 'Die nächsten fehlenden Pflichtdaten vor externer Nutzung klären.',
    },
    duenn: {
      titel: 'dünne Datenlage',
      bedeutung: 'Der Prozentwert ist ein Sammelhinweis für fehlende Gesprächsdaten, kein Freigabekriterium.',
      aktion: 'Erst die wichtigsten fehlenden Daten einsammeln; die Richtindikation nur als Gesprächsnotiz nutzen.',
    },
  }[stufe]

  return {
    prozent: dq,
    stufe,
    ...texte,
    fehlendeFokusDaten: fehlendeDaten
      .slice()
      .sort((a, b) => b.dq - a.dq)
      .slice(0, 5),
  }
}

function kundenEinheit(pos) {
  return pos.tag === 'opex' ? 'p.a.' : pos.einheit
}

function kundenLeistungsklasse(pos, ctx, annahmen) {
  if (pos.kunde?.leistungsklasse) return pos.kunde.leistungsklasse
  if (pos.id === 'wp_modul') return `${ctx.wp_module} × ${annahmen.wp_modul_kw} kW, ca. ${ctx.wp_kw} kW`
  if (pos.id.startsWith('aufst_')) return pos.variante ?? 'Aufstellvariante'
  if (pos.tag === 'opex') return 'laufende Serviceleistung'
  return 'projektbezogener Leistungsumfang'
}

function kundenLeistungsumfang(pos) {
  if (pos.kunde?.leistungsumfang) return pos.kunde.leistungsumfang
  if (pos.pruefpflichtig) return 'Im Kundengespräch als Prüfpunkt aufnehmen und intern bestätigen lassen.'
  return 'Im aktuellen Demo-Scope als Leistungsbaustein enthalten.'
}

function kundenWarntext(warnung) {
  if (warnung.kategorie === 'foerderung') return 'Interne Förderprüfung klären, bevor Aussagen nach außen genutzt werden.'
  if (warnung.status === 'rot') return 'Aktueller MVP-Standardfit passt nicht; Alternativpfad oder Sonderfall prüfen.'
  if (warnung.status === 'orange') return 'Fachprüfung einplanen, bevor der Umfang belastbar genutzt wird.'
  return warnung.text
}

function kundenScopeBauen({ eingaben, annahmen, derived, lvPositionen, opexPositionen, warnungen, fehlendeDaten, excluded }) {
  const allePositionen = [...lvPositionen, ...opexPositionen]
  const gruppenNamen = [...LV_GRUPPEN, 'Service / Betrieb (p.a.)']
  const gruppen = gruppenNamen
    .map(name => ({
      name,
      positionen: allePositionen
        .filter(pos => pos.gruppe === name)
        .map(pos => {
          const kunde = pos.kunde ?? {}
          return {
            id: pos.id,
            titel: kunde.titel ?? pos.text,
            hersteller: kunde.hersteller ?? 'herstellerneutral',
            produkt: kunde.produkt ?? 'Produkt wird später festgelegt',
            leistungsklasse: kundenLeistungsklasse(pos, derived, annahmen),
            menge: pos.menge,
            einheit: kundenEinheit(pos),
            leistungsumfang: kundenLeistungsumfang(pos),
            pruefpflichtig: !!pos.pruefpflichtig,
          }
        }),
    }))
    .filter(gruppe => gruppe.positionen.length > 0)

  const annahmenTexte = [
    'Vorläufiger Kundenumfang für das Sales-Gespräch; kein Angebot und keine Ausführungsplanung.',
    `Technologiepfad: ${eingaben.technologiepfad === 'hybrid' ? 'Hybrid mit Luft-Wasser-Wärmepumpe und Gas-Bestandskessel' : 'außerhalb des aktuellen MVP-Standards'}.`,
    derived.aufstellung_begruendung,
    `Datenlage: ${annahmen.dq_schwelle}%-Schwelle intern, aktuell ${derived.heizlast_geschaetzt ? 'mit Heizlast-Annahme' : 'mit angegebener Heizlast'}.`,
  ].filter(Boolean)

  const ausgeschlosseneVarianten = [...(excluded.aufstellvariante ?? [])]
  const ausschluesse = [
    ...ausgeschlosseneVarianten.map(v => ({
      titel: 'Aufstellvariante ausgeschlossen',
      text: `${v}: aktuell nicht tragfähig im Demo-Korridor.`,
    })),
    ...(eingaben.technologiepfad && eingaben.technologiepfad !== 'hybrid'
      ? [{ titel: 'Technologiepfad außerhalb MVP', text: 'Der gewählte Pfad ist noch nicht als Standardumfang abbildbar.' }]
      : []),
  ]

  const fehlende = fehlendeDaten.slice(0, 5).map(f => ({
    titel: 'Offene Kundendaten',
    text: `${f.sektion}: ${f.label}`,
  }))
  const pruefpunkte = warnungen.slice(0, 6).map(w => ({
    titel: w.status === 'rot' || w.status === 'orange' ? 'Prüfung vor Weitergabe' : 'Klärpunkt',
    text: kundenWarntext(w),
  }))

  return {
    gruppen,
    annahmen: annahmenTexte,
    ausschluesse,
    offenePunkte: [...pruefpunkte, ...fehlende].slice(0, 10),
  }
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
      delete ctx['require_' + modul]
      konflikte.push(`Modul „${modul}" war erzwungen, ist aber gesperrt (exclude schlägt require).`)
    }
  }
  Object.assign(derived, aufstellungEmpfehlung(eingaben, annahmen, derived, [...(excluded.aufstellvariante ?? [])]))

  // Gewählte Aufstellvariante gesperrt oder im Placement-Korridor blockiert → Fachprüfung (SYS)
  const variantenSperre = (excluded.aufstellvariante ??= new Set())
  const placementBlocker = derived.aufstellung_blockierte_varianten?.[eingaben.aufstellvariante] ?? []
  if (eingaben.aufstellvariante && (variantenSperre.has(eingaben.aufstellvariante) || placementBlocker.length > 0)) {
    variantenSperre.add(eingaben.aufstellvariante)
    status = schlechter(status, 'orange')
    const blockerText = placementBlocker.length ? ` Gründe: ${placementBlocker.join('; ')}.` : ''
    warnungen.push({ regelId: 'SYS', kategorie: 'engineering',
      text: `Die gewählte Aufstellvariante ist im aktuellen Demo-Korridor blockiert – Variante wechseln oder Fachprüfung einplanen.${blockerText}` })
  }

  // Jede Warnung mit dem korrelierten Status aus statusQuellen anreichern.
  // Regeln, die warn+status koppeln, tragen denselben regelId in beiden Arrays.
  // SYS hat keinen statusQuellen-Eintrag, erhält status direkt.
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
      const gewaehlterWert = eingaben[paket.variantenFeld]
      if (excluded[paket.variantenFeld]?.has(gewaehlterWert)) continue
      const gewaehlt = paket.varianten.find(v => v.wert === gewaehlterWert) ?? paket.varianten[0]
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
        kunde: pos.kunde, variante: varianteName,
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

  // 4. Kennzahlen, Energie, Sales-/Prüfdaten
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
    .map(f => ({ id: f.id, sektion: f.sektion, label: f.label, dq: f.dq }))
  const datenlage = datenlageEinordnung(dq, fehlendeDaten, annahmen.dq_schwelle)
  const statusKorridor = STATUS_KORRIDOR[status] ?? STATUS_KORRIDOR.unbekannt
  const kundenScope = kundenScopeBauen({
    eingaben, annahmen, derived, lvPositionen, opexPositionen, warnungen, fehlendeDaten, excluded,
  })

  return {
    derived, dq, status, statusLabel: STATUS_LABEL[status], statusQuellen,
    statusKorridor, datenlage, kundenScope,
    warnungen, gefeuert, konflikte,
    required: [...required],
    excluded: Object.fromEntries(Object.entries(excluded).map(([k, v]) => [k, [...v]])),
    lv: { positionen: lvPositionen, zwischensumme, contingency, brutto, foerderfaehig, foerderung, netto },
    opex: { positionen: opexPositionen, summe_pa: opexSumme },
    energie, kennzahlen, peScore, gruenKriterien, standardKriterien: gruenKriterien, fehlendeDaten,
  }
}
