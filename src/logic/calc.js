// Reine Berechnungen (kein React, keine Regeln): Heizlast-Proxy, WP-Kaskade,
// Schall-Demo-Abschätzung, Energieindikation. Wird von engine.js orchestriert.
// Alle Formeln sind Demo-Logik gemäß HANDOVER §2.7/§2.8, §4 (R18), §5.

import { fahrstreckeKm } from './entfernung.js'
import { findeInstallationspartner } from '../data/partner.js'

const log10 = Math.log10

// SK-81: Die vier Berechnungsdomänen – explizite Grenzziehung vor WP8-Pricing-Aufbau.
// engine.js aggregiert jede Domäne in `bereichsSummen`.
export const BERECHNUNGS_DOMAENEN = {
  invest: {
    beschreibung: 'Einmalige Investitionskosten (CAPEX)',
    quellen: 'Katalog-Positionen tag:"capex"; engine.lv.*',
  },
  cop_jaz: {
    beschreibung: 'COP/JAZ, Jahreswärmebedarf, Betriebsstrom und -gas',
    quellen: 'energieIndikation(); ANNAHMEN.jaz_* (je VL-Klasse) / wp_deckungsanteil; engine.energie.*',
  },
  betriebsfuehrung: {
    beschreibung: 'Monitoring und Datendienst (OPEX)',
    quellen: 'Katalog tag:"opex" bereich:"betriebsfuehrung"; engine.opex.positionen',
  },
  wartung_instandsetzung: {
    beschreibung: 'Wartung, Instandhaltung und Instandsetzung (OPEX)',
    quellen: 'Katalog tag:"opex" bereich:"wartung_instandsetzung"; engine.opex.positionen',
  },
}

// Servicegrenze-Default: Contractor-Leistungsumfang endet standardmäßig vor dem
// Heizkreisverteiler. Sekundärheizkreise sind Sonderfall / separater Scope.
export const SERVICEGRENZE = {
  typ: 'vor_heizkreisverteiler',
  beschreibung: 'Contractor-Leistungsumfang bis vor den Heizkreisverteiler; Sekundärheizkreise nicht im Standard-Scope.',
  optionen: ['vor_heizkreisverteiler', 'inkl_heizkreisverteiler'],
}

export function zahl(wert) {
  const n = typeof wert === 'string' ? parseFloat(wert.replace(',', '.')) : wert
  return Number.isFinite(n) ? n : null
}

// Heizlast in kW: bekannte Heizlast > Verbrauchs-Proxy > Flächen-Proxy > WE-Notbehelf
export function heizlastAbleitung(e, a) {
  const bekannt = e.heizlast_bekannt === 'ja' && zahl(e.heizlast_kw)
  if (bekannt) return { heizlast: zahl(e.heizlast_kw), geschaetzt: false, methode: 'Heizlast laut Eingabe' }

  const vbh = e.ww_enthalten === 'ja' ? a.vbh_mit_ww : a.vbh_ohne_ww
  const verbrauch = zahl(e.jahresverbrauch)
  if (verbrauch) {
    return { heizlast: (verbrauch * 1000) / vbh, geschaetzt: true,
      methode: `Proxy: ${verbrauch} MWh/a ÷ ${vbh} Vbh` }
  }
  const flaeche = zahl(e.flaeche)
  const spez = { unsaniert: a.spez_heizlast_unsaniert, teilsaniert: a.spez_heizlast_teilsaniert,
    vollsaniert: a.spez_heizlast_vollsaniert }[e.sanierungsstand]
  if (flaeche && spez) {
    return { heizlast: (flaeche * spez) / 1000, geschaetzt: true,
      methode: `Proxy: ${flaeche} m² × ${spez} W/m²` }
  }
  const we = zahl(e.wohneinheiten)
  if (we) return { heizlast: we * a.kw_je_we, geschaetzt: true, methode: `Notbehelf: ${we} WE × ${a.kw_je_we} kW` }
  return { heizlast: null, geschaetzt: true, methode: 'keine Datenbasis' }
}

