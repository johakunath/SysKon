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

Reihenfolge nach dem Sales-Output-First-Pivot (Juni 2026). Abhängigkeiten stehen in der Spalte „Hängt ab von". Begründung der Umsortierung: `docs/BACKLOG_WORK_PACKAGES.md` (WP13) und `docs/PRODUCT_ROADMAP.md`.

| Order | Epic | Work Package | Outcome | Next Child | Hängt ab von | Priority | Effort | Status |
|---:|---|---|---|---|---|---|---|---|
| 1 | SK-72 | WP10 Bestehende Tools & Learnings prüfen | Vor dem Überbauen Richtpreis-, Planungs- und Solution-Finder-Learnings auswerten (Input für WP12/WP8) | SK-72 | – | P1 | M | Todo |
| 2 | SK-74 | WP12 Technical System Package Logic | Technisches Systempaketmodell für MVP-Hybrid-Luft/Wasser-Wärmepumpen-Contracting schärfen | SK-74 | SK-72 | P1 | XL | Todo |
| 3 | SK-70 | WP8 Contracting-Angebot & Pricing-Logik | Realistische GP/AP-/Preisgleitformel-Logik mit internem Commercial Layer vorbereiten | SK-70 | SK-85 (erledigt), SK-74 | P1 | XL | Todo |
| 4 | SK-71 | WP9 Angebotsvarianten, Speichern, PDF & Export | Angebotsvarianten speichern, duplizieren, exportieren und später übertragen können | SK-71 | SK-70 | P1 | L | Todo |

## Aktueller Fokus

WP0 bis WP7, WP11, das UX-Prerequisite vor SK-70, der Sales-Output-First-Block (SK-83 CI-Gate und WP13/SK-84 Kunden-/Internsicht-Modus), WP15 (Layout & Element QA: geteilte UI-Bausteine, zentrale Texte, Design-Tokens, SK-88 rechte Vorschau verschlankt), WP16 (Navigation & Naming: Flow „Angebot erstellen → Angebot", ein Admin-Bereich, Richtpreis-Reframe ohne Binding-Offer-Disclaimer) sowie WP14/SK-89 (Playbook de-emphasizen: prominente Inline-Playbook-UI bereits in UX-SK70-PRE durch dezenten Gesprächshinweis ersetzt, toter `.playbook`-CSS entfernt, SK-59 als `Deferred` bestätigt, SK-67-Playbook-Daten bleiben im Code/Admin/Tests) sind umgesetzt und im Archiv. Mit WP16 ist das frühere „kein verbindliches Angebot"-Non-Goal aus SK-58 vom PO aufgehoben; SysKon ist jetzt als Richtpreis-Angebotstool (Demo) gerahmt. Nächster Queue-Punkt ist WP10/SK-72 (bestehende Tools & Learnings prüfen). WP10/SK-72 bleibt vor WP12/WP8 gezogen, weil seine Learnings Input für das technische und das Pricing-Modell sind; WP8 setzt zusätzlich auf dem in WP13 gebauten Sichtmodus auf.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
