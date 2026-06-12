# BACKLOG (agent quick index)

Use this file for active work only. Historical/completed items live in `docs/BACKLOG_ARCHIVE.md`. Full product brief lives in `HANDOVER.md` → `docs/HANDOVER_FULL.md`.

## Rules

- One task = one small commit.
- Keep rows short; add detail in code/PR, not here.
- Allowed values: Type `Epic|Story|Bug|UX|Tech Debt|Question`; Priority `P0|P1|P2|P3`; Effort `XS|S|M|L|XL`; Status `Todo|In Progress|Blocked|Done|Deferred`.

## Current code findings

- Gesamtstatus: `src/logic/engine.js` computes `ergebnis.status` from `src/data/regeln.js` status effects plus SYS selected-variant exclusion; displayed in `Konfiguration`, `Ergebnis`, hidden `Handover`.
- Meaning: rule-derived, but unclear as user-facing lifecycle/readiness. Prefer clearer analysis indicators or explicit semantics before demos.
- Datenqualität: `dqScore()` in `src/logic/engine.js`; weights visible questions from `src/data/fragen.js`; displayed in `Konfiguration`, `Ergebnis`, hidden `Handover`.
- Component map: `Konfiguration.jsx` = sidebar/input/live preview/tooltips; `Ergebnis.jsx` = result/LV/costs; `Handover.jsx` = hidden handover; `src/data/fragen.js` = tooltip text.

## Active structured backlog

| ID | Type | Area | Title | Description | Acceptance Criteria | Priority | Effort | Status |
|---|---|---|---|---|---|---|---|---|
| SK-42 | Epic | App structure | Simplify app structure | Remove premature workflow signals. | Handover not demoed; status/DQ reviewed. | P0 | L | Todo |
| SK-43 | UX | Handover | Remove/de-emphasize Handover | Hidden from nav; code kept for now. | Decide remove vs deferred reference. | P0 | S | In Progress |
| SK-44 | Question | Status | Reconsider Gesamtstatus | Rule-derived but unclear to users. | Keep with semantics or replace. | P1 | M | Todo |
| SK-45 | Question | Data quality | Reconsider Datenqualität | Percentage needs product meaning. | Define threshold/action or de-emphasize. | P2 | S | Todo |
| SK-46 | Epic | Page model | Rework tab/page model | Align names with demo story. | Analysis/result split is clear. | P1 | L | Todo |
| SK-47 | UX | Ergebnis | Rename/restructure Ergebnis | Current title implies final result. | Rename to Analyse or split. | P1 | M | Todo |
| SK-48 | Story | Results | Merge LV + costs | Combine included scope then CAPEX. | One coherent result section. | P1 | M | Todo |
| SK-49 | UX | Vorlösung | Elaborate Vorlösung | Add scope/assumptions/limits. | No customer-ready implication. | P2 | S | Todo |
| SK-50 | Epic | Config layout | Improve configuration layout | Improve scanability only. | Desktop/tablet-wide easier to use. | P1 | L | Todo |
| SK-51 | UX | Config layout | Fixed 3-column layout | Sidebars fixed, center scrolls. | Works on desktop/tablet-wide. | P1 | M | Todo |
| SK-52 | Story | Preview | Full result preview | Preview shows solution, scope, CAPEX, assumptions. | Matches merged result content. | P1 | M | Todo |
| SK-53 | UX | Sidebar | Left title cleanup | Title changed; subtitle removed. | Visible title is Systempaket-Konfigurator. | P0 | XS | Done |
| SK-54 | Epic | Responsive | Mobile/tablet behavior | Avoid obvious breakage. | Header/tooltips/tablet usable. | P1 | M | Todo |
| SK-55 | Bug | Header | Full-width header | Avoid clipped header. | Header spans visible width. | P0 | XS | Done |
| SK-56 | Bug | Tooltips | Touch tooltips | Tap/focus/outside-close. | Works without invalid label markup. | P1 | S | Done |
| SK-57 | UX | Tablet | Tablet-wide layout decent | No full phone optimization. | Tablet-wide avoids clipping. | P2 | M | Todo |
