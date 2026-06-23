# Backlog Work Packages

Dieses Dokument enthält die Detailansicht. `BACKLOG.md` bleibt der mobile Einstieg.

Aktueller Produktfokus: SysKon ist zuerst ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche. PE-, LV- und Engineering-Logik bleiben als interne Guardrails wichtig, sind aber nicht der sichtbare Hauptworkflow. Roadmap: `docs/PRODUCT_ROADMAP.md`.

Regel für "next epic": Wähle das erste nicht erledigte Epic aus `BACKLOG.md`, dann hier das erste Child mit `In Progress`; falls keines existiert, das erste Child mit `Todo`.

Umfangsregel: Der Agent plant zuerst. Wenn der Nutzer einen zusammenhängenden Scope freigibt, dürfen mehrere Child-Tickets in einem PR umgesetzt werden. Dabei gilt: mutig bündeln, aber keine fachfremden Änderungen einschleppen.

Token-Regel: Erledigte Work Packages und erledigte Child-Tickets stehen nicht dauerhaft in diesem aktiven Detaildokument. Nach Abschluss werden sie nach `docs/BACKLOG_ARCHIVE.md` verschoben oder dort zusammengefasst.

## WP12 Technical System Package Logic

Domänenmodell (SK-74): `docs/SYSTEMPAKET_MODELL.md` – technische Beschreibung, Per-Child-Mapping und umgesetzte Teile (SK-76 Mehr-Gebäude-Blocker, SK-78 Vorlauftemperatur-Korridor).

Ziel: SysKon hat ein schärferes technisches Paketmodell für das MVP-Hybrid-Luft/Wasser-Wärmepumpen-Contracting-Produkt. WP12 ist eine technische Grundlage vor WP8/SK-70: Erst Paketgrenzen, Blocker, Komponenten, Datenherkunft und interne vs. kundensichtbare Aussagen klären, dann Preise, GP/AP und Vertragsparameter darauf aufbauen. WP7 bleibt archiviert; kundenfähige Scope-Ausgabe wird später gegen dieses Modell nachgeschärft. Sequenz nach Pivot: WP13 (saubere Flächen + Sichtmodus) und WP10 (Tool-Learnings als Input) laufen vor WP12.

Stop-line (Planungstool-Drift): WP12 darf die Engine nicht zu einem Standort-/Planungstool ausbauen. Site-Survey, Kartografie, LiDAR und 3D-Placement bleiben Integrations-/Recherchethemen (North Star aus SK-68), nicht eigene SysKon-Berechnung. Vor jeder Erweiterung von `src/logic/calc.js` um Standort-/Sizing-Logik prüfen, ob sie wirklich nötig ist oder extern zugekauft werden sollte.

