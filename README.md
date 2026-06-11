# Projektentwicklungs-Konfigurator (Demo-Prototyp, Stufe 1)

Interner klickbarer Prototyp: aus Gebäudedaten wird per Regel-Engine ein strukturiertes
Richt-Leistungsverzeichnis für Wärmepumpen-Contracting in Bestands-MFH abgeleitet.
**Alle Zahlen sind Demo-Annahmen.** Kein Angebotstool, keine rechtsverbindliche Berechnung.

Fachliches Konzept: `HANDOVER.md` · Arbeitsvorrat: `BACKLOG.md` · Regeln für KI-Sessions: `CLAUDE.md`

## Starten

```bash
npm install     # einmalig
npm run dev     # öffnet die App unter http://localhost:5173
```

## Prüfen

```bash
npm test        # rechnet die 4 Referenz-Testfälle durch die Engine
npm run build   # prüft, ob die App fehlerfrei baut
```

## Die 5 Screens

1. **Konfiguration** – Eingabesektionen A–J, dynamische Fragen, Live-Panel (Status, Datenqualität, Kosten)
2. **Ergebnis** – Konfigurationsergebnis, Leistungsverzeichnis mit Begründung je Position, Kostenübersicht
3. **Handover** – Prüfliste für PE/Engineering, fehlende Daten, Druck-Export
4. **Annahmen & Regeln** – alle Demo-Werte inline editierbar, Regelliste als Wenn-Dann-Tabelle
5. **Testfälle** – Konfigurationen speichern, neu rechnen, Diff gegen Referenzlauf

## Weiterentwicklung per Vibe Coding

Dieses Repo ist für die Arbeit mit KI-Agenten eingerichtet:
ein Task = ein Backlog-Item in `BACKLOG.md`. Einer neuen Claude-Session genügt z. B.:
„Lies CLAUDE.md und BACKLOG.md und übernimm SK-17."
