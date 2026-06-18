# Backlog Work Packages

Dieses Dokument enthält die Detailansicht. `BACKLOG.md` bleibt der mobile Einstieg.

Regel für "next epic": Wähle das erste nicht erledigte Epic aus `BACKLOG.md`, dann hier das erste Child mit `In Progress`; falls keines existiert, das erste Child mit `Todo`.

Umfangsregel: Der Agent plant zuerst. Wenn der Nutzer einen zusammenhängenden Scope freigibt, dürfen mehrere Child-Tickets in einem PR umgesetzt werden. Dabei gilt: mutig bündeln, aber keine fachfremden Änderungen einschleppen.

## WP0 Demo-Fluss und Semantik

Ziel: Der erste Demo-Durchlauf soll keine Reifegrad- oder Übergabeversprechen suggerieren, die fachlich noch nicht entschieden sind.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-43 | UX | Handover | Remove/de-emphasize Handover | Hidden from nav; code kept for now. | Decide remove vs deferred reference. | P0 | S | In Progress |
| SK-44 | Question | Status | Reconsider Gesamtstatus | Rule-derived but unclear to users. | Keep with semantics or replace. | P1 | M | Todo |
| SK-45 | Question | Data quality | Reconsider Datenqualität | Percentage needs product meaning. | Define threshold/action or de-emphasize. | P2 | S | Todo |

## WP1 Ergebnis-Modell

Ziel: Die Ergebnis-Ansicht soll klar zeigen, ob sie Analyse, Vorlösung, Richt-LV oder Kostenindikation ist.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-47 | UX | Ergebnis | Rename/restructure Ergebnis | Current title implies final result. | Rename to Analyse or split. | P1 | M | Done |
| SK-48 | Story | Results | Merge LV + costs | Combine included scope then CAPEX. | One coherent result section. | P1 | M | Done |
| SK-49 | UX | Vorlösung | Elaborate Vorlösung | Add scope/assumptions/limits. | No customer-ready implication. | P2 | S | Done |

## WP2 Konfiguration und Preview

Ziel: Die Konfiguration soll schneller scanbar werden, ohne die Demo fachlich umzubauen.

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-51 | UX | Config layout | Fixed 3-column layout | Sidebars fixed, center scrolls. | Works on desktop/tablet-wide. | P1 | M | Done |
| SK-52 | Story | Preview | Full result preview | Preview shows solution, scope, CAPEX, assumptions. | Matches merged result content. | P1 | M | Done |

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
