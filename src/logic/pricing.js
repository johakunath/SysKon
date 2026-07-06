// Reine Contracting-/Pricing-Demo-Logik (kein React, keine Regeln).
// Übersetzt die interne Kostensicht (LV/OPEX/Energie aus engine.js) in ein
// kundenfähiges Richtpreis-Angebot: Grundpreis (GP), Arbeitspreis (AP) und
// Preisgleitformel. Commercial-Interna (Marge, CAPEX, Zielrendite/IRR) bleiben
// im `intern`-Zweig und dürfen NICHT in die Kundensicht (`kunde`) fließen
// (SK-70 / WP8). Alle Werte sind Demo-/Richtpreise.
//
// Roadmap Stufe 3 (docs/PRODUCT_ROADMAP.md): Ziel-IRR 13 % (Ambition 15 %),
// Vertragslaufzeiten 10/15/20 Jahre, Marge NUR auf den Arbeitspreis – keine
// Marge auf CAPEX und keine Marge auf den Grundpreis. Die AP-Marge wird
// iterativ auf die Ziel-IRR gelöst (loeseApMargeFuerIrr). Reale Indexreihen
// und die rechtliche AVBFernwärme-Prüfung bleiben offen (siehe Doc).

import { zahl } from './calc.js'

// Annuitätenfaktor (Kapitalwiedergewinnungsfaktor): verteilt eine Investition
// über n Jahre bei Zinssatz i. Zinssatz 0 ⇒ lineare Verteilung (1/n).
export function annuitaetenfaktor(zinssatz, jahre) {
  if (!jahre || jahre <= 0) return 0
  if (!zinssatz) return 1 / jahre
  const q = 1 + zinssatz
  return (zinssatz * Math.pow(q, jahre)) / (Math.pow(q, jahre) - 1)
}

// Kapitalwert (NPV) einer Zahlungsreihe bei gegebenem Zinssatz.
export function kapitalwert(rate, cashflows) {
  return cashflows.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t), 0)
}

// Interner Zinsfuß (IRR) per Bisektion. Erwartet einen Vorzeichenwechsel
// (typisch: t0 negativ, Folgejahre positiv). Die Obergrenze wird automatisch
// ausgeweitet, damit auch sehr hohe IRR (hoher Cashflow ggü. CAPEX) gefunden
// werden, statt fälschlich null zu liefern.
export function irr(cashflows, { unten = -0.9, oben = 1, iterationen = 100, toleranz = 1e-7 } = {}) {
  let lo = unten
  let flo = kapitalwert(lo, cashflows)
  if (Math.abs(flo) < toleranz) return lo
  let hi = oben
  let fhi = kapitalwert(hi, cashflows)
  for (let i = 0; i < 80 && flo * fhi > 0; i++) { hi = hi * 2 + 1; fhi = kapitalwert(hi, cashflows) }
  if (Math.abs(fhi) < toleranz) return hi
  if (flo * fhi > 0) return null
  for (let i = 0; i < iterationen; i++) {
    const mid = (lo + hi) / 2
    const fmid = kapitalwert(mid, cashflows)
    if (Math.abs(fmid) < toleranz) return mid
    if (flo * fmid < 0) { hi = mid; fhi = fmid } else { lo = mid; flo = fmid }
  }
  return (lo + hi) / 2
}

// Jährlicher Netto-Cashflow des Contractors bei gegebener AP-Marge.
// Herleitung: Erlös (GP + AP) − Kosten (Energie + Service). GP = Kapitaldienst
// + Service, AP-Erlös = variable Energiekosten × (1 + Marge). Service- und
// Energieanteil heben sich auf ⇒ CF = Kapitaldienst + Marge × variable Kosten.
function jahresCashflow(kapitaldienstPa, variableKostenPa, marge) {
  return kapitaldienstPa + marge * variableKostenPa
}

// Iterative AP-Marge bis zur Ziel-IRR. Gelöst wird die Nullstelle von
// `kapitalwert(zielIrr, cashflows(marge))`: der Barwert bei der Ziel-IRR ist
// monoton steigend in der Marge und wird genau dann null, wenn die IRR die
// Ziel-IRR trifft. Das ist robust gegen sehr hohe IRR (anders als eine direkte
// IRR-Suche, deren Bracket sprengen kann). Flags: `gedeckelt` (Ziel auch bei
// Maximalmarge nicht erreichbar) bzw. `bereitsErreicht` (Ziel ≤ Kapitalkosten,
// Marge 0). Bisektion ⇒ weiterhin iterativ.
export function loeseApMargeFuerIrr({ capex, kapitaldienstPa, variableKostenPa, laufzeit, zielIrr, margeMax = 3, iterationen = 80 }) {
  if (!(capex > 0) || !(variableKostenPa > 0) || !(laufzeit > 0) || zielIrr == null) return null
  const npvBeiMarge = (m) => kapitalwert(zielIrr, [-capex, ...Array(laufzeit).fill(jahresCashflow(kapitaldienstPa, variableKostenPa, m))])
  if (npvBeiMarge(0) >= 0) return { marge: 0, gedeckelt: false, bereitsErreicht: true }
  if (npvBeiMarge(margeMax) < 0) return { marge: margeMax, gedeckelt: true, bereitsErreicht: false }
  let lo = 0, hi = margeMax
  for (let i = 0; i < iterationen; i++) {
    const mid = (lo + hi) / 2
    const f = npvBeiMarge(mid)
    if (Math.abs(f) < 1e-4) return { marge: mid, gedeckelt: false, bereitsErreicht: false }
    if (f < 0) lo = mid; else hi = mid
  }
  return { marge: (lo + hi) / 2, gedeckelt: false, bereitsErreicht: false }
}

