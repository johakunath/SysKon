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

## Werte

- Type: `Epic|Story|Bug|UX|Tech Debt|Question`
- Priority: `P0|P1|P2|P3`
- Effort: `XS|S|M|L|XL`
- Status: `Todo|In Progress|Blocked|Done|Deferred`

## Next Epic Queue

| Order | Epic | Work Package | Outcome | Next Child | Priority | Effort | Status |
|---:|---|---|---|---|---|---|---|
| 1 | SK-74 | WP12 Technical System Package Logic | Technisches Systempaketmodell für MVP-Hybrid-Luft/Wasser-Wärmepumpen-Contracting schärfen | SK-74 | P1 | XL | Todo |
| 2 | SK-70 | WP8 Contracting-Angebot & Pricing-Logik | Realistische GP/AP-/Preisgleitformel-Logik mit internem Commercial Layer vorbereiten | SK-70 | P1 | XL | Todo |
| 3 | SK-71 | WP9 Angebotsvarianten, Speichern, PDF & Export | Angebotsvarianten speichern, duplizieren, exportieren und später übertragen können | SK-71 | P1 | L | Todo |
| 4 | SK-72 | WP10 Bestehende Tools & Learnings prüfen | Vor dem Überbauen Richtpreis-, Planungs- und Solution-Finder-Learnings auswerten | SK-72 | P1 | M | Todo |

## Aktueller Fokus

WP0 bis WP7 sowie das UX-Prerequisite vor SK-70 sind umgesetzt und im Archiv. Nächster Queue-Punkt ist WP12/SK-74 als technische Grundlage vor WP8/SK-70.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
