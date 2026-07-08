// Datenebene 3/3: Komponentenkatalog (HANDOVER §2.1/§2.3).
// 6 modulare Pakettypen + Basispakete. Jede LV-Position:
//   menge      Zahl oder '@feld' (Zwischenergebnis, z. B. '@wp_module')
//   einheit    'Stk' | 'pausch.' | ...
//   kosten     { typ:'fix'|'je_modul'|'prozent_lv', annahme:'<key aus annahmen.js>' }
//              | { typ:'artikel', artikel:'<artikelnummer aus artikel.js>' } (SK-102):
//                einzel = VK des Artikels (Listenpreis − Rabattgruppe = EK, × Aufschlag)
//              | { typ:'anfahrt' } (SK-102): einzel = €/km (km-Satz + Stundensatz ÷
//                Ø-Geschwindigkeit), Menge über '@anfahrt_km_gesamt'
//              je_modul: Annahme (€/kW) × wp_modul_kw × Menge
//              prozent_lv: % der Brutto-LV-Kosten p.a. (Opex)
//   foerder    Schlüssel des Förderanteils in annahmen.js
//   tag        'capex' | 'opex'  (bereitet Stufe 2 Grundpreis/Arbeitspreis vor)
//   bedingung  optionale Bedingung (DSL wie regeln.js) auf Paket- ODER Positionsebene;
//              ohne = immer dabei.
//              Spezialfeld 'require_<modul>' = true, wenn eine Regel das Modul erzwingt.
// Pakete mit `varianten` wählen die Variante über das Eingabefeld `variantenFeld`.

