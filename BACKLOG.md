# BACKLOG

Mobiler Kurzindex für aktive Arbeit. Details stehen in den verlinkten Arbeitsdokumenten, damit neue Agent-Sessions wenig Kontext laden müssen.

## Start hier

1. Lies `AGENTS.md`.
2. Wenn der Nutzer "next epic" sagt: nimm die erste nicht erledigte Zeile aus `Next Epic Queue`.
3. Plane zuerst konkret, dann bearbeite den vom Nutzer freigegebenen Umfang.
4. Wenn zusammenhängende Child-Tickets klar in einen PR gehören: mutig bündeln, aber den Diff fokussiert halten.
5. Öffne nur die für den Umfang nötigen Dateien und bei Bedarf die verlinkten Detaildokumente.
6. Nach Änderungen: `npm test`; bei UI/App-Änderungen zusätzlich `npm run build`.

## Detaildokumente

- Arbeitsgruppen und Ticketdetails: `docs/BACKLOG_WORK_PACKAGES.md`
- Code- und Produktkontext für Agenten: `docs/CODEBASE_NOTES.md`
- Erledigte / historische Tickets: `docs/BACKLOG_ARCHIVE.md`
- Produktbrief: `HANDOVER.md` -> `docs/HANDOVER_FULL.md`

## Werte

- Type: `Epic|Story|Bug|UX|Tech Debt|Question`
- Priority: `P0|P1|P2|P3`
- Effort: `XS|S|M|L|XL`
- Status: `Todo|In Progress|Blocked|Done|Deferred`

## Next Epic Queue

| Order | Epic | Work Package | Outcome | Next Child | Priority | Status |
|---:|---|---|---|---|---|---|
| 1 | SK-42 | WP0 Demo-Fluss | Demo ohne verfrühte Übergabe-/Reifegrad-Signale | SK-43 | P0 | Todo |
| 2 | SK-46 | WP1 Ergebnis-Modell | Ergebnis wirkt wie Analyse/Vorlösung, nicht wie Kundenangebot | – | P1 | Done |
| 3 | SK-50 | WP2 Konfiguration | Konfiguration und Preview schneller scanbar machen | – | P1 | Done |
| 4 | SK-54 | WP3 Responsive | Tablet- und schmale Ansichten ohne offensichtliche Brüche | SK-57 | P1 | Todo |

## Aktueller Fokus

WP1 + WP2 wurden gemeinsam umgesetzt. Nächster offener Queue-Punkt bleibt nach Nutzerpriorität WP0 oder WP3 prüfen.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
