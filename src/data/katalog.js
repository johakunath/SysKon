// Datenebene 3/3: Komponentenkatalog (HANDOVER §2.1/§2.3).
// 6 modulare Pakettypen + Basispakete. Jede LV-Position:
//   menge      Zahl oder '@feld' (Zwischenergebnis, z. B. '@wp_module')
//   einheit    'Stk' | 'pausch.' | ...
//   kosten     { typ:'fix'|'je_modul'|'prozent_lv', annahme:'<key aus annahmen.js>' }
//              je_modul: Annahme (€/kW) × wp_modul_kw × Menge
//              prozent_lv: % der Brutto-LV-Kosten p.a. (Opex)
//   foerder    Schlüssel des Förderanteils in annahmen.js
//   tag        'capex' | 'opex'  (bereitet Stufe 2 Grundpreis/Arbeitspreis vor)
//   bedingung  optionale Bedingung (DSL wie regeln.js); ohne = immer dabei.
//              Spezialfeld 'require_<modul>' = true, wenn eine Regel das Modul erzwingt.
// Pakete mit `varianten` wählen die Variante über das Eingabefeld `variantenFeld`.

export const KATALOG = [
  {
    id: 'wp', pakettyp: 'Wärmepumpe', gruppe: 'Wärmepumpenpaket',
    positionen: [
      { id: 'wp_modul', text: 'Luft-Wasser-WP-Modul 20 kW (herstellerneutral)',
        menge: '@wp_module', einheit: 'Stk',
        kosten: { typ: 'je_modul', annahme: 'k_wp_je_kw' }, foerder: 'f_wp', tag: 'capex',
        begruendung: 'Kaskadenauslegung: WP-Leistung ≈ Leistungsanteil × Heizlast, gerundet auf 20-kW-Module (1–6).',
        kunde: {
          titel: 'Luft-Wasser-Wärmepumpen-Kaskade',
          hersteller: 'herstellerneutral',
          produkt: 'WP-Modul, Produkt wird später festgelegt',
          leistungsumfang: 'Außengeräte als modularer Wärmepumpen-Verbund für den ermittelten Lösungskorridor.',
        } },
    ],
  },
  {
    id: 'hybrid', pakettyp: 'Hybrid-Einbindung', gruppe: 'Hybrid-Einbindung',
    bedingung: { feld: 'technologiepfad', op: '=', wert: 'hybrid' },
    positionen: [
      { id: 'hybrid_einbindung', text: 'Hydraulische und regelungstechnische Einbindung Bestandskessel',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_hybrid' }, foerder: 'f_hybrid', tag: 'capex',
        begruendung: 'Hybridpfad: WP speist Puffer, Bestandskessel leistet nach (Nachheizlogik).',
        kunde: {
          titel: 'Hybrid-Einbindung',
          hersteller: 'systemseitig',
          produkt: 'Hydraulische und regelungstechnische Einbindung',
          leistungsumfang: 'Einbindung der Wärmepumpe in das bestehende Heizsystem mit Nachheizlogik über den Bestandskessel.',
        } },
      { id: 'fossil_bestand', text: 'Weiternutzung Gas-Bestandskessel (fossile Einheit)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: null }, foerder: 'f_fossil', tag: 'capex', pruefpflichtig: true,
        begruendung: 'Bestand bleibt – 0 € im LV, aber nicht förderfähig (R02) und prüfpflichtig (R01).',
        kunde: {
          titel: 'Weiterbetrieb Bestandskessel',
          hersteller: 'Bestand',
          produkt: 'Vorhandener Gas-Bestandskessel',
          leistungsumfang: 'Nutzung als Spitzenlast- und Backup-Komponente, vorbehaltlich interner Bestandsprüfung.',
        } },
    ],
  },
  {
    id: 'hydraulik', pakettyp: 'Hydraulik', gruppe: 'Hydraulik',
    positionen: [
      { id: 'hydraulik_basis', text: 'Hydraulikpaket (max. 2 Heizkreise, Pumpengruppen, Abgleich, Regelung)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_hydraulik' }, foerder: 'f_hydraulik', tag: 'capex',
        begruendung: 'Pflichtbaustein: Einbindung in den vorhandenen Heizkreis (MVP ≤ 2 Heizkreise).',
        kunde: {
          titel: 'Hydraulikpaket',
          hersteller: 'systemseitig',
          produkt: 'Pumpengruppen, Regelung und hydraulische Einbindung',
          leistungsumfang: 'Einbindung in bis zu zwei Heizkreise inklusive Regelung und hydraulischem Abgleich im Demo-Scope.',
        } },
    ],
  },
  {
    id: 'speicher_ww', pakettyp: 'Hydraulik', gruppe: 'Speicher / Warmwasser',
    bedingung: { feld: 'require_speicher_ww', op: '=', wert: true },
    positionen: [
      { id: 'speicher_ww_modul', text: 'Speicher-/Warmwassermodul (Puffer + WW-Bereitung)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_speicher_ww' }, foerder: 'f_speicher', tag: 'capex',
        begruendung: 'Durch Regel erzwungen (R03: zentrale Warmwasserbereitung).',
        kunde: {
          titel: 'Speicher- und Warmwassermodul',
          hersteller: 'herstellerneutral',
          produkt: 'Puffer- und Warmwasserkomponenten',
          leistungsumfang: 'Puffer- und Warmwasserintegration für zentrale Warmwasserbereitung im betrachteten Scope.',
        } },
    ],
  },
  {
    id: 'aufstellung', pakettyp: 'Aufstellung', gruppe: 'Aufstellung',
    variantenFeld: 'aufstellvariante',
    varianten: [
      { wert: 'fundament', name: 'Standard-Fundament',
        positionen: [
          { id: 'aufst_fundament', text: 'Fundament, Anbindung Heizraum, Witterungsschutz',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_fundament' }, foerder: 'f_aufstellung', tag: 'capex',
            begruendung: 'Niedrigster Zusatz-CapEx, hohe Heizraumabhängigkeit.',
            kunde: {
              titel: 'Standard-Fundament',
              hersteller: 'systemseitig',
              produkt: 'Fundament und Außenaufstellung',
              leistungsumfang: 'Außenaufstellung der Wärmepumpenmodule mit Fundament, Anbindung und Witterungsschutz.',
            } },
        ]},
      { wert: 'einhausung', name: 'Schutz-/Schall-Einhausung',
        positionen: [
          { id: 'aufst_einhausung', text: 'Einhausung inkl. Schallwand und Vandalismusschutz',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_einhausung' }, foerder: 'f_aufstellung', tag: 'capex',
            begruendung: 'Mittlerer CapEx, adressiert Schall- und Vandalismusrisiken (−12 dB Demo).',
            kunde: {
              titel: 'Schutz- und Schall-Einhausung',
              hersteller: 'systemseitig',
              produkt: 'Einhausung für Außenaufstellung',
              leistungsumfang: 'Einhausung zur wettergeschützten Aufstellung mit zusätzlicher Schall- und Objektschutzwirkung.',
            } },
        ]},
      { wert: 'kompakt_container', name: 'Kompakt-Container',
        positionen: [
          { id: 'aufst_kompakt', text: 'Kompakt-Container vorkonfektioniert inkl. Stellfläche',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_kompakt_container' }, foerder: 'f_aufstellung', tag: 'capex',
            begruendung: 'Hoher CapEx, entlastet Heizraum, hohe Vorkonfektionierung (−15 dB Demo).',
            kunde: {
              titel: 'Kompakt-Container',
              hersteller: 'systemseitig',
              produkt: 'Vorkonfektionierte Technikcontainer-Lösung',
              leistungsumfang: 'Kompakter Technikcontainer zur Entlastung des Heizraums und Bündelung wesentlicher Anlagenkomponenten.',
            } },
        ]},
      { wert: 'vollcontainer', name: 'Vollcontainer',
        positionen: [
          { id: 'aufst_voll', text: 'Vollcontainer (begehbar, Technik weitgehend integriert)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_vollcontainer' }, foerder: 'f_aufstellung', tag: 'capex',
            begruendung: 'Premium-Variante: maximale Standardisierung, minimale Heizraumabhängigkeit (−15 dB Demo).',
            kunde: {
              titel: 'Vollcontainer',
              hersteller: 'systemseitig',
              produkt: 'Begehbarer Technikcontainer',
              leistungsumfang: 'Begehbare Containerlösung mit weitgehend integrierter Technik und reduzierter Heizraumabhängigkeit.',
            } },
        ]},
    ],
  },
  {
    id: 'schall', pakettyp: 'Aufstellung', gruppe: 'Schallmaßnahmen',
    bedingung: { und: [
      { feld: 'schallhaube', op: '=', wert: 'ja' },
      { feld: 'aufstellvariante', op: '=', wert: 'fundament' },
    ]},
    positionen: [
      { id: 'schallhaube_pos', text: 'Standard-Schallhaube für WP-Kaskade',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_schallhaube' }, foerder: 'f_aufstellung', tag: 'capex',
        begruendung: 'Schallminderung −8 dB (Demo) bei Fundamentaufstellung.',
        kunde: {
          titel: 'Schallhaube',
          hersteller: 'herstellerneutral',
          produkt: 'Schallmindernde Haube für Außenmodule',
          leistungsumfang: 'Zusätzliche Schallmaßnahme für die Fundamentaufstellung im aktuellen Lösungskorridor.',
        } },
    ],
  },
  {
    id: 'elektro', pakettyp: 'Basis', gruppe: 'Elektro / Netzanschluss',
    positionen: [
      { id: 'elektro_netz', text: 'Elektro-/Netzanschlusspaket (Zuleitung, Zähler, WP-Tarif)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_elektro' }, foerder: 'f_elektro', tag: 'capex',
        begruendung: 'Pflichtbaustein; bei unbekanntem Netzanschluss prüfpflichtig (R08).',
        kunde: {
          titel: 'Elektro- und Netzanschlusspaket',
          hersteller: 'systemseitig',
          produkt: 'Zuleitung, Zähler- und Anschlussvorbereitung',
          leistungsumfang: 'Elektroanbindung der Wärmepumpe inklusive Vorbereitung des Mess- und Anschlusskonzepts.',
        } },
    ],
  },
  {
    id: 'monitoring', pakettyp: 'Monitoring', gruppe: 'Monitoring',
    variantenFeld: 'monitoring_variante',
    varianten: [
      { wert: 'basic', name: 'Monitoring Basic',
        positionen: [
          { id: 'mon_basic', text: 'Monitoring Basic (verpflichtend): Zähler, Datenlogger, Fernablesung',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_monitoring_basic' }, foerder: 'f_monitoring', tag: 'capex',
            begruendung: 'Monitoring Basic ist im Contracting-Modell verpflichtend.',
            kunde: {
              titel: 'Monitoring Basic',
              hersteller: 'systemseitig',
              produkt: 'Zähler, Datenlogger und Fernablesung',
              leistungsumfang: 'Grundlegende Mess- und Fernablesestruktur für Betrieb und spätere Auswertung.',
            } },
        ]},
      { wert: 'plus', name: 'Monitoring Plus',
        positionen: [
          { id: 'mon_basic2', text: 'Monitoring Basic (verpflichtend): Zähler, Datenlogger, Fernablesung',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_monitoring_basic' }, foerder: 'f_monitoring', tag: 'capex',
            begruendung: 'Monitoring Basic ist im Contracting-Modell verpflichtend.',
            kunde: {
              titel: 'Monitoring Basic',
              hersteller: 'systemseitig',
              produkt: 'Zähler, Datenlogger und Fernablesung',
              leistungsumfang: 'Grundlegende Mess- und Fernablesestruktur für Betrieb und spätere Auswertung.',
            } },
          { id: 'mon_plus', text: 'Monitoring Plus (erweiterte Sensorik, Effizienz-Reporting)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_monitoring_plus' }, foerder: 'f_monitoring', tag: 'capex',
            begruendung: 'Optionale Erweiterung für Effizienznachweis und Betriebsführung.',
            kunde: {
              titel: 'Monitoring Plus',
              hersteller: 'systemseitig',
              produkt: 'Erweiterte Sensorik und Effizienz-Reporting',
              leistungsumfang: 'Erweiterte Betriebsdaten und Reporting-Bausteine für detailliertere Auswertung.',
            } },
        ]},
    ],
  },
  {
    id: 'installation', pakettyp: 'Basis', gruppe: 'Installation / Inbetriebnahme',
    positionen: [
      { id: 'install_ibn', text: 'Installation, Montage und Inbetriebnahme',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_install' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Pflichtbaustein: Montage der Gesamtanlage inkl. IBN-Protokoll.',
        kunde: {
          titel: 'Installation und Inbetriebnahme',
          hersteller: 'Serviceleistung',
          produkt: 'Montage- und Inbetriebnahmeleistung',
          leistungsumfang: 'Montage der Systemkomponenten und Inbetriebnahme im Rahmen des später freizugebenden Projektumfangs.',
        } },
    ],
  },
  {
    id: 'umfeld', pakettyp: 'Basis', gruppe: 'Umfeldmaßnahmen',
    positionen: [
      { id: 'umfeld_pausch', text: 'Umfeldmaßnahmen (Trasse, Durchbrüche, Wiederherstellung)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_umfeld' }, foerder: 'f_umfeld', tag: 'capex',
        begruendung: 'Nur förderfähig in Verbindung mit dem erneuerbaren Teil (Demo: 80 %).',
        kunde: {
          titel: 'Umfeldmaßnahmen',
          hersteller: 'Serviceleistung',
          produkt: 'Trasse, Durchbrüche und Wiederherstellung',
          leistungsumfang: 'Begleitende Arbeiten für Leitungsführung, Durchbrüche und Wiederherstellung im Demo-Scope.',
        } },
    ],
  },
  {
    id: 'service', pakettyp: 'Service', gruppe: 'Service / Betrieb (p.a.)',
    variantenFeld: 'service_variante',
    varianten: [
      { wert: 'basis', name: 'Service Basis',
        positionen: [
          { id: 'om_basis', text: 'Wartung & Instandhaltung (O&M)',
            menge: 1, einheit: '€/a',
            kosten: { typ: 'prozent_lv', annahme: 'om_prozent_pa' }, foerder: 'f_monitoring', tag: 'opex',
            begruendung: 'O&M als % der Brutto-LV-Kosten p.a. (Demo: Service Basis).',
            kunde: {
              titel: 'Service Basis',
              hersteller: 'Serviceleistung',
              produkt: 'Wartung und Instandhaltung',
              leistungsumfang: 'Grundlegende Wartungs- und Instandhaltungsleistung für den betrachteten Betriebskorridor.',
            } },
        ]},
      { wert: 'komfort', name: 'Service Komfort',
        positionen: [
          { id: 'om_komfort', text: 'Wartung, Instandhaltung & Störungsdienst (O&M Komfort)',
            menge: 1, einheit: '€/a',
            kosten: { typ: 'prozent_lv', annahme: 'om_prozent_komfort' }, foerder: 'f_monitoring', tag: 'opex',
            begruendung: 'Erweiterter Service inkl. Störungsdienst (Demo-Zuschlag).',
            kunde: {
              titel: 'Service Komfort',
              hersteller: 'Serviceleistung',
              produkt: 'Wartung, Instandhaltung und Störungsdienst',
              leistungsumfang: 'Erweiterter Serviceumfang mit zusätzlichem Störungsdienst im Betriebskorridor.',
            } },
        ]},
    ],
  },
  {
    id: 'monitoring_pa', pakettyp: 'Monitoring', gruppe: 'Service / Betrieb (p.a.)',
    positionen: [
      { id: 'mon_pa', text: 'Monitoring-Betrieb (Datendienst)',
        menge: 1, einheit: '€/a',
        kosten: { typ: 'fix', annahme: 'monitoring_pa' }, foerder: 'f_monitoring', tag: 'opex',
        begruendung: 'Laufender Monitoring-Dienst (verpflichtend).',
        kunde: {
          titel: 'Monitoring-Betrieb',
          hersteller: 'Serviceleistung',
          produkt: 'Datendienst und laufende Fernablesung',
          leistungsumfang: 'Laufender Datendienst für Monitoring und Fernablesung im Betrieb.',
        } },
    ],
  },
]

// Anzeige-Reihenfolge der LV-Gruppen (HANDOVER §15 B)
export const LV_GRUPPEN = [
  'Wärmepumpenpaket', 'Hybrid-Einbindung', 'Hydraulik', 'Speicher / Warmwasser',
  'Aufstellung', 'Schallmaßnahmen', 'Elektro / Netzanschluss', 'Monitoring',
  'Installation / Inbetriebnahme', 'Umfeldmaßnahmen',
]
