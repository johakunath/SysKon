# Backlog Work Packages

Dieses Dokument enthält die Detailansicht. `BACKLOG.md` bleibt der mobile Einstieg.

Aktueller Produktfokus: SysKon ist zuerst ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche. PE-, LV- und Engineering-Logik bleiben als interne Guardrails wichtig, sind aber nicht der sichtbare Hauptworkflow. Roadmap: `docs/PRODUCT_ROADMAP.md`.

Regel für "next epic": Wähle das erste nicht erledigte Epic aus `BACKLOG.md`, dann hier das erste Child mit `In Progress`; falls keines existiert, das erste Child mit `Todo`.

Umfangsregel: Der Agent plant zuerst. Wenn der Nutzer einen zusammenhängenden Scope freigibt, dürfen mehrere Child-Tickets in einem PR umgesetzt werden. Dabei gilt: mutig bündeln, aber keine fachfremden Änderungen einschleppen.

Token-Regel: Erledigte Work Packages und erledigte Child-Tickets stehen nicht dauerhaft in diesem aktiven Detaildokument. Nach Abschluss werden sie nach `docs/BACKLOG_ARCHIVE.md` verschoben oder dort zusammengefasst.

## WP8 Contracting-Angebot & Pricing-Logik

Ziel: Der Systempaket-Konfigurator bereitet später ein realistisches, konfigurierbares Contracting-Angebot mit GP, AP und Preisgleitformel vor, ohne interne Commercial-Logik in der Kundensicht zu zeigen.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-70 | Epic | Pricing | Contracting-Angebot & Pricing-Logik | Pricing-Logik so konzipieren, dass Kundenpreise realistisch genug für den nächsten Prozessschritt sind und spätere Enttäuschungen vermeiden. Kundensicht zeigt GP/Grundpreis, AP/Arbeitspreis, Preisgleitformel, enthaltene Services, Annahmen und offene Punkte. Interne Sicht zeigt Einkaufskosten, Kostenaufbau, interne Preisbildung, Marge, Förderannahmen, resultierenden CAPEX und später IRR-/Zielrendite-Logik. Alle relevanten Pricing-Annahmen sollen konfigurierbar werden. | GP, AP und Preisgleitformel sind als Kundenausgabe definiert; interne Commercial-Felder sind dem Sales-Internal-Toggle zugeordnet; konfigurierbare Annahmen sind als Produktanforderung beschrieben; keine interne Marge, Einkaufslogik oder IRR-Logik erscheint in der Kundensicht. | P1 | XL | Todo |

## WP9 Angebotsvarianten, Speichern, PDF & Export

Ziel: Sales kann ein Angebot vorbereiten, speichern, als PDF exportieren und mit wenigen Klicks eine zweite Variante erzeugen. Spätere Übergaben bleiben bewusst schlank und machen SysKon nicht zum CRM.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-71 | Epic | Offer workflow | Angebotsvarianten, Speichern, PDF & Export | Angebots-Workflow für eine erste Variante, Speichern, PDF-Export und schnelle Duplikation einer zweiten Angebotsvariante definieren. Später folgen Speichern/Export nach SharePoint sowie Vorschau oder Übergabe an CRM/WeClapp. Das Gesprächsergebnis bleibt minimal: Kommentarfeld plus Dropdown reichen; keine CRM-Funktionalität im Systempaket-Konfigurator nachbauen. | Angebotszustand und Varianten-Duplikation sind als Zielprozess beschrieben; PDF-Export ist Teil des Work Packages; SharePoint und CRM/WeClapp sind als spätere Integrationen markiert; Gesprächsergebnis ist auf Kommentar und Dropdown begrenzt; keine CRM-Ownership oder Pipeline-Logik wird eingeführt. | P1 | L | Todo |

## WP10 Bestehende Tools & Learnings prüfen

Ziel: Vor größerem Ausbau werden bestehende und historische Techem-Tools sowie ihre Learnings systematisch ausgewertet, damit SysKon nicht bekannte Fehler wiederholt.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-72 | Epic | Discovery | Bestehende Tools & Learnings prüfen | Richtpreis-Tool, einfaches Wärmepumpen-Planungstool, Solution Finder und weitere verwandte Versuche prüfen. Dokumentieren, was funktioniert hat, was gescheitert ist, welche Daten/Logiken/UX-Muster wiederverwendbar sind und was im Systempaket-Konfigurator bewusst vermieden werden soll. | Relevante historische Tools sind aufgelistet; Learnings zu Nutzen, Grenzen, Akzeptanz und Datenqualität sind dokumentiert; wiederverwendbare Bausteine und Anti-Patterns sind benannt; Ergebnisse fließen als Entscheidungsvorlage vor größerem Neubau ein. | P1 | M | Todo |

