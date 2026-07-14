// Datenebene: Komponenten-Stamm (SK-103, Phase 1).
// Typisierte Komponenten (hersteller/modell/technik/eignung) verknüpfen
// den DATANORM-Artikelstamm mit dem Katalog. Die Engine wählt die
// günstigste geeignete Komponente je Typ; Dropdowns in Ergebnis.jsx
// erlauben manuelle Auswahl.
//
// Alle Hersteller, Modelle und Artikelnummern sind FIKTIVE Demo-Daten.
// Alle WP-Module sind 20 kW (Kaskaden-Constraint: wp_modul_kw = 20 kW,
// Menge = @wp_module aus calc.js).

export const KOMPONENTEN_TYPEN = ['waermepumpe', 'speicher']

export const KOMPONENTEN = [
  // — Wärmepumpen (alle 20 kW, kaskadierbar) —
  {
    id: 'wt_aero_20',
    typ: 'waermepumpe',
    hersteller: 'Wärmetechnik Nord (fiktiver Hersteller)',
    modell: 'AeroLine 20',
    artikelnummer: 'WT-WP20-R290',
    titel: 'Luft-Wasser-WP-Modul 20 kW (Wärmetechnik Nord)',
    beschreibung: 'Demo-Standard: günstigstes 20-kW-Modul, Kältemittel R290, kaskadierbar. Fiktiver Hersteller.',
    technik: { leistung_kw: 20, schallleistung_dba: 65 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  {
    id: 'dm_basic_20',
    typ: 'waermepumpe',
    hersteller: 'Dreammaker (fiktiver Hersteller)',
    modell: 'DM-WP20-BASIC',
    artikelnummer: 'DM-WP20-BASIC',
    titel: 'Luft-Wasser-WP-Modul 20 kW Basic (Dreammaker)',
    beschreibung: 'Mittelklasse-Modul, 20 kW, R290, Kaskadeneignung. Fiktiver Hersteller.',
    technik: { leistung_kw: 20, schallleistung_dba: 66 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  {
    id: 'dm_silent_20',
    typ: 'waermepumpe',
    hersteller: 'Dreammaker (fiktiver Hersteller)',
    modell: 'DM-WP20-SILENT',
    artikelnummer: 'DM-WP20-SILENT',
    titel: 'Luft-Wasser-WP-Modul 20 kW Silent (Dreammaker)',
    beschreibung: 'Schalloptimiertes 20-kW-Modul (62 dBA), geeignet für schallsensible Lagen. Fiktiver Hersteller.',
    technik: { leistung_kw: 20, schallleistung_dba: 62 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: null },
  },
  // — Speicher / Warmwasser (ww_speicher_typ trennt BWS von FWS) —
  {
    id: 'wt_bws_800',
    typ: 'speicher',
    hersteller: 'Wärmetechnik Nord (fiktiver Hersteller)',
    modell: 'BWS 800',
    artikelnummer: 'WT-PS-BWS800',
    titel: 'Brauchwasserspeicher-Paket 800 l (Wärmetechnik Nord)',
    beschreibung: 'Demo-Standard BWS: 800 l mit Puffer, zentrale WW-Bereitung MFH. Fiktiver Hersteller.',
    technik: { volumen_l: 800 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'speicher' },
  },
  {
    id: 'dm_bws_900',
    typ: 'speicher',
    hersteller: 'Dreammaker (fiktiver Hersteller)',
    modell: 'DM-BWS-900',
    artikelnummer: 'DM-BWS-900',
    titel: 'Brauchwasserspeicher-Paket 900 l (Dreammaker)',
    beschreibung: 'Größere BWS-Variante, 900 l mit Puffer, für höhere Zapfleistungen. Fiktiver Hersteller.',
    technik: { volumen_l: 900 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'speicher' },
  },
  {
    id: 'wt_fws_40',
    typ: 'speicher',
    hersteller: 'Wärmetechnik Nord (fiktiver Hersteller)',
    modell: 'FWS 40',
    artikelnummer: 'WT-FWS-40',
    titel: 'Frischwasserstation 40 l/min (Wärmetechnik Nord)',
    beschreibung: 'Demo-Standard FWS: hygienische Durchfluss-WW-Bereitung 40 l/min mit Puffer. Fiktiver Hersteller.',
    technik: { durchfluss_l_min: 40 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'fws' },
  },
  {
    id: 'dm_fws_45',
    typ: 'speicher',
    hersteller: 'Dreammaker (fiktiver Hersteller)',
    modell: 'DM-FWS-45',
    artikelnummer: 'DM-FWS-45',
    titel: 'Frischwasserstation 45 l/min (Dreammaker)',
    beschreibung: 'Leistungsstärkere FWS-Variante, 45 l/min, mit Puffer und erweitertem Regelungsset. Fiktiver Hersteller.',
    technik: { durchfluss_l_min: 45 },
    eignung: { heizlast_min_kw: null, heizlast_max_kw: null, technologiepfade: null, aufstellvarianten: null, ww_speicher_typ: 'fws' },
  },
]
