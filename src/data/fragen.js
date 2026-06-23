// Fragebogen Sektionen A–J. Dynamisch: `sichtbar` nutzt dieselbe
// Bedingungs-DSL wie regeln.js; unsichtbare Fragen zählen nicht für den DQ-Score.
// `dq` = Gewicht im Datenqualitätsscore (0 = optionale Frage). Antworten mit
// Wert 'unbekannt' gelten als unzureichend und liefern KEINE DQ-Punkte.

const JN = [
  { wert: 'ja', label: 'ja' },
  { wert: 'nein', label: 'nein' },
]
const JNU = [...JN, { wert: 'unbekannt', label: 'unbekannt' }]

const OPTION_FALLBACKS = {
  ja: 'Trifft nach aktuellem Gesprächsstand zu.',
  nein: 'Trifft nach aktuellem Gesprächsstand nicht zu.',
  unbekannt: 'Noch offen; gezielt nachfassen.',
}

const OPTION_HINTS = {
  gebaeudetyp: {
    freistehend: 'Typischer MVP-Standardfall mit besser prüfbarer Aufstellung.',
    innenstadt: 'Mehr Schall-, Platz- und Nachbarschaftsrisiko.',
    sonstig: 'Sonderlage; Annahmen im Gespräch sichtbar halten.',
  },
  baujahrklasse: {
    vor1960: 'Oft höherer Wärmebedarf; Sanierung besonders prüfen.',
    '1960-1979': 'Häufig mittlerer bis hoher Bedarf; Zustand klären.',
    '1980-1994': 'Meist moderater Bedarf; Modernisierung abfragen.',
    ab1995: 'Tendenziell besserer Standard; Werte trotzdem prüfen.',
  },
  sanierungsstand: {
    unsaniert: 'Hoher Bedarf und höhere Vorlauftemperatur wahrscheinlicher.',
    teilsaniert: 'Mittlerer Korridor; Maßnahmen konkret nachfragen.',
    vollsaniert: 'Besserer Fit, wenn Verbrauch und Temperaturen passen.',
  },
  verbrauchsquelle: {
    abrechnung: 'Beste schnelle Datenbasis für die Richtindikation.',
    schaetzung: 'Nur Annahme; vor externer Nutzung schärfen.',
    unbekannt: 'Verbrauchsdaten nachfordern.',
  },
  ww_bereitung: {
    zentral: 'Speicher-/Warmwassermodul wird relevant.',
    dezentral: 'Warmwasser bleibt meist außerhalb des WP-Scopes.',
    unbekannt: 'Vor Scope-Aussage klären.',
  },
  technologiepfad: {
    hybrid: 'Unterstützter MVP-Standardpfad.',
    monoenergetisch: 'Roadmap-Platzhalter, kein Standardfit.',
    sonstig: 'Außerhalb des aktuellen MVP.',
  },
  kessel_zustand: {
    gut: 'Weiterbetrieb wirkt plausibel.',
    mittel: 'Nutzbarkeit ansprechen, aber nicht blockierend.',
    schlecht: 'Restlaufzeit und Einbindung kritisch prüfen.',
    unbekannt: 'Kesselprüfung als offenen Punkt markieren.',
  },
  vorlauftemp_klasse: {
    '<=45': 'Sehr guter Temperaturkorridor.',
    '46-50': 'Guter Korridor für WP-Betrieb.',
    '51-55': 'Noch gut besprechbar.',
    '56-60': 'Grenznaher, aber typischer Hybridkorridor.',
    '61-65': 'Erhöhte Effizienz- und Prüfanforderung.',
    '66-70': 'Mit modernem R290-Setup standardfähig; interne Klärung.',
    '>70': 'Über 70 °C: Fachprüfung, MVP-Sonderfall.',
    unbekannt: 'Temperaturniveau nachfassen.',
  },
  aussenflaeche_typ: {
    hof: 'Befestigte Fläche stützt Standardaufstellung.',
    stellplatz: 'Praktisch, aber Nutzung und Eigentum klären.',
    garten: 'Untergrund und Wiederherstellung beachten.',
    dach_garage: 'Statik und Genehmigung fachlich prüfen.',
    unbekannt: 'Standortart vor Empfehlung klären.',
  },
  zugang_logistik: {
    einfach: 'Anlieferung wirkt plausibel.',
    eingeschraenkt: 'Montageaufwand im Gespräch markieren.',
    schwierig: 'Kann Container und große Bauteile blockieren.',
    unbekannt: 'Zufahrt und Kranstellung klären.',
  },
  platz_prioritaet: {
    kosten_min: 'Empfehlung bleibt günstigste tragfähige Variante.',
    schall_robust: 'Schallstabile Variante bevorzugen.',
    heizraum_entlasten: 'Containeroptionen stärker gewichten.',
    container_bevorzugt: 'Containerwunsch zeigen, Blocker bleiben gültig.',
    offen: 'Keine Zusatzpräferenz setzen.',
  },
  aufstellvariante: {
    fundament: 'Günstig, aber stärker vom Heizraum abhängig.',
    einhausung: 'Mehr Schallschutz bei mittlerem Zusatz-CAPEX.',
    kompakt_container: 'Entlastet Heizraum, braucht Logistik und Fläche.',
    vollcontainer: 'Maximal integriert, teuer und flächenintensiv.',
  },
  gebietstyp: {
    WR: 'Strengster Nachtgrenzwert im Demo-Modell.',
    WA: 'Typischer Wohngebietskorridor.',
    MI: 'Höherer Grenzwert, trotzdem nur Vorprüfung.',
  },
  schallsensibilitaet: {
    hoch: 'Erwartungsmanagement und Schallprüfung früh setzen.',
    mittel: 'Standardannahme für Wohnumfeld.',
    niedrig: 'Weniger Gesprächsrisiko, aber kein Freibrief.',
  },
  kabelweg: {
    einfach: 'Elektroaufwand wirkt überschaubar.',
    mittel: 'Normale Klärung im weiteren Prozess.',
    schwierig: 'Zusatzaufwand und Prüfung erwarten.',
  },
  foerderung_annahme: {
    ja: 'Demo rechnet mit Förderannahme.',
    nein: 'Konservativer Netto-Korridor ohne Förderung.',
    unsicher: 'Förderprüfung als nächsten Schritt setzen.',
  },
  monitoring_variante: {
    basic: 'Pflichtnaher Standardumfang.',
    plus: 'Mehr Sensorik und Reportingbedarf.',
  },
  service_variante: {
    basis: 'Schlanker OPEX-Standard.',
    komfort: 'Mehr Betriebssicherheit, höhere OPEX-Indikation.',
  },
}

const optionHinweis = (frage, option) =>
  option.hinweis ?? OPTION_HINTS[frage.id]?.[option.wert] ?? OPTION_FALLBACKS[option.wert] ?? 'Im Gespräch konkretisieren.'