// WP-Kaskade: Leistungsanteil der Heizlast, gerundet auf 20-kW-Module (1..max)
export function wpAuslegung(heizlast, a) {
  if (!heizlast) return { wp_module: 0, wp_kw: 0 }
  const ziel = heizlast * a.wp_leistungsanteil
  const module = Math.min(a.wp_module_max, Math.max(1, Math.round(ziel / a.wp_modul_kw)))
  return { wp_module: module, wp_kw: module * a.wp_modul_kw }
}

// Jahreswärmebedarf in MWh/a (Eingabe oder Rückrechnung aus Heizlast)
export function waermebedarf(e, a, heizlast) {
  const verbrauch = zahl(e.jahresverbrauch)
  if (verbrauch) return verbrauch
  if (!heizlast) return null
  const vbh = e.ww_enthalten === 'ja' ? a.vbh_mit_ww : a.vbh_ohne_ww
  return (heizlast * vbh) / 1000
}

export const AUFSTELLVARIANTEN = ['aussen_offen', 'fundament', 'einhausung', 'kompakt_container', 'vollcontainer']

// SK-79: Mapping Robert's-Draft → SysKon-Varianten + getroffene Produktentscheidungen.
// Dient als Dokumentationskonstante; enthält keine Rechenlogik.
export const AUFSTELLUNG_VARIANTEN_MAPPING = {
  aussen_offen: {
    roberts_draft: 'outside unprotected',
    entscheidung: 'Neu: günstigste Low-CAPEX-Variante ohne Wetterschutz. Nur für standortgeeignete Mikrolage (Schall, Witterung, Sichtschutz vorab klären).',
  },
  fundament: {
    roberts_draft: 'Fundament',
    entscheidung: 'Halten: Standardaufstellung mit Fundament und Witterungsschutz; breitester Anwendungsbereich.',
  },
  einhausung: {
    roberts_draft: 'outside with fence / Schallschutzzaun',
    entscheidung: 'Halten: entspricht Robert\'s "outside with fence/sound barrier". Rockwool-Schallschutzzaun als Demo-Referenzprodukt. Adressiert Schall- und Vandalismusrisiko ohne Container.',
  },
  kompakt_container: {
    roberts_draft: 'in Container (kompakt)',
    entscheidung: 'Halten: vorkonfektionierte Kompakt-Container-Lösung (ca. 30 m²). Zwei Containergrößen bleiben – Platzbedarf und Budget differieren signifikant.',
  },
  vollcontainer: {
    roberts_draft: 'in Container (vollintegriert)',
    entscheidung: 'Halten: begehbarer Vollcontainer mit integrierter Technik (ca. 45 m²). Höchste Standardisierung, minimale Heizraumabhängigkeit.',
  },
}

export const AUFSTELLVARIANTEN_META = {
  aussen_offen: {
    label: 'Außenaufstellung offen',
    kostenKey: 'k_aussen_offen',
    flaecheMin: 6,
    laengeMin: 2.5,
    breiteMin: 1.5,
    container: false,
    heizraumAbhaengig: true,
  },
  fundament: {
    label: 'Standard-Fundament',
    kostenKey: 'k_fundament',
    flaecheMin: 8,
    laengeMin: 3,
    breiteMin: 2,
    container: false,
    heizraumAbhaengig: true,
  },
  einhausung: {
    label: 'Schutz-/Schall-Einhausung',
    kostenKey: 'k_einhausung',
    flaecheMin: 10,
    laengeMin: 3.5,
    breiteMin: 2.5,
    container: false,
    heizraumAbhaengig: true,
  },
  kompakt_container: {
    label: 'Kompakt-Container',
    kostenKey: 'k_kompakt_container',
    flaecheMin: 30,
    laengeMin: 6,
    breiteMin: 3,
    container: true,
    heizraumAbhaengig: false,
  },
  vollcontainer: {
    label: 'Vollcontainer',
    kostenKey: 'k_vollcontainer',
    flaecheMin: 45,
    laengeMin: 10,
    breiteMin: 3.5,
    container: true,
    heizraumAbhaengig: false,
  },
}

