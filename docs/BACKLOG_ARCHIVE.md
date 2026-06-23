# Backlog

Arbeitsvorrat für alle Agent-Sessions. Regeln: siehe `CLAUDE.md`.
Status: `Offen` → `In Arbeit` → `Erledigt` (mit Datum). Ein Item = ein Commit.
Neue Items unten in der passenden Sektion anlegen (nächste freie SK-Nummer).

## Aus aktiven Backlog-Dokumenten verschoben

Diese Einträge wurden aus `BACKLOG.md` und `docs/BACKLOG_WORK_PACKAGES.md` entfernt, damit neue Agent-Sessions weniger Kontext laden müssen. Historie bleibt hier erhalten.

| ID | Type | Work Package | Outcome / Inhalt | Status |
|---|---|---|---|---|
| SK-89 | UX | WP14 Konfiguration declutter | Playbook de-emphasizen abgeschlossen: Die prominente Inline-Playbook-UI pro Frage war bereits in UX-SK70-PRE durch einen dezenten einzeiligen `Gespraechshinweis` (aus `hinweisKurz`) ersetzt; der dadurch tot gewordene `.playbook`-CSS-Block in `src/styles.css` wurde entfernt. SK-59 (Guided Conversation Flow) ist in den Roadmap-Epics weiterhin `Deferred` mit Pivot-Begründung (bestätigt). SK-67-Playbook-Daten (`warum`/`warnsignale`/`einordnung`) bleiben in `src/data/fragen.js`, editierbar im Admin (`src/screens/Annahmen.jsx`) und durch `tests/questions.test.js` abgesichert. | Done |
| SK-93 | UX | WP16 Navigation & Naming | Top-Navigation auf den Flow „Angebot erstellen → Angebot" umbenannt (vormals `Konfiguration`/`Analyse`); Admin zu EINEM Bereich zusammengeführt (Testfälle als Tab neben Annahmen/Fragen/Katalog/Governance/Import); Sichtmodus bleibt global. Begleitende Copy (Buttons, Banner, Hinweise) auf das Angebot-Framing vereinheitlicht. | Done |
| SK-94 | Story | WP16 Navigation & Naming (Reframe) | Produktframing auf Richtpreis-Angebotstool umgestellt: Binding-Offer-Disclaimer entfernt (Ergebnis-Karte „Nicht als Zusage lesen", `kein Angebot/Angebotscharakter/kein Kundenangebot`-Klauseln in Ergebnis/texte.js/engine.js). Fachliche Schall-/Förder-Demo-Caveats bleiben erhalten. CLAUDE.md- und Roadmap-Schutzplanken entsprechend angepasst; das frühere „kein verbindliches Angebot"-Non-Goal aus SK-58 wurde vom PO aufgehoben. | Done |
| SK-90 | Tech Debt | WP15 Layout & Element QA | Geteilte UI-Bausteine eingeführt (`src/components/Ampel.jsx`, `src/components/ScopeListe.jsx`) und die zuvor in fünf Screens handgeschriebene Status-/Scope-Markup vereinheitlicht; Demo-/Disclaimer-Texte in eine zentrale React-freie Quelle `src/data/texte.js` zusammengeführt (App-Footer, Analyse-Limits, Handover-Fußnote); `kundenPreviewText`/`korridorTitel` als gemeinsame Helfer in `src/screens/format.js`. | Done |
| SK-91 | UX | WP15 Layout & Element QA | Label- und Überschriftenkohärenz über die Screens geschärft: doppelte „Umfangs-Vorschau"-Überschrift entzerrt, `kundenPreviewText` jetzt konsistent auch in der Analyse-Kundensicht angewandt, `sh-label` „Korridor" → „Gesprächskorridor" vereinheitlicht. | Done |
| SK-88 | Story | WP15 Layout & Element QA (vormals WP14) | Rechte Vorschau in `src/screens/Konfiguration.jsx` verschlankt: redundante Vorlösungs-KPIs (WP-Kaskade, Empfohlen) entfernt, doppelte Überschrift aufgelöst, Scope-Listen auf die geteilte `ScopeListe` umgestellt. Vorschau spiegelt den konsolidierten Kundenoutput mit weniger Text und ohne doppelte Snippets. | Done |
| SK-92 | Tech Debt | WP15 Layout & Element QA | CSS in `src/styles.css` konsolidiert: Hinweisboxen (`warnbox/empfehlungsbox/okbox`) und Listen auf gemeinsame Basisregeln + Farb-/Marker-Modifier reduziert, dangling Klassen bereinigt (`disclaimer-karte`, `umfang-vorschau` entfernt, `lv-aktionen` mit echter Regel), Design-Tokens ergänzt (Schrift-/Abstands-Skala, `--fokus-ring`, `--radius-pill`, `--lh-eng`) und die zuvor 14+ Ad-hoc-Schriftgrößen darauf migriert. | Done |
| SK-46 | Epic | WP1 Ergebnis-Modell | Ergebnis stützt Sales-Gespräch und interne Vorprüfung, nicht finales Angebot. Child-Tickets: SK-47 Rename/restructure Ergebnis, SK-48 Merge LV + costs, SK-49 Elaborate Vorlösung. | Done |
| SK-50 | Epic | WP2 Konfiguration und Preview | Konfiguration wirkt wie geführtes Kundengespräch mit Live-Lösungskorridor. Child-Tickets: SK-51 Fixed 3-column layout, SK-52 Full result preview. | Done |
| SK-53 | UX | Sidebar | Left title cleanup. | Done |
| SK-55 | Bug | Header | Full-width header. | Done |
| SK-56 | Bug | Tooltips | Touch tooltips. | Done |
| SK-63 | Epic | Product roadmap documentation | `docs/PRODUCT_ROADMAP.md` erstellt und von `README.md`, `BACKLOG.md`, `AGENTS.md` und `CLAUDE.md` verlinkt; Stage 1, Stage 2, Stage 3, Regressionstests und spätere Plattformthemen außerhalb des Archivs sichtbar gemacht. | Done |
| SK-43 | UX | WP0 Demo-Fluss | Handover bleibt aus Navigation und sichtbarem Demo-Fluss entfernt; der vorhandene Screen ist als versteckte interne Referenz/Prüfnotiz markiert und wording-seitig de-emphasized. | Done |
| SK-54 | Epic | WP3 Responsive | Tablet- und schmale Ansichten ohne offensichtliche Brüche; Child-Ticket SK-57 umgesetzt. | Done |
| SK-57 | UX | WP3 Responsive | Tablet-weite Konfiguration nutzt eine kompaktere Layout-Struktur; breite Tabellen scrollen in Karten statt die Seite horizontal zu sprengen. | Done |
| SK-66 | Epic | WP4 Sales Ownership & Role Semantics | App- und Docs-Semantik auf erfahrene Sales-/KAM-Nutzer geschärft; interne Prüf-/Techniklogik bleibt Guardrail statt sichtbare Ownership. Neue Agentenregel: nach jedem Work Package aktive Backlogs aktualisieren und Erledigtes archivieren. | Done |
| SK-67 | Epic | WP5 Logisches Fragen- und Playbook-Modell | Fragen als vollständige fachliche Fragen formuliert, Sektionen sales-tauglich geschärft, pro Frage ein strukturiertes Sales-Playbook-Modell ergänzt und inline gerendert; Tests sichern Playbook-Vollständigkeit und Sichtbarkeitsreferenzen. | Done |
| SK-68 | Epic | WP6 Aufstellvariante, Fläche & Placement-Logik | Focused MVP-Placement-Felder ergänzt und eine Sales-kontrollierte Empfehlung für die günstigste tragfähige Aufstellvariante eingeführt. Die App überschreibt die manuelle Auswahl nicht, zeigt aber Variantenkorridor, Abweichung und Blocker. North Star bleibt Integration/Research für Kartografie, Site Survey, LiDAR oder 3D-Placement statt eigenem SysKon-Planungstool. | Done |
| SK-42 | Epic | WP0 Demo-Fluss | Demo-Fluss semantisch bereinigt: Status wird als Gesprächskorridor mit Bedeutung und nächster Sales-Aktion gezeigt; Datenqualität bleibt Prozentwert, wird aber als Datensammel-Check mit priorisierten fehlenden Pflichtdaten erklärt. Child-Tickets: SK-44, SK-45. | Done |
| SK-44 | Question | WP0 Demo-Fluss | Gesamtstatus nicht entfernt, sondern als Gesprächskorridor neu gerahmt: grün/gelb/orange/rot bedeuten Gesprächsreife und internen nächsten Schritt, keine Freigabe oder finale Operational Readiness. | Done |
| SK-45 | Question | WP0 Demo-Fluss | Datenqualität bleibt regelkompatibel, wird aber de-emphasized: Prozentwert ist ein Sales-Hinweis für fehlende Gesprächsdaten; UI zeigt Bedeutung, Aktion und die wichtigsten fehlenden Felder. | Done |
| SK-69 | Epic | WP7 Kundenfähiger Scope-/LV-Output | Kundenfähiger No-Price-Umfang ergänzt: Analyse startet mit separatem Kundenumfang, Komponenten/Services zeigen Hersteller-/Produkt-/Leistungsklasse-Platzhalter, Annahmen, Ausschlüsse und offene Punkte; interne LV-/CAPEX-Ansichten bleiben getrennt. | Done |
| UX-SK70-PRE | UX | Prerequisite vor SK-70 | Konfiguration kompakter an Referenzlayout angelehnt: linke Abschnittsleiste verdichtet, Fragehilfen als kurze Gesprächshinweise neben der Antwortbox gerendert und rechte Standardvorschau auf kundenfähige Komponenten/Services ohne Preise umgestellt. SK-70 bleibt nächster Queue-Punkt. | Done |
| SK-73 | Epic | WP11 Admin-Konfiguration & Governance | Frontend-only Admin-Konfiguration umgesetzt: lokale versionierte Overrides per localStorage, JSON Import/Export, editierbare Annahmen, Fragen-/Playbook-/Optionshinweise, Katalog-/Kundendaten und Governance-Texte. Regeln bleiben read-only mit Governance-Hinweisen; WP12/SK-74 bleibt nächster aktiver Queue-Punkt. | Done |
| SK-83 | Tech | CI / Merge-Gate | `.github/workflows/ci.yml` führt `npm ci`, `npm test` und `npm run build` auf PR und Push aus. Schließt die Lücke, dass PRs ohne grünen Testlauf gemergt wurden. | Done |
| SK-76 | Story | WP12 Technical package | Ausschluss- und Standardfit-Logik: Hard Blocker für >1 Gebäude, Non-Luft/Wasser-WP, Außenstandort-Pflicht, >2 Raumheizkreise und nicht unterstützten MVP-Hybridpfad ergänzt; Statuswirkung grün/gelb/orange/rot definiert; jeder Blocker mit Sales-Begründung und internem nächsten Schritt. | Done |
| SK-78 | Story | WP12 Technical package | Standardhydraulik, Warmwasser & Regelung: 2RH+1TWW-Standard-Schema verankert, Pufferspeicher-Sizing nach kleinster WP, Frischwasserstation und Speicher als Zielvarianten, Vorlauftemperatur >55 °C als rot/nicht standardfähig eingestuft, 56–65-°C-Spanne nicht mehr stillschweigend akzeptiert. | Done |
| SK-77 | Story | WP12 Technical package | WP-Produktstamm, Sizing & Kaskade: `WP_PRODUKT_REFERENZ` in `annahmen.js` (Hersteller/Familie/Leistungsklasse/COP/Kaskadenlimits/Einsatzgrenzen Buderus/Dreammaker); `wp_modul`-Katalogposition zeigt Referenzhersteller und Kaskadenkorridor (1–6 × 20 kW, max. 120 kW); nicht hart codiert, Alternativhersteller möglich. | Done |
| SK-81 | Story | WP12 Calculation boundaries | Berechnungs- und Output-Grenzen: `BERECHNUNGS_DOMAENEN` + `SERVICEGRENZE` in `calc.js`; `bereich`-Tags auf opex-Katalogpositionen (betriebsfuehrung/wartung_instandsetzung); `bereichsSummen` im Engine-Return; Kundensicht enthält weiterhin keine Marge/CAPEX/IRR. | Done |
| SK-84 | Epic | WP13 Sales-Output-First Analyse + Kunden-/Internsicht-Modus | Analyse-Seite nach dem Pivot (Output statt Gesprächsführung) konsolidiert. Child-Tickets: SK-85 Sichtmodus, SK-86 Tab-Konsolidierung, SK-87 Text-Redundanz. | Done |
| SK-85 | Story | WP13 View mode | `sichtModus` (`kunde`/`intern`) als App-State getrennt vom Admin-Toggle; Topbar-Umschalter. Kundensicht zeigt nur den preisfreien Kundenumfang, blendet LV/CAPEX/OPEX vollständig aus. Test sichert, dass die Kundensicht keine Preise/CAPEX exponiert. Voraussetzung für WP8. | Done |
| SK-86 | Story | WP13 Consolidation | Vier Analyse-Tabs auf einen fokussierten Output reduziert: Kundensicht = ein Kundenumfang; Internsicht = zwei Tabs (Lösung & Umfang, Prüfpunkte) mit zusammengeführter Vorlösung/LV. | Done |
| SK-87 | UX | WP13 Copy | Annahmen-/Disclaimer-Redundanz entfernt: „Nicht als Zusage lesen" erscheint in der Internsicht genau einmal statt mehrfach pro Tab. | Done |

## v0.1 Build

| ID | Titel | Beschreibung | Dateien | Prio | Status |
|---|---|---|---|---|---|
| SK-01 | Projekt-Setup React+Vite | package.json, vite.config.js, index.html, main.jsx, Vitest | Root, `src/main.jsx` | hoch | Erledigt 11.06.2026 |
| SK-02 | Demo-Annahmen | Alle Annahmen aus HANDOVER §5 als editierbares Datenobjekt | `src/data/annahmen.js` | hoch | Erledigt 11.06.2026 |
| SK-03 | Regelsatz R01–R18 | 18 Regeln aus HANDOVER §4 im Schema §2.2 (deklarativ) | `src/data/regeln.js` | hoch | Erledigt 11.06.2026 |
| SK-04 | Komponentenkatalog | 6 Pakettypen mit Varianten + LV-Positionen (Kostenformel, Förderflag, CapEx/Opex) | `src/data/katalog.js` | hoch | Erledigt 11.06.2026 |
| SK-05 | Fragebogen A–J | Dynamische Fragen mit Sichtbarkeitsbedingungen, Tooltips, DQ-Gewichten | `src/data/fragen.js` | hoch | Erledigt 11.06.2026 |
| SK-06 | Presets/Testfälle | Referenzfall §3.3 + 4 Testfälle §17 mit Erwartungswerten | `src/data/presets.js` | hoch | Erledigt 11.06.2026 |
| SK-07 | Berechnungen | Heizlast-Proxy, Kaskade, Schallformel R18, Kosten/Förderung/Energie | `src/logic/calc.js` | hoch | Erledigt 11.06.2026 |
| SK-08 | Regel-Engine | Fixpunkt-Schleife, require/exclude/warn/status, DQ-Deckelung | `src/logic/engine.js` | hoch | Erledigt 11.06.2026 |
| SK-09 | Preset-Validierung | Vitest: 4 Testfälle gegen Erwartungen aus HANDOVER §6 | `tests/presets.test.js` | hoch | Erledigt 11.06.2026 |
| SK-10 | App-Shell + Styles | Navigation 5 Screens, globaler State, 3-Spalten-CSS | `src/App.jsx`, `src/styles.css` | hoch | Erledigt 11.06.2026 |
| SK-11 | Screen 1 Konfiguration | Sektionen A–J links, dyn. Fragen Mitte, Live-Panel rechts | `src/screens/Konfiguration.jsx` | hoch | Erledigt 11.06.2026 |
| SK-12 | Screen 2 Ergebnis | Tabs Konfigurationsergebnis / LV mit Begründung / Kostenübersicht | `src/screens/Ergebnis.jsx` | hoch | Erledigt 11.06.2026 |
| SK-13 | Screen 3 Handover | Prüfliste, fehlende Daten, Prüfpunkte, Empfehlung, Druck | `src/screens/Handover.jsx` | hoch | Erledigt 11.06.2026 |
| SK-14 | Screen 4 Annahmen & Regeln | Inline-editierbare Annahmen, Regeltabelle, Live-Neuberechnung | `src/screens/Annahmen.jsx` | hoch | Erledigt 11.06.2026 |
| SK-15 | Screen 5 Testfälle | Speichern (localStorage), Rechenlauf, Diff-Tabelle | `src/screens/Testfaelle.jsx` | hoch | Erledigt 11.06.2026 |
| SK-21 | Render-Smoke-Test Screens | Alle 5 Screens rendern fehlerfrei mit jedem Preset (SSR, ohne Browser) | `tests/screens.test.jsx` | hoch | Erledigt 11.06.2026 |
| SK-22 | Review-Fix: `!=` bei leerem Feld | PR-#1-Review: unbeantwortetes Feld darf keinen Negativ-Treffer auslösen (R17 machte leere Konfiguration rot) | `src/logic/engine.js`, `tests/presets.test.js` | hoch | Erledigt 11.06.2026 |
| SK-23 | Schriften IBM Plex (self-hosted) | Neue Dependencies `@fontsource/ibm-plex-sans` + `@fontsource/ibm-plex-mono`. Begründung: eigenständiges Ingenieurs-Schriftbild, identisch auf allen Rechnern, Tabellenziffern für €/kW/dB-Spalten; lokal gebundelt statt Google-CDN (DSGVO) | `package.json`, `src/main.jsx` | mittel | Erledigt 11.06.2026 |
| SK-24 | Redesign „Stahlblau & Signal" | Durchgängiges Erscheinungsbild: Design-Tokens, Stahlblau-Topbar, Haarlinien statt Schatten, Monospace-Ziffern, Status-Ampeln als CSS-Klassen, dezente 140-ms-Übergänge (mit `prefers-reduced-motion`) | `src/styles.css`, `src/App.jsx`, `src/screens/*.jsx`, `src/screens/format.js` | mittel | Erledigt 11.06.2026 |

## v0.1 Verbesserungen (offen)

| ID | Titel | Beschreibung | Dateien | Prio | Status |
|---|---|---|---|---|---|
| SK-16 | Druck-Stylesheet verfeinern | `window.print()`-Ausgabe des Handover-Screens sauber formatieren (Seitenumbrüche, keine Navigation) | `src/styles.css`, `src/screens/Handover.jsx` | mittel | Erledigt 12.06.2026 |
| SK-17 | Tooltips vervollständigen | Jede Frage in A–J bekommt einen „Warum fragen wir das?"-Tooltip | `src/data/fragen.js` | mittel | Erledigt 12.06.2026 |
| SK-18 | LV-Export CSV | LV-Tabelle als CSV herunterladen (ohne neue Dependency) | `src/screens/Ergebnis.jsx` | niedrig | Erledigt 12.06.2026 |
| SK-19 | Engine-Unit-Tests | Einzeltests für exclude>require, Status-Verschlechterung, DQ-Deckelung | `tests/engine.test.js` (neu) | mittel | Erledigt 12.06.2026 |
| SK-20 | Eingabevalidierung | Plausibilitätsgrenzen für Zahlenfelder (z. B. Fläche, MWh) mit Inline-Hinweis | `src/data/fragen.js`, `src/screens/Konfiguration.jsx` | mittel | Erledigt 12.06.2026 |

## v0.2 UI-Strukturbereinigung

| ID | Titel | Beschreibung | Dateien | Prio | Status |
|---|---|---|---|---|---|
| SK-35 | Hauptnavigation auf 3 Schritte | Nur Konfiguration→Ergebnis→Handover im Hauptflow; Annahmen & Testfälle hinter Admin-Toggle | `src/App.jsx`, `src/styles.css` | hoch | Erledigt 12.06.2026 |
| SK-36 | Header bereinigen + PE-Prüfung umbenennen | Preis/Status aus Header entfernen; PE-Prüfung → Interne Prüfung; gefeuert → Ausgelöst | `src/App.jsx`, `src/screens/*.jsx` | hoch | Erledigt 12.06.2026 |
| SK-37 | Konfiguration: Durchgehende Formularansicht | Alle Fragen sichtbar, Sidebar als Anker-Navigation, Live-Panel auf KPIs reduziert | `src/screens/Konfiguration.jsx`, `src/styles.css` | mittel | Erledigt 12.06.2026 |
| SK-38 | Ergebnis: Summary-Strip + Regel-IDs verstecken | Entscheidungs-Strip über Tabs, Regel-IDs in aufklappbarem Nachweis | `src/screens/Ergebnis.jsx`, `src/styles.css` | mittel | Erledigt 12.06.2026 |
| SK-39 | Handover: Aktionsorientierte Tabelle | Prüfpunkte als Tabelle mit Owner/Status, kompakte Nächster-Schritt-Box | `src/screens/Handover.jsx`, `src/styles.css` | mittel | Erledigt 12.06.2026 |
| SK-40 | Admin-Bereich kennzeichnen | Admin-Banner auf Annahmen & Testfälle-Seiten | `src/screens/Annahmen.jsx`, `src/screens/Testfaelle.jsx` | niedrig | Erledigt 12.06.2026 |

| SK-41 | Engine: Warnungen mit Status annotieren | `warn`-Effekte enthalten kein `status`-Feld; Blocker-Filter in Ergebnis.jsx läuft immer leer. Engine soll nach dem Fixpunkt jede Warnung mit dem korrelierten Status aus `statusQuellen` anreichern. | `src/logic/engine.js`, `tests/engine.test.js` | hoch | Erledigt 12.06.2026 |

## Roadmap (aus HANDOVER, nicht v0.1)

| ID | Titel | Beschreibung | Prio | Status |
|---|---|---|---|---|
| SK-30 | Stufe 2: Grundpreis/Arbeitspreis | Laufzeiten 10/15/20 J., Ziel-IRR 13/15 %, Marge nur auf Arbeitspreis (HANDOVER §7/Stufe 2) | später | Offen |
| SK-31 | Monoenergetischer Pfad | Aktuell nur Roadmap-Platzhalter im UI; echte Auslegung mit Heizstab | später | Offen |
| SK-32 | Preisgleitformeln | Marktglied/Kostenglied, Indizes; aktuell nur Roadmap-Hinweis | später | Offen |
| SK-33 | Admin-Backend | Echter Editor über die 3 Datenebenen (Annahmen/Regeln/Katalog) mit Versionierung | später | Offen |
| SK-34 | BEG-Kostendeckel | Förderdeckel-Logik; aktuell nur Warnhinweis | später | Offen |

## Current code findings

- **Gesamtstatus definition:** `ergebnis.status` is produced by `berechne()` in `src/logic/engine.js`. It starts as `gruen` and uses the ordering `gruen → gelb → orange → rot`; `STATUS_LABEL` maps these values to demo labels.
- **Gesamtstatus update logic:** status changes only through rule effects with `typ: 'status'` in `src/data/regeln.js` and the engine's extra `SYS-EXCLUDE` case when the selected `aufstellvariante` is later excluded. The engine keeps the worst status found during its fixpoint pass. Current status-affecting rules include R04, R06, R08, R09, R10, R11, R12, R13, R14, R15, R16, R17, and R18.
- **Gesamtstatus display locations:** the status is displayed in the configuration right live panel (`src/screens/Konfiguration.jsx`), the result summary strip and configuration-result cards (`src/screens/Ergebnis.jsx`), and the Handover screen (`src/screens/Handover.jsx`). The Handover screen remains in the code but is hidden from the main navigation in this pass.
- **Meaningfulness assessment:** the status is rule-derived, not purely decorative. However, the label "Gesamtstatus" is not self-explanatory for internal demos because the user cannot see a clear owner, lifecycle, or direct action that changes it without opening rule details. Treat it as a candidate for replacement with clearer analysis indicators.
- **Datenqualität definition/display:** `dqScore()` in `src/logic/engine.js` computes a weighted percentage from visible questions in `src/data/fragen.js`; it is shown in the configuration live panel, result page, and Handover.
- **Component map:** configuration sidebar, center input area, and right preview/live results are rendered by `src/screens/Konfiguration.jsx`; Ergebnis tab/page, Leistungsverzeichnis, and Kostenübersicht are rendered by `src/screens/Ergebnis.jsx`; Handover is rendered by `src/screens/Handover.jsx`; Datenqualität display is rendered in `src/screens/Konfiguration.jsx`, `src/screens/Ergebnis.jsx`, and `src/screens/Handover.jsx`; tooltip content is stored on questions in `src/data/fragen.js` and rendered by the `Tooltip`/`Frage` components in `src/screens/Konfiguration.jsx`.

## Structured backlog for internal-demo trustworthiness

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-42 | Epic | App structure | Simplify app structure and remove premature workflow concepts | Reduce concepts that imply operational readiness or delivery handover maturity. | Handover is not demoed as a live workflow; ambiguous status/data-quality concepts are reviewed before being presented as final workflow signals. | P0 | L | Todo |
| SK-43 | UX | Handover | Remove or de-emphasize Handover | The app is nowhere near a real handover workflow. Handover should not be demoed. In this pass the Handover navigation is hidden; the remaining component should either be removed later or kept only as deferred backlog/reference material. | Main navigation no longer exposes Handover; any remaining Handover code is documented as non-demo/deferred or removed after dependency review. | P0 | S | Done |
| SK-44 | Question | Status | Reconsider or remove Gesamtstatus | Current finding: status is generated in `src/logic/engine.js` from status effects in `src/data/regeln.js` and displayed in configuration, Ergebnis, and Handover. It is rule-derived but unclear as a user-facing lifecycle state. | Decide whether to remove the Gesamtstatus label, replace it with analysis indicators, or expose clearer causes/actions. Document the chosen semantics and update UI copy accordingly. | P1 | M | Todo |
| SK-45 | Question | Data quality | Reconsider Datenqualität | Data quality may remain useful, but the current percentage needs product review before it is presented as a trustworthy readiness measure. | Define what the percentage means, what threshold matters, and what action the user should take; update labels/help text or remove from prominent demo surfaces. | P2 | S | Todo |
| SK-46 | Epic | Tab/page model | Rework tab/page model | Make page names and content hierarchy match how internal demo users understand the prototype. | Ergebnis is not presented as a final answer before analysis; LV and cost views form a coherent result area; Vorlösung remains understandable. | P1 | L | Done |
| SK-47 | UX | Ergebnis | Rename or restructure tab Ergebnis | Current title is misleading because the page is more about analysis than a final result. Consider renaming to "Analyse" or splitting analysis from final result. | Navigation and page heading communicate analysis vs. final result clearly; no broad visual redesign is required. | P1 | M | Done |
| SK-48 | Story | Results | Merge Leistungsverzeichnis and Kostenübersicht | These are the most important result views and should become one coherent page/section: first included scope/LV, then CAPEX/cost summary. | A single result section shows included scope/LV followed by CAPEX/Kostenübersicht; the same content model can be reused in the configuration preview panel. | P1 | M | Done |
| SK-49 | UX | Vorlösung | Keep Vorlösung but elaborate slightly | The current Vorlösung is acceptable but should be expanded with clearer included scope, assumptions, and limitations. | Vorlösung explains selected system concept, included scope, assumptions, and limitations without implying a customer-ready offer. | P2 | S | Done |
| SK-50 | Epic | Configuration layout | Improve configuration layout | Improve scanability without a broad redesign. | Desktop/tablet-wide configuration is easier to navigate and preview content is more trustworthy. | P1 | L | Done |
| SK-51 | UX | Configuration layout | Fixed three-column configuration layout | Left sidebar stays fixed while scrolling, right preview/result panel stays fixed while scrolling, only the center input/question area scrolls. | On desktop and tablet-wide viewports, left and right columns stay visible while the center content scrolls; no phone optimization is required. | P1 | M | Done |
| SK-52 | Story | Preview panel | Right preview panel should show full result content | The preview should show more than small live snippets: Vorlösung, LV/included scope, CAPEX/Kostenübersicht, and key assumptions. | Preview content matches the merged LV/Kosten result content and remains internally consistent with the result page. | P1 | M | Done |
| SK-53 | UX | Sidebar | Left sidebar title | Title should be "Systempaket-Konfigurator". Remove subtitle/description text underneath. Add or keep a simple logo/icon area. | The visible title reads "Systempaket-Konfigurator"; no subtitle appears directly below it; logo/icon area is simple and non-distracting. | P0 | XS | Done |
| SK-54 | Epic | Responsive behavior | Mobile/tablet behavior | Make the prototype decent on mobile/tablet without a full phone redesign. | Header is not clipped, tooltips can be used on touch, and tablet-wide layout does not break. | P1 | M | Done |
| SK-55 | Bug | Header | Header should stretch full width on mobile/tablet | Header must not look clipped or constrained in any viewport. At minimum, it should span the full visible width. | Header uses full visible width on tablet/mobile and wraps or scrolls navigation instead of clipping. | P0 | XS | Done |
| SK-56 | Bug | Tooltips | Tooltips must work on mobile/touch | Current issue: tapping tooltips does not work reliably on mobile. Fix tooltip trigger behavior for touch devices. | Tap opens tooltip, tapping outside closes it, and keyboard/focus behavior remains acceptable. | P1 | S | Done |
| SK-57 | UX | Tablet | Tablet-wide layout should be decent | It does not need to be fully optimized for phones, but tablet-wide viewports should not break layout. | Tablet-wide viewport shows usable navigation and content without horizontal page clipping. | P2 | M | Done |
