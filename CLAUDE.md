# Agent guide (SysKon)

Read order: `BACKLOG.md` → this file → only referenced source files. Product roadmap if needed: `docs/PRODUCT_ROADMAP.md`. Full historical brief only if needed: `HANDOVER.md` → `docs/HANDOVER_FULL.md`.

## Workflow

1. Read `BACKLOG.md` and identify the next coherent work package or user-approved scope.
2. Propose a concrete plan before implementation; make it ambitious when related tickets clearly belong in one PR.
3. Read only files from the map below plus the ticket/work-package docs needed for that scope.
4. Keep the diff focused on the approved outcome; avoid unrelated redesigns/refactors.
5. Run `npm test`; run `npm run build` for UI/app changes.
6. Update backlog status if relevant; commit one focused change.

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
| Article DB/rebates/travel (SK-102) | `src/data/artikel.js`, `src/logic/artikelPreise.js`, `src/data/partner.js`, `src/logic/entfernung.js` |
| Calculations | `src/logic/calc.js` |
| Presets/tests | `src/data/presets.js`, `tests/*.js`, `tests/*.jsx` |

## Hard rules

- German UI text.
- Demo assumptions only; values are Richtpreise/Demo-Annahmen (no legal/funding/sound guarantees).
- Product framing: Sales Tool first, PE engine underneath; a Richtpreis-Angebot (Demo) that supports the customer conversation and internal concept alignment, not a self-service order path. (Updated Jun 2026, WP16: the earlier "no binding offer" non-goal was retired by the PO.)
- `src/logic/` and `src/data/` stay React-free.
- No new dependency without explicit backlog item.
- Status order: `gruen < gelb < orange < rot`; engine keeps worst status.
- Prefer short docs with links over duplicated explanations.
- Keep active backlog docs token-light: move completed Work Packages and completed child tickets out of `BACKLOG.md` / `docs/BACKLOG_WORK_PACKAGES.md` into `docs/BACKLOG_ARCHIVE.md`.
- Never name the contracting company itself or its internal pilot product name anywhere in code, data, comments, or docs — not as a placeholder or example. Use generic terms ("Contractor", "Messdienstleister", "das Systempaket") or the established company short form already used in `src/App.jsx` / `src/screens/Strategie.jsx`. (Jul 2026, PO instruction; a previously used real metering-services vendor name was scrubbed repo-wide for this reason — do not reintroduce it.)
- Real **supplier, manufacturer and installation-partner** names ARE permitted (PO, Jul 2026 — this narrows the earlier blanket vendor ban, which was too broad). The WP reference manufacturer in `src/data/annahmen.js` is a real name. The demo suppliers in `src/data/artikel.js` and partners in `src/data/partner.js` stay fictional until the PO supplies real names — do not invent them.
