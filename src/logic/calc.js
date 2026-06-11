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