// Schall-Demo-Abschätzung (R18): Lp = LW_Kaskade − 20·log10(r) − 8 − Abschlag.
// Keine rechtsverbindliche Schallberechnung.
export function schallBewertung(e, module, a) {
  const grenzwert = { WR: a.grenze_wr, WA: a.grenze_wa, MI: a.grenze_mi }[e.gebietstyp] ?? null
  const r = Math.max(1, zahl(e.abstand_fenster) ?? 0)
  if (!module || !grenzwert || !zahl(e.abstand_fenster)) {
    return { grenzwert, lw_kaskade: null, je_variante: {}, ampel_aktiv: 'unbekannt',
      lp_aktiv: null, gesperrte: [], status: 'gelb' }
  }
  const lw_kaskade = a.lw_modul + 10 * log10(module)
  const abschlag = (variante) => {
    if (variante === 'einhausung') return a.abschlag_einhausung
    if (variante === 'kompakt_container' || variante === 'vollcontainer') return a.abschlag_container
    return e.schallhaube === 'ja' ? a.abschlag_haube : 0
  }
  const ampel = (lp) => lp <= grenzwert - a.schall_toleranz ? 'gruen'
    : lp <= grenzwert + a.schall_toleranz ? 'gelb' : 'orange'

  const je_variante = {}
  const gesperrte = []
  for (const v of AUFSTELLVARIANTEN) {
    const lp = lw_kaskade - 20 * log10(r) - 8 - abschlag(v)
    je_variante[v] = { lp: Math.round(lp * 10) / 10, ampel: ampel(lp), abschlag: abschlag(v) }
    if (ampel(lp) === 'orange') gesperrte.push(v)
  }
  const aktiv = je_variante[e.aufstellvariante] ?? je_variante.fundament
  return {
    grenzwert, lw_kaskade: Math.round(lw_kaskade * 10) / 10, je_variante,
    lp_aktiv: aktiv.lp, ampel_aktiv: aktiv.ampel, gesperrte,
    status: aktiv.ampel === 'orange' ? 'orange' : aktiv.ampel === 'gelb' ? 'gelb' : 'gruen',
  }
}