Do not do yet: keine finale juristische Vertragsgenerierung; keine Einkaufs-/Herstellkosten, interne Kundenpreisbildung, Marge, Subventionsinterna, internen Gesamt-CAPEX oder IRR in der Kundensicht zeigen; nicht auf einen möglichst kurzen Fragebogen optimieren, sondern auf einen validen Angebotskorridor; keine dynamische Stromtarif-Optimierung implementieren; keine Details aus der Kevin-W./Patrick-L.-Elektro-Notiz erfinden, bevor sie vorliegt.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-74 | Epic | Technical package | Technical System Package Logic | Robert's Workshop-Stand in ein kohärentes technisches Produktmodell übersetzen: Hybrid-Luft/Wasser-WP, Standardhydraulik, Aufstellung, Schall, Messkonzept, Monitoring, Datenherkunft, Berechnung und Scope-Grenzen. | MVP-Systempaket ist als technische Domäne beschrieben; WP12-Abhängigkeiten zu WP7-Kundenscope, WP8-Pricing/Contracting und WP11-Admin/Governance sind benannt; keine App-Implementierung ohne später freigegebenen Scope. | P1 | XL | Todo |
| SK-75 | Story | Data model | Datenquellen & Provenienzmodell | Eingaben sollen später nach Herkunft, Skalierbarkeit und Vertrauen unterscheidbar sein: TES-Abrechnung, Messdaten bestehender TS Assets via Asset Manager, Stammdaten, manuelle Sales-/Kundenangaben und spätere skalierbare Quellen. | Jedes fachlich wichtige Eingabefeld hat Zielattribute für Quelle, Erfassungsweg, Aktualität, Vertrauen/Confidence und kundensichtbare Annahme; Asset-Manager- und Stammdaten-Input sind als Quellen vorgesehen; manuelle vs. skalierbare Quellen sind unterscheidbar; offene oder schwache Quellen erzeugen Sales-Follow-up statt Scheingenauigkeit. | P1 | L | Todo |
| SK-79 | Story | Placement & sound | Aufstellung & Schallschutzkonzept | Aktuelle Aufstellvarianten gegen Robert's Draft mappen und Schallschutz fachlich sauber trennen: in Container, außen ungeschützt, außen mit Zaun, Fundament; ATEC als Schallberechnung/Schutzkonzept; Rockwool-Schallschutzzaun als mögliche Komponente. | Mapping ist dokumentiert: `fundament` prüfen/halten; `einhausung` gegen outside-with-fence/Schallschutzzaun prüfen; `kompakt_container` und `vollcontainer` gegen "in container" prüfen und Entscheidung treffen, ob zwei Containergrößen bleiben oder ein Containerkonzept reicht; "outside unprotected" wird als eigene Low-CAPEX-Variante geprüft; ATEC-Service ist als Schallberechnung/Schutzkonzept vorgesehen; Rockwool-Zaun ist mögliche Scope-Line; aktuelle Schallformel bleibt nur Demo-Vorprüfung, keine rechtliche Schallberechnung. | P1 | L | Todo |
| SK-80 | Story | Metering & operation | Messkonzept, Monitoring, Strombezug & Förderannahmen | Messkonzept als eigenes Modul neben Monitoring modellieren und Beziehungen zu Betrieb, Strombeschaffung, Tarif-/Preisformel und Förderannahmen klären. | Messkonzept ist separater Scope-/Regelblock, nicht nur Monitoring; Monitoring Basic/Plus wird gegen Messkonzept, Betriebsführung und Reporting-Erwartungen geprüft; Strombeschaffung wird als Commercial/Betrieb-Annahmebereich ergänzt und mit WP-Stromtarif, Messkonzept und Preisgleitformel verknüpft; BEG bleibt Demo-Annahme, Kundensicht zeigt nur Annahmen/offene Prüfungen, interne Sicht darf Subventionseffekt auf CAPEX zeigen. | P1 | M | Todo |
| SK-82 | Story | Electrical | Elektroanschluss-Notiz einarbeiten | Der Elektroanschluss bleibt zunächst generisch. Die separate Notiz von Kevin W./Patrick L. wird als spätere fachliche Quelle eingeplant, ohne Inhalte vorwegzunehmen. | Aktuelles generisches Elektropaket bleibt bestehen; Backlog verweist auf spätere Einarbeitung der Kevin-/Patrick-Notiz; keine erfundenen Anschluss-, Zähler- oder Netzdetails; nach Vorliegen der Notiz werden Inputs, Blocker, Scope-Lines und Kundentexte daraus abgeleitet. | P1 | S | Todo |

## WP8 Contracting-Angebot & Pricing-Logik

Ziel: Der Systempaket-Konfigurator bereitet später ein realistisches, konfigurierbares Contracting-Angebot mit GP, AP und Preisgleitformel vor, ohne interne Commercial-Logik in der Kundensicht zu zeigen.

