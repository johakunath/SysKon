// Reine Contracting-/Pricing-Demo-Logik (kein React, keine Regeln).
// Übersetzt die interne Kostensicht (LV/OPEX/Energie aus engine.js) in ein
// kundenfähiges Richtpreis-Angebot: Grundpreis (GP), Arbeitspreis (AP) und
// Preisgleitformel. Commercial-Interna (Marge, CAPEX, Zielrendite/IRR) bleiben
// im `intern`-Zweig und dürfen NICHT in die Kundensicht (`kunde`) fließen
// (SK-70 / WP8). Alle Werte sind Demo-/Richtpreise.
//
// Roadmap Stufe 3 (docs/PRODUCT_ROADMAP.md): Ziel-IRR 13 % (Ambition 15 %),
// Vertragslaufzeiten 10/15/20 Jahre, Marge NUR auf den Arbeitspreis – keine
// Marge auf CAPEX und keine Marge auf den Grundpreis. Der iterative Solver
// (AP-Marge bis Ziel-IRR) ist bewusst noch nicht enthalten; die Zielrendite
// erscheint als transparente, nicht-iterative Demo-Indikation.

import { zahl } from './calc.js'

// Annuitätenfaktor: verteilt eine Investition über n Jahre bei Zinssatz i.
// Zinssatz 0 ⇒ lineare Verteilung (1/n).
export function annuitaetenfaktor(zinssatz, jahre) {
  if (!jahre || jahre <= 0) return 0
  if (!zinssatz) return 1 / jahre
  const q = 1 + zinssatz
  return (zinssatz * Math.pow(q, jahre)) / (Math.pow(q, jahre) - 1)
}

// Preisgleitformel (AVBFernwärme-orientiert, Demo): Basiswert + gewichtete
// Indexkomponenten. Die Gewichte summieren zu 1; reale Indexreihen und eine
// rechtliche Prüfung sind noch offen (siehe docs/PRICING_MODELL.md).
function preisgleitformelBauen(annahmen) {
  const komponenten = [
    { schluessel: 'lohn', label: 'Lohnindex', gewicht: annahmen.pg_lohn },
    { schluessel: 'strom', label: 'Strompreisindex', gewicht: annahmen.pg_strom },
    { schluessel: 'gas', label: 'Gaspreisindex', gewicht: annahmen.pg_gas },
    { schluessel: 'invest', label: 'Investitionsgüter-/Inflationsindex', gewicht: annahmen.pg_invest },
  ]
  const summe = komponenten.reduce((s, k) => s + (k.gewicht ?? 0), 0)
  return { basisjahr: annahmen.pg_basisjahr, komponenten, gewichtSumme: Math.round(summe * 1000) / 1000 }
}

// Hauptfunktion: erzeugt {kunde, intern} aus der internen Kostensicht.
export function contractingPreise({ lv, opex, energie, derived, eingaben, annahmen }) {
  const laufzeit = zahl(eingaben?.vertragslaufzeit) ?? annahmen.vertragslaufzeit_default
  const capex = lv?.netto ?? 0
  const opexPa = opex?.summe_pa ?? 0

  // Grundpreis: Kapitaldienst (Annuität der Netto-CAPEX) + fixer Service.
  // KEINE Marge auf CAPEX oder Grundpreis (Roadmap Stufe 3).
  const af = annuitaetenfaktor(annahmen.kapitalkostensatz, laufzeit)
  const kapitaldienstPa = capex * af
  const grundpreisPa = kapitaldienstPa + opexPa
  const grundpreisMonat = grundpreisPa / 12

  // Arbeitspreis: variable Energiekosten je MWh + Marge (NUR hier).
  const bedarf = derived?.waermebedarf_mwh ?? null
  const variableKostenPa = energie ? energie.kosten_strom + energie.kosten_gas : null
  const variabelProMwh = bedarf && variableKostenPa != null ? variableKostenPa / bedarf : null
  const arbeitspreisMwh = variabelProMwh != null ? variabelProMwh * (1 + annahmen.ap_marge) : null

  const preisgleitformel = preisgleitformelBauen(annahmen)

  // Vertragsparameter (strukturiert, kundensicher).
  const vertragsparameter = {
    servicegrenze: 'bis Heizkreisverteiler (Demo-Standard)',
    effizienzrisiko: 'Techem trägt das WP-Effizienzrisiko (Demo-Annahme)',
    preisanpassung: 'jährlich nach Preisgleitformel (AVBFernwärme-orientiert, Demo)',
  }

  // Interner Commercial-Aufbau (NUR intern). Zielrendite als transparente,
  // nicht-iterative Demo-Indikation: jährliche AP-Marge bezogen auf die CAPEX.
  const apMargeAbsolutPa = variableKostenPa != null ? variableKostenPa * annahmen.ap_marge : null
  const zielrenditeIndikation = capex > 0 && apMargeAbsolutPa != null ? apMargeAbsolutPa / capex : null

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
      apMarge: annahmen.ap_marge,
      apMargeAbsolutPa,
      grundpreisPa,
      arbeitspreisMwh,
      zielrenditeIndikation,
      zielIrr: annahmen.ziel_irr,
      zielIrrAmbition: annahmen.ziel_irr_ambition,
    },
  }
}
