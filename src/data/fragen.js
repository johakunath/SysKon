// Fragebogen Sektionen A–J (HANDOVER §8). Dynamisch: `sichtbar` nutzt dieselbe
// Bedingungs-DSL wie regeln.js; unsichtbare Fragen zählen nicht für den DQ-Score.
// `dq` = Gewicht im Datenqualitätsscore (0 = optionale Frage). Antworten mit
// Wert 'unbekannt' gelten als beantwortet, liefern aber KEINE DQ-Punkte.

const JN = [
  { wert: 'ja', label: 'ja' },
  { wert: 'nein', label: 'nein' },
]
const JNU = [...JN, { wert: 'unbekannt', label: 'unbekannt' }]

export const SEKTIONEN = [
  { id: 'A', titel: 'Gebäudegrunddaten', fragen: [
    { id: 'gebaeudetyp', label: 'Gebäudesituation', typ: 'select', dq: 2,
      optionen: [
        { wert: 'freistehend', label: 'freistehendes Bestands-MFH' },
        { wert: 'innenstadt', label: 'verdichtete Innenstadt-/Blockrandlage' },
        { wert: 'sonstig', label: 'sonstige Lage' },
      ],
      tooltip: 'Freistehende Gebäude sind der Standardfall; Innenstadtlage verschärft Schall- und Platzprüfung (R06).' },
    { id: 'wohneinheiten', label: 'Wohneinheiten', typ: 'zahl', einheit: 'WE', dq: 2,
      tooltip: 'Bezugsgröße für Kennzahlen (€/WE) und Heizlast-Notbehelf.' },
    { id: 'flaeche', label: 'Beheizte Fläche', typ: 'zahl', einheit: 'm²', dq: 2,
      tooltip: 'Bezugsgröße für €/m² und Heizlast-Proxy, falls kein Verbrauch vorliegt.' },
    { id: 'baujahrklasse', label: 'Baujahrklasse', typ: 'select', dq: 1,
      optionen: [
        { wert: 'vor1960', label: 'vor 1960' },
        { wert: '1960-1979', label: '1960–1979' },
        { wert: '1980-1994', label: '1980–1994' },
        { wert: 'ab1995', label: 'ab 1995' },
      ],
      tooltip: 'Grobe Einordnung des energetischen Standards.' },
    { id: 'sanierungsstand', label: 'Sanierungsstand', typ: 'select', dq: 2,
      optionen: [
        { wert: 'unsaniert', label: 'unsaniert' },
        { wert: 'teilsaniert', label: 'teilsaniert' },
        { wert: 'vollsaniert', label: 'vollsaniert' },
      ],
      tooltip: 'Steuert die spezifische Heizlast im Proxy (Demo: 100/75/50 W/m²).' },
    { id: 'heizraum_vorhanden', label: 'Heizraum/Keller vorhanden', typ: 'select', optionen: JN, dq: 2,
      tooltip: 'Heizraum nimmt Speicher, Hydraulik und Regelung auf (außer bei Containern).' },
    { id: 'aussenflaeche_vorhanden', label: 'Außenfläche/Hof verfügbar', typ: 'select', optionen: JN, dq: 3,
      tooltip: 'MVP setzt Außenaufstellung der WP voraus – ohne Außenfläche Ausschluss (R16).' },
  ]},

  { id: 'B', titel: 'Wärmebedarf & Leistung', fragen: [
    { id: 'jahresverbrauch', label: 'Jahreswärmeverbrauch', typ: 'zahl', einheit: 'MWh/a', dq: 3,
      tooltip: 'Wichtigste Größe für Heizlast-Proxy und Energiekosten. Leer lassen, wenn unbekannt.' },
    { id: 'verbrauchsquelle', label: 'Quelle des Verbrauchswerts', typ: 'select', dq: 2,
      optionen: [
        { wert: 'abrechnung', label: 'Abrechnung/Messung' },
        { wert: 'schaetzung', label: 'Schätzung' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Nur gemessene Verbräuche gelten als plausibel (Grün-Kriterium R11).' },
    { id: 'ww_enthalten', label: 'Warmwasser im Jahresverbrauch enthalten', typ: 'select', optionen: JNU, dq: 2,
      tooltip: 'Steuert die Vollbenutzungsstunden im Proxy: 1.900 ohne WW, 2.200 mit WW.' },
    { id: 'ww_bereitung', label: 'Warmwasserbereitung', typ: 'select', dq: 2,
      optionen: [
        { wert: 'zentral', label: 'zentral' },
        { wert: 'dezentral', label: 'dezentral (z. B. Durchlauferhitzer)' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Zentrale WW-Bereitung erzwingt das Speicher-/WW-Modul (R03).' },
    { id: 'heizlast_bekannt', label: 'Heizlast bekannt', typ: 'select', optionen: JN, dq: 2,
      tooltip: 'Liegt eine berechnete Heizlast vor? Sonst wird per Proxy geschätzt (Status mind. gelb, R14).' },
    { id: 'heizlast_kw', label: 'Heizlast', typ: 'zahl', einheit: 'kW', dq: 0,
      sichtbar: { feld: 'heizlast_bekannt', op: '=', wert: 'ja' },
      tooltip: 'Berechnete oder gemessene Gebäudeheizlast.' },
  ]},

  { id: 'C', titel: 'Bestandssystem', fragen: [
    { id: 'technologiepfad', label: 'Technologiepfad', typ: 'select', dq: 2,
      optionen: [
        { wert: 'hybrid', label: 'Hybrid: Luft-Wasser-WP + Gas-Bestandskessel (MVP)' },
        { wert: 'monoenergetisch', label: 'monoenergetische WP (Roadmap-Platzhalter)' },
        { wert: 'sonstig', label: 'anderer Pfad (außerhalb MVP)' },
      ],
      tooltip: 'v0.1 unterstützt nur den Hybridpfad; andere Pfade sind nicht standardfähig (R17).' },
    { id: 'gaskessel_vorhanden', label: 'Gas-Bestandskessel vorhanden', typ: 'select', optionen: JN, dq: 2,
      sichtbar: { feld: 'technologiepfad', op: '=', wert: 'hybrid' },
      tooltip: 'Voraussetzung für die Hybrid-Einbindung.' },
    { id: 'kessel_zustand', label: 'Zustand Bestandskessel', typ: 'select', dq: 2,
      sichtbar: { feld: 'gaskessel_vorhanden', op: '=', wert: 'ja' },
      optionen: [
        { wert: 'gut', label: 'gut' },
        { wert: 'mittel', label: 'mittel' },
        { wert: 'schlecht', label: 'schlecht' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Unbekannter Kesselzustand löst PE-Prüfung aus (R12).' },
    { id: 'kessel_nutzbar', label: 'Bestandskessel weiter nutzbar', typ: 'select', optionen: JNU, dq: 2,
      sichtbar: { feld: 'gaskessel_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Grün-Kriterium: der Hybridpfad braucht einen nutzbaren Bestandskessel.' },
    { id: 'anzahl_heizkreise', label: 'Anzahl Heizkreise', typ: 'zahl', einheit: 'Stk', dq: 3,
      tooltip: 'MVP unterstützt maximal zwei Heizkreise; mehr ist Ausschluss (R04).' },
    { id: 'pufferspeicher_vorhanden', label: 'Pufferspeicher vorhanden', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'Information für die Hydraulikplanung (WP speist zuerst in den Puffer).' },
  ]},

  { id: 'D', titel: 'Temperaturniveau', fragen: [
    { id: 'vorlauftemp_klasse', label: 'Vorlauftemperatur (Auslegung/Messung)', typ: 'select', dq: 3,
      optionen: [
        { wert: '<=45', label: '≤ 45 °C' },
        { wert: '46-50', label: '46–50 °C' },
        { wert: '51-55', label: '51–55 °C' },
        { wert: '56-60', label: '56–60 °C' },
        { wert: '61-65', label: '61–65 °C' },
        { wert: '66-70', label: '66–70 °C' },
        { wert: '>70', label: '> 70 °C' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Über 65 °C ist der Standard-Hybrid nur mit Engineering-Prüfung möglich (R09).' },
    { id: 'heizkoerper_ausreichend', label: 'Heizkörper ausreichend dimensioniert', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'Knappe Heizflächen erhöhen die nötige Vorlauftemperatur.' },
    { id: 'hydraulischer_abgleich', label: 'Hydraulischer Abgleich vorhanden', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'Fehlender Abgleich wird im Hydraulikpaket mit erledigt.' },
  ]},

  { id: 'E', titel: 'Aufstellung innen', fragen: [
    { id: 'heizraum_groesse_ok', label: 'Heizraumgröße ausreichend', typ: 'select', optionen: JNU, dq: 2,
      sichtbar: { feld: 'heizraum_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Zu kleiner Heizraum macht Fundament/Einhausung schwierig – Container prüfen (R15).' },
    { id: 'zugang_ok', label: 'Zugang/Türbreiten ausreichend', typ: 'select', optionen: JNU, dq: 2,
      sichtbar: { feld: 'heizraum_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Speicher und Hydraulik müssen in den Heizraum transportiert werden können.' },
    { id: 'platz_speicher', label: 'Platz für Speicher vorhanden', typ: 'select', optionen: JNU, dq: 1,
      sichtbar: { feld: 'heizraum_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Relevant für das Speicher-/WW-Modul.' },
    { id: 'rueckbau_noetig', label: 'Rückbau Altanlage nötig', typ: 'select', optionen: JNU, dq: 0,
      tooltip: 'Information für Umfeldmaßnahmen/Handover.' },
  ]},

  { id: 'F', titel: 'Aufstellung außen', fragen: [
    { id: 'aussenflaeche_m2', label: 'Verfügbare Außenfläche (geschätzt)', typ: 'zahl', einheit: 'm²', dq: 2,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Unter 30 m² (Demo-Annahme) sind Container-Varianten gesperrt (R05).' },
    { id: 'aufstellvariante', label: 'Aufstellvariante', typ: 'select', dq: 2,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      optionen: [
        { wert: 'fundament', label: 'Standard-Fundament' },
        { wert: 'einhausung', label: 'Schutz-/Schall-Einhausung' },
        { wert: 'kompakt_container', label: 'Kompakt-Container' },
        { wert: 'vollcontainer', label: 'Vollcontainer' },
      ],
      tooltip: 'Zentrale Konfigurationsachse: CapEx vs. Schallschutz vs. Heizraumabhängigkeit (Trade-off-Tabelle im Handover).' },
    { id: 'schallhaube', label: 'Standard-Schallhaube vorsehen', typ: 'select', optionen: JN, dq: 0,
      sichtbar: { feld: 'aufstellvariante', op: '=', wert: 'fundament' },
      tooltip: 'Nur bei Fundamentaufstellung: −8 dB (Demo) gegen Aufpreis.' },
    { id: 'entfernung_heizraum', label: 'Entfernung WP-Standort zum Heizraum', typ: 'zahl', einheit: 'm', dq: 1,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Lange Trassen erhöhen die Umfeldkosten (in v0.1 nur informativ).' },
    { id: 'kran_zugang', label: 'Kran-/Anlieferzugang möglich', typ: 'select', optionen: JNU, dq: 1,
      sichtbar: { feld: 'aufstellvariante', op: 'in', wert: ['kompakt_container', 'vollcontainer'] },
      tooltip: 'Container brauchen Kranstellung und Anlieferweg.' },
  ]},

  { id: 'G', titel: 'Schall', fragen: [
    { id: 'abstand_fenster', label: 'Abstand zum nächsten Fenster/Immissionsort', typ: 'zahl', einheit: 'm', dq: 3,
      tooltip: 'Geht direkt in die Pegelabschätzung ein: −20·log10(r) (R18, Demo-Formel).' },
    { id: 'gebietstyp', label: 'Gebietstyp (Nachtgrenzwert)', typ: 'select', dq: 2,
      optionen: [
        { wert: 'WR', label: 'reines Wohngebiet (35 dB(A) nachts)' },
        { wert: 'WA', label: 'allgemeines Wohngebiet (40 dB(A) nachts)' },
        { wert: 'MI', label: 'Mischgebiet (45 dB(A) nachts)' },
      ],
      tooltip: 'Demo-Grenzwerte; keine rechtsverbindliche Schallberechnung.' },
    { id: 'schallsensibilitaet', label: 'Geräuschsensibilität Umfeld', typ: 'select', dq: 0,
      optionen: [
        { wert: 'hoch', label: 'hoch' },
        { wert: 'mittel', label: 'mittel' },
        { wert: 'niedrig', label: 'niedrig' },
      ],
      tooltip: 'Weiches Kriterium für die PE-Einschätzung (in v0.1 nur informativ).' },
  ]},

  { id: 'H', titel: 'Elektrik / Netzanschluss', fragen: [
    { id: 'netzanschluss_bekannt', label: 'Netzanschlussleistung bekannt', typ: 'select', optionen: JN, dq: 3,
      tooltip: 'Unbekannter Netzanschluss löst Elektroprüfung aus und setzt Status mind. auf gelb (R08).' },
    { id: 'zaehlerschrank_ok', label: 'Zählerschrank geeignet', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'WP-Tarif braucht ggf. separaten Zähler.' },
    { id: 'kabelweg', label: 'Kabelweg Heizraum ↔ Zähler', typ: 'select', dq: 1,
      optionen: [
        { wert: 'einfach', label: 'einfach' },
        { wert: 'mittel', label: 'mittel' },
        { wert: 'schwierig', label: 'schwierig' },
      ],
      tooltip: 'Information für das Elektro-Paket (v0.1: Pauschale).' },
  ]},

  { id: 'I', titel: 'Förderung', fragen: [
    { id: 'foerderung_annahme', label: 'BEG-Förderung annehmen', typ: 'select', dq: 2,
      optionen: [
        { wert: 'ja', label: 'ja (Contractor-Modell, 35 % Demo)' },
        { wert: 'nein', label: 'nein' },
        { wert: 'unsicher', label: 'unsicher' },
      ],
      tooltip: 'Demo-Förderlogik, keine Förderberatung. „unsicher" löst Förderprüfung aus (R13).' },
  ]},

  { id: 'J', titel: 'Monitoring / Betrieb', fragen: [
    { id: 'monitoring_variante', label: 'Monitoring-Paket', typ: 'select', dq: 1,
      optionen: [
        { wert: 'basic', label: 'Monitoring Basic (verpflichtend)' },
        { wert: 'plus', label: 'Monitoring Plus (Basic + Erweiterung)' },
      ],
      tooltip: 'Basic ist verpflichtend; Plus ergänzt Sensorik und Reporting.' },
    { id: 'service_variante', label: 'Servicepaket', typ: 'select', dq: 1,
      optionen: [
        { wert: 'basis', label: 'Service Basis (O&M 1,5 %/a Demo)' },
        { wert: 'komfort', label: 'Service Komfort (O&M 2,2 %/a Demo)' },
      ],
      tooltip: 'Laufende Kosten, gehen nicht ins einmalige LV ein (Opex).' },
    { id: 'fernablesung', label: 'Fernablesung erforderlich', typ: 'select', optionen: JNU, dq: 0,
      tooltip: 'In Monitoring Basic enthalten (Demo).' },
  ]},
]

// Flache Liste aller Fragen (für Engine/DQ-Score)
export const ALLE_FRAGEN = SEKTIONEN.flatMap(s => s.fragen.map(f => ({ ...f, sektion: s.id })))
