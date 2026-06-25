# Backlog Work Packages

Dieses Dokument enthält die Detailansicht. `BACKLOG.md` bleibt der mobile Einstieg.

Aktueller Produktfokus: SysKon ist zuerst ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche. PE-, LV- und Engineering-Logik bleiben als interne Guardrails wichtig, sind aber nicht der sichtbare Hauptworkflow. Demo-Vision: `docs/DEMO_BRIEF.md`. Roadmap: `docs/PRODUCT_ROADMAP.md`.

Regel für "next epic": Wähle das erste nicht erledigte Epic aus `BACKLOG.md`, dann hier das erste Child mit `In Progress`; falls keines existiert, das erste Child mit `Todo`.

Umfangsregel: Der Agent plant zuerst. Wenn der Nutzer einen zusammenhängenden Scope freigibt, dürfen mehrere Child-Tickets in einem PR umgesetzt werden. Dabei gilt: mutig bündeln, aber keine fachfremden Änderungen einschleppen.

Token-Regel: Erledigte Work Packages und erledigte Child-Tickets stehen nicht dauerhaft in diesem aktiven Detaildokument. Nach Abschluss werden sie nach `docs/BACKLOG_ARCHIVE.md` verschoben oder dort zusammengefasst.

---

## SK-95 – Angebots-Snapshot in Konfiguration-Sidebar

Ziel: Die rechte Sidebar der Konfiguration-Hauptseite wird zum vollständigen
Angebots-Snapshot, der sich live mit jeder Eingabe aktualisiert. GP/AP + CapEx +
Förderung + Komponentenliste – kundenseitig sichtbar. Das ist der zentrale
„Wow-Moment" der Demo. Kontext: GP/AP-Engine fertig (WP8/SK-70); Sidebar zeigt
bereits Korridor (SK-60), aber nicht Contracting-Preise oder Förderung.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-95 | Epic | Sidebar | Angebots-Snapshot Sidebar | GP + AP (€/a) + CapEx-Richtwert + Förderungsbetrag/-art + Komponentenliste live in der rechten Konfiguration-Sidebar. Kundenseitig sichtbar (Förderung regulatorisch offenzulegen; CapEx ist Kundenverhandlungshebel). | GP/AP erscheint live; CapEx als Richtwert ±Band; Förderung mit Betrag+Typ sichtbar; Komponentenliste (WP, SmartControl, Aufstellung, Services) live; alles ohne Seitennavigation; kein intern-Guard für diese Werte. | P1 | M | Todo |

---

## SK-96 – Förderung kundenseitig sichtbar

Ziel: Förderbetrag und Förderart werden kundenseitig sichtbar – in der Sidebar
(via SK-95) und in der Ergebnis-Kundensicht. Regulatorisch geboten.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-96 | Epic | Results | Förderung kundenseitig | Förderbetrag (€) und Förderart (z.B. BEG EM) in Kundensicht und Sidebar. Aktuell hinter `!istKunde` verborgen. | Kundensicht zeigt Förderung; Sidebar zeigt Förderung; Hinweis „indikativ, kein Rechtsanspruch" bleibt; Intern-Detail (Förderquote, Berechnung) bleibt hinter Internsicht. | P1 | S | Todo |

---

## SK-97 – SmartControl als Katalogobjekt

Ziel: SmartZero SmartControl (KI-fähiges Steuergerät) als eigene Katalogposition
neben der Wärmepumpe – in Komponentenliste, Scope und Kalkulation.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-97 | Epic | Catalog | SmartControl Katalog | SmartControl als Katalogobjekt mit eigenem Kostenansatz, Scope-Zeile und Komponentenlisten-Eintrag. Optional: KI-Variante als Auswahlfeld. | Erscheint in KundenScope unter „Steuerung & Monitoring"; eigene LV-Position; optional: KI-Variante als Frage/Schalter; Tests prüfen Auftauchen in kundenScope. | P2 | S | Todo |

---

## SK-98 – Inline-Fragenkontext

Ziel: Alle Infos zur Fragenbeantwortung direkt neben der Frage – kein separates
Training nötig. Playbook-Daten (`warum`, `warnsignale`, `einordnung`) existieren
bereits in `src/data/fragen.js`; Rendering im Hauptflow ggf. nicht prominent genug.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-98 | Epic | UX | Inline-Fragenkontext | `warum`-Text, Einordnung und Richtwert inline neben dem Antwortfeld. Warnsignale kontextuell. | Jede Frage zeigt ihr `warum`; Richtwert/Einordnung wo vorhanden; Warnsignale wenn relevant; alles im Fließtext, kein Modal. | P2 | M | Todo |

---

## SK-99 – Admin auf Demo-Reife bringen

Ziel: Admin demonstriert Pflegbarkeit durch 1–2 interne Personen (PM + Engineer)
ohne Agency. Aktuell 6 Tabs, zu überwältigend für die Demo.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-99 | Epic | Admin | Admin Demo-Reife | Admin auf 3 Kernbereiche reduzieren: (1) Fragen & Playbook, (2) Katalog & Preise, (3) Regeln & Annahmen. Testfälle/Governance/Import sekundär. | Kommuniziert „Das kann ein PM konfigurieren"; 3 Hauptbereiche klar; unter 30 Sekunden um zu verstehen, was jeder Bereich tut. | P2 | S | Todo |

---

## SK-100 – Angebot als Dokument

Ziel: Ergebnis-Kundensicht sieht aus wie ein echtes Angebotsdokument, nicht wie
eine Web-App.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-100 | Epic | Results | Angebot als Dokument | Kundensicht mit sauberem Dokumentlayout: Logo-Platzhalter, Angebotsname, Datum, klare Sektionen. PDF-Export via window.print() bleibt. | Erkennbare Dokumentstruktur; Name+Datum oben; Logo-Platzhalter; Druckversion professionell; keine Tab-Navigation im Kundensicht-Print. | P3 | M | Todo |

---

## WP10 – Bestehende Tools & Learnings prüfen (SK-72, Blocked)

Status: **Blocked** – erfordert Zugang zu Techem-Bestandstools durch den PO.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-72 | Epic | Discovery | Bestehende Tools & Learnings prüfen | Richtpreis-Tool, WP-Planungstool, Solution Finder und weitere prüfen. Learnings zu Nutzen, Grenzen, Akzeptanz und Datenqualität dokumentieren. | Tools aufgelistet; Learnings dokumentiert; Anti-Patterns benannt; Entscheidungsvorlage verfügbar. | P1 | M | Blocked |

---

## Roadmap-Epics (deferred / future)

| ID | Type | Area | Title | Outcome | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|
| SK-59 | Epic | Conversation flow | Guided customer conversation flow | Fragen kundennah gruppiert, Folgefragen geführt, „Kunde weiß es nicht"-Pfade. | P1 | L | Deferred |
| SK-64 | Epic | Contracting | Contracting offer future scope | GP/AP/IRR dokumentiert als spätere Ausbaustufe (10/15/20 Jahre, Ziel-IRR 13/15%). | P2 | M | Todo |
| SK-65 | Epic | Integration | CRM and data integration future scope | Input/Output-Integrationen (CRM, Gebäudedaten, WeClapp) dokumentiert. | P3 | M | Todo |
