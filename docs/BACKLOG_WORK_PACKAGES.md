# Backlog Work Packages

Dieses Dokument enthält die Detailansicht. `BACKLOG.md` bleibt der mobile Einstieg.

Aktueller Produktfokus: SysKon ist zuerst ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche. PE-, LV- und Engineering-Logik bleiben als interne Guardrails wichtig, sind aber nicht der sichtbare Hauptworkflow. Demo-Vision: `docs/DEMO_BRIEF.md`. Roadmap: `docs/PRODUCT_ROADMAP.md`.

Regel für "next epic": Wähle das erste nicht erledigte Epic aus `BACKLOG.md`, dann hier das erste Child mit `In Progress`; falls keines existiert, das erste Child mit `Todo`.

Umfangsregel: Der Agent plant zuerst. Wenn der Nutzer einen zusammenhängenden Scope freigibt, dürfen mehrere Child-Tickets in einem PR umgesetzt werden. Dabei gilt: mutig bündeln, aber keine fachfremden Änderungen einschleppen.

Token-Regel: Erledigte Work Packages und erledigte Child-Tickets stehen nicht dauerhaft in diesem aktiven Detaildokument. Nach Abschluss werden sie nach `docs/BACKLOG_ARCHIVE.md` verschoben oder dort zusammengefasst.

---

## SK-101 – Sidebar-/Ergebnis-Konsolidierung, Vertragstyp & Vendor-Namen-Bereinigung

Ziel: Nach Live-Annotationen die Konfiguration-Sidebar von Redundanzen befreien
und den Ergebnis-Screen in Informationen (links) vs. Aktionen (rechte
Sticky-Sidebar) strukturieren. Zusätzlich eine echte Vertragstyp-Weiche
(AVB-Fernwärme vs. Individualvertrag) einführen und einen real existierenden
Vendor-Namen, der versehentlich als Platzhalter im Code/den Docs gelandet
war, vollständig entfernen (siehe CLAUDE.md-Hard-Rule).

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-101 | Epic | Konfiguration/Ergebnis | Sidebar-Konsolidierung, Ergebnis-Layout-Split, Vertragstyp-Frage | Konfiguration-Sidebar: Snapshot-Redundanzen, Tooltips und doppelte Status-/Datenqualität-/Gesprächsrisiken-Blöcke zu einem "Offene Punkte"-Block konsolidiert; Lösungs-Vorschau/Aufstelloptionen/Leistungen visuell gruppiert; breitere/größere Sidebar. Ergebnis-Screen in `.ergebnis-layout` (Info links, Aktionen rechts sticky) restrukturiert; LV in "Leistungsverzeichnis" umbenannt (Zeilen default offen, globaler Toggle, Kunden-/Interninfo je Position zusammengeführt). Admin-Navigation vereinfacht (Gear-Button navigiert direkt). Neue Frage `vertragstyp` (AVB-Fernwärme/Individualvertrag): AVB bindet Laufzeit fest auf `AVB_LAUFZEIT_JAHRE` (10, nicht admin-editierbar) und nutzt die §24-Preisgleitformel; Individualvertrag erlaubt freie Laufzeit/Preisanpassung. "MVP"-Jargon und der reale Vendor-Name aus der CLAUDE.md-Hard-Rule vollständig aus Code/Tests/Docs entfernt. Codex-Review-Findings zu Rechtssicherheits-Wording und stale-Admin-Config adressiert. | 129 Tests grün; kein "MVP" oder der in CLAUDE.md genannte Vendor-Name mehr in `src/`/Docs; AVB-Laufzeit bleibt 10 Jahre unabhängig von persistierter Admin-Config; Ergebnis-Sidebar bleibt beim Scrollen sichtbar (sticky); Print-Layout kollabiert weiterhin auf eine Spalte. | P1 | L | Done |

---

## SK-102 – Katalog- & Kostendatenbank (CPQ-Demo)

Ziel: Die Kostenlogik demonstriert eine CPQ-typische Katalog-/Preisdatenbank,
wie der PO sie aus früheren Configure-Price-Quote-Tools kennt: Artikelstamm
mit Artikelnummern, Kurz-/Langtexten, Listenpreisen und Rabattgruppen je
Lieferant, gepflegt über (simulierte) DATANORM-Uploads. Nicht-Katalog-Kosten
(Fundament, Netzanschluss, Hydraulikpaket, Umfeld) bleiben Annahmen-basiert.
PO-Entscheidungen: Import nur simuliert (kein Parser); Anfahrt als
Demo-Distanzrechnung statt einer externen Kartendienst-API; volle EK/VK-Kette;
Servicevertrag als Artikelpreis je WP-Modul p.a.; Installations-Einzelkomponenten
in Summe nahe der früheren 60-k€-Pauschale.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-102 | Epic | Katalog/Kosten | Artikelstamm, DATANORM-Demo-Import, Rabattgruppen, Installations-Einzelpositionen, Anfahrtskalkulation | Neuer Artikelstamm `src/data/artikel.js` (fiktive Lieferanten, Hard Rule beachtet) + EK/VK-Kette `src/logic/artikelPreise.js` (Listenpreis − Rabattgruppe/Generalrabatt = EK; × `vk_aufschlag_material` = VK). Katalog-Hardware (WP-Modul, Speicher/FWS, Schallzubehör, Monitoring, Messkonzept, SmartControl) und Serviceverträge (je WP-Modul p.a., OpEx) preisen über `kosten.typ='artikel'`; Engine reichert LV-Positionen mit Artikel-Kalkulation an (nur Internsicht/CSV; Kundensicht zeigt Artikelnummer ohne Preise). Installation in 13 Einzelpositionen (`k_inst_*`) inkl. bedingter Demontagen (Öltank-Frage `oeltank_vorhanden`, Kessel nicht nutzbar) über neue Positions-Bedingungen. Anfahrt als km-Position: Fahrstrecke Installationspartner (fiktiv, `src/data/partner.js`) → Projekt-PLZ (`projekt_plz`) über PLZ-Leitzonen-Zentroide × Straßenfaktor (`src/logic/entfernung.js`, Demo-Ersatz für eine externe Kartendienst-Distanz, Fallback ohne PLZ/Partner); €/km = km-Satz + Stundensatz ÷ Ø-Geschwindigkeit, × 2 × Fahrten. Admin-Tab „Artikeldatenbank": Artikel/Listenpreise/Rabattgruppen editierbar, simulierter DATANORM-Import (`applyDatanormDemoImport`, idempotent, Import-Historie), Persistenz in `syskon_admin_config_v1`. | 160 Tests grün (`tests/artikel.test.js`, `tests/entfernung.test.js`, SK-102-Engine-Tests); Referenzfall bleibt im gewohnten Korridor (Installationsgruppe ≈ 60 k€, WP-Modul-VK ≈ 22 k€); Rabattgruppen-Änderung wirkt live auf LV; zweiter Demo-Import meldet „keine Änderungen"; keine realen Firmennamen bei neuen Lieferanten/Partnern. | P1 | XL | Done |

---

## WP10 – Bestehende Tools & Learnings prüfen (SK-72, Blocked)

Status: **Blocked** – erfordert Zugang zu bestehenden Contractor-Tools durch den PO.

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
