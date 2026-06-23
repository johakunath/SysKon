// Datenebene 1/3: Demo-Annahmen (HANDOVER §5). Alle Werte sind editierbar
// auf Screen 4 und ausdrücklich KEINE echten Kalkulationswerte.
// Kostenformeln im Katalog referenzieren diese Schlüssel (annahme: '<key>').

export const ANNAHMEN = {
  // Energie & Effizienz
  strompreis_wp: 240,        // €/MWh
  gaspreis: 80,              // €/MWh
  jaz: 3.3,                  // Jahresarbeitszahl WP
  kessel_eta: 0.93,          // Wirkungsgrad Bestandskessel
  vbh_ohne_ww: 1900,         // Vollbenutzungsstunden ohne Warmwasser
  vbh_mit_ww: 2200,          // Vollbenutzungsstunden mit Warmwasser
  wp_deckungsanteil: 0.65,   // Anteil WP an der Wärmemenge (Hybrid)
  wp_leistungsanteil: 0.27,  // WP-Leistung als Anteil der Heizlast (Auslegungs-Demo)
  wp_modul_kw: 20,           // kW thermisch je WP-Modul
  wp_module_max: 6,          // Kaskade 1..6 Module

  // Heizlast-Proxy, wenn weder Heizlast noch Verbrauch vorliegen
  spez_heizlast_unsaniert: 100,  // W/m²
  spez_heizlast_teilsaniert: 75, // W/m²
  spez_heizlast_vollsaniert: 50, // W/m²
  kw_je_we: 5,                   // kW je Wohneinheit (grober Notbehelf)

  // Schall (Demo-Abschätzung, nicht rechtsverbindlich)
  lw_modul: 68,              // dB(A) Schallleistungspegel je 20-kW-Modul
  grenze_wr: 35,             // dB(A) Nachtgrenzwert reines Wohngebiet
  grenze_wa: 40,             // dB(A) allgemeines Wohngebiet
  grenze_mi: 45,             // dB(A) Mischgebiet
  abschlag_haube: 8,         // dB Schallhaube
  abschlag_einhausung: 12,   // dB Einhausung
  abschlag_container: 15,    // dB Container
  schall_toleranz: 3,        // ±dB Ampelband um den Grenzwert

  // Aufstellung
  flaeche_min_container: 30, // m² Außenfläche, darunter Container gesperrt (R05)

  // Förderung
  foerderquote: 0.35,
  f_wp: 1.0,
  f_hydraulik: 1.0,
  f_speicher: 1.0,
  f_hybrid: 0.5,
  f_elektro: 0.8,
  f_umfeld: 0.8,
  f_aufstellung: 0.8,
  f_install: 1.0,
  f_monitoring: 0,
  f_fossil: 0,

  // Kostenbausteine einmalig (€)
  k_wp_je_kw: 1100,
  k_hybrid: 25000,
  k_hydraulik: 40000,
  k_speicher_ww: 30000,
  k_fws: 25000,             // €, Frischwasserstation + Puffer (Demo)
  k_elektro: 25000,
  k_monitoring_basic: 5000,
  k_monitoring_plus: 12000,
  k_install: 60000,
  k_umfeld: 30000,
  k_fundament: 15000,
  k_einhausung: 35000,
  k_kompakt_container: 120000,
  k_vollcontainer: 280000,
  k_schallhaube: 8000,

  // Laufende Kosten & Sonstiges
  monitoring_pa: 1500,       // €/a
  om_prozent_pa: 1.5,        // % der Brutto-LV-Kosten p.a. (Service Basis)
  om_prozent_komfort: 2.2,   // % p.a. (Service Komfort inkl. Störungsdienst)
  contingency: 0.10,
  dq_schwelle: 60,           // % – darunter Status-Deckelung auf gelb (R10)
  puffer_liter_je_kw: 30,    // L/kW kleinste WP in Kaskade (Demo-Anhaltswert)

  // Contracting & Pricing (Demo, WP8/SK-70). Roadmap Stufe 3:
  // Marge NUR auf Arbeitspreis, keine Marge auf CAPEX/Grundpreis.
  vertragslaufzeit_default: 15, // Jahre (10/15/20 wählbar)
  kapitalkostensatz: 0.06,      // Zinssatz der Grundpreis-Annuität (keine Marge)
  ap_marge: 0.15,               // Marge auf den Arbeitspreis
  ziel_irr: 0.13,               // Ziel-IRR (Demo)
  ziel_irr_ambition: 0.15,      // Ambitionsszenario
  // Preisgleitformel-Gewichte (AVBFernwärme §24-orientiert): Festanteil +
  // Index-Gewichte summieren zu 1.
  pg_fest: 0.10,
  pg_lohn: 0.27,
  pg_strom: 0.27,
  pg_gas: 0.22,
  pg_invest: 0.14,
  pg_basisjahr: 2026,
}