## WP11 Admin-Konfiguration & Governance

Ziel: Sales-facing Inhalte, Produktdaten und Commercial-Annahmen können später ohne Codeänderung gepflegt, versioniert und nach interner oder kundensichtbarer Nutzung getrennt werden.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-73 | Epic | Admin | Admin-Konfiguration & Governance | Admin-Konzept für editierbare Playbook-Texte, Komponenten-/Produktstammdaten, Herstellerdaten, Pricing-Annahmen, Regeln, Versionierung und Sichtbarkeitsflags definieren. Kundensicht und interne Sales-Sicht müssen pro Inhalt/Feld trennbar sein, damit Angebote konsistent gepflegt werden können, ohne interne Informationen offenzulegen. | Admin-editierbare Fragehilfen sind vorgesehen; Produkt-/Hersteller- und Pricing-Stammdaten sind als pflegbare Domänen beschrieben; Regeln und Annahmen haben Versionierungsbedarf; interne vs. kundensichtbare Felder können per Governance/Sichtbarkeitslogik unterschieden werden. | P2 | L | Todo |

## Roadmap-Epics

Diese Epics dokumentieren den Produkt-Pivot und spätere Ausbaustufen. Sie stören die aktive Queue nicht; konkrete Umsetzung wird erst aus ihnen gezogen, wenn der Nutzer den Scope freigibt.

| ID | Type | Area | Title | Outcome | Possible Children | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-58 | Epic | Product framing | Sales-first product framing | UI und Docs implizieren nicht mehr PE-Handover als primären Use Case; SysKon erklärt sich als Sales-Gesprächs-, Vorqualifizierungs- und Lösungskorridor-Tool. | Produktflächen weg von Handover/PE-Begriffen benennen; Sales-use-case Intro ergänzen; Kundengespräch-Modus narrativ klären; Non-Goals sichtbar machen: kein verbindliches Angebot, keine Ausführungsplanung, keine Self-Service-Bestellung. | P0 | M | Todo |
| SK-59 | Epic | Conversation flow | Guided customer conversation flow | Konfigurationsfragen folgen einem Sales-Gespräch statt einer Engineering-Checkliste. | Fragen kundennah gruppieren; relevante Folgefragen zeigen; Tooltips "warum fragen wir das" erweitern; Sales-Erklärungssnippets ergänzen; "Kunde weiß es nicht"-Pfade mit nächsten Schritten ergänzen. | P1 | L | Todo |
| SK-60 | Epic | Preview | Live solution corridor | Die rechte Preview zeigt eine live nutzbare Empfehlung für Kundengespräche. | Wahrscheinlichen Lösungspfad zeigen; Aufstelloptionen mit Trade-offs erklären; Risiko-Flags einfach formulieren; Preiskorridor statt exakt wirkendem Preis; nächster Schritt: interne Prüfung, Daten nötig oder kein Standardfit. | P1 | L | Todo |
| SK-61 | Epic | Results | Sales-safe result semantics | Ergebnisse wirken nicht wie finales Angebot oder PE-freigegebenes LV. | Ergebnisbereiche bei Bedarf umbenennen; finale Labels durch Vorlösung, Richtindikation und Prüfbedarf ersetzen; Limitierungen sichtbar machen; Annahmen klar zeigen; Detail-LV nur in Admin-/Internmodus zeigen. | P1 | M | Todo |
| SK-62 | Epic | Internal engine | Internal engine remains available | PE-/LV-/Regellogik bleibt erhalten, aber sekundär zur Sales-Experience. | LV im internen Detailmodus halten; Annahmen-/Regel-Editor unter Admin-Toggle halten; Testfälle unter Admin-Toggle halten; PE-Logik nicht löschen, wenn sie Sales-Empfehlungen stützt. | P1 | M | Todo |
| SK-64 | Epic | Contracting | Contracting offer future scope | Künftige GP/AP/IRR-Logik ist dokumentiert, ohne das MVP zu verunreinigen. | GP/AP und AP-margin-only dokumentieren; 10/15/20 Jahre dokumentieren; Ziel-IRR 13/15 Prozent dokumentieren; Preisgleitformel-Recherche dokumentieren; Non-Goal für v0.1/v0.2 markieren. | P2 | M | Todo |
| SK-65 | Epic | Integration | CRM and data integration future scope | Künftige Integrationserwartungen sind dokumentiert. | Inputquellen CRM, Gebäudedatenerfassung und Customer Intake dokumentieren; Outputziele CRM, interner Angebotsprozess und später Installation/Operations dokumentieren; als Zukunftsthema halten, nicht MVP. | P3 | M | Todo |