const SEKTIONEN_ROH = [
  { id: 'A', titel: 'Gebäude & Gesprächsrahmen', fragen: [
    { id: 'gebaeudetyp', label: 'Welche Gebäudesituation liegt vor?', typ: 'select', dq: 2,
      optionen: [
        { wert: 'freistehend', label: 'freistehendes Bestands-MFH' },
        { wert: 'innenstadt', label: 'verdichtete Innenstadt-/Blockrandlage' },
        { wert: 'sonstig', label: 'sonstige Lage' },
      ],
      tooltip: 'Freistehende Gebäude sind der Standardfall; Innenstadtlage verschärft Schall- und Platzprüfung (R06).' },
    { id: 'wohneinheiten', label: 'Wie viele Wohneinheiten hat das Gebäude?', typ: 'zahl', einheit: 'WE', dq: 2, min: 1, max: 500,
      tooltip: 'Bezugsgröße für Kennzahlen (€/WE) und Heizlast-Notbehelf.' },
    { id: 'anzahl_gebaeude', label: 'Wie viele Gebäude soll die Anlage versorgen?', typ: 'zahl', einheit: 'Gebäude', dq: 0, min: 1, max: 50,
      tooltip: 'MVP-Systempaket versorgt genau ein Gebäude; mehr als eines ist kein Standardfit (R19). Leer = Annahme „ein Gebäude".' },
    { id: 'flaeche', label: 'Wie groß ist die beheizte Fläche?', typ: 'zahl', einheit: 'm²', dq: 2, min: 50, max: 50000,
      tooltip: 'Bezugsgröße für €/m² und Heizlast-Proxy, falls kein Verbrauch vorliegt.' },
    { id: 'baujahrklasse', label: 'In welche Baujahrklasse fällt das Gebäude?', typ: 'select', dq: 1,
      optionen: [
        { wert: 'vor1960', label: 'vor 1960' },
        { wert: '1960-1979', label: '1960–1979' },
        { wert: '1980-1994', label: '1980–1994' },
        { wert: 'ab1995', label: 'ab 1995' },
      ],
      tooltip: 'Grobe Einordnung des energetischen Standards.' },
    { id: 'sanierungsstand', label: 'Wie ist der energetische Sanierungsstand?', typ: 'select', dq: 2,
      optionen: [
        { wert: 'unsaniert', label: 'unsaniert' },
        { wert: 'teilsaniert', label: 'teilsaniert' },
        { wert: 'vollsaniert', label: 'vollsaniert' },
      ],
      tooltip: 'Steuert die spezifische Heizlast im Proxy (Demo: 100/75/50 W/m²).' },
    { id: 'heizraum_vorhanden', label: 'Gibt es einen nutzbaren Heizraum oder Keller?', typ: 'select', optionen: JN, dq: 2,
      tooltip: 'Heizraum nimmt Speicher, Hydraulik und Regelung auf (außer bei Containern).' },
    { id: 'aussenflaeche_vorhanden', label: 'Ist eine Außenfläche oder ein Hof verfügbar?', typ: 'select', optionen: JN, dq: 3,
      tooltip: 'MVP setzt Außenaufstellung der WP voraus – ohne Außenfläche Ausschluss (R16).' },
  ]},

  { id: 'B', titel: 'Wärmebedarf & Datenlage', fragen: [
    { id: 'jahresverbrauch', label: 'Welcher Jahreswärmeverbrauch ist bekannt?', typ: 'zahl', einheit: 'MWh/a', dq: 3, min: 5, max: 10000,
      tooltip: 'Wichtigste Größe für Heizlast-Proxy und Energiekosten. Leer lassen, wenn unbekannt.' },
    { id: 'verbrauchsquelle', label: 'Aus welcher Quelle stammt der Verbrauchswert?', typ: 'select', dq: 2,
      optionen: [
        { wert: 'abrechnung', label: 'Abrechnung/Messung' },
        { wert: 'schaetzung', label: 'Schätzung' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Nur gemessene Verbräuche gelten als plausibel (Grün-Kriterium R11).' },
    { id: 'ww_enthalten', label: 'Ist Warmwasser im Jahresverbrauch enthalten?', typ: 'select', optionen: JNU, dq: 2,
      tooltip: 'Steuert die Vollbenutzungsstunden im Proxy: 1.900 ohne WW, 2.200 mit WW.' },
    { id: 'ww_bereitung', label: 'Wie wird Warmwasser heute bereitet?', typ: 'select', dq: 2,
      optionen: [
        { wert: 'zentral', label: 'zentral' },
        { wert: 'dezentral', label: 'dezentral (z. B. Durchlauferhitzer)' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Zentrale WW-Bereitung erzwingt das Speicher-/WW-Modul (R03).' },
    { id: 'heizlast_bekannt', label: 'Liegt eine Heizlastberechnung oder belastbare Heizlast vor?', typ: 'select', optionen: JN, dq: 2,
      tooltip: 'Liegt eine berechnete Heizlast vor? Sonst wird per Proxy geschätzt (Status mind. gelb, R14).' },
    { id: 'heizlast_kw', label: 'Welche Heizlast wurde ermittelt?', typ: 'zahl', einheit: 'kW', dq: 0, min: 5, max: 5000,
      sichtbar: { feld: 'heizlast_bekannt', op: '=', wert: 'ja' },
      tooltip: 'Berechnete oder gemessene Gebäudeheizlast.' },
  ]},

  { id: 'C', titel: 'Bestandssystem & Hybridfähigkeit', fragen: [
    { id: 'technologiepfad', label: 'Welcher Technologiepfad soll geprüft werden?', typ: 'select', dq: 2,
      optionen: [
        { wert: 'hybrid', label: 'Hybrid: Luft-Wasser-WP + Gas-Bestandskessel (MVP)' },
        { wert: 'monoenergetisch', label: 'monoenergetische WP (Roadmap-Platzhalter)' },
        { wert: 'sonstig', label: 'anderer Pfad (außerhalb MVP)' },
      ],
      tooltip: 'v0.1 unterstützt nur den Hybridpfad; andere Pfade sind nicht standardfähig (R17).' },
    { id: 'gaskessel_vorhanden', label: 'Ist ein Gas-Bestandskessel vorhanden?', typ: 'select', optionen: JN, dq: 2,
      sichtbar: { feld: 'technologiepfad', op: '=', wert: 'hybrid' },
      tooltip: 'Voraussetzung für die Hybrid-Einbindung.' },
    { id: 'kessel_zustand', label: 'Wie ist der Zustand des Bestandskessels?', typ: 'select', dq: 2,
      sichtbar: { feld: 'gaskessel_vorhanden', op: '=', wert: 'ja' },
      optionen: [
        { wert: 'gut', label: 'gut' },
        { wert: 'mittel', label: 'mittel' },
        { wert: 'schlecht', label: 'schlecht' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Unbekannter Kesselzustand löst interne Klärung aus (R12).' },
    { id: 'kessel_nutzbar', label: 'Kann der Bestandskessel weiter genutzt werden?', typ: 'select', optionen: JNU, dq: 2,
      sichtbar: { feld: 'gaskessel_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Grün-Kriterium: der Hybridpfad braucht einen nutzbaren Bestandskessel.' },
    { id: 'anzahl_heizkreise', label: 'Wie viele Heizkreise sind vorhanden?', typ: 'zahl', einheit: 'Stk', dq: 3, min: 1, max: 10,
      tooltip: 'MVP unterstützt maximal zwei Heizkreise; mehr ist Ausschluss (R04).' },
    { id: 'pufferspeicher_vorhanden', label: 'Ist bereits ein Pufferspeicher vorhanden?', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'Information für die Hydraulikplanung (WP speist zuerst in den Puffer).' },
  ]},

  { id: 'D', titel: 'Temperaturniveau & Heizflächen', fragen: [
    { id: 'vorlauftemp_klasse', label: 'Welches Vorlauftemperaturniveau ist bekannt?', typ: 'select', dq: 3,
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
      tooltip: 'Korridor: bis 65 °C Standard (Hinweis ab 56 °C, R09), 66–70 °C interne Klärung (R20), über 70 °C Fachprüfung (R21).' },
    { id: 'heizkoerper_ausreichend', label: 'Sind die Heizkörper ausreichend dimensioniert?', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'Knappe Heizflächen erhöhen die nötige Vorlauftemperatur.' },
    { id: 'hydraulischer_abgleich', label: 'Ist ein hydraulischer Abgleich vorhanden?', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'Fehlender Abgleich wird im Hydraulikpaket mit erledigt.' },
  ]},

  { id: 'E', titel: 'Heizraum & Innenaufstellung', fragen: [
    { id: 'heizraum_groesse_ok', label: 'Ist die Heizraumgröße ausreichend?', typ: 'select', optionen: JNU, dq: 2,
      sichtbar: { feld: 'heizraum_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Zu kleiner Heizraum macht Fundament/Einhausung schwierig – Container prüfen (R15).' },
    { id: 'zugang_ok', label: 'Sind Zugang und Türbreiten ausreichend?', typ: 'select', optionen: JNU, dq: 2,
      sichtbar: { feld: 'heizraum_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Speicher und Hydraulik müssen in den Heizraum transportiert werden können.' },
    { id: 'platz_speicher', label: 'Ist Platz für Speicher vorhanden?', typ: 'select', optionen: JNU, dq: 1,
      sichtbar: { feld: 'heizraum_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Relevant für das Speicher-/WW-Modul.' },
    { id: 'rueckbau_noetig', label: 'Ist ein Rückbau der Altanlage nötig?', typ: 'select', optionen: JNU, dq: 0,
      tooltip: 'Information für Umfeldmaßnahmen und spätere interne Prüfung.' },
  ]},

  { id: 'F', titel: 'Außenaufstellung & Standort', fragen: [
    { id: 'aussenflaeche_m2', label: 'Wie viel Außenfläche ist ungefähr verfügbar?', typ: 'zahl', einheit: 'm²', dq: 2, min: 10, max: 10000,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Unter 30 m² (Demo-Annahme) sind Container-Varianten gesperrt (R05).' },
    { id: 'aussenflaeche_typ', label: 'Welche Art von Außenfläche steht zur Verfügung?', typ: 'select', dq: 1,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      optionen: [
        { wert: 'hof', label: 'Hof / befestigte Fläche' },
        { wert: 'stellplatz', label: 'Stellplatz / Parkfläche' },
        { wert: 'garten', label: 'Garten / unbefestigte Fläche' },
        { wert: 'dach_garage', label: 'Dach / Garage / erhöhte Fläche' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Grobe Flächenart für die MVP-Placement-Einschätzung; ersetzt keine Statik- oder Ortsprüfung.' },
    { id: 'aussenflaeche_laenge_m', label: 'Wie lang ist die nutzbare Außenfläche ungefähr?', typ: 'zahl', einheit: 'm', dq: 1, min: 1, max: 100,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Nutzbares Rechteck als schnelle Plausibilisierung für Fundament, Einhausung oder Container.' },
    { id: 'aussenflaeche_breite_m', label: 'Wie breit ist die nutzbare Außenfläche ungefähr?', typ: 'zahl', einheit: 'm', dq: 1, min: 1, max: 100,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Nutzbares Rechteck als schnelle Plausibilisierung für Mindestbreiten der Aufstellvarianten.' },
    { id: 'zugang_logistik', label: 'Wie einfach sind Anlieferung und Montage am geplanten Standort?', typ: 'select', dq: 1,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      optionen: [
        { wert: 'einfach', label: 'einfach' },
        { wert: 'eingeschraenkt', label: 'eingeschränkt' },
        { wert: 'schwierig', label: 'schwierig' },
        { wert: 'unbekannt', label: 'unbekannt' },
      ],
      tooltip: 'Logistik beeinflusst vor allem Container- und Kranvarianten.' },
    { id: 'platz_prioritaet', label: 'Welche Priorität soll Sales für die Aufstellung setzen?', typ: 'select', dq: 0,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      optionen: [
        { wert: 'kosten_min', label: 'niedrigster Zusatz-CAPEX' },
        { wert: 'schall_robust', label: 'robuster Schallkorridor' },
        { wert: 'heizraum_entlasten', label: 'Heizraum entlasten' },
        { wert: 'container_bevorzugt', label: 'Container bevorzugen' },
        { wert: 'offen', label: 'noch offen' },
      ],
      tooltip: 'Sales-Priorität für die Empfehlung; die manuelle Auswahl bleibt weiterhin möglich.' },
    { id: 'aufstellvariante', label: 'Welche Aufstellvariante soll verglichen werden?', typ: 'select', dq: 2,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      optionen: [
        { wert: 'fundament', label: 'Standard-Fundament' },
        { wert: 'einhausung', label: 'Schutz-/Schall-Einhausung' },
        { wert: 'kompakt_container', label: 'Kompakt-Container' },
        { wert: 'vollcontainer', label: 'Vollcontainer' },
      ],
      tooltip: 'Zentrale Konfigurationsachse: CapEx vs. Schallschutz vs. Heizraumabhängigkeit.' },
    { id: 'schallhaube', label: 'Soll eine Standard-Schallhaube vorgesehen werden?', typ: 'select', optionen: JN, dq: 0,
      sichtbar: { feld: 'aufstellvariante', op: '=', wert: 'fundament' },
      tooltip: 'Nur bei Fundamentaufstellung: −8 dB (Demo) gegen Aufpreis.' },
    { id: 'entfernung_heizraum', label: 'Wie weit ist der WP-Standort vom Heizraum entfernt?', typ: 'zahl', einheit: 'm', dq: 1, min: 1, max: 500,
      sichtbar: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      tooltip: 'Lange Trassen erhöhen die Umfeldkosten (in v0.1 nur informativ).' },
    { id: 'kran_zugang', label: 'Ist Kran- oder Anlieferzugang möglich?', typ: 'select', optionen: JNU, dq: 1,
      sichtbar: { feld: 'aufstellvariante', op: 'in', wert: ['kompakt_container', 'vollcontainer'] },
      tooltip: 'Container brauchen Kranstellung und Anlieferweg.' },
  ]},

  { id: 'G', titel: 'Schall & Umfeld', fragen: [
    { id: 'abstand_fenster', label: 'Wie groß ist der Abstand zum nächsten Fenster oder Immissionsort?', typ: 'zahl', einheit: 'm', dq: 3, min: 0, max: 100,
      tooltip: 'Geht direkt in die Pegelabschätzung ein: −20·log10(r) (R18, Demo-Formel).' },
    { id: 'gebietstyp', label: 'Welcher Gebietstyp gilt für den Nachtgrenzwert?', typ: 'select', dq: 2,
      optionen: [
        { wert: 'WR', label: 'reines Wohngebiet (35 dB(A) nachts)' },
        { wert: 'WA', label: 'allgemeines Wohngebiet (40 dB(A) nachts)' },
        { wert: 'MI', label: 'Mischgebiet (45 dB(A) nachts)' },
      ],
      tooltip: 'Demo-Grenzwerte; keine rechtsverbindliche Schallberechnung.' },
    { id: 'schallsensibilitaet', label: 'Wie geräuschsensibel ist das Umfeld?', typ: 'select', dq: 0,
      optionen: [
        { wert: 'hoch', label: 'hoch' },
        { wert: 'mittel', label: 'mittel' },
        { wert: 'niedrig', label: 'niedrig' },
      ],
      tooltip: 'Weiches Kriterium für die interne Einschätzung (in v0.1 nur informativ).' },
  ]},

  { id: 'H', titel: 'Elektrik & Netzanschluss', fragen: [
    { id: 'netzanschluss_bekannt', label: 'Ist die Netzanschlussleistung bekannt?', typ: 'select', optionen: JN, dq: 3,
      tooltip: 'Unbekannter Netzanschluss löst Elektroprüfung aus und setzt Status mind. auf gelb (R08).' },
    { id: 'zaehlerschrank_ok', label: 'Ist der Zählerschrank voraussichtlich geeignet?', typ: 'select', optionen: JNU, dq: 1,
      tooltip: 'WP-Tarif braucht ggf. separaten Zähler.' },
    { id: 'kabelweg', label: 'Wie aufwendig ist der Kabelweg zwischen Heizraum und Zähler?', typ: 'select', dq: 1,
      optionen: [
        { wert: 'einfach', label: 'einfach' },
        { wert: 'mittel', label: 'mittel' },
        { wert: 'schwierig', label: 'schwierig' },
      ],
      tooltip: 'Information für das Elektro-Paket (v0.1: Pauschale).' },
  ]},

  { id: 'I', titel: 'Förderannahme', fragen: [
    { id: 'foerderung_annahme', label: 'Soll eine BEG-Förderung angenommen werden?', typ: 'select', dq: 2,
      optionen: [
        { wert: 'ja', label: 'ja (Contractor-Modell, 35 % Demo)' },
        { wert: 'nein', label: 'nein' },
        { wert: 'unsicher', label: 'unsicher' },
      ],
      tooltip: 'Demo-Förderlogik, keine Förderberatung. „unsicher" löst Förderprüfung aus (R13).' },
  ]},

  { id: 'J', titel: 'Betrieb & Monitoring', fragen: [
    { id: 'monitoring_variante', label: 'Welches Monitoring-Paket soll angesetzt werden?', typ: 'select', dq: 1,
      optionen: [
        { wert: 'basic', label: 'Monitoring Basic (verpflichtend)' },
        { wert: 'plus', label: 'Monitoring Plus (Basic + Erweiterung)' },
      ],
      tooltip: 'Basic ist verpflichtend; Plus ergänzt Sensorik und Reporting.' },
    { id: 'service_variante', label: 'Welches Servicepaket soll angesetzt werden?', typ: 'select', dq: 1,
      optionen: [
        { wert: 'basis', label: 'Service Basis (O&M 1,5 %/a Demo)' },
        { wert: 'komfort', label: 'Service Komfort (O&M 2,2 %/a Demo)' },
      ],
      tooltip: 'Laufende Kosten, gehen nicht ins einmalige LV ein (Opex).' },
    { id: 'fernablesung', label: 'Ist Fernablesung erforderlich?', typ: 'select', optionen: JNU, dq: 0,
      tooltip: 'In Monitoring Basic enthalten (Demo).' },
  ]},

  { id: 'K', titel: 'Vertrag & Angebot', fragen: [
    { id: 'vertragslaufzeit', label: 'Welche Vertragslaufzeit soll angesetzt werden?', typ: 'select', dq: 0,
      optionen: [
        { wert: '10', label: '10 Jahre', hinweis: 'Höherer Grundpreis, schnellere Amortisation.' },
        { wert: '15', label: '15 Jahre (Demo-Standard)', hinweis: 'Ausgewogener Demo-Standard.' },
        { wert: '20', label: '20 Jahre', hinweis: 'Niedrigerer Grundpreis, längere Bindung.' },
      ],
      tooltip: 'Bestimmt die Grundpreis-Annuität (Demo). Leer = 15 Jahre Default.' },
    { id: 'effizienzrisiko', label: 'Wer trägt das Effizienzrisiko der Wärmepumpe?', typ: 'select', dq: 0,
      optionen: [
        { wert: 'techem', label: 'Techem trägt das Risiko (Demo-Standard)', hinweis: 'Contracting-Wertversprechen: Effizienz liegt bei Techem.' },
        { wert: 'geteilt', label: 'Risiko geteilt', hinweis: 'Effizienzabweichungen werden zwischen den Parteien geteilt.' },
        { wert: 'kunde', label: 'Kunde trägt das Risiko', hinweis: 'Kunde trägt Effizienzabweichungen, meist günstigerer Preis.' },
      ],
      tooltip: 'Strukturierter Vertragsparameter (Demo). Leer = Techem trägt das Risiko.' },
  ]},
]

const PLAYBOOKS = {
  gebaeudetyp: {
    warum: 'Die Gebäudesituation setzt den Gesprächsrahmen für Platz, Schall und Standardfähigkeit.',
    warnsignale: 'Verdichtete Blockrandlagen, enge Höfe oder Nachbarschaftsnähe früh als Risiko markieren.',
    einordnung: 'Freistehend ist der Standardpfad. Innenstadtlage bleibt möglich, braucht aber mehr interne Prüfung.',
  },
  wohneinheiten: {
    warum: 'Die Wohneinheiten helfen Sales, Größenordnung und Richtwerte pro Einheit einzuordnen.',
    warnsignale: 'Sehr kleine oder sehr große Objekte können außerhalb des typischen Contracting-Korridors liegen.',
    einordnung: 'Die Zahl ist kein Ausschluss allein, erklärt aber Kostenkennzahlen und Gesprächserwartungen.',
  },
  flaeche: {
    warum: 'Die beheizte Fläche stützt Heizlast-Proxy und Kostenkennzahlen, wenn Verbrauchsdaten fehlen.',
    warnsignale: 'Unplausible Flächen im Verhältnis zu Wohneinheiten oder Verbrauch sollten nachgefragt werden.',
    einordnung: 'Eine belastbare Fläche macht die Richtindikation erklärbarer; Schätzwerte bleiben als Annahme kenntlich.',
  },
  baujahrklasse: {
    warum: 'Die Baujahrklasse liefert eine schnelle energetische Grobeinordnung für den Bedarf.',
    warnsignale: 'Stark modernisierte Altbauten oder unsichere Baujahre können den Proxy verzerren.',
    einordnung: 'Die Antwort ist ein Gesprächsanker, ersetzt aber keine Energie- oder Heizlastberechnung.',
  },
  sanierungsstand: {
    warum: 'Der Sanierungsstand beeinflusst die angenommene spezifische Heizlast im Demo-Modell.',
    warnsignale: 'Unklare oder widersprüchliche Angaben zu Dämmung, Fenstern und Dach sollten als Annahme markiert werden.',
    einordnung: 'Je besser der Sanierungsstand, desto plausibler werden niedrigere Vorlauftemperaturen und kleinere Leistung.',
  },
  heizraum_vorhanden: {
    warum: 'Der Heizraum bestimmt, ob Speicher, Hydraulik und Regelung im Bestand untergebracht werden können.',
    warnsignale: 'Kein Heizraum oder sehr knappe Räume erhöhen die Wahrscheinlichkeit für Container- oder Sonderlösungen.',
    einordnung: 'Ja unterstützt den Standardpfad; Nein verschiebt das Gespräch früh Richtung Aufstell- und Platzprüfung.',
  },
  aussenflaeche_vorhanden: {
    warum: 'Die Wärmepumpe braucht im MVP eine tragfähige Außenaufstellung.',
    warnsignale: 'Keine Außenfläche ist ein klarer Standardfit-Blocker im aktuellen Prototyp.',
    einordnung: 'Ja öffnet die Standortfragen; Nein erklärt direkt, warum kein Standardvorschlag entsteht.',
  },
  jahresverbrauch: {
    warum: 'Der Jahresverbrauch ist die wichtigste schnelle Quelle für Bedarf, Heizlastproxy und Energiekosten.',
    warnsignale: 'Leerwerte, grobe Schätzungen oder Ausreißer im Vergleich zur Fläche sollten nachgefasst werden.',
    einordnung: 'Gemessene Werte stärken die Richtindikation; fehlende Werte führen zu stärkerer Annahmenlogik.',
  },
  verbrauchsquelle: {
    warum: 'Die Quelle zeigt, wie belastbar der Verbrauchswert für ein Kundengespräch ist.',
    warnsignale: 'Schätzungen, unvollständige Jahre oder unklare Abrechnungsgrenzen senken die Aussagekraft.',
    einordnung: 'Abrechnung oder Messung ist der beste Gesprächsanker; unbekannt bleibt ein offener Punkt.',
  },
  ww_enthalten: {
    warum: 'Warmwasser im Verbrauch verändert die Vollbenutzungsstunden und damit den Heizlastproxy.',
    warnsignale: 'Unbekannte Warmwasseranteile können Bedarf und Leistung sichtbar verschieben.',
    einordnung: 'Bekannte Einordnung hilft Sales, Annahmen transparent zu erklären.',
  },
  ww_bereitung: {
    warum: 'Die Warmwasserbereitung entscheidet, ob ein Speicher-/WW-Modul im Scope landet.',
    warnsignale: 'Zentrale Warmwasserbereitung mit unklaren Speichern oder Hygieneanforderungen braucht spätere Klärung.',
    einordnung: 'Zentral erzwingt Scope; dezentral hält das Paket schlanker; unbekannt bleibt prüfpflichtig.',
  },
  heizlast_bekannt: {
    warum: 'Eine bekannte Heizlast macht die Leistungsauswahl belastbarer als ein Proxy.',
    warnsignale: 'Unbekannte Heizlast ist normal im Erstgespräch, darf aber nicht als Auslegung verkauft werden.',
    einordnung: 'Ja nutzt den angegebenen Wert; Nein bleibt als Richtindikation mit Annahme sichtbar.',
  },
  heizlast_kw: {
    warum: 'Die Heizlast steuert die Modulanzahl und ist zentral für die Vorlösung.',
    warnsignale: 'Sehr hohe oder sehr niedrige Werte im Verhältnis zu Fläche und Verbrauch prüfen lassen.',
    einordnung: 'Der Wert verbessert die Richtindikation, ersetzt aber keine finale technische Auslegung.',
  },
  technologiepfad: {
    warum: 'Der Technologiepfad grenzt das MVP klar auf den aktuell unterstützten Standardfall ein.',
    warnsignale: 'Monoenergetische oder sonstige Pfade sind Roadmap- bzw. Sonderfälle.',
    einordnung: 'Hybrid ist der Standardpfad. Andere Pfade erklären, warum die Demo keinen Standardfit ausgibt.',
  },
  gaskessel_vorhanden: {
    warum: 'Der Hybridpfad braucht einen Bestandskessel als Spitzenlast- und Backup-Komponente.',
    warnsignale: 'Kein oder ungeklärter Kessel stellt den Hybridpfad grundsätzlich infrage.',
    einordnung: 'Ja stützt den Hybridvorschlag; Nein lenkt früh in einen Sonderfall.',
  },
  kessel_zustand: {
    warum: 'Der Kesselzustand zeigt, ob der Bestand glaubwürdig weiter genutzt werden kann.',
    warnsignale: 'Schlecht oder unbekannt bedeutet: Restlaufzeit, Wartung und Einbindbarkeit klären.',
    einordnung: 'Gut/mittel ist gesprächsfähig; unbekannt löst interne Klärung aus.',
  },
  kessel_nutzbar: {
    warum: 'Die weitere Nutzbarkeit ist ein Kernkriterium für den Hybrid-Standardpfad.',
    warnsignale: 'Unklar oder nein kann Scope, Kosten und Standardfähigkeit deutlich verändern.',
    einordnung: 'Ja unterstützt den Vorschlag; unbekannt bleibt ein offener Prüfpunkt.',
  },
  anzahl_heizkreise: {
    warum: 'Die Zahl der Heizkreise ist ein einfacher Indikator für hydraulische Komplexität.',
    warnsignale: 'Mehr als zwei Heizkreise ist im MVP kein Standardfall.',
    einordnung: 'Bis zwei bleibt im Standardkorridor; mehr als zwei erklärt einen technischen Sonderfall.',
  },
  pufferspeicher_vorhanden: {
    warum: 'Ein vorhandener Puffer kann die spätere Hydraulikbewertung beeinflussen.',
    warnsignale: 'Unbekannte Speichergrößen oder Zustände nicht als belastbare Einsparung verkaufen.',
    einordnung: 'Die Antwort ist informativ; der Demo-Scope bleibt vorsichtig.',
  },
  vorlauftemp_klasse: {
    warum: 'Das Temperaturniveau entscheidet stark über Effizienz und technische Machbarkeit.',
    warnsignale: 'Über 65 °C ist ein klares Warnsignal für Standard-Hybrid und Effizienz.',
    einordnung: 'Niedrigere Klassen stärken den Fit; hohe oder unbekannte Werte brauchen Fachprüfung.',
  },
  heizkoerper_ausreichend: {
    warum: 'Heizflächen bestimmen, ob niedrige Vorlauftemperaturen realistisch sind.',
    warnsignale: 'Zu kleine Heizkörper können Komfort, Effizienz und Scope beeinflussen.',
    einordnung: 'Ja unterstützt den Fit; nein oder unbekannt bleibt im Gespräch als Annahme offen.',
  },
  hydraulischer_abgleich: {
    warum: 'Ein hydraulischer Abgleich ist relevant für Effizienz und Umsetzungsumfang.',
    warnsignale: 'Fehlender oder unbekannter Abgleich kann Zusatzaufwand bedeuten.',
    einordnung: 'Die Demo nimmt Aufwand im Hydraulikpaket auf, aber Sales sollte den Punkt benennen.',
  },
  heizraum_groesse_ok: {
    warum: 'Die Raumgröße entscheidet, ob Speicher und Hydraulik praktisch untergebracht werden können.',
    warnsignale: 'Zu klein kann Innenaufstellung blockieren und Containeroptionen attraktiver machen.',
    einordnung: 'Ja stützt den Standardpfad; nein macht den Standort zum wichtigen Prüfpunkt.',
  },
  zugang_ok: {
    warum: 'Zugang und Türbreiten entscheiden, ob Komponenten eingebracht werden können.',
    warnsignale: 'Enge Treppen, Türen oder verwinkelte Keller sind praktische Umsetzungsrisiken.',
    einordnung: 'Ja hält die Umsetzung plausibel; nein sollte nicht übergangen werden.',
  },
  platz_speicher: {
    warum: 'Speicherplatz ist besonders bei zentralem Warmwasser relevant.',
    warnsignale: 'Unklarer Platzbedarf kann Scope und Aufstellvariante verändern.',
    einordnung: 'Ja stabilisiert die Vorlösung; unbekannt bleibt eine Vor-Ort-Frage.',
  },
  rueckbau_noetig: {
    warum: 'Rückbau beeinflusst Umfeldmaßnahmen und spätere Aufwandsschätzung.',
    warnsignale: 'Asbest, sehr alte Anlagen oder enge Räume sind nicht im Demo-Modell abgedeckt.',
    einordnung: 'Die Antwort ist informativ und sollte als offener Punkt dokumentiert werden.',
  },
  aussenflaeche_m2: {
    warum: 'Die verfügbare Fläche begrenzt Standort und Containeroptionen.',
    warnsignale: 'Kleine Flächen, Fluchtwege, Stellplätze oder Eigentumsgrenzen früh klären.',
    einordnung: 'Mehr Fläche öffnet Varianten; wenig Fläche macht den Fit fragiler.',
  },
  aussenflaeche_typ: {
    warum: 'Die Flächenart zeigt, ob die Aufstellung eher Standardfläche, Gartenumbau oder Sonderprüfung ist.',
    warnsignale: 'Dächer, Garagen, unbefestigte Flächen oder ungeklärte Eigentumsgrenzen nicht als Standard verkaufen.',
    einordnung: 'Befestigte Hof- oder Stellflächen stützen die Empfehlung; Dach/Garage bleibt ein Fachprüfungshinweis.',
  },
  aussenflaeche_laenge_m: {
    warum: 'Die Länge macht aus Quadratmetern eine praktischere Aufstellflächenprüfung.',
    warnsignale: 'Schmale oder verwinkelte Restflächen können trotz ausreichender Quadratmeter unbrauchbar sein.',
    einordnung: 'Ausreichende Länge stabilisiert Fundament/Einhausung; Container brauchen mehr zusammenhängende Fläche.',
  },
  aussenflaeche_breite_m: {
    warum: 'Die Breite entscheidet, ob Wartungs- und Aufstellkorridore plausibel bleiben.',
    warnsignale: 'Sehr schmale Flächen, Durchgänge oder Fluchtwege früh als Standortthema markieren.',
    einordnung: 'Die Breite ergänzt die Flächenangabe und verhindert zu optimistische Standortannahmen.',
  },
  zugang_logistik: {
    warum: 'Anlieferung und Montage bestimmen, ob größere oder vorkonfektionierte Varianten realistisch sind.',
    warnsignale: 'Schwierige Zufahrt, Innenhöfe, enge Straßen oder fehlende Kranstellung können Container blockieren.',
    einordnung: 'Einfacher Zugang stützt alle Varianten; schwierige Logistik spricht gegen Container im MVP.',
  },
  platz_prioritaet: {
    warum: 'Die Priorität macht transparent, ob Sales Kosten, Schall oder Heizraumentlastung stärker gewichtet.',
    warnsignale: 'Eine Präferenz darf Blocker aus Schall, Fläche oder Logistik nicht überstimmen.',
    einordnung: 'Kostenminimum bleibt Standard; andere Prioritäten erklären bewusst teurere, aber passendere Varianten.',
  },
  aufstellvariante: {
    warum: 'Die Aufstellvariante verbindet Kosten, Schall, Platz und Heizraumabhängigkeit.',
    warnsignale: 'Varianten nicht als finale Empfehlung verkaufen, wenn Schall oder Fläche offen sind.',
    einordnung: 'Die Auswahl ist ein Vergleichspunkt im Gespräch und kann durch Regeln gesperrt werden.',
  },
  schallhaube: {
    warum: 'Die Schallhaube ist eine einfache Maßnahme für Fundamentaufstellung.',
    warnsignale: 'Sie ersetzt keine belastbare Schallprüfung und hilft nicht bei jedem Standort.',
    einordnung: 'Ja erhöht Scope/Kosten, kann aber den Gesprächskorridor stabilisieren.',
  },
  entfernung_heizraum: {
    warum: 'Die Entfernung beeinflusst Trassen, Umfeldmaßnahmen und praktische Umsetzung.',
    warnsignale: 'Lange Wege, Höhenversatz oder schwierige Durchbrüche können Aufwand erhöhen.',
    einordnung: 'Kurze Wege stützen den Standard; lange Wege als Annahme sichtbar halten.',
  },
  kran_zugang: {
    warum: 'Containerlösungen brauchen realistische Anlieferung und Kranstellung.',
    warnsignale: 'Kein Zugang, enge Straßen oder Innenhöfe können Container praktisch blockieren.',
    einordnung: 'Ja macht Container plausibler; unbekannt muss vor Variantenentscheidung geklärt werden.',
  },
  abstand_fenster: {
    warum: 'Der Abstand ist der wichtigste schnelle Input für die Demo-Schallabschätzung.',
    warnsignale: 'Sehr geringe Abstände oder mehrere Immissionsorte erhöhen das Risiko deutlich.',
    einordnung: 'Größerer Abstand entspannt den Korridor; kleine Werte führen zu Prüfbedarf.',
  },
  gebietstyp: {
    warum: 'Der Gebietstyp bestimmt den verwendeten Nachtgrenzwert in der Demo.',
    warnsignale: 'Unklare Gebietseinstufung oder sensible Nachbarschaft nicht rechtlich zusagen.',
    einordnung: 'Die Auswahl ist eine Vorprüfung, keine rechtsverbindliche Schallbewertung.',
  },
  schallsensibilitaet: {
    warum: 'Die gefühlte Sensibilität hilft Sales, Gesprächsrisiken früh zu erkennen.',
    warnsignale: 'Beschwerden, enge Nachbarschaft oder hochwertige Innenhöfe vorsichtig behandeln.',
    einordnung: 'Informativ: beeinflusst v0.1 nicht hart, ist aber wichtig für Erwartungsmanagement.',
  },
  netzanschluss_bekannt: {
    warum: 'Die Anschlussleistung ist ein früher Elektro-Blocker oder offener Prüfpunkt.',
    warnsignale: 'Unbekannte Leistung nicht als unkritisch darstellen.',
    einordnung: 'Ja stützt die Vorlösung; nein löst interne Elektroklärung aus.',
  },
  zaehlerschrank_ok: {
    warum: 'Der Zählerschrank kann Zusatzaufwand für WP-Tarif oder Messkonzept erzeugen.',
    warnsignale: 'Alte Anlagen, Platzmangel oder unbekannte Eigentumsgrenzen früh markieren.',
    einordnung: 'Ja reduziert Unsicherheit; unbekannt bleibt eine Vor-Ort-Frage.',
  },
  kabelweg: {
    warum: 'Der Kabelweg beeinflusst Elektroaufwand und Umsetzbarkeit.',
    warnsignale: 'Schwierige Wege, Brandschutzabschnitte oder lange Strecken können Aufwand treiben.',
    einordnung: 'Einfach hält den Korridor stabil; schwierig sollte Sales als Risiko benennen.',
  },
  foerderung_annahme: {
    warum: 'Die Förderannahme verändert die Netto-Richtindikation sichtbar.',
    warnsignale: 'Unsicher oder nein darf nicht als Förderberatung missverstanden werden.',
    einordnung: 'Ja ist Demo-Annahme; unsicher löst Förderprüfung aus; nein zeigt konservativeres Netto.',
  },
  monitoring_variante: {
    warum: 'Monitoring ist Teil des betreibbaren Systempakets und unterstützt spätere Betriebsqualität.',
    warnsignale: 'Zusatzwünsche oder Reporting-Erwartungen können über Basic hinausgehen.',
    einordnung: 'Basic ist Standard; Plus ist ein Gesprächspunkt für höheren Informationsbedarf.',
  },
  service_variante: {
    warum: 'Service beeinflusst laufende Kosten und Erwartung an Betriebssicherheit.',
    warnsignale: 'Komfortwünsche nicht mit einmaligem CAPEX vermischen.',
    einordnung: 'Basis hält die Demo schlank; Komfort erhöht OPEX-Indikation.',
  },
  fernablesung: {
    warum: 'Fernablesung klärt, ob zusätzliche Betriebs- oder Messanforderungen erwartet werden.',
    warnsignale: 'Unklare Messkonzepte oder besondere Reportingwünsche später konkretisieren.',
    einordnung: 'In Basic enthaltene Annahme, aber für Kundenerwartungen im Gespräch nützlich.',
  },
}

const p = (warum, warnsignale, einordnung) => ({ warum, warnsignale, einordnung })

const PLAYBOOKS_KURZ = {
  gebaeudetyp: p('Setzt den Rahmen für Platz, Schall und Standardfit.', 'Innenstadt, enge Höfe oder direkte Nachbarn.', 'Freistehend ist Standard; verdichtet braucht Prüfung.'),
  wohneinheiten: p('Ordnet Objektgröße und Richtwerte pro WE ein.', 'Sehr kleine oder sehr große Objekte.', 'Erklärt Kennzahlen, ist allein kein Ausschluss.'),
  anzahl_gebaeude: p('Klärt früh, ob nur ein Gebäude versorgt wird.', 'Mehr als ein Gebäude ist im MVP kein Standardfit.', 'Ein Gebäude ist Standard; mehrere sind Sonderfall.'),
  flaeche: p('Stützt Heizlastproxy und Kosten pro m².', 'Fläche passt nicht zu WE oder Verbrauch.', 'Schätzwert klar als Annahme führen.'),
  baujahrklasse: p('Gibt eine schnelle energetische Einordnung.', 'Modernisierung passt nicht zur Baujahrklasse.', 'Nur Gesprächsanker, keine Berechnung.'),
  sanierungsstand: p('Beeinflusst den Heizlastproxy im Demo-Modell.', 'Unklare Dämmung, Fenster oder Dachzustand.', 'Besser saniert stärkt Temperatur- und Leistungsfit.'),
  heizraum_vorhanden: p('Klärt Platz für Hydraulik, Speicher und Regelung.', 'Kein oder sehr knapper Heizraum.', 'Ja stützt Standard; nein lenkt zu Standortprüfung.'),
  aussenflaeche_vorhanden: p('MVP braucht eine Außenaufstellung.', 'Keine belastbare Außenfläche.', 'Ja öffnet Standortfragen; nein blockiert Standardfit.'),
  jahresverbrauch: p('Beste schnelle Basis für Bedarf und Energiekosten.', 'Schätzung, Leerwert oder klarer Ausreißer.', 'Gemessen stärkt die Richtindikation.'),
  verbrauchsquelle: p('Bewertet die Belastbarkeit des Verbrauchs.', 'Schätzung oder unklare Abrechnungsgrenze.', 'Messung ist stark; unbekannt bleibt offen.'),
  ww_enthalten: p('Steuert den Heizlastproxy über Vollbenutzungsstunden.', 'Warmwasseranteil unbekannt.', 'Bekannte Einordnung macht Annahmen erklärbar.'),
  ww_bereitung: p('Entscheidet über Speicher-/WW-Scope.', 'Zentrale WW-Anlage mit unklarem Bestand.', 'Zentral erzwingt Scope; dezentral hält ihn schlanker.'),
  heizlast_bekannt: p('Verbessert die Leistungsauswahl gegenüber Proxy.', 'Keine Heizlast als Auslegung verkaufen.', 'Ja nutzt Eingabe; nein bleibt Richtindikation.'),
  heizlast_kw: p('Steuert WP-Modulanzahl und Leistungskorridor.', 'Wert passt nicht zu Fläche oder Verbrauch.', 'Hilft stark, ersetzt keine finale Auslegung.'),
  technologiepfad: p('Grenzt den unterstützten MVP-Pfad ab.', 'Alles außerhalb Hybrid ist Sonderfall.', 'Hybrid ist Standard; andere Pfade blockieren MVP-Fit.'),
  gaskessel_vorhanden: p('Hybrid braucht den Kessel als Spitzenlast.', 'Kein oder ungeklärter Bestandskessel.', 'Ja stützt Hybrid; nein ist Sonderfall.'),
  kessel_zustand: p('Prüft, ob der Bestand glaubwürdig weiterläuft.', 'Schlecht, alt oder Zustand unbekannt.', 'Gut/mittel ist besprechbar; unbekannt klären.'),
  kessel_nutzbar: p('Kernkriterium für den Hybrid-Standardpfad.', 'Nein oder unklar verändert Scope und Fit.', 'Ja stützt Vorschlag; unbekannt bleibt Prüfpunkt.'),
  anzahl_heizkreise: p('Zeigt hydraulische Komplexität früh.', 'Mehr als zwei Heizkreise.', 'Bis zwei Standard; darüber MVP-Sonderfall.'),
  pufferspeicher_vorhanden: p('Hilft bei der späteren Hydraulikbewertung.', 'Größe oder Zustand unbekannt.', 'Informativ; Demo bleibt vorsichtig.'),
  vorlauftemp_klasse: p('Treiber für Effizienz und Machbarkeit.', 'Über 65 °C oder unbekannt.', 'Niedrig stärkt Fit; hoch braucht Prüfung.'),
  heizkoerper_ausreichend: p('Zeigt, ob niedrige Temperaturen plausibel sind.', 'Zu kleine Heizflächen.', 'Ja stützt Fit; nein bleibt Annahme.'),
  hydraulischer_abgleich: p('Relevant für Effizienz und Hydraulik-Scope.', 'Fehlend oder unbekannt.', 'Im Paket mitdenken, im Gespräch benennen.'),
  heizraum_groesse_ok: p('Klärt Platz für Speicher und Hydraulik.', 'Zu klein oder schwer nutzbar.', 'Ja stützt Standard; nein macht Standort kritisch.'),
  zugang_ok: p('Klärt, ob Komponenten eingebracht werden können.', 'Enge Türen, Treppen oder verwinkelte Keller.', 'Nein nicht übergehen; Fachprüfung einplanen.'),
  platz_speicher: p('Wichtig bei zentralem Warmwasser.', 'Unklarer Platz oder konkurrierende Nutzung.', 'Ja stabilisiert Scope; unbekannt vor Ort klären.'),
  rueckbau_noetig: p('Zeigt möglichen Zusatzaufwand im Bestand.', 'Altlasten, enge Räume oder Sonderrückbau.', 'Informativ, als offenen Punkt führen.'),
  aussenflaeche_m2: p('Begrenzt Standort- und Containeroptionen.', 'Kleine Flächen, Fluchtwege, Grenzen.', 'Mehr Fläche öffnet Varianten.'),
  aussenflaeche_typ: p('Unterscheidet Standardfläche und Sonderstandort.', 'Dach, Garage, Garten oder Eigentumsgrenzen.', 'Befestigt stützt; Dach/Garage prüfpflichtig.'),
  aussenflaeche_laenge_m: p('Macht Fläche als Rechteck plausibel.', 'Zu kurz, verwinkelt oder nur Restfläche.', 'Container brauchen längere zusammenhängende Fläche.'),
  aussenflaeche_breite_m: p('Sichert Wartungs- und Aufstellkorridore ab.', 'Zu schmal, Durchgang oder Fluchtweg.', 'Ergänzt m² und verhindert Scheinsicherheit.'),
  zugang_logistik: p('Bewertet Anlieferung und Montage.', 'Enge Zufahrt, Innenhof oder fehlender Kran.', 'Einfach stützt; schwierig blockiert Container eher.'),
  platz_prioritaet: p('Macht die Sales-Gewichtung transparent.', 'Präferenz darf Blocker nicht überstimmen.', 'Kostenminimum bleibt Default.'),
  aufstellvariante: p('Verbindet Kosten, Schall, Platz und Heizraum.', 'Variante bei offenen Blockern nicht verkaufen.', 'Auswahl ist Vergleichspunkt, keine Freigabe.'),
  schallhaube: p('Einfache Schallmaßnahme bei Fundament.', 'Ersetzt keine Schallprüfung.', 'Erhöht Scope, kann Korridor stabilisieren.'),
  entfernung_heizraum: p('Zeigt Trassen- und Umfeldaufwand.', 'Lange Wege oder schwierige Durchbrüche.', 'Kurze Wege stützen Standard; lange als Annahme.'),
  kran_zugang: p('Container brauchen Anlieferung und Kranstellung.', 'Kein Zugang, enge Straße oder Innenhof.', 'Ja stützt Container; unbekannt vorher klären.'),
  abstand_fenster: p('Wichtigster Schnellinput für Schall.', 'Kleine Abstände oder mehrere Immissionsorte.', 'Mehr Abstand entspannt den Korridor.'),
  gebietstyp: p('Setzt den Demo-Nachtgrenzwert.', 'Gebietseinstufung unklar.', 'Vorprüfung, keine Rechtsaussage.'),
  schallsensibilitaet: p('Erfasst Gesprächsrisiko im Umfeld.', 'Beschwerden, Innenhöfe, sensible Nachbarn.', 'Weiches Kriterium für Erwartungsmanagement.'),
  netzanschluss_bekannt: p('Früher Elektro-Blocker oder Prüfpunkt.', 'Anschlussleistung unbekannt.', 'Ja stützt; nein löst Elektroklärung aus.'),
  zaehlerschrank_ok: p('Zeigt Aufwand für Tarif und Messkonzept.', 'Altanlage, Platzmangel oder unklarer Zustand.', 'Ja senkt Unsicherheit; unbekannt vor Ort klären.'),
  kabelweg: p('Beeinflusst Elektroaufwand und Umsetzung.', 'Lange Wege oder Brandschutzabschnitte.', 'Schwierig als Risiko benennen.'),
  foerderung_annahme: p('Verändert die Netto-Richtindikation.', 'Nicht als Förderberatung darstellen.', 'Ja ist Demo; unsicher braucht Förderprüfung.'),
  monitoring_variante: p('Setzt den Betriebsdaten-Umfang.', 'Reportingwünsche über Basic hinaus.', 'Basic ist Standard; Plus bei höherem Bedarf.'),
  service_variante: p('Beeinflusst laufende Kosten und Betriebserwartung.', 'Komfort nicht mit CAPEX vermischen.', 'Basis schlank; Komfort erhöht OPEX.'),
  fernablesung: p('Klärt Mess- und Betriebsanforderungen.', 'Unklare Reporting- oder Messwünsche.', 'In Basic angenommen, Erwartung trotzdem klären.'),
  vertragslaufzeit: p('Die Laufzeit verteilt die Investition und bestimmt den Grundpreis je Jahr.', 'Sehr kurze Laufzeiten treiben den Grundpreis und können das Angebot kippen.', '15 Jahre ist Demo-Standard; 10 oder 20 Jahre verschieben den Grundpreis.'),
  effizienzrisiko: p('Klärt, wer Abweichungen von der erwarteten WP-Effizienz wirtschaftlich trägt.', 'Unklare Risikoverteilung führt später zu Streit über Wärmekosten und JAZ.', 'Techem-Übernahme ist das Contracting-Standardversprechen; Alternativen prüfen.'),
}

const mitPlaybook = (frage) => ({
  ...frage,
  optionen: frage.optionen?.map(option => ({
    ...option,
    hinweis: optionHinweis(frage, option),
  })),
  playbook: PLAYBOOKS_KURZ[frage.id] ?? PLAYBOOKS[frage.id],
})

export const SEKTIONEN = SEKTIONEN_ROH.map(sektion => ({
  ...sektion,
  fragen: sektion.fragen.map(mitPlaybook),
}))

// Flache Liste aller Fragen (für Engine/DQ-Score)
export const ALLE_FRAGEN = SEKTIONEN.flatMap(s => s.fragen.map(f => ({ ...f, sektion: s.id })))
