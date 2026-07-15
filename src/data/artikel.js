// Datenebene: Artikelstamm (SK-102, CPQ-Demo). Demonstriert eine Katalog-/
// Preisdatenbank, wie sie in Configure-Price-Quote-Tools üblich ist:
// Artikel mit Artikelnummer, Kurz-/Langtext, Listenpreis und Rabattgruppe
// je Lieferant – gepflegt über (hier simulierte) DATANORM-Dateien von
// Herstellern und Großhändlern. Alle Lieferanten, Artikelnummern und Preise
// sind frei erfundene Beispieldaten (Hard Rule: keine realen Firmennamen).
//
// Preislogik (src/logic/artikelPreise.js):
//   Listenpreis − Rabatt (Rabattgruppe, sonst Generalrabatt) = EK
//   EK × (1 + vk_aufschlag_material) = VK (erscheint im LV)

export const LIEFERANTEN = [
  {
    id: 'wt_nord',
    name: 'Wärmetechnik Nord',
    typ: 'hersteller',
    hinweis: 'WP-/Speicher-Hersteller; liefert auch Serviceverträge.',
  },
  {
    id: 'gh_sued',
    name: 'Haustechnik-Großhandel Süd',
    typ: 'grosshaendler',
    hinweis: 'Großhändler für Zubehör, Schallschutz und MSR-Technik.',
  },
  {
    id: 'regeltechnik',
    name: 'Regeltechnik (Eigenfertigung)',
    typ: 'eigenfertigung',
    hinweis: 'Eigenprodukte zu internen Verrechnungspreisen; kein Lieferantenrabatt.',
  },
  {
    id: 'st_sued',
    name: 'Systemtechnik Süd',
    typ: 'hersteller',
    hinweis: 'Zweithersteller für WP-Module und Speicher (Komponenten-Layer).',
  },
]

// Rabattgruppen je Lieferant: individueller Gruppenrabatt, sonst Generalrabatt.
// Werte sind Beispiel-Konditionen, wie sie typischerweise mit Herstellern und
// Großhändlern verhandelt werden (im Admin editierbar).
export const RABATTGRUPPEN = {
  wt_nord: {
    generalrabatt: 0.12,
    gruppen: { WP: 0.30, SPEICHER: 0.28, SERVICE: 0.10 },
  },
  gh_sued: {
    generalrabatt: 0.15,
    gruppen: { SCHALL: 0.25, MSR: 0.20 },
  },
  regeltechnik: {
    generalrabatt: 0,
    gruppen: {},
  },
  st_sued: {
    generalrabatt: 0.10,
    gruppen: { WP: 0.25, SPEICHER: 0.20 },
  },
}

