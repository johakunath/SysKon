// Reine Berechnungen (kein React, keine Regeln): Heizlast-Proxy, WP-Kaskade,
// Schall-Demo-Abschätzung, Energieindikation. Wird von engine.js orchestriert.
// Alle Formeln sind Demo-Logik gemäß HANDOVER §2.7/§2.8, §4 (R18), §5.

const log10 = Math.log10

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

export const AUFSTELLVARIANTEN = ['fundament', 'einhausung', 'kompakt_container', 'vollcontainer']

export const AUFSTELLVARIANTEN_META = {
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
      aufstellung_begruendung: 'Keine Außenfläche erfasst; im MVP entsteht keine Standard-Aufstellungsempfehlung.',
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
    if (dachSonderfall) gruende.push('Dach/Garage braucht Fachprüfung statt MVP-Placement')
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

// Energieindikation Hybrid: WP deckt Deckungsanteil der Wärmemenge, Rest Gaskessel
export function energieIndikation(bedarf, a) {
  if (!bedarf) return null
  const wp_waerme = bedarf * a.wp_deckungsanteil
  const gas_waerme = bedarf - wp_waerme
  const strom_mwh = wp_waerme / a.jaz
  const gas_mwh = gas_waerme / a.kessel_eta
  return {
    bedarf, wp_waerme, gas_waerme, strom_mwh, gas_mwh,
    kosten_strom: strom_mwh * a.strompreis_wp,
    kosten_gas: gas_mwh * a.gaspreis,
  }
}

// Alle Zwischenergebnisse für die Regel-Engine (Felder sind in Bedingungen nutzbar)
export function ableiten(e, a) {
  const hl = heizlastAbleitung(e, a)
  const wp = wpAuslegung(hl.heizlast, a)
  const schall = schallBewertung(e, wp.wp_module, a)
  const bedarf = waermebedarf(e, a, hl.heizlast)
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
    energie: energieIndikation(bedarf, a),
  }
}
