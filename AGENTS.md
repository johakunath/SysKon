# Agent guide (SysKon)

Read order: `BACKLOG.md` → this file → only referenced source files. Product roadmap if needed: `docs/PRODUCT_ROADMAP.md`. Full historical brief only if needed: `HANDOVER.md` → `docs/HANDOVER_FULL.md`.

## Workflow

1. Read `BACKLOG.md` and identify the next coherent work package or user-approved scope.
2. Propose a concrete plan before implementation; make it ambitious when related tickets clearly belong in one PR.
3. Read only files from the map below plus the ticket/work-package docs needed for that scope.
4. Keep the diff focused on the approved outcome; avoid unrelated redesigns/refactors.
5. Run `npm test`; run `npm run build` for UI/app changes.
6. Update backlog status if relevant; commit the approved scope as one focused change.

## File map

| Area | Files |
|---|---|
| App/nav/state | `src/App.jsx` |
| Config UI/sidebar/inputs/live preview/tooltips | `src/screens/Konfiguration.jsx` |
| Result/LV/costs | `src/screens/Ergebnis.jsx` |
| Hidden Handover/print | `src/screens/Handover.jsx` |
| Admin/test screens | `src/screens/Annahmen.jsx`, `src/screens/Testfaelle.jsx` |
| Styles | `src/styles.css` |
| Questions/tooltips/DQ weights | `src/data/fragen.js` |
| Rules/status | `src/data/regeln.js`, `src/logic/engine.js` |
| Assumptions/prices/catalog | `src/data/annahmen.js`, `src/data/katalog.js` |
| Calculations | `src/logic/calc.js` |
| Presets/tests | `src/data/presets.js`, `tests/*.js`, `tests/*.jsx` |

## Hard rules

- German UI text.
- Demo assumptions only; no customer-ready/legal claims.
- Product framing: Sales Tool first, PE engine underneath; customer conversation support, not self-service or binding offer.
- `src/logic/` and `src/data/` stay React-free.
- No new dependency without explicit backlog item.
- Status order: `gruen < gelb < orange < rot`; engine keeps worst status.
- Prefer short docs with links over duplicated explanations.
