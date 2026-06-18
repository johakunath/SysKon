# SysKon — Sales-Konfigurator für Systempakete

Internal demo prototype. SysKon is now framed as a sales-facing co-creation and pre-qualification tool for heat pump contracting conversations: Sales Tool first, PE engine underneath. It supports customer conversations, solution corridors, rough Richtindikation and next-step recommendations; it is not customer self-service, not a planning tool and not a binding offer generator. All numbers are demo assumptions.

## Agent entry points

- Active tasks: `BACKLOG.md`
- Agent workflow/file map: `CLAUDE.md`
- Product roadmap: `docs/PRODUCT_ROADMAP.md`
- Product brief pointer: `HANDOVER.md`
- Full archived product brief: `docs/HANDOVER_FULL.md`
- Completed backlog archive: `docs/BACKLOG_ARCHIVE.md`

## Run/check

```bash
npm install
npm run dev
npm test
npm run build
```

## Current visible app flow

1. `Konfiguration` — guided building/customer questions, live solution preview.
2. `Ergebnis` — solution analysis, Richtindikation, Prüfbedarf and internal scope details.
3. Admin toggle — assumptions/rules and test cases.

`Handover` code still exists but is intentionally hidden from the main demo flow; it is not the primary product story.
