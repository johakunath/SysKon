# BACKLOG

Mobiler Kurzindex für aktive Arbeit. Details stehen in den verlinkten Arbeitsdokumenten, damit neue Agent-Sessions wenig Kontext laden müssen.

## Start hier

1. Lies `AGENTS.md`.
2. Wenn der Nutzer "next epic" sagt: nimm die erste nicht erledigte Zeile aus `Next Epic Queue`.
3. Plane zuerst konkret, dann bearbeite den vom Nutzer freigegebenen Umfang.
4. Wenn zusammenhängende Child-Tickets klar in einen PR gehören: mutig bündeln, aber den Diff fokussiert halten.
5. Öffne nur die für den Umfang nötigen Dateien und bei Bedarf die verlinkten Detaildokumente.
6. Nach Änderungen: `npm test`; bei UI/App-Änderungen zusätzlich `npm run build`.
7. Erledigte Work Packages aus `BACKLOG.md` und `docs/BACKLOG_WORK_PACKAGES.md` entfernen und in `docs/BACKLOG_ARCHIVE.md` archivieren, damit aktive Agent-Sessions wenig Kontext laden.

## Detaildokumente

- Produkt-Roadmap nach Konzept-Pivot: `docs/PRODUCT_ROADMAP.md`
- Demo-Vision und Stakeholder-Brief: `docs/DEMO_BRIEF.md`
- Arbeitsgruppen und Ticketdetails: `docs/BACKLOG_WORK_PACKAGES.md`
- Code- und Produktkontext für Agenten: `docs/CODEBASE_NOTES.md`
- Erledigte / historische Tickets: `docs/BACKLOG_ARCHIVE.md`
- Produktbrief: `HANDOVER.md` -> `docs/HANDOVER_FULL.md`

## Produktfokus

SysKon ist primär ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche, kein PE-Handover- oder Planungstool.

- Sales Tool first, PE engine underneath.
- Kundengespräch unterstützen, keine Customer-Self-Service-Bestellstrecke.
- Frühe Konfiguration und Erklärung, kein finales Angebot und keine Engineering-Auslegung.
- Richtpreis, Lösungskorridor und nächster sinnvoller Schritt statt verbindlichem Angebot.
- Demo-Zielgruppe Jun 2026: internes Team (PM, Führung, Ingenieure). Siehe `docs/DEMO_BRIEF.md`.

## Werte

- Type: `Epic|Story|Bug|UX|Tech Debt|Question`
- Priority: `P0|P1|P2|P3`
- Effort: `XS|S|M|L|XL`
- Status: `Todo|In Progress|Blocked|Done|Deferred`

## Next Epic Queue

Reihenfolge nach Demo-Vision Jun 2026. Details und Einwände der Ingenieure: `docs/DEMO_BRIEF.md`.

| Order | Epic | Outcome | Hängt ab von | Priority | Effort | Status |
|---:|---|---|---|---|---|---|
| 1 | SK-101 Sidebar-/Ergebnis-Konsolidierung & Vertragstyp | Konfiguration-Sidebar entschlackt, Ergebnis in Info/Aktionen gesplittet, Vertragstyp-Frage (AVB/Individual), Vendor-Namen-Bereinigung | SK-95 (Angebots-Snapshot Sidebar, Done) | P1 | L | Done |
| 2 | SK-102 Katalog- & Kostendatenbank (CPQ-Demo) | Artikelstamm mit Rabattgruppen + simulierter DATANORM-Import, EK/VK-Kette im LV, Installations-Einzelpositionen, Anfahrt aus PLZ-Demo-Distanz, Service als Vertragsartikel (OpEx) | – | P1 | XL | Done |
| 3 | SK-72 Bestehende Tools & Learnings | Discovery: bestehende Contractor-Tools auswerten (erfordert Input vom PO) | – | P1 | M | Blocked |

## Aktueller Fokus

SK-102 ist umgesetzt: Artikeldatenbank (fiktive Lieferanten, Listenpreis → Rabattgruppe → EK → VK-Aufschlag) speist Hardware- und Servicevertragspreise im LV; Admin-Tab „Artikeldatenbank" mit simuliertem DATANORM-Import (Preise überschreiben, Artikel ergänzen, Konditionen aktualisieren – kein echter Parser); Installation als ~13 Einzelpositionen inkl. bedingter Demontagen (Öltank, nicht nutzbarer Kessel); Anfahrt als km-Position (Installationspartner → Projekt-PLZ, Demo-Distanz statt Google-Maps-API). Details: `docs/BACKLOG_WORK_PACKAGES.md`. SK-72 bleibt geblockt.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