// Preisgleitformel (AVBFernwärme §24-orientiert, Demo): ein Festanteil plus
// gewichtete Indexkomponenten (Lohn/Strom/Gas/Investitionsgüter). Festanteil +
// Index-Gewichte summieren zu 1. Genannt sind die fachlich passenden amtlichen
// Indizes (Destatis); reale Indexreihen und die rechtliche Prüfung sind offen.
export function preisgleitformelBauen(annahmen) {
  const komponenten = [
    { schluessel: 'lohn', label: 'Lohnindex', referenz: 'Destatis Tarifindex Dienstleistungen', gewicht: annahmen.pg_lohn },
    { schluessel: 'strom', label: 'Strompreisindex', referenz: 'Destatis Erzeugerpreisindex Strom', gewicht: annahmen.pg_strom },
    { schluessel: 'gas', label: 'Gaspreisindex', referenz: 'Destatis Erzeugerpreisindex Gas', gewicht: annahmen.pg_gas },
    { schluessel: 'invest', label: 'Investitionsgüter-/Inflationsindex', referenz: 'Destatis Verbraucherpreisindex', gewicht: annahmen.pg_invest },
  ]
  const festanteil = annahmen.pg_fest
  const summe = festanteil + komponenten.reduce((s, k) => s + (k.gewicht ?? 0), 0)
  return {
    basisjahr: annahmen.pg_basisjahr,
    festanteil,
    komponenten,
    gewichtSumme: Math.round(summe * 1000) / 1000,
  }
}

// Preisänderungsfaktor P/P0 = a + Σ wₖ·(Iₖ/I0ₖ). Ohne Indexstände (Basisjahr,
// alle Iₖ = I0ₖ) ergibt sich Faktor 1. Basiswert je Index default 100.
export function preisgleitWert(formel, indexStaende = {}, basiswerte = {}) {
  if (!formel) return null
  return formel.komponenten.reduce((faktor, k) => {
    const aktuell = indexStaende[k.schluessel]
    const basis = basiswerte[k.schluessel] ?? 100
    const verhaeltnis = aktuell != null && basis ? aktuell / basis : 1
    return faktor + (k.gewicht ?? 0) * verhaeltnis
  }, formel.festanteil ?? 0)
}

// Effizienzrisiko-Allokation (Vertragsparameter, kundensicher). Konfigurierbar
// über die Frage `effizienzrisiko`; Default: Contractor trägt das Risiko.
export const EFFIZIENZRISIKO_TEXT = {
  contractor: 'Contractor trägt das WP-Effizienzrisiko (Demo-Annahme)',
  geteilt: 'Effizienzrisiko zwischen Contractor und Kunde geteilt (Demo-Annahme)',
  kunde: 'Kunde trägt das Effizienzrisiko (Demo-Annahme)',
}

