# Backlog Work Packages

Dieses Dokument enthält die Detailansicht. `BACKLOG.md` bleibt der mobile Einstieg.

Aktueller Produktfokus: SysKon ist zuerst ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche. PE-, LV- und Engineering-Logik bleiben als interne Guardrails wichtig, sind aber nicht der sichtbare Hauptworkflow. Roadmap: `docs/PRODUCT_ROADMAP.md`.

Regel für "next epic": Wähle das erste nicht erledigte Epic aus `BACKLOG.md`, dann hier das erste Child mit `In Progress`; falls keines existiert, das erste Child mit `Todo`.

Umfangsregel: Der Agent plant zuerst. Wenn der Nutzer einen zusammenhängenden Scope freigibt, dürfen mehrere Child-Tickets in einem PR umgesetzt werden. Dabei gilt: mutig bündeln, aber keine fachfremden Änderungen einschleppen.

## WP0 Demo-Fluss und Semantik

Ziel: Der erste Demo-Durchlauf soll keine Reifegrad-, PE-Handover- oder Operational-Readiness-Versprechen suggerieren, die fachlich noch nicht entschieden sind. Die Demo soll als Sales-Gespräch mit Vorqualifizierung, Lösungskorridor und internem Prüfbedarf lesbar sein.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-43 | UX | Handover | Remove/de-emphasize Handover | Hidden from nav; code kept for now. | Decide remove vs deferred reference. | P0 | S | In Progress |
| SK-44 | Question | Status | Reconsider Gesamtstatus | Rule-derived but unclear to users. | Keep with semantics or replace. | P1 | M | Todo |
| SK-45 | Question | Data quality | Reconsider Datenqualität | Percentage needs product meaning. | Define threshold/action or de-emphasize. | P2 | S | Todo |

## WP1 Ergebnis-Modell

Ziel: Die Ergebnis-Ansicht soll klar zeigen, ob sie Analyse, Vorlösung, Richtindikation, Prüfbedarf oder interner Scope ist. Sie soll Sales im Kundengespräch und die interne Vorprüfung unterstützen, nicht wie ein finales Angebot oder PE-freigegebenes LV wirken.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-47 | UX | Ergebnis | Rename/restructure Ergebnis | Current title implies final result. | Rename to Analyse/Vorlösung or split. | P1 | M | Done |
| SK-48 | Story | Results | Merge LV + costs | Combine included scope then CAPEX. | One coherent result section. | P1 | M | Done |
| SK-49 | UX | Vorlösung | Elaborate Vorlösung | Add scope/assumptions/limits. | No customer-ready implication. | P2 | S | Done |

## WP2 Konfiguration und Preview

Ziel: Die Konfiguration soll schneller scanbar werden und perspektivisch wie ein geführtes Kundengespräch mit Live-Lösungskorridor wirken, ohne die Demo fachlich umzubauen.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-51 | UX | Config layout | Fixed 3-column layout | Sidebars fixed, center scrolls. | Works on desktop/tablet-wide. | P1 | M | Done |
| SK-52 | Story | Preview | Full result preview | Preview shows solution corridor, scope, CAPEX/Richtindikation, assumptions. | Matches merged result content. | P1 | M | Done |

## WP3 Responsive Verhalten

Ziel: Tablet- und schmale Ansichten sollen nicht offensichtlich brechen. Kein vollständiger Mobile-Produktumbau.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-57 | UX | Tablet | Tablet-wide layout decent | No full phone optimization. | Tablet-wide avoids clipping. | P2 | M | Todo |

## Erledigt

Erledigte Tickets bleiben nicht in der aktiven Tabelle. Siehe `docs/BACKLOG_ARCHIVE.md`.

- SK-53: Left title cleanup
- SK-55: Full-width header
- SK-56: Touch tooltips

## Roadmap-Epics