export function aufstellungEmpfehlung(e, a, derived, gesperrteVarianten = []) {
  if (e.aussenflaeche_vorhanden !== 'ja') {
    return {
      aufstellung_viable: [],
      aufstellung_empfohlen: null,
      aufstellung_empfohlen_label: null,
      aufstellung_begruendung: 'Keine Außenfläche erfasst; es entsteht keine Standard-Aufstellungsempfehlung.',
      aufstellung_abweichung: null,
      aufstellung_blockierte_varianten: Object.fromEntries(AUFSTELLVARIANTEN.map(v => [v, ['keine Außenfläche erfasst']])),
    }
  }

  const flaeche = zahl(e.aussenflaeche_m2)
  const laenge = zahl(e.aussenflaeche_laenge_m)
  const breite = zahl(e.aussenflaeche_breite_m)
  const heizraumBlockiert = e.heizraum_vorhanden === 'nein' || e.heizraum_groesse_ok === 'nein' || e.zugang_ok === 'nein'
  const containerLogistikBlockiert = e.zugang_logistik === 'schwierig' || e.kran_zugang === 'nein'
  const dachSonderfall = e.aussenflaeche_typ === 'dach_garage'
  const gesperrt = new Set(gesperrteVarianten)
  const blockierte = {}

  const pruefe = (variante) => {
    const meta = AUFSTELLVARIANTEN_META[variante]
    const gruende = []
    if (gesperrt.has(variante)) gruende.push('durch Schall- oder Flächenregel gesperrt')
    if (flaeche !== null && flaeche < meta.flaecheMin) gruende.push(`mindestens ${meta.flaecheMin} m² zusammenhängende Fläche ansetzen`)
    if (laenge !== null && laenge < meta.laengeMin) gruende.push(`nutzbare Länge unter ${meta.laengeMin} m`)
    if (breite !== null && breite < meta.breiteMin) gruende.push(`nutzbare Breite unter ${meta.breiteMin} m`)
    if (dachSonderfall) gruende.push('Dach/Garage braucht Fachprüfung statt Standard-Placement')
    if (meta.container && containerLogistikBlockiert) gruende.push('Container braucht realistische Anlieferung und Kranstellung')
    if (meta.heizraumAbhaengig && heizraumBlockiert) gruende.push('Heizraum oder Zugang spricht gegen heizraumabhängige Varianten')
    return gruende
  }

  const alle = AUFSTELLVARIANTEN.map(variante => {
    const meta = AUFSTELLVARIANTEN_META[variante]
    const gruende = pruefe(variante)
    if (gruende.length > 0) blockierte[variante] = gruende
    return {
      variante,
      label: meta.label,
      kosten: a[meta.kostenKey],
      schall: derived.schall_je_variante[variante]?.ampel ?? 'unbekannt',
      container: meta.container,
      gruende,
      viable: gruende.length === 0,
    }
  })

  let kandidaten = alle.filter(v => v.viable)
  if ((e.platz_prioritaet === 'schall_robust' || e.schallsensibilitaet === 'hoch') && kandidaten.some(v => v.schall === 'gruen')) {
    kandidaten = kandidaten.filter(v => v.schall === 'gruen')
  }
  if (['heizraum_entlasten', 'container_bevorzugt'].includes(e.platz_prioritaet) && kandidaten.some(v => v.container)) {
    kandidaten = kandidaten.filter(v => v.container)
  }

  kandidaten.sort((aVar, bVar) => aVar.kosten - bVar.kosten)
  const empfohlen = kandidaten[0] ?? null
  const gewaehlt = alle.find(v => v.variante === e.aufstellvariante) ?? null
  const abweichung = empfohlen && gewaehlt && empfohlen.variante !== gewaehlt.variante
    ? {
      gewaehlt: gewaehlt.variante,
      gewaehlt_label: gewaehlt.label,
      empfohlen: empfohlen.variante,
      empfohlen_label: empfohlen.label,
      kosten_delta: (gewaehlt.kosten ?? 0) - (empfohlen.kosten ?? 0),
      gewaehlt_viable: gewaehlt.viable,
    }
    : null

  const prioritaetText = {
    kosten_min: 'Kostenminimum',
    schall_robust: 'robuster Schallkorridor',
    heizraum_entlasten: 'Heizraumentlastung',
    container_bevorzugt: 'Containerpräferenz',
    offen: 'keine besondere Priorität',
  }[e.platz_prioritaet] ?? 'Kostenminimum'

  return {
    aufstellung_viable: alle.filter(v => v.viable).map(({ variante, label, kosten, schall }) => ({ variante, label, kosten, schall })),
    aufstellung_empfohlen: empfohlen?.variante ?? null,
    aufstellung_empfohlen_label: empfohlen?.label ?? null,
    aufstellung_begruendung: empfohlen
      ? `${empfohlen.label} ist die günstigste tragfähige Variante im aktuellen Demo-Korridor (${prioritaetText}).`
      : 'Keine Aufstellvariante ist im aktuellen Demo-Korridor tragfähig; Standortdaten schärfen oder Fachprüfung einplanen.',
    aufstellung_abweichung: abweichung,
    aufstellung_blockierte_varianten: blockierte,
  }
}

// JAZ je Vorlauftemperatur-Klasse (Review C2): höhere VL → niedrigere JAZ.
// Unbekannte/fehlende Klasse fällt auf a.jaz zurück.
const JAZ_KEY = {
  '<=45': 'jaz_le45', '46-50': 'jaz_46_50', '51-55': 'jaz_51_55',
  '56-60': 'jaz_56_60', '61-65': 'jaz_61_65', '66-70': 'jaz_66_70', '>70': 'jaz_gt70',
}
// Nur positive, endliche JAZ-Werte akzeptieren (Admin-editierbar: 0/negativ/leer
// würde sonst wp_waerme/jaz → Infinity erzeugen). Klassenwert → Fallback a.jaz →
// harter Default 3.3.
const positiveJaz = (wert) => {
  const n = zahl(wert)
  return n != null && n > 0 ? n : null
}
export function resolveJaz(a, vlKlasse) {
  const key = JAZ_KEY[vlKlasse]
  return positiveJaz(key != null ? a[key] : null) ?? positiveJaz(a?.jaz) ?? 3.3
}

