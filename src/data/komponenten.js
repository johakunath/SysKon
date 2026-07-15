// Datenebene: Komponenten-Stamm (SK-103 / SK-104).
// Typisierte Komponenten (hersteller/modell/technik/eignung) verknüpfen
// den DATANORM-Artikelstamm mit dem Katalog. Die Engine wählt die
// günstigste geeignete Komponente je Typ; Dropdowns in Ergebnis.jsx
// erlauben manuelle Auswahl.
//
// Alle Hersteller, Modelle und Artikelnummern sind frei erfundene Beispieldaten.
// Alle WP-Module sind 20 kW (Kaskaden-Constraint: wp_modul_kw = 20 kW,
// Menge = @wp_module aus calc.js).

export const KOMPONENTEN_TYPEN = ['waermepumpe', 'speicher', 'regelung', 'monitoring']

export const KOMPONENTEN = [
  // — Wärmepumpen (alle 20 kW, kaskadierbar) —
  {
    id: 'wt_aero_20',
    typ: 'waermepumpe',
    hersteller: 'Wärmetechnik Nord',
    modell: 'AeroLine 20',
    artikelnummer: 'WT-WP20-R290',
    titel: 'Luft-Wasser-WP-Modul 20 kW (Wärmetechnik Nord)',
    beschreibung: 'Günstigstes 20-kW-Modul, Kältemittel R290, kaskadierbar.',
    technik: { leistung_kw: 20, schallleistung_dba: 65 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  {
    id: 'st_basic_20',
    typ: 'waermepumpe',
    hersteller: 'Systemtechnik Süd',
    modell: 'WP20 Basic',
    artikelnummer: 'ST-WP20-BASIC',
    titel: 'Luft-Wasser-WP-Modul 20 kW Basic (Systemtechnik Süd)',
    beschreibung: 'Mittelklasse-Modul, 20 kW, R290, Kaskadeneignung.',
    technik: { leistung_kw: 20, schallleistung_dba: 66 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  {
    id: 'st_silent_20',
    typ: 'waermepumpe',
    hersteller: 'Systemtechnik Süd',
    modell: 'WP20 Silent',
    artikelnummer: 'ST-WP20-SILENT',
    titel: 'Luft-Wasser-WP-Modul 20 kW Silent (Systemtechnik Süd)',
    beschreibung: 'Schalloptimiertes 20-kW-Modul (62 dBA), geeignet für schallsensible Lagen.',
    technik: { leistung_kw: 20, schallleistung_dba: 62 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  // — Speicher / Warmwasser (ww_speicher_typ trennt BWS von FWS) —
  {
    id: 'wt_bws_800',
    typ: 'speicher',
    hersteller: 'Wärmetechnik Nord',
    modell: 'BWS 800',
    artikelnummer: 'WT-PS-BWS800',
    titel: 'Brauchwasserspeicher-Paket 800 l (Wärmetechnik Nord)',
    beschreibung: 'Standard-BWS: 800 l mit Puffer, zentrale WW-Bereitung MFH.',
    technik: { volumen_l: 800 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'speicher' },
  },
  {
    id: 'st_bws_900',
    typ: 'speicher',
    hersteller: 'Systemtechnik Süd',
    modell: 'BWS 900',
    artikelnummer: 'ST-BWS-900',
    titel: 'Brauchwasserspeicher-Paket 900 l (Systemtechnik Süd)',
    beschreibung: 'Größere BWS-Variante, 900 l mit Puffer, für höhere Zapfleistungen.',
    technik: { volumen_l: 900 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'speicher' },
  },
  {
    id: 'wt_fws_40',
    typ: 'speicher',
    hersteller: 'Wärmetechnik Nord',
    modell: 'FWS 40',
    artikelnummer: 'WT-FWS-40',
    titel: 'Frischwasserstation 40 l/min (Wärmetechnik Nord)',
    beschreibung: 'Standard-FWS: hygienische Durchfluss-WW-Bereitung 40 l/min mit Puffer.',
    technik: { durchfluss_l_min: 40 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'fws' },
  },
  {
    id: 'st_fws_45',
    typ: 'speicher',
    hersteller: 'Systemtechnik Süd',
    modell: 'FWS 45',
    artikelnummer: 'ST-FWS-45',
    titel: 'Frischwasserstation 45 l/min (Systemtechnik Süd)',
    beschreibung: 'Leistungsstärkere FWS-Variante, 45 l/min, mit Puffer und erweitertem Regelungsset.',
    technik: { durchfluss_l_min: 45 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'fws' },
  },
  // — Regelung / Steuerung (Standard vs. KI-gestützt) —
  {
    id: 'regelung_std',
    typ: 'regelung',
    hersteller: 'Regeltechnik',
    modell: 'Steuergerät Standard',
    artikelnummer: 'RT-SC-STD',
    titel: 'Regelung Standard (Steuergerät)',
    beschreibung: 'Digitales Steuergerät für Betriebsführung, Optimierung und Datenintegration.',
    technik: { merkmal: 'Standard-Regelung' },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  {
    id: 'regelung_ki',
    typ: 'regelung',
    hersteller: 'Regeltechnik',
    modell: 'Steuergerät KI',
    artikelnummer: 'RT-SC-KI',
    titel: 'Regelung KI (adaptive Betriebsführung)',
    beschreibung: 'KI-gestütztes Steuergerät mit adaptiver Effizienzoptimierung und lernender Regellogik.',
    technik: { merkmal: 'KI-gestützt, adaptiv' },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  // — Monitoring (Basic Pflicht-Default vs. Plus-Bündel) —
  {
    id: 'mon_basic',
    typ: 'monitoring',
    hersteller: 'Haustechnik-Großhandel Süd',
    modell: 'Monitoring Basic',
    artikelnummer: 'GH-MON-DL1',
    titel: 'Monitoring Basic (Datenlogger, Fernablesung)',
    beschreibung: 'Verpflichtendes Betriebsmonitoring: Datenlogger und Fernablesung.',
    technik: { merkmal: 'Datenlogger + Fernablesung' },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  {
    id: 'mon_plus',
    typ: 'monitoring',
    hersteller: 'Haustechnik-Großhandel Süd',
    modell: 'Monitoring Plus',
    artikelnummer: 'GH-MON-PLUS',
    titel: 'Monitoring Plus (Basic + erweiterte Sensorik)',
    beschreibung: 'Basic zzgl. erweiterter Wärmemengen-, Temperatur- und Stromsensorik mit Reporting.',
    technik: { merkmal: 'erweiterte Sensorik + Reporting' },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
]
