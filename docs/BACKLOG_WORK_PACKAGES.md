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

Schutzplanke (SK-88): Die Sidebar wurde bewusst verschlankt. SK-95 muss die
neuen Daten kompakt und scanbar integrieren – keine Wall-of-Data, keine
doppelten Angaben zu bereits gezeigten Informationen.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-95 | Epic | Sidebar | Angebots-Snapshot Sidebar | GP + AP live in Sidebar + Ergebnis-Kundensicht. Förderart (Typ, z.B. BEG EM) kundenseitig sichtbar; Förderbetrag und CapEx bleiben intern. Komponentenliste (Namen, keine Preise) in Kundensicht; Komponentenkosten per Gruppe in Internsicht. Ersetzt den alten intern-only Richtpreis-Korridor-Block. | GP/AP live in Sidebar; Förderart kundenseitig sichtbar (kein Betrag); Komponentennamen in Kundensicht ohne €; Internsicht zeigt zusätzlich CapEx netto + Förderbetrag + Komponentenkosten; Sidebar bleibt scanbar. | P1 | M | Done |

---



## SK-98 – Kurze Hinweise verbessern (NICHT Playbook zurückbringen)

Ziel: Der bestehende kurze Gesprächshinweis (`hinweisKurz`, max. 150 Zeichen)
neben jeder Frage soll vollständig befüllt und gut sichtbar sein.

Schutzplanke (SK-89): Die prominente Inline-Playbook-UI (`warum`, `warnsignale`,
`einordnung`) wurde bewusst entfernt und ist nur noch im Admin editierbar.
SK-98 darf diese Entscheidung NICHT rückgängig machen. Kein `warum`-Block,
kein `warnsignale`-Accordion, keine `einordnung`-Texte im Hauptflow.

Was SK-98 stattdessen tut:
- Sicherstellen, dass `hinweisKurz` für alle relevanten Fragen befüllt ist
- Ggf. visuellen Kontrast oder Kompaktheit des Gesprächshinweises verbessern
- Optional: ein diskretes Tooltip-/Info-Icon (nicht ausklappbarer Block) für
  zusätzlichen Kontext wo nötig – immer einzeilig, niemals Fließtext-Blöcke

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-98 | Epic | UX | Kurze Hinweise verbessern | `hinweisKurz` für alle wichtigen Fragen befüllen; visuell gut sichtbar halten. Kein Playbook-Block inline – das wurde in SK-89 bewusst entfernt. | Alle Fragen mit relevantem Kontext haben einen kurzen Hinweis (max. 150 Z.); kein warum/warnsignale/einordnung im Hauptflow; kein Modal, kein Accordion; Playbook bleibt Admin-only. | P2 | S | Todo |

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

Schutzplanke (SK-94): Der Binding-Offer-Disclaimer wurde bewusst entfernt. Aber
der Charakter als Richtpreis-Angebot (Demo) muss sichtbar bleiben – keine
Formulierungen, die ein verbindliches Angebot suggerieren.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-100 | Epic | Results | Angebot als Dokument | Kundensicht mit sauberem Dokumentlayout: Logo-Platzhalter, Angebotsname, Datum, klare Sektionen. PDF-Export via window.print() bleibt. „Richtpreis-Angebot (Demo)"-Label bleibt sichtbar (kein verbindliches Angebot). | Erkennbare Dokumentstruktur; Name+Datum oben; Logo-Platzhalter; Druckversion professionell; keine Tab-Navigation im Kundensicht-Print; Richtpreis-Demo-Kennzeichnung vorhanden. | P3 | M | Todo |

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
