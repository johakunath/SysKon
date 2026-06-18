# BACKLOG

Mobiler Kurzindex für aktive Arbeit. Details stehen in den verlinkten Arbeitsdokumenten, damit neue Agent-Sessions wenig Kontext laden müssen.

## Start hier

1. Lies `AGENTS.md`.
2. Wenn der Nutzer "next epic" sagt: nimm die erste nicht erledigte Zeile aus `Next Epic Queue`.
3. Bearbeite innerhalb dieses Epics genau das angegebene nächste Child-Ticket.
4. Öffne nur die im Ticket genannten Dateien und bei Bedarf die verlinkten Detaildokumente.
5. Nach Änderungen: `npm test`; bei UI/App-Änderungen zusätzlich `npm run build`.
6. Ein Child-Ticket = ein kleiner Commit.

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
| 2 | SK-46 | WP1 Ergebnis-Modell | Ergebnis wirkt wie Analyse/Vorlösung, nicht wie Kundenangebot | SK-47 | P1 | Todo |
| 3 | SK-50 | WP2 Konfiguration | Konfiguration und Preview schneller scanbar machen | SK-51 | P1 | Todo |
| 4 | SK-54 | WP3 Responsive | Tablet- und schmale Ansichten ohne offensichtliche Brüche | SK-57 | P1 | Todo |

## Aktueller Fokus

`SK-42` ist das nächste Epic. Starte mit `SK-43`, weil es bereits `In Progress` ist. Danach innerhalb von WP0 weiter mit `SK-44`, dann `SK-45`.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
