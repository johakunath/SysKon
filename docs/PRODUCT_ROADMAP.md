# Product Roadmap

Kompakte Produktlinie nach dem Konzept-Pivot. Das alte Handover bleibt als Archiv und technische Quelle erhalten; diese Roadmap beschreibt die aktuelle strategische Richtung.

## Produktfokus

SysKon ist zuerst ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche, kein PE-Handover- oder Planungstool.

- Sales Tool first, PE engine underneath.
- Unterstützung im Kundengespräch, keine Customer-Self-Service-Bestellstrecke.
- Frühe Konfiguration und Erklärung, kein finales Angebot und keine technische Ausführungsplanung.
- Richtpreis, Lösungskorridor und nächster sinnvoller Schritt statt verbindlichem Angebot.
- PE-/Engineering-Logik bleibt wichtig, aber als interne Guardrails unter der sichtbaren Sales-Experience.

## Stage 0: Aktuelle Demo bereinigen

Ziel: Der bestehende Prototyp soll keine Reife-, Übergabe- oder Angebotsversprechen senden, die er fachlich noch nicht tragen kann.

- Handover- und Operational-Readiness-Signale entfernen oder deutlich de-emphasizen.
- Ergebnis-Semantik so schärfen, dass Analyse, Vorlösung, Richtindikation und Prüfbedarf klar getrennt sind.
- Ergebnis und Preview als Sales-Unterstützung und interne Vorprüfung darstellen, nicht als Kundenangebot.
- Admin-, Annahmen-, Regeln- und Testbereiche hinter dem Admin-Modus halten.

## Stage 1: Sales-Gesprächskonfigurator

Primärer nächster Zielzustand.

- Sales und Kunde gehen gemeinsam durch Gebäude-, Bestands- und Präferenzfragen.
- Fragen sind geführt, kundennah gruppiert und zeigen nur relevante Folgefragen.
- Die Live-Preview erklärt mögliche Lösungspfade, Ausschlüsse, Risiken und internen Prüfbedarf.
- Die Anzeige bleibt ein Lösungskorridor, kein finaler technischer Plan.
- CAPEX, O&M und Wärmekosten erscheinen nur als grobe Demo-/Richtindikation.
- Der nächste Schritt ist klar: interne Prüfung möglich, weitere Daten nötig oder kein Standardfit.
- Tooltips erklären, warum Fragen gestellt werden und wie Sales die Antwort einordnen kann.
- PE-/Engineering-Prüfungen laufen als interne Guardrails mit, ersetzen aber keine Fachprüfung.

Wichtig: Sales darf mit dem Tool kein verbindliches Angebot allein erzeugen. SysKon reduziert Reibung vor PE, ersetzt PE aber nicht.

## Stage 2: CTO-/LV-Engine hinter dem Sales-Workflow

Ziel: Die modulare Configure-to-Order-Logik bleibt als belastbarer Kern erhalten, tritt aber visuell hinter die Sales-Führung zurück.

- Komponenten- und Paketlogik für Wärmepumpe, Hybrid-Einbindung, Hydraulik, Warmwasser, Aufstellvariante, Monitoring und Service.
- Regeln, Ausschlüsse, Abhängigkeiten und Kostenannahmen.
- Förderfähigkeitslogik als indikative interne Prüfung, ohne Förderzusage.
- Internes LV und Scope-Generierung für PE-/Engineering-Review.
- Review- und Prüfpunktlogik als Backend-Fähigkeit, nicht als dominanter Hauptscreen.

## Stage 3: Contracting-Angebotslogik

**Kernengine bereits implementiert** (SK-70, als interne Guardrail-Fähigkeit hinter `sichtModus='intern'`,
seither erweitert um SK-101): GP/AP-Logik mit iterativer Arbeitspreismarge bis zur Ziel-IRR (13 %,
Ambition 15 %), Marge ausschließlich auf den Arbeitspreis (keine Marge auf CapEx/Grundpreis),
AVBFernwärme-orientierte §24-Preisgleitformel. Vertragstyp-Weiche (SK-101): AVB-Fernwärme bindet
die Laufzeit fest auf 10 Jahre und nutzt die §24-Formel; Individualvertrag erlaubt 10/15/20 Jahre
und eine frei ausgehandelte Preisanpassung. Ein AVB-Angebot muss dabei immer verfügbar sein,
Individualvertrag wird mit dem Kunden verhandelt.

Weiterhin späterer Ausbau (bewusst nicht MVP):

