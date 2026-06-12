# SysKon — Systempaket-Konfigurator

Internal demo prototype. Not customer-facing; all numbers are demo assumptions.

## Agent entry points

- Active tasks: `BACKLOG.md`
- Agent workflow/file map: `CLAUDE.md`
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

1. `Konfiguration` — questions, live analysis preview.
2. `Ergebnis` — solution analysis, LV, costs.
3. Admin toggle — assumptions/rules and test cases.

`Handover` code still exists but is intentionally hidden from the main demo flow.
