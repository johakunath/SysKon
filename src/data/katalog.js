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
      { id: 'wp_modul', text: 'Luft-Wasser-WP-Modul 20 kW (Demo-Referenz: Buderus/Dreammaker)',
        menge: '@wp_module', einheit: 'Stk',
        kosten: { typ: 'je_modul', annahme: 'k_wp_je_kw' }, foerder: 'f_wp', tag: 'capex',
        begruendung: 'Kaskadenauslegung: WP-Leistung ≈ Leistungsanteil × Heizlast, gerundet auf 20-kW-Module (1–6).',
        kunde: {
          titel: 'Luft-Wasser-Wärmepumpen-Kaskade',
          hersteller: 'Buderus / Dreammaker (Demo-Referenz)',
          produkt: 'Logatherm WLW / Luft-Wasser-WP-Modul – finales Produkt im Angebot',
          leistungsumfang: 'Außengeräte als modularer Wärmepumpen-Verbund für den ermittelten Lösungskorridor. Kältemittel R290, JAZ laut Betriebsannahme. Alternativhersteller nach technischer Prüfung möglich.',
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
        begruendung: 'Pflichtbaustein: Einbindung in den vorhandenen Heizkreis (Standard ≤ 2 Heizkreise).',
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
    variantenFeld: 'ww_speicher_typ',
    varianten: [
      { wert: 'speicher', name: 'Brauchwasserspeicher',
        positionen: [
          { id: 'speicher_ww_modul', text: 'Brauchwasserspeicher + Puffer (zentrale WW-Bereitung)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_speicher_ww' }, foerder: 'f_speicher', tag: 'capex',
            begruendung: 'Durch Regel erzwungen (R03: zentrale WW-Bereitung). Klassische Speicherlösung.',
            kunde: {
              titel: 'Brauchwasserspeicher',
              hersteller: 'herstellerneutral',
              produkt: 'Puffer- und Brauchwasserspeicher',
              leistungsumfang: 'Zentrale Warmwasserbereitung und Pufferung über Brauchwasserspeicher im betrachteten Scope.',
            } },
        ]},
      { wert: 'fws', name: 'Frischwasserstation',
        positionen: [
          { id: 'fws_modul', text: 'Frischwasserstation + Puffer (hygienische Durchfluss-WW)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_fws' }, foerder: 'f_speicher', tag: 'capex',
            begruendung: 'Frischwasserstation für hygienisch einwandfreie WW-Bereitung ohne stehende Speicherinhalte.',
            kunde: {
              titel: 'Frischwasserstation',
              hersteller: 'herstellerneutral',
              produkt: 'Frischwasserstation und Pufferspeicher',
              leistungsumfang: 'Zentrale Warmwasserbereitung im Durchflussbetrieb mit Puffer; hygienisch geprüfte Lösung ohne stehenden Warmwasserinhalt.',
            } },
        ]},
    ],
  },
  {
    id: 'aufstellung', pakettyp: 'Aufstellung', gruppe: 'Aufstellung',
    variantenFeld: 'aufstellvariante',
    varianten: [
      { wert: 'aussen_offen', name: 'Außenaufstellung offen',
        positionen: [
          { id: 'aufst_aussen_offen', text: 'Außenaufstellung offen (Fundament, kein Wetterschutz)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_aussen_offen' }, foerder: 'f_aufstellung', tag: 'capex',
            begruendung: 'Günstigste Variante ohne Wetterschutz oder Einhausung; nur für geeignete Mikrolage.',
            kunde: {
              titel: 'Außenaufstellung offen',
              hersteller: 'systemseitig',
              produkt: 'Außenaufstellung ohne Einhausung',
              leistungsumfang: 'Einfache Außenaufstellung auf Fundament ohne Einhausung oder Wetterschutz. Nur für standortspezifisch geeignete Mikrolage (Schall, Witterung, Sichtschutz vorab klären).',
            } },
        ]},
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
          { id: 'aufst_einhausung', text: 'Einhausung inkl. Schallschutzwand und Vandalismusschutz',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_einhausung' }, foerder: 'f_aufstellung', tag: 'capex',
            begruendung: 'Mittlerer CapEx, adressiert Schall- und Vandalismusrisiken (−12 dB Demo). Schallschutzwand: Demo-Referenz Rockwool.',
            kunde: {
              titel: 'Schutz- und Schall-Einhausung',
              hersteller: 'systemseitig',
              produkt: 'Einhausung mit Schallschutzwand (Demo-Referenz: Rockwool)',
              leistungsumfang: 'Einhausung zur wettergeschützten Aufstellung mit Schall- und Objektschutzwirkung (Demo-Abschlag −12 dB). Schallschutzwand auf Basis absorptiver Elemente (Demo-Referenz: Rockwool).',
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
      { feld: 'aufstellvariante', op: 'in', wert: ['fundament', 'aussen_offen'] },
    ]},
    positionen: [
      { id: 'schallhaube_pos', text: 'Standard-Schallhaube für WP-Kaskade',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_schallhaube' }, foerder: 'f_aufstellung', tag: 'capex',
        begruendung: 'Schallminderung −8 dB (Demo) bei offener Außenaufstellung oder Fundament.',
        kunde: {
          titel: 'Schallhaube',
          hersteller: 'herstellerneutral',
          produkt: 'Schallmindernde Haube für Außenmodule',
          leistungsumfang: 'Zusätzliche Schallmaßnahme (Demo-Abschlag −8 dB) im aktuellen Lösungskorridor.',
        } },
    ],
  },
  {
    id: 'schall_rockwool', pakettyp: 'Aufstellung', gruppe: 'Schallmaßnahmen',
    bedingung: { und: [
      { feld: 'schallsensibilitaet', op: '=', wert: 'hoch' },
      { feld: 'aufstellvariante', op: 'in', wert: ['aussen_offen', 'fundament'] },
    ]},
    positionen: [
      { id: 'schallschutzzaun_pos', text: 'Schallschutzzaun (Rockwool – Demo-Referenz)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_schallschutzzaun' }, foerder: 'f_aufstellung', tag: 'capex',
        begruendung: 'Absorptiver Schallschutzzaun für Fundament-/Offenvarianten bei hoher Schallsensibilität; Rockwool als Demo-Referenzprodukt (SK-79).',
        kunde: {
          titel: 'Schallschutzzaun',
          hersteller: 'Rockwool (Demo-Referenz)',
          produkt: 'Absorptiver Schallschutzzaun für Außenaufstellung',
          leistungsumfang: 'Absorptiver Schallschutzzaun (Demo-Referenz: Rockwool) als ergänzende Maßnahme zur Fundament- oder offenen Außenaufstellung bei erhöhter Schallsensibilität.',
        } },
    ],
  },
  {
    id: 'schall_atec', pakettyp: 'Aufstellung', gruppe: 'Schallmaßnahmen',
    bedingung: { feld: 'schallsensibilitaet', op: '=', wert: 'hoch' },
    positionen: [
      { id: 'atec_schall_pos', text: 'ATEC-Schallberechnungsservice (Demo-Pauschale)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_atec_schallberechnung' }, foerder: 'f_aufstellung', tag: 'capex',
        begruendung: 'Fachplanerische Schallberechnung und Schutzkonzept (ATEC als Demo-Referenzanbieter). Löst die Demo-Vorprüfung durch rechtsverbindlichen Nachweis ab (SK-79).',
        kunde: {
          titel: 'Schallberechnung & Schutzkonzept',
          hersteller: 'ATEC (Demo-Referenz)',
          produkt: 'Fachplanerische Schallberechnung',
          leistungsumfang: 'Schallberechnung und Schutzkonzept durch Fachplaner (Demo-Referenz: ATEC). Ablöst die Demo-Vorprüfung durch rechtsverbindlichen Nachweis für den Standort.',
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
    id: 'messkonzept', pakettyp: 'Basis', gruppe: 'Messkonzept',
    positionen: [
      { id: 'messkonzept_basis',
        text: 'Messkonzept Basis (WP-Eigenstromzähler, Fernablesung, Übergabedokumentation)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_messkonzept_basis' },
        foerder: 'f_messkonzept', tag: 'capex',
        begruendung: 'Pflichtbaustein Contracting: separater WP-Zähler für JAZ-Messung und WP-Sondertarif-Abrechnung.',
        kunde: {
          titel: 'Messkonzept & Zählerinfrastruktur',
          hersteller: 'systemseitig',
          produkt: 'WP-Eigenstromzähler und Fernablesung',
          leistungsumfang: 'WP-eigener Stromzähler (Zweirichtungszähler / WP-Sondertarif), Fernablesung-Anschluss und Übergabedokumentation. Pflichtbaustein für das Contracting-Modell.',
        } },
    ],
  },
  {
    id: 'monitoring', pakettyp: 'Monitoring', gruppe: 'Monitoring',
    variantenFeld: 'monitoring_variante',
    varianten: [
      { wert: 'basic', name: 'Monitoring Basic',
        positionen: [
          { id: 'mon_basic', text: 'Monitoring Basic (verpflichtend): Datenlogger, Fernablesung-Betrieb',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_monitoring_basic' }, foerder: 'f_monitoring', tag: 'capex',
            begruendung: 'Monitoring Basic ist im Contracting-Modell verpflichtend.',
            kunde: {
              titel: 'Monitoring Basic',
              hersteller: 'systemseitig',
              produkt: 'Datenlogger und Fernablesung-Betrieb',
              leistungsumfang: 'Betriebsmonitoring aufbauend auf Messkonzept Basis: Datenlogger, Fernablesung-Betrieb und Reporting-Infrastruktur.',
            } },
        ]},
      { wert: 'plus', name: 'Monitoring Plus',
        positionen: [
          { id: 'mon_basic2', text: 'Monitoring Basic (verpflichtend): Datenlogger, Fernablesung-Betrieb',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_monitoring_basic' }, foerder: 'f_monitoring', tag: 'capex',
            begruendung: 'Monitoring Basic ist im Contracting-Modell verpflichtend.',
            kunde: {
              titel: 'Monitoring Basic',
              hersteller: 'systemseitig',
              produkt: 'Datenlogger und Fernablesung-Betrieb',
              leistungsumfang: 'Betriebsmonitoring aufbauend auf Messkonzept Basis: Datenlogger, Fernablesung-Betrieb und Reporting-Infrastruktur.',
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
    id: 'smartcontrol', pakettyp: 'Steuerung', gruppe: 'Steuerung & Monitoring',
    variantenFeld: 'smartcontrol_variante',
    varianten: [
      { wert: 'standard', name: 'SmartControl Standard',
        positionen: [
          { id: 'smartcontrol_std', text: 'SmartZero SmartControl (Steuergerät, Standard)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_smartcontrol' }, foerder: 'f_smartcontrol', tag: 'capex',
            begruendung: 'Digitales Steuergerät für Wärmepumpenanlage im Contracting-Modell (Demo-Referenz: SmartZero).',
            kunde: {
              titel: 'SmartControl',
              hersteller: 'SmartZero (Demo-Referenz)',
              produkt: 'Digitales Steuergerät',
              leistungsumfang: 'Digitales Steuergerät für Betriebsführung, Optimierung und Datenintegration der Wärmepumpenanlage im Contracting-Modell.',
            } },
        ]},
      { wert: 'ki', name: 'SmartControl KI',
        positionen: [
          { id: 'smartcontrol_ki', text: 'SmartZero SmartControl KI (KI-gestützte Regelung)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'fix', annahme: 'k_smartcontrol_ki' }, foerder: 'f_smartcontrol', tag: 'capex',
            begruendung: 'KI-gestützte Betriebsführung für adaptive Effizienzoptimierung (Demo-Aufpreis gegenüber Standard).',
            kunde: {
              titel: 'SmartControl KI',
              hersteller: 'SmartZero (Demo-Referenz)',
              produkt: 'KI-gestütztes Steuergerät',
              leistungsumfang: 'KI-gestützte Betriebsführung und adaptive Effizienzoptimierung. Lernende Regellogik für den Betriebsoptimierungskorridor (Demo).',
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
            bereich: 'wartung_instandsetzung',
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
            bereich: 'wartung_instandsetzung',
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
        bereich: 'betriebsfuehrung',
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
  'Aufstellung', 'Schallmaßnahmen', 'Elektro / Netzanschluss', 'Messkonzept', 'Monitoring',
  'Steuerung & Monitoring',
  'Installation / Inbetriebnahme', 'Umfeldmaßnahmen',
]
