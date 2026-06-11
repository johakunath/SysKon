// Datenebene 2/3: Regelsatz R01–R18 (HANDOVER §4, Schema §2.2).
//
// Bedingungs-DSL (`wenn`):
//   { feld, op, wert }            op: '=' '!=' '>' '>=' '<' '<=' 'in' 'nicht_in' 'nicht_leer'
//                                 '!=' feuert nur bei beantwortetem Feld (leer ≠ Negativ-Treffer)
//   { und: [bedingung, ...] }     alle müssen zutreffen
//   { oder: [bedingung, ...] }    mindestens eine trifft zu
//   `feld` greift auf Eingaben UND Zwischenergebnisse (calc.ableiten) zu.
//
// Wirkungen (`dann`, einzeln oder als Liste – manche Handover-Regeln koppeln warn+status):
//   { typ:'require', modul }                          Modul/LV-Position erzwingen
//   { typ:'exclude', ziel, wert }                     Option(en) sperren; wert: String, Liste
//                                                     oder '@feld' (Liste aus Zwischenergebnis)
//   { typ:'warn', kategorie, text }                   kategorie: 'pe' | 'engineering' | 'foerderung' | 'hinweis'
//   { typ:'status', wert }                            'gruen'|'gelb'|'orange'|'rot' oder '@feld';
//                                                     Engine nimmt immer die schlechteste Stufe.
// Konfliktauflösung: exclude schlägt require (Engine).