// SK-77: WP-Produktstamm Demo-Referenz (nicht editierbar).
// Buderus/Dreammaker ist der aktuelle Referenzstand; Alternativhersteller sind nach
// technischer Prüfung möglich. Felder dokumentieren die Zielstruktur für später
// ergänzte Produktstammdaten.
export const WP_PRODUKT_REFERENZ = {
  hersteller: 'Buderus / Dreammaker',
  produktfamilie: 'Logatherm WLW / Luft-Wasser-WP-Kaskade',
  modell_hinweis: 'Demo-Referenzstand; finales Produkt wird im Angebot festgelegt',
  kuehlmittel: 'R290',
  leistungsklasse_je_modul_kw: 20,
  kaskade_min: 1,
  kaskade_max: 6,
  cop_referenz_a2w35: 3.5,
  jaz_quelle: 'ANNAHMEN.jaz',
  vorlauf_max_standard_c: 65,
  vorlauf_max_technisch_c: 70,
  aussentemp_min_c: -20,
  sizing_methode: 'Leistungsanteil × Heizlast-Proxy ÷ Modulleistung (Demo-Heuristik)',
  sizing_korridor: '1–6 Module à 20 kW (20–120 kW thermisch)',
  anmerkung: 'Demo-Referenzstand Buderus/Dreammaker; Alternativhersteller nach technischer Prüfung möglich.',
}