// Energieindikation Hybrid: WP deckt Deckungsanteil der Wärmemenge, Rest Gaskessel.
// JAZ richtet sich nach der Vorlauftemperatur-Klasse (vlKlasse), sonst Fallback a.jaz.
export function energieIndikation(bedarf, a, vlKlasse) {
  if (!bedarf) return null
  const jaz = resolveJaz(a, vlKlasse)
  const wp_waerme = bedarf * a.wp_deckungsanteil
  const gas_waerme = bedarf - wp_waerme
  const strom_mwh = wp_waerme / jaz
  const gas_mwh = gas_waerme / a.kessel_eta
  return {
    bedarf, wp_waerme, gas_waerme, strom_mwh, gas_mwh, jaz,
    kosten_strom: strom_mwh * a.strompreis_wp,
    kosten_gas: gas_mwh * a.gaspreis,
  }
}

// Anfahrt-Demo (SK-102): Fahrstrecke gewählter Installationspartner → Projekt-PLZ
// (Ersatz für eine Google-Maps-Distance-Abfrage). Ohne PLZ oder Partner greift
// der Fallback aus den Annahmen; die Quelle bleibt für die Anzeige sichtbar.
export function anfahrtAbleitung(e, a) {
  const partner = findeInstallationspartner(e.installationspartner)
  const kmEinfach = fahrstreckeKm(partner, e.projekt_plz, a.anfahrt_strassenfaktor)
  const quelle = kmEinfach != null ? 'plz_demo' : 'fallback'
  const einfach = kmEinfach ?? a.anfahrt_fallback_km
  return {
    anfahrt_km_einfach: einfach,
    anfahrt_km_gesamt: Math.round(einfach * 2 * a.anfahrt_fahrten),
    anfahrt_partner_label: partner?.name ?? null,
    anfahrt_quelle: quelle,
  }
}

// Alle Zwischenergebnisse für die Regel-Engine (Felder sind in Bedingungen nutzbar)
export function ableiten(e, a) {
  const hl = heizlastAbleitung(e, a)
  const wp = wpAuslegung(hl.heizlast, a)
  const schall = schallBewertung(e, wp.wp_module, a)
  const bedarf = waermebedarf(e, a, hl.heizlast)
  const energie = energieIndikation(bedarf, a, e.vorlauftemp_klasse)
  return {
    heizlast_effektiv: hl.heizlast ? Math.round(hl.heizlast) : null,
    heizlast_geschaetzt: hl.geschaetzt,
    heizlast_methode: hl.methode,
    wp_module: wp.wp_module,
    wp_kw: wp.wp_kw,
    waermebedarf_mwh: bedarf ? Math.round(bedarf) : null,
    schall_grenzwert: schall.grenzwert,
    schall_lw_kaskade: schall.lw_kaskade,
    schall_lp_aktiv: schall.lp_aktiv,
    schall_ampel_aktiv: schall.ampel_aktiv,
    schall_status: schall.status,
    schall_je_variante: schall.je_variante,
    schall_gesperrte_varianten: schall.gesperrte,
    energie,
    jaz_effektiv: energie ? energie.jaz : resolveJaz(a, e.vorlauftemp_klasse),
    // WP-Volllaststunden (Review C1): impliziter Auslegungs-Kennwert (wp_waerme ÷ wp_kw).
    // Durch die feste Kopplung deckungsanteil/leistungsanteil ~konstant; Demo-Indikation.
    wp_volllaststunden: energie && wp.wp_kw ? Math.round((energie.wp_waerme * 1000) / wp.wp_kw) : null,
    // Puffer-Sizing: Richtwert auf Basis kleinster WP-Einheit in homogener Kaskade
    puffer_empfehlung_liter: a.puffer_liter_je_kw * a.wp_modul_kw,
    ...anfahrtAbleitung(e, a),
  }
}
