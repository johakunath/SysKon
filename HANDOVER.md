# HANDOVER (quick pointer)

This root file is intentionally short for agent token efficiency.

- Current product roadmap after pivot: `docs/PRODUCT_ROADMAP.md`
- Full original handover/product brief: `docs/HANDOVER_FULL.md`
- Active work queue: `BACKLOG.md`
- Agent workflow/file map: `CLAUDE.md`

## Current product stance

Prototype only: Sales-facing Co-Creation- und Vorqualifizierungsdemo für Wärmepumpen-Contracting-Gespräche. Sales Tool first, PE engine underneath. Supports customer conversations, solution corridors, rough Richtindikation and next-step recommendations; not a PE handover tool, not a planning tool, not customer self-service, not ready for operations, pricing commitments, legal sound or subsidy calculations, or real offers.

## Read only what you need

- Rules/status/DQ: `docs/HANDOVER_FULL.md` sections 2–6, then `src/data/regeln.js` and `src/logic/engine.js`.
- Pricing/LV assumptions: `src/data/annahmen.js`, `src/data/katalog.js`.
- UI/page questions: `BACKLOG.md`, then the relevant screen in `src/screens/`.