// Metadaten für die editierbare Annahmen-Seite (Screen 4)
export const ANNAHMEN_META = [
  { gruppe: 'Energie & Effizienz', felder: [
    ['strompreis_wp', 'Strompreis Wärmepumpe', '€/MWh'],
    ['gaspreis', 'Gaspreis', '€/MWh'],
    ['jaz', 'JAZ Wärmepumpe', '–'],
    ['kessel_eta', 'Kesselwirkungsgrad', '0–1'],
    ['vbh_ohne_ww', 'Vollbenutzungsstunden ohne WW', 'h/a'],
    ['vbh_mit_ww', 'Vollbenutzungsstunden mit WW', 'h/a'],
    ['wp_deckungsanteil', 'WP-Deckungsanteil Hybrid (Wärmemenge)', '0–1'],
    ['wp_leistungsanteil', 'WP-Leistung als Anteil der Heizlast', '0–1'],
    ['wp_modul_kw', 'Leistung je WP-Modul', 'kW'],
    ['wp_module_max', 'max. Module in Kaskade', 'Stk'],
  ]},
  { gruppe: 'Heizlast-Proxy', felder: [
    ['spez_heizlast_unsaniert', 'spez. Heizlast unsaniert', 'W/m²'],
    ['spez_heizlast_teilsaniert', 'spez. Heizlast teilsaniert', 'W/m²'],
    ['spez_heizlast_vollsaniert', 'spez. Heizlast vollsaniert', 'W/m²'],
    ['kw_je_we', 'Heizlast je Wohneinheit (Notbehelf)', 'kW/WE'],
  ]},
  { gruppe: 'Schall (Demo-Abschätzung)', felder: [
    ['lw_modul', 'Schallleistungspegel je 20-kW-Modul', 'dB(A)'],
    ['grenze_wr', 'Nachtgrenzwert WR', 'dB(A)'],
    ['grenze_wa', 'Nachtgrenzwert WA', 'dB(A)'],
    ['grenze_mi', 'Nachtgrenzwert MI', 'dB(A)'],
    ['abschlag_haube', 'Abschlag Schallhaube', 'dB'],
    ['abschlag_einhausung', 'Abschlag Einhausung', 'dB'],
    ['abschlag_container', 'Abschlag Container', 'dB'],
    ['schall_toleranz', 'Ampelband um Grenzwert', '±dB'],
  ]},
  { gruppe: 'Förderung (Demo-Logik, keine Förderberatung)', felder: [
    ['foerderquote', 'Förderquote auf förderfähigen Anteil', '0–1'],
    ['f_wp', 'Förderanteil WP-Paket', '0–1'],
    ['f_hydraulik', 'Förderanteil Hydraulik', '0–1'],
    ['f_speicher', 'Förderanteil Speicher/WW', '0–1'],
    ['f_hybrid', 'Förderanteil Hybrid-Einbindung', '0–1'],
    ['f_elektro', 'Förderanteil Elektro/Netz', '0–1'],
    ['f_umfeld', 'Förderanteil Umfeldmaßnahmen', '0–1'],
    ['f_aufstellung', 'Förderanteil Aufstellung', '0–1'],
    ['f_install', 'Förderanteil Installation/IBN', '0–1'],
    ['f_monitoring', 'Förderanteil Monitoring', '0–1'],
    ['f_fossil', 'Förderanteil fossile Einheit', '0–1'],
  ]},
  { gruppe: 'Kostenbausteine einmalig', felder: [
    ['k_wp_je_kw', 'WP-Paket', '€/kW'],
    ['k_hybrid', 'Hybrid-Einbindung', '€'],
    ['k_hydraulik', 'Hydraulikpaket', '€'],
    ['k_speicher_ww', 'Speicher-/WW-Modul (Brauchwasserspeicher)', '€'],
    ['k_fws', 'Frischwasserstation + Puffer', '€'],
    ['k_elektro', 'Elektro/Netzanschluss', '€'],
    ['k_monitoring_basic', 'Monitoring Basic', '€'],
    ['k_monitoring_plus', 'Monitoring Plus (Aufpreis)', '€'],
    ['k_install', 'Installation/Inbetriebnahme', '€'],
    ['k_umfeld', 'Umfeldmaßnahmen', '€'],
    ['k_fundament', 'Aufstellung Fundament', '€'],
    ['k_einhausung', 'Aufstellung Einhausung', '€'],
    ['k_kompakt_container', 'Aufstellung Kompakt-Container', '€'],
    ['k_vollcontainer', 'Aufstellung Vollcontainer', '€'],
    ['k_schallhaube', 'Schallhaube', '€'],
  ]},
  { gruppe: 'Laufend & Sonstiges', felder: [
    ['monitoring_pa', 'Monitoring p.a.', '€/a'],
    ['om_prozent_pa', 'O&M p.a. (Service Basis)', '% Brutto-LV'],
    ['om_prozent_komfort', 'O&M p.a. (Service Komfort)', '% Brutto-LV'],
    ['contingency', 'Contingency', '0–1'],
    ['dq_schwelle', 'DQ-Schwelle für Status-Deckelung', '%'],
    ['flaeche_min_container', 'Mindest-Außenfläche für Container', 'm²'],
    ['puffer_liter_je_kw', 'Puffer: L/kW kleinste WP (Demo-Anhaltswert)', 'L/kW'],
  ]},
  { gruppe: 'Contracting & Pricing (Demo)', felder: [
    ['vertragslaufzeit_default', 'Vertragslaufzeit (Default)', 'Jahre'],
    ['kapitalkostensatz', 'Kapitalkostensatz Grundpreis-Annuität', '0–1'],
    ['ap_marge', 'Marge auf Arbeitspreis', '0–1'],
    ['ziel_irr', 'Ziel-IRR', '0–1'],
    ['ziel_irr_ambition', 'Ziel-IRR Ambition', '0–1'],
    ['pg_fest', 'Preisgleit: Festanteil', '0–1'],
    ['pg_lohn', 'Preisgleit: Lohnindex-Gewicht', '0–1'],
    ['pg_strom', 'Preisgleit: Strompreisindex-Gewicht', '0–1'],
    ['pg_gas', 'Preisgleit: Gaspreisindex-Gewicht', '0–1'],
    ['pg_invest', 'Preisgleit: Investitions-/Inflationsindex-Gewicht', '0–1'],
    ['pg_basisjahr', 'Preisgleit: Basisjahr', 'Jahr'],
  ]},
]