export const REGELN = [
  {
    id: 'R01',
    wenn: { feld: 'technologiepfad', op: '=', wert: 'hybrid' },
    dann: { typ: 'warn', kategorie: 'pe', text: 'Bestandskesselprüfung erforderlich (Zustand, Restlaufzeit, Einbindbarkeit).' },
    begruendung: 'Hybrid nutzt den Bestandskessel weiter – Eignung muss geprüft werden.',
  },
  {
    id: 'R02',
    wenn: { feld: 'technologiepfad', op: '=', wert: 'hybrid' },
    dann: { typ: 'warn', kategorie: 'foerderung', text: 'Fossile Einheit ist nicht förderfähig (Förderanteil 0 %, im Katalog hinterlegt).' },
    begruendung: 'BEG-Demo-Logik: nur der erneuerbare Teil ist förderfähig.',
  },
  {
    id: 'R03',
    wenn: { feld: 'ww_bereitung', op: '=', wert: 'zentral' },
    dann: { typ: 'require', modul: 'speicher_ww' },
    begruendung: 'Zentrale Warmwasserbereitung erfordert das Speicher-/WW-Modul.',
  },
  {
    id: 'R04',
    wenn: { feld: 'anzahl_heizkreise', op: '>', wert: 2 },
    dann: { typ: 'status', wert: 'rot' },
    begruendung: 'MVP unterstützt maximal zwei Heizkreise – Engineering-Sonderfall.',
  },
  {
    id: 'R05',
    wenn: { und: [
      { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      { feld: 'aussenflaeche_m2', op: '<', wert: '@flaeche_min_container' },
    ]},
    dann: { typ: 'exclude', ziel: 'aufstellvariante', wert: ['kompakt_container', 'vollcontainer'] },
    begruendung: 'Außenfläche unzureichend für Container-Varianten.',
  },
  {
    id: 'R06',
    wenn: { und: [
      { feld: 'gebaeudetyp', op: '=', wert: 'innenstadt' },
      { feld: 'schall_ampel_aktiv', op: 'in', wert: ['gelb', 'orange'] },
    ]},
    dann: [
      { typ: 'status', wert: 'orange' },
      { typ: 'warn', kategorie: 'engineering', text: 'Innenstadtlage mit kritischer Schallsituation – Engineering-Prüfung.' },
    ],
    begruendung: 'Verdichtete Lage plus Schallrisiko ist kein Standardfall.',
  },
  {
    id: 'R07',
    wenn: { feld: 'schall_gesperrte_varianten', op: 'nicht_leer' },
    dann: { typ: 'exclude', ziel: 'aufstellvariante', wert: '@schall_gesperrte_varianten' },
    begruendung: 'Aufstellvarianten, deren geschätzter Pegel den Grenzwert um mehr als das Ampelband überschreitet, werden gesperrt (Schallmaßnahme oder Variantenwechsel nötig).',
  },
  {
    id: 'R08',
    wenn: { feld: 'netzanschluss_bekannt', op: '=', wert: 'nein' },
    dann: [
      { typ: 'warn', kategorie: 'engineering', text: 'Elektro-/Netzanschlussprüfung erforderlich (Anschlussleistung unbekannt).' },
      { typ: 'status', wert: 'gelb' },
    ],
    begruendung: 'Ohne Netzanschlussdaten kein belastbares Elektro-Paket.',
  },
  {
    id: 'R09',
    wenn: { feld: 'vorlauftemp_klasse', op: 'in', wert: ['66-70', '>70'] },
    dann: [
      { typ: 'warn', kategorie: 'engineering', text: 'Vorlauftemperatur über 65 °C – Standard-Hybrid nur nach Engineering-Prüfung.' },
      { typ: 'status', wert: 'orange' },
    ],
    begruendung: 'Hohe Vorlauftemperatur gefährdet WP-Effizienz und Auslegung.',
  },
  {
    id: 'R10',
    wenn: { feld: 'dq_score', op: '<', wert: '@dq_schwelle' },
    dann: [
      { typ: 'status', wert: 'gelb' },
      { typ: 'warn', kategorie: 'pe', text: 'Datenqualität unter 60 % – kein belastbares Richt-LV.' },
    ],
    begruendung: 'Status wird bei niedriger Datenqualität mindestens auf gelb gedeckelt.',
  },
  {
    id: 'R11',
    wenn: { und: [
      { feld: 'gebaeudetyp', op: '=', wert: 'freistehend' },
      { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'ja' },
      { feld: 'schall_ampel_aktiv', op: '=', wert: 'gruen' },
      { feld: 'anzahl_heizkreise', op: '<=', wert: 2 },
      { feld: 'kessel_nutzbar', op: '=', wert: 'ja' },
      { feld: 'verbrauchsquelle', op: '=', wert: 'abrechnung' },
      { feld: 'ww_bereitung', op: 'in', wert: ['zentral', 'dezentral'] },
      { feld: 'netzanschluss_bekannt', op: '=', wert: 'ja' },
    ]},
    dann: { typ: 'status', wert: 'gruen' },
    begruendung: 'Alle Grün-Kriterien erfüllt: Richt-LV-fähig (sofern keine andere Regel verschlechtert).',
  },
  {
    id: 'R12',
    wenn: { oder: [
      { feld: 'kessel_zustand', op: '=', wert: 'unbekannt' },
      { feld: 'kessel_nutzbar', op: '=', wert: 'unbekannt' },
    ]},
    dann: { typ: 'status', wert: 'gelb' },
    begruendung: 'Bestandskesselzustand unbekannt – PE-Prüfung nötig.',
  },
  {
    id: 'R13',
    wenn: { feld: 'foerderung_annahme', op: '=', wert: 'unsicher' },
    dann: [
      { typ: 'warn', kategorie: 'foerderung', text: 'Förderfähigkeit unsicher – Förderprüfung vor Richt-LV-Versand.' },
      { typ: 'status', wert: 'gelb' },
    ],
    begruendung: 'Unsichere Förderung verändert das Netto-LV erheblich.',
  },
  {
    id: 'R14',
    wenn: { feld: 'heizlast_geschaetzt', op: '=', wert: true },
    dann: { typ: 'status', wert: 'gelb' },
    begruendung: 'Heizlast nur per Proxy geschätzt – Auslegung vorläufig.',
  },
  {
    id: 'R15',
    wenn: { und: [
      { oder: [
        { feld: 'heizraum_groesse_ok', op: '=', wert: 'nein' },
        { feld: 'zugang_ok', op: '=', wert: 'nein' },
      ]},
      { feld: 'aufstellvariante', op: 'nicht_in', wert: ['kompakt_container', 'vollcontainer'] },
    ]},
    dann: [
      { typ: 'status', wert: 'orange' },
      { typ: 'warn', kategorie: 'engineering', text: 'Heizraumgröße oder Zugang problematisch – Container-Variante prüfen oder Engineering.' },
    ],
    begruendung: 'Fundament/Einhausung hängen stark vom Heizraum ab; Container entlasten ihn.',
  },
  {
    id: 'R16',
    wenn: { feld: 'aussenflaeche_vorhanden', op: '=', wert: 'nein' },
    dann: { typ: 'status', wert: 'rot' },
    begruendung: 'MVP setzt Außenaufstellung voraus – ohne Außenfläche keine Standardlösung.',
  },
  {
    id: 'R17',
    wenn: { feld: 'technologiepfad', op: '!=', wert: 'hybrid' },
    dann: { typ: 'status', wert: 'rot' },
    begruendung: 'Technologiepfad außerhalb MVP v0.1 (monoenergetisch ist Roadmap-Platzhalter).',
  },
  {
    id: 'R18',
    wenn: { feld: 'schall_ampel_aktiv', op: 'in', wert: ['gelb', 'orange'] },
    dann: { typ: 'status', wert: '@schall_status' },
    begruendung: 'Schall-Ampel: Lp = LW_Kaskade − 20·log10(r) − 8 − Abschlag; gelb = prüfpflichtig, orange = Engineering. Demo-Abschätzung, keine rechtsverbindliche Schallberechnung.',
  },
]