// Artikelstamm (Auszug). Felder orientieren sich an DATANORM-Artikelsätzen:
// Artikelnummer, Kurztext, Langtext, Listenpreis, Einheit, Rabattgruppe, Preisstand.
// `verwendung: 'opex'`-Artikel sind laufende Leistungen (Jahrespreise), alle
// anderen sind einmalige Hardware-/Leistungsartikel (CapEx).
export const ARTIKEL = [
  {
    artikelnummer: 'WT-WP20-R290',
    lieferant: 'wt_nord',
    rabattgruppe: 'WP',
    kurztext: 'Luft-Wasser-WP-Modul 20 kW (R290)',
    langtext: 'Luft-Wasser-Wärmepumpenmodul 20 kW thermisch, Kältemittel R290, kaskadierbar 1–6 Module, inkl. Hydraulik-Anschlussset und Regelungsanbindung.',
    listenpreis: 26600,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'WT-PS-BWS800',
    lieferant: 'wt_nord',
    rabattgruppe: 'SPEICHER',
    kurztext: 'Brauchwasserspeicher-Paket 800 l + Puffer',
    langtext: 'Brauchwasserspeicher 800 l mit Pufferspeicher, Sicherheitsgruppe und Anschlusszubehör für zentrale Warmwasserbereitung im MFH.',
    listenpreis: 35300,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'WT-FWS-40',
    lieferant: 'wt_nord',
    rabattgruppe: 'SPEICHER',
    kurztext: 'Frischwasserstation 40 l/min + Puffer',
    langtext: 'Frischwasserstation für hygienische Durchfluss-Warmwasserbereitung (bis 40 l/min) inkl. Pufferspeicher und Regelungsset.',
    listenpreis: 29400,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'WT-SV-BASIS',
    lieferant: 'wt_nord',
    rabattgruppe: 'SERVICE',
    kurztext: 'Wartungsvertrag Basis je WP-Modul (p.a.)',
    langtext: 'Jährlicher Wartungs- und Instandhaltungsvertrag je Wärmepumpenmodul: Inspektion, Wartung nach Herstellervorgabe, Verschleißteile-Grundumfang. Jahrespreis je Modul.',
    listenpreis: 1410,
    einheit: 'Stk/a',
    verwendung: 'opex',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'WT-SV-KOMFORT',
    lieferant: 'wt_nord',
    rabattgruppe: 'SERVICE',
    kurztext: 'Wartungsvertrag Komfort je WP-Modul (p.a.)',
    langtext: 'Jährlicher Komfort-Servicevertrag je Wärmepumpenmodul: Wartung, Instandhaltung, Störungsdienst mit Reaktionszeitzusage. Jahrespreis je Modul.',
    listenpreis: 2070,
    einheit: 'Stk/a',
    verwendung: 'opex',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'GH-SH-K2',
    lieferant: 'gh_sued',
    rabattgruppe: 'SCHALL',
    kurztext: 'Schallhaube Typ K2 für WP-Kaskade',
    langtext: 'Schallmindernde Haube für Außenmodule (Abschlag −8 dB), witterungsbeständig, inkl. Montagerahmen.',
    listenpreis: 9000,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'GH-SSZ-ABS',
    lieferant: 'gh_sued',
    rabattgruppe: 'SCHALL',
    kurztext: 'Absorptiver Schallschutzzaun (Elementbausatz)',
    langtext: 'Absorptiver Schallschutzzaun als Elementbausatz für Fundament-/Offenaufstellung bei erhöhter Schallsensibilität, inkl. Pfosten und Fundamentankern.',
    listenpreis: 13550,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'GH-MON-DL1',
    lieferant: 'gh_sued',
    rabattgruppe: 'MSR',
    kurztext: 'Monitoring-Set Basic (Datenlogger, Fernablesung)',
    langtext: 'Datenlogger-Set mit Fernablesungs-Gateway und Grundsensorik für das verpflichtende Betriebsmonitoring.',
    listenpreis: 5300,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'GH-MON-SEN5',
    lieferant: 'gh_sued',
    rabattgruppe: 'MSR',
    kurztext: 'Monitoring-Erweiterung Plus (Sensorik-Paket)',
    langtext: 'Erweiterte Sensorik (Wärmemengen-, Temperatur- und Stromsensoren) und Reporting-Bausteine für Monitoring Plus.',
    listenpreis: 12700,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'GH-MON-PLUS',
    lieferant: 'gh_sued',
    rabattgruppe: 'MSR',
    kurztext: 'Monitoring-Set Plus (Basic + erweiterte Sensorik)',
    langtext: 'Komplettpaket Monitoring Plus: Datenlogger-Set mit Fernablesung sowie erweiterte Wärmemengen-, Temperatur- und Stromsensorik inkl. Reporting-Bausteinen.',
    listenpreis: 18000,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'GH-MK-Z2R',
    lieferant: 'gh_sued',
    rabattgruppe: 'MSR',
    kurztext: 'Messkonzept-Zählerset (WP-Zähler, Fernablesung)',
    langtext: 'WP-Eigenstromzähler (Zweirichtungszähler, WP-Sondertarif-fähig) mit Fernablese-Anschluss und Übergabedokumentation.',
    listenpreis: 4770,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'RT-SC-STD',
    lieferant: 'regeltechnik',
    rabattgruppe: null,
    kurztext: 'Steuergerät Standard (Regelung)',
    langtext: 'Digitales Steuergerät für Betriebsführung, Optimierung und Datenintegration der Wärmepumpenanlage. Eigenprodukt zu internem Verrechnungspreis.',
    listenpreis: 10170,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'RT-SC-KI',
    lieferant: 'regeltechnik',
    rabattgruppe: null,
    kurztext: 'Steuergerät KI (KI-gestützte Regelung)',
    langtext: 'KI-gestütztes Steuergerät mit adaptiver Effizienzoptimierung und lernender Regellogik. Eigenprodukt zu internem Verrechnungspreis.',
    listenpreis: 15250,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'RT-MON-SRV',
    lieferant: 'regeltechnik',
    rabattgruppe: null,
    kurztext: 'Monitoring-Datendienst (p.a.)',
    langtext: 'Laufender Datendienst für Monitoring und Fernablesung im Betrieb (Hosting, Auswertung, Reporting). Jahrespreis. Eigenleistung.',
    listenpreis: 1270,
    einheit: 'pausch./a',
    verwendung: 'opex',
    preisstand: '2026-01-15',
  },
  // SK-103: Zweithersteller-Artikel für den Komponenten-Layer
  {
    artikelnummer: 'ST-WP20-BASIC',
    lieferant: 'st_sued',
    rabattgruppe: 'WP',
    kurztext: 'Luft-Wasser-WP-Modul 20 kW Basic (Systemtechnik Süd)',
    langtext: 'Luft-Wasser-Wärmepumpenmodul 20 kW thermisch, Kältemittel R290, kaskadierbar 1–6 Module.',
    listenpreis: 28000,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'ST-WP20-SILENT',
    lieferant: 'st_sued',
    rabattgruppe: 'WP',
    kurztext: 'Luft-Wasser-WP-Modul 20 kW Silent (Systemtechnik Süd)',
    langtext: 'Schalloptimiertes Luft-Wasser-Wärmepumpenmodul 20 kW (62 dBA Schallleistungspegel), Kältemittel R290, kaskadierbar.',
    listenpreis: 31500,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'ST-BWS-900',
    lieferant: 'st_sued',
    rabattgruppe: 'SPEICHER',
    kurztext: 'Brauchwasserspeicher-Paket 900 l (Systemtechnik Süd)',
    langtext: 'Brauchwasserspeicher 900 l mit Pufferspeicher, Sicherheitsgruppe und Anschlusszubehör für zentrale Warmwasserbereitung im MFH.',
    listenpreis: 38000,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
  {
    artikelnummer: 'ST-FWS-45',
    lieferant: 'st_sued',
    rabattgruppe: 'SPEICHER',
    kurztext: 'Frischwasserstation 45 l/min (Systemtechnik Süd)',
    langtext: 'Frischwasserstation für hygienische Durchfluss-Warmwasserbereitung (bis 45 l/min) inkl. Pufferspeicher und erweitertem Regelungsset.',
    listenpreis: 32000,
    einheit: 'Stk',
    preisstand: '2026-01-15',
  },
]

// Simulierter DATANORM-Import (SK-102). Der Admin-Upload parst KEINE echte
// Datei: er wendet dieses vordefinierte Update an und protokolliert es –
// genug, um den Prozess (Preise überschreiben, Artikel ergänzen, Konditionen
// aktualisieren) glaubwürdig zu demonstrieren.
export const DATANORM_UPDATE_DEMO = {
  quelle: 'DATANORM-v5-Datei (Simulation, kein echter Parser)',
  preisstand: '2026-07-01',
  // Listenpreis-Überschreibungen (typisch: Preisrunde des Herstellers, ~+3 %).
  preisaenderungen: {
    'WT-WP20-R290': 27400,
    'WT-PS-BWS800': 36400,
    'WT-FWS-40': 30300,
    'WT-SV-BASIS': 1450,
    'WT-SV-KOMFORT': 2130,
    'GH-MON-DL1': 5450,
  },
  // Neue Artikel aus der Datei (werden dem Stamm hinzugefügt).
  neueArtikel: [
    {
      artikelnummer: 'GH-SH-K3',
      lieferant: 'gh_sued',
      rabattgruppe: 'SCHALL',
      kurztext: 'Schallhaube Typ K3 (Nachfolgemodell)',
      langtext: 'Nachfolgemodell der Schallhaube K2 mit verbessertem Schallabschlag und Schnellmontagerahmen.',
      listenpreis: 9600,
      einheit: 'Stk',
      preisstand: '2026-07-01',
    },
    {
      artikelnummer: 'WT-PS-BWS1000',
      lieferant: 'wt_nord',
      rabattgruppe: 'SPEICHER',
      kurztext: 'Brauchwasserspeicher-Paket 1.000 l + Puffer',
      langtext: 'Größere Speichervariante für höhere Zapfleistungen, inkl. Puffer und Anschlusszubehör.',
      listenpreis: 41200,
      einheit: 'Stk',
      preisstand: '2026-07-01',
    },
  ],
  // Aktualisierte Konditionen (z. B. nachverhandelte Rabattgruppe).
  rabattgruppenAenderungen: {
    gh_sued: { gruppen: { MSR: 0.22 } },
  },
}