- Opex, Finanzierung, Preisentwicklung und Erlöslogik als primärer statt interner Bestandteil.
- Recherche zu Indizes wie Lohn, Strom, Gas und Inflation (aktuell Basisjahr-Platzhalter, Faktor 1).
- Finale AVBFernwärme-/Rechtsfreigabe – ersetzt weiterhin keine juristische Prüfung.

## Parallel: Regressionstest-Umgebung

Kein linearer Stage-Gate, sondern Produktqualitätsmechanismus.

- Eine Konfiguration mit Ergebnis als Testfall speichern.
- Repräsentative Testfall-Sets pflegen.
- Nach Regel-, Preis- oder Produktänderungen alle Testfälle neu berechnen.
- Neue Ausgabe gegen Referenzlauf vergleichen.
- Unterschiede in Komponenten, Kosten, Förderlogik, Status und später GP/AP/IRR sichtbar machen.

## Spätere Plattformthemen

- Admin-Backend für Regeln, Annahmen, Komponentenkatalog und Versionierung.
- CRM-Input und CRM-Output.
- Import aus Gebäudedatenerfassung oder Customer-Intake.
- Export zurück in CRM, internen Angebotsprozess und später Installation/Operations.
- Skalierung auf weitere Technologien.
- Governance: Product owns; PE, Engineering, Procurement, Finance und Legal unterstützen.
- **Moonshot-Idee: Visuelle Systemvorschau.** Statt reiner Tabellen/Listen ein zusammengesetztes
  Bild der gewählten Komponenten in der Live-Preview zeigen (z. B. Aufstellvariante-Szene +
  Icons für Modulanzahl, Hydraulik, Monitoring). Entscheidung: vorgefertigte/handgezeichnete
  Illustrationen (ein Satz Szenen je Aufstellvariante + Icon-Set), programmatisch je nach
  Konfiguration zusammengesetzt – **keine** KI-Bildgenerierung (Konsistenz- und Kostenrisiko,
  neue Abhängigkeit). Bleibt eine schematische Illustration, keine Standort-/3D-Berechnung
  (siehe Schutzplanke unten). Aufwand: Design-Vorlauf für die Basis-Assets nötig.

## Qualitäts- und Hygienethemen (aus PR-Review Juni 2026)

Lücken, die kein Feature-Ticket besitzt, aber die Produktqualität und -sicherheit betreffen. Dokumentiert nach dem Review der letzten ~7 PRs.

- **CI / Merge-Gate (aktiv als SK-83):** Bis Juni 2026 gab es keinen automatischen Testlauf vor dem Merge; PRs wurden Sekunden nach Erstellung gemergt. SK-83 führt `npm test` + `npm run build` als GitHub-Actions-Gate ein.
- **Tech-Debt-Pflege:** `src/screens/Handover.jsx` (≈115 Zeilen) ist nach dem Sales-Pivot verwaist und nicht mehr von `App.jsx` referenziert — entfernen oder bewusst als Referenz markieren. Außerdem die Datenschicht-Grenze nachschärfen: `src/data/adminConfig.js` greift inzwischen auf `window`/`localStorage` zu, was die „src/data bleibt React-/Browser-frei"-Intention aufweicht.
- **Disclaimer- und Wording-Governance (teilweise adressiert, WP15):** Die screen-übergreifenden Demo-Sicherheitstexte (App-Footer, Analyse-Limits, Handover-Fußnote) liegen seit WP15 zentral in `src/data/texte.js`; die kundensichere Wortwahl (`kundenPreviewText`) ist ein gemeinsamer Helfer in `src/screens/format.js`. Offen bleibt, fachliche Demo-Texte aus `engine.js`, `calc.js` und `katalog.js` schrittweise an dieselbe Quelle anzubinden, damit kein PR versehentlich verbindlich klingende Kundenaussagen einführt.
- **Planungstool-Stop-line:** SysKon bleibt Sales-/Vorqualifizierungstool. Standort-, Sizing- und Placement-Logik nicht weiter in die Engine ziehen; Kartografie/LiDAR/3D bleiben Integrations-/Recherchethemen (siehe WP12-Notiz).

## Dauerhafte Schutzplanken

- Nur Demo-Annahmen, keine produktiven Kalkulationswerte.
- Richtpreis-Angebot (Demo) zur internen Konzeptabstimmung – Werte sind Richtwerte, kein freigegebenes Festpreisangebot. (WP16, Juni 2026: das frühere „kein verbindliches Kundenangebot"-Non-Goal wurde vom PO aufgehoben.)
- Keine Rechts-, Förder- oder Schallgarantie.
- Keine echten Kundendaten.
- Keine Kundenselbstbedienung ohne Sales-/interne Prüfung.
- Kein Planungstool: keine eigene Standort-/LiDAR-/3D-Placement-Berechnung in der Engine.
