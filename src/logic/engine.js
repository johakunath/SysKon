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
import { KATALOG } from '../data/katalog.js'
import { ALLE_FRAGEN } from '../data/fragen.js'
import { ARTIKEL, RABATTGRUPPEN } from '../data/artikel.js'
import { KOMPONENTEN } from '../data/komponenten.js'
import { ableiten, aufstellungEmpfehlung, zahl } from './calc.js'
import { artikelKalkulation } from './artikelPreise.js'
import { komponentenAuswahl } from './komponenten.js'
import { gruppiereNachGruppe } from './lv.js'
import { contractingVarianten } from './pricing.js'

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
    bedeutung: 'Der Fall wirkt im Korridor plausibel; Annahmen und Prüfpunkte bleiben intern sichtbar.',
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
    titel: 'Kein Standardfit',
    bedeutung: 'Der aktuelle Standardpfad passt nicht; das ist noch kein Umsetzungsurteil.',
    aktion: 'Sonderfall markieren, Alternativpfad prüfen oder den Fall zurückstellen.',
  },
  unbekannt: {
    titel: 'Noch nicht einordenbar',
    bedeutung: 'Es fehlen Pflichtdaten, bevor das Angebot sinnvoll eingeordnet werden kann.',
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
export function dqScore(eingaben, annahmen = ANNAHMEN, fragen = ALLE_FRAGEN) {
  let gesamt = 0, erreicht = 0
  for (const f of fragen) {
    if (!f.dq) continue
    if (f.sichtbar && !pruefeBedingung(f.sichtbar, eingaben, annahmen)) continue
    gesamt += f.dq
    if (beantwortet(eingaben[f.id])) erreicht += f.dq
  }
  return gesamt ? Math.round((100 * erreicht) / gesamt) : 0
}

export function sichtbareFragen(eingaben, annahmen = ANNAHMEN, fragen = ALLE_FRAGEN) {
  return fragen.filter(f => !f.sichtbar || pruefeBedingung(f.sichtbar, eingaben, annahmen))
}

function feldLabels(fragen) {
  return {
    ...Object.fromEntries(fragen.map(f => [f.id, f.label])),
    schall_ampel_aktiv: 'Schall-Ampel',
  }
}

function kriteriumText(b, labels) {
  const label = labels[b.feld] ?? b.feld
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
      bedeutung: 'Das Angebot ist als interne Orientierung nutzbar, enthält aber noch Annahmen.',
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
  if (pos.tag !== 'opex') return pos.einheit
  return pos.einheit === '€/a' ? 'p.a.' : `${pos.einheit} p.a.`
}

function kundenLeistungsklasse(pos, ctx, annahmen) {
  if (pos.kunde?.leistungsklasse) return pos.kunde.leistungsklasse
  if (pos.id === 'wp_modul') return `${ctx.wp_module} × ${annahmen.wp_modul_kw} kW, ca. ${ctx.wp_kw} kW`
  if (pos.id.startsWith('aufst_')) return pos.variante ?? 'Aufstellvariante'
  if (pos.tag === 'opex') return 'laufende Serviceleistung'
  return 'projektbezogener Leistungsumfang'
}

function kundenLeistungsumfang(pos, annahmen) {
  if (pos.id === 'wp_modul' && annahmen) {
    const maxKw = annahmen.wp_module_max * annahmen.wp_modul_kw
    return `Außengeräte als modularer Wärmepumpen-Verbund (1–${annahmen.wp_module_max} Module à ${annahmen.wp_modul_kw} kW, max. ${maxKw} kW thermisch). Kältemittel R290, JAZ laut Betriebsannahme. Alternativhersteller nach technischer Prüfung möglich.`
  }
  if (pos.kunde?.leistungsumfang) return pos.kunde.leistungsumfang
  if (pos.pruefpflichtig) return 'Im Kundengespräch als Prüfpunkt aufnehmen und intern bestätigen lassen.'
  return 'Im aktuellen Scope als Leistungsbaustein enthalten.'
}

function kundenWarntext(warnung) {
  if (warnung.kategorie === 'foerderung') return 'Interne Förderprüfung klären, bevor Aussagen nach außen genutzt werden.'
  if (warnung.status === 'rot') return 'Aktueller Standardfit passt nicht; Alternativpfad oder Sonderfall prüfen.'
  if (warnung.status === 'orange') return 'Fachprüfung einplanen, bevor der Umfang belastbar genutzt wird.'
  return warnung.text
}

function kundenScopeBauen({ eingaben, annahmen, derived, lvPositionen, opexPositionen, warnungen, fehlendeDaten, excluded, contractingKunde, avbAlternativeKunde = null }) {
  const allePositionen = [...lvPositionen, ...opexPositionen]
  const gruppen = gruppiereNachGruppe(allePositionen, ['Service / Betrieb (p.a.)'])
    .map(gruppe => ({
      name: gruppe.name,
      positionen: gruppe.positionen.map(pos => {
        const kunde = pos.kunde ?? {}
        return {
          id: pos.id,
          titel: kunde.titel ?? pos.text,
          artikelnummer: pos.artikel?.artikelnummer ?? null,
          hersteller: kunde.hersteller ?? 'herstellerneutral',
          produkt: kunde.produkt ?? 'Produkt wird später festgelegt',
          leistungsklasse: kundenLeistungsklasse(pos, derived, annahmen),
          menge: pos.menge,
          einheit: kundenEinheit(pos),
          leistungsumfang: kundenLeistungsumfang(pos, annahmen),
          pruefpflichtig: !!pos.pruefpflichtig,
        }
      }),
    }))

  const pfadEffektiv = derived.technologiepfad_effektiv ?? eingaben.technologiepfad
  const annahmenTexte = [
    'Vorläufiger Kundenumfang mit Richtpreisen für das Sales-Gespräch.',
    `Technologiepfad: ${pfadEffektiv === 'hybrid' ? 'Hybrid mit Luft-Wasser-Wärmepumpe und Gas-Bestandskessel' : 'außerhalb des aktuellen Standards'}.`,
    derived.aufstellung_begruendung,
    `Datenlage: ${annahmen.dq_schwelle}%-Schwelle intern, aktuell ${derived.heizlast_geschaetzt ? 'mit Heizlast-Annahme' : 'mit angegebener Heizlast'}.`,
  ].filter(Boolean)

  const ausgeschlosseneVarianten = [...(excluded.aufstellvariante ?? [])]
  const ausschluesse = [
    ...ausgeschlosseneVarianten.map(v => ({
      titel: 'Aufstellvariante ausgeschlossen',
      text: `${v}: aktuell nicht tragfähig im Korridor.`,
    })),
    ...(pfadEffektiv && pfadEffektiv !== 'hybrid'
      ? [{ titel: 'Technologiepfad außerhalb des Standards', text: 'Der gewählte Pfad ist noch nicht als Standardumfang abbildbar.' }]
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

  // Contracting-Angebot (kundensicher): nur GP/AP/Preisgleitformel und
  // strukturierte Vertragsparameter – keine Marge/CAPEX/IRR (SK-70 / WP8).
  const contracting = contractingKunde
    ? {
      laufzeit: contractingKunde.laufzeit,
      grundpreis_pa: contractingKunde.grundpreis_pa,
      grundpreis_monat: contractingKunde.grundpreis_monat,
      arbeitspreis_mwh: contractingKunde.arbeitspreis_mwh,
      preisgleitformel: contractingKunde.preisgleitformel,
      vertragsparameter: contractingKunde.vertragsparameter,
      enthalteneServices: opexPositionen.map(pos => pos.kunde?.titel ?? pos.text),
      // Bei Laufzeit über 10 Jahren: das immer verfügbare AVB-Angebot als
      // kundensichere Alternative (nur GP/AP/Laufzeit, keine Interna).
      avbAlternative: avbAlternativeKunde
        ? {
          laufzeit: avbAlternativeKunde.laufzeit,
          grundpreis_pa: avbAlternativeKunde.grundpreis_pa,
          grundpreis_monat: avbAlternativeKunde.grundpreis_monat,
          arbeitspreis_mwh: avbAlternativeKunde.arbeitspreis_mwh,
          preisanpassung: avbAlternativeKunde.vertragsparameter?.preisanpassung ?? null,
        }
        : null,
    }
    : null

  return {
    gruppen,
    contracting,
    annahmen: annahmenTexte,
    ausschluesse,
    offenePunkte: [...pruefpunkte, ...fehlende].slice(0, 10),
  }
}

export function berechne(eingaben, opts = {}) {
  const annahmen = opts.annahmen ?? ANNAHMEN
  const regeln = opts.regeln ?? REGELN
  const katalog = opts.katalog ?? KATALOG
  const fragen = opts.fragen ?? ALLE_FRAGEN
  const artikel = opts.artikel ?? ARTIKEL
  const rabattgruppen = opts.rabattgruppen ?? RABATTGRUPPEN
  const komponentenStamm = opts.komponenten ?? KOMPONENTEN

  // 1. Zwischenergebnisse + DQ
  const derived = ableiten(eingaben, annahmen)
  const dq = dqScore(eingaben, annahmen, fragen)
  const ctx = { ...derived, ...eingaben, dq_score: dq }
  // Überschreibe ctx.technologiepfad mit dem effektiven Pfad ('unentschieden' → 'hybrid'),
  // damit Regeln und Komponenten-Eignung den aufgelösten Pfad sehen.
  ctx.technologiepfad = derived.technologiepfad_effektiv ?? ctx.technologiepfad

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
      text: `Die gewählte Aufstellvariante ist im aktuellen Korridor blockiert – Variante wechseln oder Fachprüfung einplanen.${blockerText}` })
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
  const komponentenAuswahlMap = {}
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
      // SK-102: Bedingungen auch auf Positionsebene (z. B. bedingte Demontagen).
      if (pos.bedingung && !pruefeBedingung(pos.bedingung, ctx, annahmen)) continue
      const menge = zahl(deref(pos.menge, ctx, annahmen)) ?? 0
      let einzel = 0
      let artikelInfo = null
      let komponentenInfo = null
      if (pos.kosten.typ === 'fix') einzel = pos.kosten.annahme ? annahmen[pos.kosten.annahme] : 0
      else if (pos.kosten.typ === 'je_modul') einzel = annahmen[pos.kosten.annahme] * annahmen.wp_modul_kw
      else if (pos.kosten.typ === 'artikel') {
        // SK-102: Preis aus dem Artikelstamm (Listenpreis − Rabattgruppe = EK, × Aufschlag = VK).
        artikelInfo = artikelKalkulation(pos.kosten.artikel, artikel, rabattgruppen, annahmen.vk_aufschlag_material)
        if (artikelInfo) einzel = artikelInfo.vk
        else warnungen.push({ regelId: 'KAT', kategorie: 'katalog', status: null,
          text: `Artikel „${pos.kosten.artikel}" (Position „${pos.id}") fehlt im Artikelstamm – Position mit 0 € angesetzt, Artikeldatenbank prüfen.` })
      } else if (pos.kosten.typ === 'komponente') {
        // SK-103: günstigste geeignete Komponente aus dem Komponenten-Stamm wählen.
        const typ = pos.kosten.komponentenTyp
        const override = eingaben['komponente_' + typ]
        komponentenInfo = komponentenAuswahl({
          typ, komponenten: komponentenStamm, ctx, override,
          artikel, rabattgruppen, aufschlag: annahmen.vk_aufschlag_material,
        })
        if (!komponentenInfo) {
          warnungen.push({ regelId: 'KOMP', kategorie: 'katalog', status: null,
            text: `Keine geeignete Komponente (${typ}) gefunden – Position mit 0 € angesetzt.` })
        } else {
          einzel = komponentenInfo.gewaehlt.vk
          // Artikel-Kalkulation anhängen für EK/VK-Rückverfolgung im internen LV.
          artikelInfo = artikelKalkulation(komponentenInfo.gewaehlt.artikelnummer, artikel, rabattgruppen, annahmen.vk_aufschlag_material)
          if (komponentenInfo.ungueltigeWahl) {
            warnungen.push({ regelId: 'KOMP', kategorie: 'katalog', status: null,
              text: `Gewählte Komponente (${typ}) nicht geeignet – automatisch auf günstigste geeignete zurückgestellt.` })
          }
          komponentenAuswahlMap[typ] ??= komponentenInfo
        }
      } else if (pos.kosten.typ === 'anfahrt') {
        // SK-102: €/km = Fahrzeugkosten + Stundensatz ÷ Ø-Geschwindigkeit; Menge = km gesamt.
        einzel = annahmen.anfahrt_km_satz + annahmen.monteur_stundensatz / annahmen.anfahrt_geschwindigkeit_kmh
      }
      const eintrag = {
        id: pos.id, paket: paket.id, pakettyp: paket.pakettyp, gruppe: paket.gruppe,
        variante: varianteName, text: pos.text, menge, einheit: pos.einheit,
        einzel, betrag: einzel * menge,
        artikel: artikelInfo,
        komponente: komponentenInfo ? { gewaehlt: komponentenInfo.gewaehlt, ueberschrieben: komponentenInfo.ueberschrieben } : null,
        anfahrt: pos.kosten.typ === 'anfahrt'
          ? { km_einfach: ctx.anfahrt_km_einfach, fahrten: annahmen.anfahrt_fahrten,
              partner: ctx.anfahrt_partner_label, quelle: ctx.anfahrt_quelle }
          : null,
        foerderanteil: annahmen[pos.foerder] ?? 0, tag: pos.tag,
        bereich: pos.bereich ?? null,
        begruendung: pos.begruendung, pruefpflichtig: !!pos.pruefpflichtig,
        kunde: komponentenInfo?.gewaehlt
          ? { ...pos.kunde, hersteller: komponentenInfo.gewaehlt.hersteller, produkt: komponentenInfo.gewaehlt.modell }
          : pos.kunde,
        erzwungen: paket.bedingung?.feld?.startsWith?.('require_') ? 'R03' : null,
      }
      if (pos.tag === 'opex') opexPositionen.push({ ...eintrag, prozent: pos.kosten.typ === 'prozent_lv' ? annahmen[pos.kosten.annahme] : null })
      else lvPositionen.push(eintrag)
    }
  }

  const zwischensumme = lvPositionen.reduce((s, p) => s + p.betrag, 0)
  const contingency = zwischensumme * annahmen.contingency
  const brutto = zwischensumme + contingency
  // foerderfaehig rechnet bewusst auf der Zwischensumme OHNE Contingency (Review C3):
  // der Risikopuffer ist kein Förder-Gegenstand. netto zieht die Förderung anschließend
  // vom Brutto (inkl. Contingency) ab → Contingency ist implizit nicht förderfähig (konservativ).
  const foerderfaehig = lvPositionen.reduce((s, p) => s + p.betrag * p.foerderanteil, 0)
  const foerderAktiv = eingaben.foerderung_annahme !== 'nein'
  const foerderung = foerderAktiv ? foerderfaehig * annahmen.foerderquote : 0
  const netto = brutto - foerderung

  for (const p of opexPositionen) {
    if (p.prozent != null) p.betrag = (brutto * p.prozent) / 100
    else p.betrag = p.einzel * p.menge
  }
  const opexSumme = opexPositionen.reduce((s, p) => s + p.betrag, 0)

  // SK-81: Domänen-Summen für getrennte Berechnungsbereiche.
  const summeBereich = (bereich) => opexPositionen
    .filter(p => p.bereich === bereich).reduce((s, p) => s + p.betrag, 0)
  const bereichsSummen = {
    invest: netto,
    cop_jaz: derived.energie
      ? { strom_mwh: derived.energie.strom_mwh, gas_mwh: derived.energie.gas_mwh,
          kosten_strom_pa: derived.energie.kosten_strom, kosten_gas_pa: derived.energie.kosten_gas }
      : null,
    betriebsfuehrung_pa: summeBereich('betriebsfuehrung'),
    wartung_instandsetzung_pa: summeBereich('wartung_instandsetzung'),
  }

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
  const labels = feldLabels(fragen)
  const gruenKriterien = (r11?.wenn?.und ?? []).map(b => ({
    text: kriteriumText(b, labels), erfuellt: pruefeBedingung(b, ctx, annahmen),
  }))

  const fehlendeDaten = sichtbareFragen(eingaben, annahmen, fragen)
    .filter(f => f.dq > 0 && !beantwortet(eingaben[f.id]))
    .map(f => ({ id: f.id, sektion: f.sektion, label: f.label, dq: f.dq }))
  const datenlage = datenlageEinordnung(dq, fehlendeDaten, annahmen.dq_schwelle)
  const statusKorridor = STATUS_KORRIDOR[status] ?? STATUS_KORRIDOR.unbekannt

  // Contracting-/Pricing-Layer (WP8): aus interner Kostensicht GP/AP/Preisgleit-
  // formel ableiten. `pricing.kunde` ist kundensicher, `pricing.intern` trägt die
  // Commercial-Interna (Marge, CAPEX, Zielrendite/IRR) hinter dem Sales-Toggle.
  // Bei Laufzeit >10 Jahre (implizierter Individualvertrag) wird zusätzlich immer
  // die AVB-Variante (10 Jahre) gerechnet – ein AVB-Angebot muss verfügbar sein.
  const varianten = contractingVarianten({
    lv: { positionen: lvPositionen, zwischensumme, contingency, brutto, foerderfaehig, foerderung, netto },
    opex: { positionen: opexPositionen, summe_pa: opexSumme },
    energie, derived, eingaben, annahmen,
  })
  const pricing = varianten.aktiv
  const kundenScope = kundenScopeBauen({
    eingaben, annahmen, derived, lvPositionen, opexPositionen, warnungen, fehlendeDaten, excluded,
    contractingKunde: pricing.kunde,
    avbAlternativeKunde: varianten.dual ? varianten.avb.kunde : null,
  })

  return {
    derived, dq, status, statusLabel: STATUS_LABEL[status], statusQuellen,
    statusKorridor, datenlage, kundenScope,
    warnungen, gefeuert, konflikte,
    required: [...required],
    excluded: Object.fromEntries(Object.entries(excluded).map(([k, v]) => [k, [...v]])),
    lv: { positionen: lvPositionen, zwischensumme, contingency, brutto, foerderfaehig, foerderung, netto },
    opex: { positionen: opexPositionen, summe_pa: opexSumme },
    bereichsSummen,
    energie, kennzahlen, peScore, gruenKriterien, standardKriterien: gruenKriterien, fehlendeDaten,
    pricing: pricing.intern,
    pricingVarianten: {
      avb: varianten.avb.intern,
      individual: varianten.individual?.intern ?? null,
      dual: varianten.dual,
    },
    komponentenAuswahl: komponentenAuswahlMap,
  }
}