Stand: Pricing-Layer umgesetzt – `src/logic/pricing.js` (GP/AP/Preisgleitformel) mit iterativem IRR-Solver (`loeseApMargeFuerIrr`, Marge auf Ziel-IRR gelöst), AVBFernwärme §24-Preisgleitformel (Festanteil + amtliche Indizes, Evaluator `preisgleitWert`) und parameterisiertem Effizienzrisiko (Frage `effizienzrisiko`). Kundensicht-Karte + interne Commercial-Sicht in `src/screens/Ergebnis.jsx`, konfigurierbare Annahmen + Fragen `vertragslaufzeit`/`effizienzrisiko`. Verbleibend offen: reale Index-Zeitreihen + finale AVBFernwärme-/Rechtsfreigabe. Modell: `docs/PRICING_MODELL.md`.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-70 | Epic | Pricing | Contracting-Angebot & Pricing-Logik | Pricing-Logik so konzipieren, dass Kundenpreise realistisch genug für den nächsten Prozessschritt sind und spätere Enttäuschungen vermeiden. Kundensicht zeigt GP/Grundpreis, AP/Arbeitspreis, Preisgleitformel, enthaltene Services, Annahmen, offene Punkte und strukturierte Vertragsparameter. Interne Sicht zeigt Einkaufskosten, Kostenaufbau, interne Preisbildung, Marge, Förderannahmen, resultierenden CAPEX und später IRR-/Zielrendite-Logik. WP8 baut auf dem technischen Paketmodell aus WP12 auf. | GP, AP und Preisgleitformel sind als Kundenausgabe definiert; enthaltene Services, Annahmen, Servicegrenze, Effizienzrisiko-Allokation zwischen Techem und Kunde sowie Preisänderungsklausel-Parameter sind strukturiert vorbereitet; interne Commercial-Felder sind dem Sales-Internal-Toggle zugeordnet; konfigurierbare Annahmen sind als Produktanforderung beschrieben; keine interne Marge, Einkaufslogik, Subventionsinterna, interner Gesamt-CAPEX oder IRR-Logik erscheint in der Kundensicht; keine finale juristische Vertragsgenerierung. | P1 | XL | In Arbeit |

## WP9 Angebotsvarianten, Speichern, PDF & Export

Ziel: Sales kann ein Angebot vorbereiten, speichern, als PDF exportieren und mit wenigen Klicks eine zweite Variante erzeugen. Spätere Übergaben bleiben bewusst schlank und machen SysKon nicht zum CRM.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-71 | Epic | Offer workflow | Angebotsvarianten, Speichern, PDF & Export | Angebots-Workflow für eine erste Variante, Speichern, PDF-Export und schnelle Duplikation einer zweiten Angebotsvariante definieren. Später folgen Speichern/Export nach SharePoint sowie Vorschau oder Übergabe an CRM/WeClapp. Das Gesprächsergebnis bleibt minimal: Kommentarfeld plus Dropdown reichen; keine CRM-Funktionalität im Systempaket-Konfigurator nachbauen. | Angebotszustand und Varianten-Duplikation sind als Zielprozess beschrieben; PDF-Export ist Teil des Work Packages; SharePoint und CRM/WeClapp sind als spätere Integrationen markiert; Gesprächsergebnis ist auf Kommentar und Dropdown begrenzt; keine CRM-Ownership oder Pipeline-Logik wird eingeführt. | P1 | L | Todo |

## WP10 Bestehende Tools & Learnings prüfen

Ziel: Vor größerem Ausbau werden bestehende und historische Techem-Tools sowie ihre Learnings systematisch ausgewertet, damit SysKon nicht bekannte Fehler wiederholt.

Sequenz nach Pivot: WP10 wurde in der Queue vor WP12/WP8 gezogen. Begründung: die Learnings sind ein Input für das technische Paketmodell (WP12) und die Pricing-Logik (WP8). Sie erst nach dem Hardcoden dieser Modelle zu erheben, würde genau die bekannten Fehler wiederholen, vor denen dieses Work Package warnt.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-72 | Epic | Discovery | Bestehende Tools & Learnings prüfen | Richtpreis-Tool, einfaches Wärmepumpen-Planungstool, Solution Finder und weitere verwandte Versuche prüfen. Dokumentieren, was funktioniert hat, was gescheitert ist, welche Daten/Logiken/UX-Muster wiederverwendbar sind und was im Systempaket-Konfigurator bewusst vermieden werden soll. | Relevante historische Tools sind aufgelistet; Learnings zu Nutzen, Grenzen, Akzeptanz und Datenqualität sind dokumentiert; wiederverwendbare Bausteine und Anti-Patterns sind benannt; Ergebnisse fließen als Entscheidungsvorlage vor größerem Neubau ein. | P1 | M | Todo |