Diese Epics dokumentieren den Produkt-Pivot und spätere Ausbaustufen. Sie stören die aktive Queue nicht; konkrete Umsetzung wird erst aus ihnen gezogen, wenn der Nutzer den Scope freigibt.

| ID | Type | Area | Title | Outcome | Possible Children | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-58 | Epic | Product framing | Sales-first product framing | UI und Docs implizieren nicht mehr PE-Handover als primären Use Case; SysKon erklärt sich als Sales-Gesprächs-, Vorqualifizierungs- und Lösungskorridor-Tool. | Produktflächen weg von Handover/PE-Begriffen benennen; Sales-use-case Intro ergänzen; Kundengespräch-Modus narrativ klären; Non-Goals sichtbar machen: kein verbindliches Angebot, keine Ausführungsplanung, keine Self-Service-Bestellung. | P0 | M | Todo |
| SK-59 | Epic | Conversation flow | Guided customer conversation flow | Konfigurationsfragen folgen einem Sales-Gespräch statt einer Engineering-Checkliste. | Fragen kundennah gruppieren; relevante Folgefragen zeigen; Tooltips "warum fragen wir das" erweitern; Sales-Erklärungssnippets ergänzen; "Kunde weiß es nicht"-Pfade mit nächsten Schritten ergänzen. | P1 | L | Todo |
| SK-60 | Epic | Preview | Live solution corridor | Die rechte Preview zeigt eine live nutzbare Empfehlung für Kundengespräche. | Wahrscheinlichen Lösungspfad zeigen; Aufstelloptionen mit Trade-offs erklären; Risiko-Flags einfach formulieren; Preiskorridor statt exakt wirkendem Preis; nächster Schritt: interne Prüfung, Daten nötig oder kein Standardfit. | P1 | L | Todo |
| SK-61 | Epic | Results | Sales-safe result semantics | Ergebnisse wirken nicht wie finales Angebot oder PE-freigegebenes LV. | Ergebnisbereiche bei Bedarf umbenennen; finale Labels durch Vorlösung, Richtindikation und Prüfbedarf ersetzen; Limitierungen sichtbar machen; Annahmen klar zeigen; Detail-LV nur in Admin-/Internmodus zeigen. | P1 | M | Todo |
| SK-62 | Epic | Internal engine | Internal engine remains available | PE-/LV-/Regellogik bleibt erhalten, aber sekundär zur Sales-Experience. | LV im internen Detailmodus halten; Annahmen-/Regel-Editor unter Admin-Toggle halten; Testfälle unter Admin-Toggle halten; PE-Logik nicht löschen, wenn sie Sales-Empfehlungen stützt. | P1 | M | Todo |
| SK-63 | Epic | Roadmap docs | Product roadmap documentation | Backlog-Dokumente erklären Stage 1, Stage 2, Stage 3, Regressionstests und spätere Plattformthemen außerhalb des Archivs. | `docs/PRODUCT_ROADMAP.md` erstellen; von `README.md`, `BACKLOG.md`, `AGENTS.md` und `CLAUDE.md` verlinken; lange Strategie aus Archivsichtbarkeit holen. | P0 | S | Done |
| SK-64 | Epic | Contracting | Contracting offer future scope | Künftige GP/AP/IRR-Logik ist dokumentiert, ohne das MVP zu verunreinigen. | GP/AP und AP-margin-only dokumentieren; 10/15/20 Jahre dokumentieren; Ziel-IRR 13/15 Prozent dokumentieren; Preisgleitformel-Recherche dokumentieren; Non-Goal für v0.1/v0.2 markieren. | P2 | M | Todo |
| SK-65 | Epic | Integration | CRM and data integration future scope | Künftige Integrationserwartungen sind dokumentiert. | Inputquellen CRM, Gebäudedatenerfassung und Customer Intake dokumentieren; Outputziele CRM, interner Angebotsprozess und später Installation/Operations dokumentieren; als Zukunftsthema halten, nicht MVP. | P3 | M | Todo |
