// Datenebene 1/3: Demo-Annahmen (HANDOVER §5). Alle Werte sind editierbar
// auf Screen 4 und ausdrücklich KEINE echten Kalkulationswerte.
// Kostenformeln im Katalog referenzieren diese Schlüssel (annahme: '<key>').

export const ANNAHMEN = {
  // Energie & Effizienz
  strompreis_wp: 240,        // €/MWh
  gaspreis: 80,              // €/MWh
  jaz: 3.3,                  // Jahresarbeitszahl WP (Fallback, wenn VL-Klasse unbekannt; Review C2)
  // JAZ je Vorlauftemperatur-Klasse (Demo, R290-Luft/Wasser): höhere VL → niedrigere JAZ.
  // Resolver in calc.js (resolveJaz); unbekannte/fehlende Klasse fällt auf `jaz` zurück.
  jaz_le45: 4.3,             // ≤ 45 °C
  jaz_46_50: 4.0,            // 46–50 °C
  jaz_51_55: 3.7,            // 51–55 °C
  jaz_56_60: 3.3,            // 56–60 °C (Demo-Referenz, = jaz)
  jaz_61_65: 3.0,            // 61–65 °C
  jaz_66_70: 2.8,            // 66–70 °C
  jaz_gt70: 2.6,             // > 70 °C
  kessel_eta: 0.93,          // Wirkungsgrad Bestandskessel
  vbh_ohne_ww: 1900,         // Vollbenutzungsstunden ohne Warmwasser
  vbh_mit_ww: 2200,          // Vollbenutzungsstunden mit Warmwasser
  // Hinweis (Review C1): wp_deckungsanteil (Energie) und wp_leistungsanteil (Leistung) sind
  // unabhängige Demo-Konstanten. Ihre Kombination impliziert ~konstante WP-Volllaststunden
  // (≈ vbh × deckungsanteil / leistungsanteil ≈ 5.300 h); mittelfristig aus Bivalenzpunkt ableiten.
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
  f_messkonzept: 0,   // Zählerinfrastruktur: kein BEG-Fördergegenstand (Demo)
  f_fossil: 0,

  // Kostenbausteine einmalig (€). Hardware-Preise (WP-Module, Speicher, Schall-
  // zubehör, MSR, SmartControl) liegen seit SK-102 NICHT mehr hier, sondern als
  // Artikel mit Listenpreis/Rabattgruppe in src/data/artikel.js (CPQ-Demo).
  // Hier bleiben nur Nicht-Katalog-Bausteine (Bau-/Projektleistungen).
  k_hybrid: 25000,
  k_hydraulik: 40000,
  k_elektro: 25000,
  k_umfeld: 30000,
  k_aussen_offen: 3000,
  k_fundament: 15000,
  k_einhausung: 35000,
  k_kompakt_container: 120000,
  k_vollcontainer: 280000,
  k_atec_schallberechnung: 3500,     // €, ATEC-Schallberechnungsservice Pauschale (Demo, SK-79)
  f_smartcontrol: 0,                 // kein BEG-Gegenstand (Demo)
  f_vertrieb_einweisung: 0,          // Vertrieb/Einweisung/Doku: kein Fördergegenstand (Demo, SK-102)

  // Installation als Einzelkomponenten (SK-102, ersetzt die frühere Pauschale
  // k_install = 60.000 €; Referenzfall 4 Module ohne Demontagen ≈ 59 k€ + Anfahrt).
  k_inst_baustelle: 3500,            // Baustelleneinrichtung
  k_inst_wp_montage_je_modul: 4500,  // Montage je WP-Modul (Fundament-Aufsetzen, Anschluss)
  k_inst_hydraulik_montage: 9000,    // Hydraulische Installation im Heizraum
  k_inst_elektro_montage: 6000,      // Elektromontage (Verkabelung, Anschlussarbeiten)
  k_inst_kleinmaterial: 4000,        // Montage-Kleinmaterial (Demo-Pauschale)
  k_inst_ibn: 4000,                  // Inbetriebnahme inkl. IBN-Protokoll
  k_inst_doku: 1500,                 // Revisions-/Übergabedokumentation
  k_inst_projektierung: 6500,        // Projektplanung (Demo-Pauschale)
  k_inst_einweisung: 1200,           // Einweisung Betreiber/Kunde
  k_inst_vertrieb: 5000,             // Vertriebs-/Marketingpauschale (Demo)
  k_inst_demontage_gaskessel: 3500,  // nur bei nicht nutzbarem Bestandskessel
  k_inst_demontage_abgas: 2500,      // Demontage Abgasanlage (mit Kessel-Demontage)
  k_inst_demontage_oeltank: 4500,    // Demontage/Stilllegung Öltank (falls vorhanden)

  // Anfahrt (SK-102, Demo-Ersatz für eine externe Kartendienst-Fahrstreckenabfrage):
  // Fahrstrecke Partner→Projekt-PLZ (Luftlinie × Straßenfaktor), Kosten je km =
  // Fahrzeug-km-Satz + Stundensatz ÷ Ø-Geschwindigkeit; × 2 (hin/zurück) × Fahrten.
  anfahrt_geschwindigkeit_kmh: 60,   // Ø-Geschwindigkeit Montagefahrzeug
  monteur_stundensatz: 85,           // €/h Handwerker-Stundensatz (Demo)
  anfahrt_km_satz: 0.7,              // €/km Fahrzeugkosten
  anfahrt_fahrten: 10,               // Anzahl Fahrten (≈ Montagetage, Demo)
  anfahrt_strassenfaktor: 1.3,       // Luftlinie → Straßenstrecke (Demo)
  anfahrt_fallback_km: 35,           // km einfach, wenn PLZ/Partner fehlen

  // Beschaffung/Verkauf (SK-102): Zuschlag auf den Artikel-EK → VK im LV.
  // Getrennt von ap_marge – die Contracting-Regel „Marge nur auf Arbeitspreis"
  // bleibt unberührt; dies ist ein Material-Gemeinkostenzuschlag (Demo).
  vk_aufschlag_material: 0.18,

  // Laufende Kosten & Sonstiges (Service-/Monitoring-Jahrespreise: Artikelstamm)
  contingency: 0.10,
  dq_schwelle: 60,           // % – darunter Status-Deckelung auf gelb (R10)
  puffer_liter_je_kw: 30,    // L/kW kleinste WP in Kaskade (Demo-Anhaltswert)

  // Contracting & Pricing (Demo, WP8/SK-70). Roadmap Stufe 3:
  // Marge NUR auf Arbeitspreis, keine Marge auf CAPEX/Grundpreis.
  vertragslaufzeit_default: 10, // Jahre (10/15/20 wählbar), 10 = AVB-konform
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

// Förderart-Label für Kundensicht (Demo). Kein numerischer ANNAHMEN-Wert,
// daher eigener Export (nicht über Admin editierbar).
export const FOERDERUNG_ART_LABEL = 'Bundesförderung für effiziente Gebäude – Einzelmaßnahmen (BEG EM)'

// Feste AVB-Fernwärme-Laufzeit (Demo). Bewusst kein ANNAHMEN-Feld: Admin darf
// vertragslaufzeit_default (Individualvertrag-Fallback) ändern, ohne dass ein
// zuvor lokal gespeicherter Admin-Stand die AVB-Bindung auf 10 Jahre aufweicht.
export const AVB_LAUFZEIT_JAHRE = 10

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
  jaz_quelle: 'ANNAHMEN.jaz_* je Vorlauftemperatur-Klasse (Fallback ANNAHMEN.jaz)',
  vorlauf_max_standard_c: 65,
  vorlauf_max_technisch_c: 70,
  aussentemp_min_c: -20,
  sizing_methode: 'Leistungsanteil × Heizlast-Proxy ÷ Modulleistung (Demo-Heuristik)',
  sizing_korridor: '1–6 Module à 20 kW (20–120 kW thermisch)',
  anmerkung: 'Demo-Referenzstand Buderus/Dreammaker; Alternativhersteller nach technischer Prüfung möglich.',
}