export const KATALOG = [
  {
    id: 'wp', pakettyp: 'Wärmepumpe', gruppe: 'Wärmepumpenpaket',
    positionen: [
      { id: 'wp_modul', text: 'Luft-Wasser-WP-Modul 20 kW (Demo-Referenz: Buderus/Dreammaker)',
        menge: '@wp_module', einheit: 'Stk',
        kosten: { typ: 'artikel', artikel: 'WT-WP20-R290' }, foerder: 'f_wp', tag: 'capex',
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
            kosten: { typ: 'artikel', artikel: 'WT-PS-BWS800' }, foerder: 'f_speicher', tag: 'capex',
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
            kosten: { typ: 'artikel', artikel: 'WT-FWS-40' }, foerder: 'f_speicher', tag: 'capex',
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
        kosten: { typ: 'artikel', artikel: 'GH-SH-K2' }, foerder: 'f_aufstellung', tag: 'capex',
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
        kosten: { typ: 'artikel', artikel: 'GH-SSZ-ABS' }, foerder: 'f_aufstellung', tag: 'capex',
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
        kosten: { typ: 'artikel', artikel: 'GH-MK-Z2R' },
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
            kosten: { typ: 'artikel', artikel: 'GH-MON-DL1' }, foerder: 'f_monitoring', tag: 'capex',
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
            kosten: { typ: 'artikel', artikel: 'GH-MON-DL1' }, foerder: 'f_monitoring', tag: 'capex',
            begruendung: 'Monitoring Basic ist im Contracting-Modell verpflichtend.',
            kunde: {
              titel: 'Monitoring Basic',
              hersteller: 'systemseitig',
              produkt: 'Datenlogger und Fernablesung-Betrieb',
              leistungsumfang: 'Betriebsmonitoring aufbauend auf Messkonzept Basis: Datenlogger, Fernablesung-Betrieb und Reporting-Infrastruktur.',
            } },
          { id: 'mon_plus', text: 'Monitoring Plus (erweiterte Sensorik, Effizienz-Reporting)',
            menge: 1, einheit: 'pausch.',
            kosten: { typ: 'artikel', artikel: 'GH-MON-SEN5' }, foerder: 'f_monitoring', tag: 'capex',
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
            kosten: { typ: 'artikel', artikel: 'SZ-SC-STD' }, foerder: 'f_smartcontrol', tag: 'capex',
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
            kosten: { typ: 'artikel', artikel: 'SZ-SC-KI' }, foerder: 'f_smartcontrol', tag: 'capex',
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
    // SK-102: Installation als Einzelkomponenten statt Pauschale. Bedingte
    // Positionen (Demontagen) nutzen die Bedingungs-DSL auf Positionsebene.
    id: 'installation', pakettyp: 'Basis', gruppe: 'Installation / Inbetriebnahme',
    positionen: [
      { id: 'inst_baustelle', text: 'Baustelleneinrichtung',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_baustelle' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Einrichtung und Sicherung der Baustelle für die Montagephase.',
        kunde: {
          titel: 'Baustelleneinrichtung',
          hersteller: 'Serviceleistung',
          produkt: 'Baustelleneinrichtung und -sicherung',
          leistungsumfang: 'Einrichtung, Absicherung und Räumung der Baustelle im Montagezeitraum.',
        } },
      { id: 'inst_wp_montage', text: 'Montage WP-Module (je Modul)',
        menge: '@wp_module', einheit: 'Stk',
        kosten: { typ: 'fix', annahme: 'k_inst_wp_montage_je_modul' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Aufstellen, Ausrichten und Anschließen der Außenmodule; skaliert mit der Kaskadengröße.',
        kunde: {
          titel: 'Montage Wärmepumpenmodule',
          hersteller: 'Serviceleistung',
          produkt: 'Mechanische Montage der Außenmodule',
          leistungsumfang: 'Aufstellen, Ausrichten und kälte-/hydraulikseitiges Anschließen der Wärmepumpenmodule.',
        } },
      { id: 'inst_hydraulik', text: 'Hydraulische Installation im Heizraum',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_hydraulik_montage' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Rohrleitungs- und Anschlussarbeiten zwischen WP, Puffer und Bestandssystem.',
        kunde: {
          titel: 'Hydraulische Installation',
          hersteller: 'Serviceleistung',
          produkt: 'Rohrleitungs- und Anschlussarbeiten',
          leistungsumfang: 'Hydraulische Verbindung von Wärmepumpe, Speicher und Bestandssystem im Heizraum.',
        } },
      { id: 'inst_elektro', text: 'Elektromontage (Verkabelung, Anschluss)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_elektro_montage' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Montageanteil Elektro: Verkabelung und Anschluss der Anlagenkomponenten (Netzanschlusspaket separat).',
        kunde: {
          titel: 'Elektromontage',
          hersteller: 'Serviceleistung',
          produkt: 'Verkabelung und elektrischer Anschluss',
          leistungsumfang: 'Elektrische Verbindung der Anlagenkomponenten inklusive Anschluss an die vorbereitete Zuleitung.',
        } },
      { id: 'inst_kleinmaterial', text: 'Montage-Kleinmaterial',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_kleinmaterial' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Befestigungs-, Dichtungs- und Verbrauchsmaterial der Montage (Demo-Pauschale).',
        kunde: {
          titel: 'Montage-Kleinmaterial',
          hersteller: 'Serviceleistung',
          produkt: 'Befestigungs- und Verbrauchsmaterial',
          leistungsumfang: 'Kleinmaterial und Verbrauchsstoffe für die Montage der Systemkomponenten.',
        } },
      { id: 'inst_ibn', text: 'Inbetriebnahme inkl. IBN-Protokoll',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_ibn' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Inbetriebnahme der Gesamtanlage mit Einregulierung und Protokoll.',
        kunde: {
          titel: 'Inbetriebnahme',
          hersteller: 'Serviceleistung',
          produkt: 'Inbetriebnahme und Einregulierung',
          leistungsumfang: 'Inbetriebnahme der Gesamtanlage inklusive Einregulierung und IBN-Protokoll.',
        } },
      { id: 'inst_doku', text: 'Revisions- und Übergabedokumentation',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_doku' }, foerder: 'f_vertrieb_einweisung', tag: 'capex',
        begruendung: 'Anlagendokumentation für Betrieb, Wartung und spätere Prüfungen.',
        kunde: {
          titel: 'Anlagendokumentation',
          hersteller: 'Serviceleistung',
          produkt: 'Revisions- und Übergabeunterlagen',
          leistungsumfang: 'Zusammenstellung der Revisions- und Übergabedokumentation der Anlage.',
        } },
      { id: 'inst_projektierung', text: 'Projektplanung (Pauschale)',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_projektierung' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Projektierung, Terminplanung und Koordination der Gewerke (Demo-Pauschale).',
        kunde: {
          titel: 'Projektplanung',
          hersteller: 'Serviceleistung',
          produkt: 'Projektierung und Koordination',
          leistungsumfang: 'Planung, Terminierung und Koordination der Umsetzung im Projektumfang.',
        } },
      { id: 'inst_einweisung', text: 'Einweisung Betreiber/Kunde',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_einweisung' }, foerder: 'f_vertrieb_einweisung', tag: 'capex',
        begruendung: 'Einweisung in Bedienung und Betrieb der Anlage bei Übergabe.',
        kunde: {
          titel: 'Einweisung',
          hersteller: 'Serviceleistung',
          produkt: 'Betreiber-/Kundeneinweisung',
          leistungsumfang: 'Einweisung des Betreibers in Bedienung, Betrieb und Meldewege der Anlage.',
        } },
      { id: 'inst_vertrieb', text: 'Vertriebs- und Marketingpauschale',
        menge: 1, einheit: 'pausch.',
        kosten: { typ: 'fix', annahme: 'k_inst_vertrieb' }, foerder: 'f_vertrieb_einweisung', tag: 'capex',
        begruendung: 'Anteilige Vertriebs- und Marketingkosten des Projekts (Demo-Pauschale, transparent ausgewiesen).',
        kunde: {
          titel: 'Vertriebspauschale',
          hersteller: 'Serviceleistung',
          produkt: 'Vertriebs- und Marketinganteil',
          leistungsumfang: 'Anteilige Vertriebs- und Beratungsleistung des Projekts (Demo-Ausweis).',
        } },
      { id: 'inst_demontage_gaskessel', text: 'Demontage Bestandskessel',
        menge: 1, einheit: 'pausch.',
        bedingung: { und: [
          { feld: 'gaskessel_vorhanden', op: '=', wert: 'ja' },
          { feld: 'kessel_nutzbar', op: '=', wert: 'nein' },
        ]},
        kosten: { typ: 'fix', annahme: 'k_inst_demontage_gaskessel' }, foerder: 'f_umfeld', tag: 'capex',
        begruendung: 'Nur wenn der Bestandskessel nicht weiter nutzbar ist: Demontage und Entsorgung.',
        kunde: {
          titel: 'Demontage Bestandskessel',
          hersteller: 'Serviceleistung',
          produkt: 'Demontage und Entsorgung',
          leistungsumfang: 'Demontage und fachgerechte Entsorgung des nicht weiter nutzbaren Bestandskessels.',
        } },
      { id: 'inst_demontage_abgas', text: 'Demontage Abgasanlage',
        menge: 1, einheit: 'pausch.',
        bedingung: { und: [
          { feld: 'gaskessel_vorhanden', op: '=', wert: 'ja' },
          { feld: 'kessel_nutzbar', op: '=', wert: 'nein' },
        ]},
        kosten: { typ: 'fix', annahme: 'k_inst_demontage_abgas' }, foerder: 'f_umfeld', tag: 'capex',
        begruendung: 'Mit der Kessel-Demontage entfällt die zugehörige Abgasanlage.',
        kunde: {
          titel: 'Demontage Abgasanlage',
          hersteller: 'Serviceleistung',
          produkt: 'Rückbau Abgasanlage',
          leistungsumfang: 'Rückbau der nicht mehr benötigten Abgasanlage im Zuge der Kessel-Demontage.',
        } },
      { id: 'inst_demontage_oeltank', text: 'Demontage/Stilllegung Öltank',
        menge: 1, einheit: 'pausch.',
        bedingung: { feld: 'oeltank_vorhanden', op: '=', wert: 'ja' },
        kosten: { typ: 'fix', annahme: 'k_inst_demontage_oeltank' }, foerder: 'f_umfeld', tag: 'capex',
        begruendung: 'Nur bei vorhandenem Alt-Öltank: Reinigung, Demontage bzw. Stilllegung.',
        kunde: {
          titel: 'Öltank-Demontage',
          hersteller: 'Serviceleistung',
          produkt: 'Reinigung und Demontage/Stilllegung',
          leistungsumfang: 'Reinigung und fachgerechte Demontage bzw. Stilllegung des vorhandenen Öltanks.',
        } },
      { id: 'anfahrt', text: 'Anfahrt Installationspartner (Demo-Fahrstrecke)',
        menge: '@anfahrt_km_gesamt', einheit: 'km',
        kosten: { typ: 'anfahrt' }, foerder: 'f_install', tag: 'capex',
        begruendung: 'Fahrstrecke Partner → Projekt-PLZ (Demo für externe Kartendienst-Distanz) × 2 × Fahrten; €/km = Fahrzeugkosten + Stundensatz ÷ Ø-Geschwindigkeit.',
        kunde: {
          titel: 'Anfahrt',
          hersteller: 'Serviceleistung',
          produkt: 'An- und Abfahrten Montageteam',
          leistungsumfang: 'An- und Abfahrten des Montageteams vom Partnerstandort zum Projektstandort über die Montagephase.',
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
          { id: 'om_basis', text: 'Wartungsvertrag Basis (O&M, je WP-Modul p.a.)',
            menge: '@wp_module', einheit: 'Stk',
            kosten: { typ: 'artikel', artikel: 'WT-SV-BASIS' }, foerder: 'f_monitoring', tag: 'opex',
            bereich: 'wartung_instandsetzung',
            begruendung: 'SK-102: Wartungsvertrag als Katalogartikel mit Jahrespreis je WP-Modul (statt % der LV-Kosten).',
            kunde: {
              titel: 'Service Basis',
              hersteller: 'Serviceleistung',
              produkt: 'Wartung und Instandhaltung (Vertragsartikel)',
              leistungsumfang: 'Grundlegende Wartungs- und Instandhaltungsleistung je Wärmepumpenmodul für den betrachteten Betriebskorridor.',
            } },
        ]},
      { wert: 'komfort', name: 'Service Komfort',
        positionen: [
          { id: 'om_komfort', text: 'Wartungsvertrag Komfort (O&M + Störungsdienst, je WP-Modul p.a.)',
            menge: '@wp_module', einheit: 'Stk',
            kosten: { typ: 'artikel', artikel: 'WT-SV-KOMFORT' }, foerder: 'f_monitoring', tag: 'opex',
            bereich: 'wartung_instandsetzung',
            begruendung: 'SK-102: erweiterter Servicevertrag inkl. Störungsdienst als Katalogartikel je WP-Modul p.a.',
            kunde: {
              titel: 'Service Komfort',
              hersteller: 'Serviceleistung',
              produkt: 'Wartung, Instandhaltung und Störungsdienst (Vertragsartikel)',
              leistungsumfang: 'Erweiterter Serviceumfang mit Störungsdienst je Wärmepumpenmodul im Betriebskorridor.',
            } },
        ]},
    ],
  },
  {
    id: 'monitoring_pa', pakettyp: 'Monitoring', gruppe: 'Service / Betrieb (p.a.)',
    positionen: [
      { id: 'mon_pa', text: 'Monitoring-Betrieb (Datendienst)',
        menge: 1, einheit: '€/a',
        kosten: { typ: 'artikel', artikel: 'SZ-MON-SRV' }, foerder: 'f_monitoring', tag: 'opex',
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