## Roadmap-Epics

Diese Epics dokumentieren den Produkt-Pivot und spätere Ausbaustufen. Sie stören die aktive Queue nicht; konkrete Umsetzung wird erst aus ihnen gezogen, wenn der Nutzer den Scope freigibt.

| ID | Type | Area | Title | Outcome | Possible Children | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-58 | Epic | Product framing | Sales-first product framing | UI und Docs implizieren nicht mehr PE-Handover als primären Use Case; SysKon erklärt sich als Sales-Gesprächs-, Vorqualifizierungs- und Lösungskorridor-Tool. | Produktflächen weg von Handover/PE-Begriffen benennen; Sales-use-case Intro ergänzen; Kundengespräch-Modus narrativ klären; Non-Goals sichtbar machen: kein verbindliches Angebot, keine Ausführungsplanung, keine Self-Service-Bestellung. | P0 | M | Todo |
| SK-59 | Epic | Conversation flow | Guided customer conversation flow | Konfigurationsfragen folgen einem Sales-Gespräch statt einer Engineering-Checkliste. | Fragen kundennah gruppieren; relevante Folgefragen zeigen; Tooltips "warum fragen wir das" erweitern; Sales-Erklärungssnippets ergänzen; "Kunde weiß es nicht"-Pfade mit nächsten Schritten ergänzen. | P1 | L | Deferred (Pivot Juni 2026: SysKon führt nicht das Kundengespräch; Fokus liegt auf dem Output. Reaktivieren nur, wenn sich der Bedarf bestätigt.) |
| SK-60 | Epic | Preview | Live solution corridor | Die rechte Preview zeigt eine live nutzbare Empfehlung für Kundengespräche. | Wahrscheinlichen Lösungspfad zeigen; Aufstelloptionen mit Trade-offs erklären; Risiko-Flags einfach formulieren; Preiskorridor statt exakt wirkendem Preis; nächster Schritt: interne Prüfung, Daten nötig oder kein Standardfit. | P1 | L | Todo |
| SK-61 | Epic | Results | Sales-safe result semantics | Ergebnisse wirken nicht wie finales Angebot oder PE-freigegebenes LV. | Ergebnisbereiche bei Bedarf umbenennen; finale Labels durch Vorlösung, Richtindikation und Prüfbedarf ersetzen; Limitierungen sichtbar machen; Annahmen klar zeigen; Detail-LV nur in Admin-/Internmodus zeigen. | P1 | M | Todo |
| SK-62 | Epic | Internal engine | Internal engine remains available | PE-/LV-/Regellogik bleibt erhalten, aber sekundär zur Sales-Experience. | LV im internen Detailmodus halten; Annahmen-/Regel-Editor unter Admin-Toggle halten; Testfälle unter Admin-Toggle halten; PE-Logik nicht löschen, wenn sie Sales-Empfehlungen stützt. | P1 | M | Todo |
| SK-64 | Epic | Contracting | Contracting offer future scope | Künftige GP/AP/IRR-Logik ist dokumentiert, ohne das MVP zu verunreinigen. | GP/AP und AP-margin-only dokumentieren; 10/15/20 Jahre dokumentieren; Ziel-IRR 13/15 Prozent dokumentieren; Preisgleitformel-Recherche dokumentieren; Non-Goal für v0.1/v0.2 markieren. | P2 | M | Todo |
| SK-65 | Epic | Integration | CRM and data integration future scope | Künftige Integrationserwartungen sind dokumentiert. | Inputquellen CRM, Gebäudedatenerfassung und Customer Intake dokumentieren; Outputziele CRM, interner Angebotsprozess und später Installation/Operations dokumentieren; als Zukunftsthema halten, nicht MVP. | P3 | M | Todo |