// Hauptfunktion: erzeugt {kunde, intern} aus der internen Kostensicht.
export function contractingPreise({ lv, opex, energie, derived, eingaben, annahmen }) {
  // Vertragstyp (Frage `vertragstyp`, Default AVB-konform): AVB-Fernwärme bindet
  // die Laufzeit fest auf annahmen.vertragslaufzeit_default (10 Jahre, Demo) – ein
  // AVB-Angebot muss immer verfügbar sein. Andere Laufzeiten sind nur im
  // individuell mit dem Kunden ausgehandelten Vertrag möglich.
  const istIndividualvertrag = eingaben?.vertragstyp === 'individual'
  const laufzeit = istIndividualvertrag
    ? (zahl(eingaben?.vertragslaufzeit) ?? annahmen.vertragslaufzeit_default)
    : annahmen.vertragslaufzeit_default
  const capex = lv?.netto ?? 0
  const opexPa = opex?.summe_pa ?? 0

  // Grundpreis: Kapitaldienst (Annuität der Netto-CAPEX) + fixer Service.
  // KEINE Marge auf CAPEX oder Grundpreis (Roadmap Stufe 3).
  const af = annuitaetenfaktor(annahmen.kapitalkostensatz, laufzeit)
  const kapitaldienstPa = capex * af
  const grundpreisPa = kapitaldienstPa + opexPa
  const grundpreisMonat = grundpreisPa / 12

  // Arbeitspreis: variable Energiekosten je MWh + Marge (NUR hier). Die Marge
  // wird iterativ auf die Ziel-IRR gelöst; ap_marge ist nur noch Fallback.
  const bedarf = derived?.waermebedarf_mwh ?? null
  const variableKostenPa = energie ? energie.kosten_strom + energie.kosten_gas : null
  const variabelProMwh = bedarf && variableKostenPa != null ? variableKostenPa / bedarf : null

  const loesungZiel = loeseApMargeFuerIrr({ capex, kapitaldienstPa, variableKostenPa, laufzeit, zielIrr: annahmen.ziel_irr })
  const loesungAmbition = loeseApMargeFuerIrr({ capex, kapitaldienstPa, variableKostenPa, laufzeit, zielIrr: annahmen.ziel_irr_ambition })
  const effektiveMarge = loesungZiel?.marge ?? annahmen.ap_marge
  const arbeitspreisMwh = variabelProMwh != null ? variabelProMwh * (1 + effektiveMarge) : null

  // Tatsächlich erreichte IRR bei effektiver Marge (Reporting/Sanity).
  const erreichteIrr = capex > 0 && variableKostenPa != null && laufzeit
    ? irr([-capex, ...Array(laufzeit).fill(jahresCashflow(kapitaldienstPa, variableKostenPa, effektiveMarge))])
    : null
  const apMargeAbsolutPa = variableKostenPa != null ? variableKostenPa * effektiveMarge : null

  // Sensitivität Energie-Split ↔ IRR (Review C4, intern): variiert den WP-Deckungsanteil
  // um ±10 %-Punkte (geklemmt) bei KONSTANTER AP-Marge (Basis-Angebot) und konstanter CAPEX.
  // Zeigt, wie stark die erreichte IRR driftet, wenn der reale Split von der Annahme abweicht.
  // (Würde man je Szenario die Marge neu auf die Ziel-IRR lösen, bliebe die IRR per Konstruktion
  // konstant – uninformativ.) WP-Wärme ist je MWh günstiger als Gas-Spitzenlast, daher senkt ein
  // höherer WP-Anteil die variablen Kosten und damit den absoluten Margenbetrag → niedrigere IRR.
  const jazEff = derived?.jaz_effektiv ?? annahmen.jaz
  const baseDeckung = annahmen.wp_deckungsanteil
  const sensitivitaet = (bedarf && capex > 0 && variableKostenPa != null)
    ? [-0.1, 0, 0.1].map(delta => {
      const deckung = Math.min(1, Math.max(0, baseDeckung + delta))
      const wpWaerme = bedarf * deckung
      const vkPa = (wpWaerme / jazEff) * annahmen.strompreis_wp
        + ((bedarf - wpWaerme) / annahmen.kessel_eta) * annahmen.gaspreis
      const erreicht = irr([-capex, ...Array(laufzeit).fill(kapitaldienstPa + effektiveMarge * vkPa)])
      return { deckungsanteil: deckung, variableKostenPa: vkPa, erreichteIrr: erreicht, basis: delta === 0 }
    })
    : []

  // Preisanpassungsstruktur: Individualvertrag ersetzt die §24-Preisgleitformel
  // durch eine freiere Anpassung; Grundpreis/Arbeitspreis-Berechnung bleibt gleich.
  const preisgleitformel = istIndividualvertrag ? null : preisgleitformelBauen(annahmen)
  const effizienzrisiko = EFFIZIENZRISIKO_TEXT[eingaben?.effizienzrisiko] ?? EFFIZIENZRISIKO_TEXT.contractor

  // Vertragsparameter (strukturiert, kundensicher).
  const vertragsparameter = {
    servicegrenze: 'bis Heizkreisverteiler (Demo-Standard)',
    effizienzrisiko,
    preisanpassung: istIndividualvertrag
      ? 'individuell vereinbart (frei, ohne §24-Bezug, Demo)'
      : 'jährlich nach Preisgleitformel (AVBFernwärme-orientiert, Demo)',
  }

  return {
    kunde: {
      laufzeit,
      grundpreis_pa: grundpreisPa,
      grundpreis_monat: grundpreisMonat,
      arbeitspreis_mwh: arbeitspreisMwh,
      preisgleitformel,
      vertragsparameter,
    },
    intern: {
      laufzeit,
      capex,
      opexPa,
      kapitaldienstPa,
      annuitaetenfaktor: af,
      variabelProMwh,
      variableKostenPa,
      effektiveMarge,
      apMargeAbsolutPa,
      grundpreisPa,
      arbeitspreisMwh,
      erreichteIrr,
      margeZiel: loesungZiel?.marge ?? null,
      margeAmbition: loesungAmbition?.marge ?? null,
      margeGedeckelt: loesungZiel?.gedeckelt ?? false,
      apMargeFallback: annahmen.ap_marge,
      zielIrr: annahmen.ziel_irr,
      zielIrrAmbition: annahmen.ziel_irr_ambition,
      sensitivitaet,
    },
  }
}