// SK-80: Strombeschaffungs-Modell (Dokumentationskonstante, keine Rechenlogik).
// Verknüpft strompreis_wp (Energiekostenannahme) mit pg_strom (Preisgleitformel-Gewicht)
// und messkonzept_basis (Pflicht-Infrastruktur für WP-Sondertarif-Abrechnung).
export const STROMBESCHAFFUNG_MODELL = {
  modell: 'wp_sondertarif',
  beschreibung: 'Der Contractor beschafft WP-Strom im WP-Sondertarif (HTT/NTT); getrennte Zählung via Messkonzept Basis.',
  strompreis_annahme: 'strompreis_wp',           // 240 €/MWh Demo
  preisgleitformel_anteil: 'pg_strom',           // 27 % Stromkostenanteil in Preisgleitformel
  foerderung: 'keine_direkte',                   // Strombeschaffung kein BEG-Gegenstand
  messkonzept_voraussetzung: 'messkonzept_basis',// Katalog-Paket; separater WP-Zähler Pflicht
}

// Metadaten für die editierbare Annahmen-Seite (Screen 4)
export const ANNAHMEN_META = [
  { gruppe: 'Energie & Effizienz', felder: [
    ['strompreis_wp', 'Strompreis Wärmepumpe', '€/MWh'],
    ['gaspreis', 'Gaspreis', '€/MWh'],
    ['jaz', 'JAZ Wärmepumpe (Fallback)', '–'],
    ['jaz_le45', 'JAZ ≤ 45 °C', '–'],
    ['jaz_46_50', 'JAZ 46–50 °C', '–'],
    ['jaz_51_55', 'JAZ 51–55 °C', '–'],
    ['jaz_56_60', 'JAZ 56–60 °C', '–'],
    ['jaz_61_65', 'JAZ 61–65 °C', '–'],
    ['jaz_66_70', 'JAZ 66–70 °C', '–'],
    ['jaz_gt70', 'JAZ > 70 °C', '–'],
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
  { gruppe: 'Kostenbausteine einmalig (Nicht-Katalog; Hardware: Artikeldatenbank)', felder: [
    ['k_hybrid', 'Hybrid-Einbindung', '€'],
    ['k_hydraulik', 'Hydraulikpaket', '€'],
    ['k_elektro', 'Elektro/Netzanschluss', '€'],
    ['k_umfeld', 'Umfeldmaßnahmen', '€'],
    ['k_aussen_offen', 'Aufstellung offen (kein Wetterschutz)', '€'],
    ['k_fundament', 'Aufstellung Fundament', '€'],
    ['k_einhausung', 'Aufstellung Einhausung / Schallschutzzaun', '€'],
    ['k_kompakt_container', 'Aufstellung Kompakt-Container', '€'],
    ['k_vollcontainer', 'Aufstellung Vollcontainer', '€'],
    ['k_atec_schallberechnung', 'ATEC-Schallberechnung (Demo-Pauschale)', '€'],
  ]},
  { gruppe: 'Installation – Einzelkomponenten (SK-102)', felder: [
    ['k_inst_baustelle', 'Baustelleneinrichtung', '€'],
    ['k_inst_wp_montage_je_modul', 'WP-Montage je Modul', '€/Modul'],
    ['k_inst_hydraulik_montage', 'Hydraulische Installation', '€'],
    ['k_inst_elektro_montage', 'Elektromontage', '€'],
    ['k_inst_kleinmaterial', 'Montage-Kleinmaterial', '€'],
    ['k_inst_ibn', 'Inbetriebnahme inkl. Protokoll', '€'],
    ['k_inst_doku', 'Revisions-/Übergabedokumentation', '€'],
    ['k_inst_projektierung', 'Projektplanung (Pauschale)', '€'],
    ['k_inst_einweisung', 'Einweisung Betreiber/Kunde', '€'],
    ['k_inst_vertrieb', 'Vertriebs-/Marketingpauschale', '€'],
    ['k_inst_demontage_gaskessel', 'Demontage Bestandskessel (falls nicht nutzbar)', '€'],
    ['k_inst_demontage_abgas', 'Demontage Abgasanlage', '€'],
    ['k_inst_demontage_oeltank', 'Demontage/Stilllegung Öltank', '€'],
  ]},
  { gruppe: 'Anfahrt (SK-102, Demo-Distanzrechnung)', felder: [
    ['anfahrt_geschwindigkeit_kmh', 'Ø-Geschwindigkeit', 'km/h'],
    ['monteur_stundensatz', 'Handwerker-Stundensatz', '€/h'],
    ['anfahrt_km_satz', 'Fahrzeugkosten', '€/km'],
    ['anfahrt_fahrten', 'Anzahl Fahrten (≈ Montagetage)', 'Stk'],
    ['anfahrt_strassenfaktor', 'Straßenfaktor (Luftlinie → Strecke)', '–'],
    ['anfahrt_fallback_km', 'Fallback-Distanz ohne PLZ/Partner', 'km'],
  ]},
  { gruppe: 'Artikel-Kalkulation & Förderung Sonstiges (SK-102)', felder: [
    ['vk_aufschlag_material', 'VK-Aufschlag auf Artikel-EK (Materialgemeinkosten)', '0–1'],
    ['f_messkonzept', 'Förderanteil Messkonzept (kein BEG-Gegenstand)', '0–1'],
    ['f_smartcontrol', 'Förderanteil SmartControl (kein BEG-Gegenstand)', '0–1'],
    ['f_vertrieb_einweisung', 'Förderanteil Vertrieb/Einweisung/Doku', '0–1'],
  ]},
  { gruppe: 'Laufend & Sonstiges', felder: [
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
