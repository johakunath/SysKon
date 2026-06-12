# Backlog

Arbeitsvorrat für alle Agent-Sessions. Regeln: siehe `CLAUDE.md`.
Status: `Offen` → `In Arbeit` → `Erledigt` (mit Datum). Ein Item = ein Commit.
Neue Items unten in der passenden Sektion anlegen (nächste freie SK-Nummer).

## v0.1 Build

| ID | Titel | Beschreibung | Dateien | Prio | Status |
|---|---|---|---|---|---|
| SK-01 | Projekt-Setup React+Vite | package.json, vite.config.js, index.html, main.jsx, Vitest | Root, `src/main.jsx` | hoch | Erledigt 11.06.2026 |
| SK-02 | Demo-Annahmen | Alle Annahmen aus HANDOVER §5 als editierbares Datenobjekt | `src/data/annahmen.js` | hoch | Erledigt 11.06.2026 |
| SK-03 | Regelsatz R01–R18 | 18 Regeln aus HANDOVER §4 im Schema §2.2 (deklarativ) | `src/data/regeln.js` | hoch | Erledigt 11.06.2026 |
| SK-04 | Komponentenkatalog | 6 Pakettypen mit Varianten + LV-Positionen (Kostenformel, Förderflag, CapEx/Opex) | `src/data/katalog.js` | hoch | Erledigt 11.06.2026 |
| SK-05 | Fragebogen A–J | Dynamische Fragen mit Sichtbarkeitsbedingungen, Tooltips, DQ-Gewichten | `src/data/fragen.js` | hoch | Erledigt 11.06.2026 |
| SK-06 | Presets/Testfälle | Referenzfall §3.3 + 4 Testfälle §17 mit Erwartungswerten | `src/data/presets.js` | hoch | Erledigt 11.06.2026 |
| SK-07 | Berechnungen | Heizlast-Proxy, Kaskade, Schallformel R18, Kosten/Förderung/Energie | `src/logic/calc.js` | hoch | Erledigt 11.06.2026 |
| SK-08 | Regel-Engine | Fixpunkt-Schleife, require/exclude/warn/status, DQ-Deckelung | `src/logic/engine.js` | hoch | Erledigt 11.06.2026 |
| SK-09 | Preset-Validierung | Vitest: 4 Testfälle gegen Erwartungen aus HANDOVER §6 | `tests/presets.test.js` | hoch | Erledigt 11.06.2026 |
| SK-10 | App-Shell + Styles | Navigation 5 Screens, globaler State, 3-Spalten-CSS | `src/App.jsx`, `src/styles.css` | hoch | Erledigt 11.06.2026 |
| SK-11 | Screen 1 Konfiguration | Sektionen A–J links, dyn. Fragen Mitte, Live-Panel rechts | `src/screens/Konfiguration.jsx` | hoch | Erledigt 11.06.2026 |
| SK-12 | Screen 2 Ergebnis | Tabs Konfigurationsergebnis / LV mit Begründung / Kostenübersicht | `src/screens/Ergebnis.jsx` | hoch | Erledigt 11.06.2026 |
| SK-13 | Screen 3 Handover | Prüfliste, fehlende Daten, Prüfpunkte, Empfehlung, Druck | `src/screens/Handover.jsx` | hoch | Erledigt 11.06.2026 |
| SK-14 | Screen 4 Annahmen & Regeln | Inline-editierbare Annahmen, Regeltabelle, Live-Neuberechnung | `src/screens/Annahmen.jsx` | hoch | Erledigt 11.06.2026 |
| SK-15 | Screen 5 Testfälle | Speichern (localStorage), Rechenlauf, Diff-Tabelle | `src/screens/Testfaelle.jsx` | hoch | Erledigt 11.06.2026 |
| SK-21 | Render-Smoke-Test Screens | Alle 5 Screens rendern fehlerfrei mit jedem Preset (SSR, ohne Browser) | `tests/screens.test.jsx` | hoch | Erledigt 11.06.2026 |
| SK-22 | Review-Fix: `!=` bei leerem Feld | PR-#1-Review: unbeantwortetes Feld darf keinen Negativ-Treffer auslösen (R17 machte leere Konfiguration rot) | `src/logic/engine.js`, `tests/presets.test.js` | hoch | Erledigt 11.06.2026 |
| SK-23 | Schriften IBM Plex (self-hosted) | Neue Dependencies `@fontsource/ibm-plex-sans` + `@fontsource/ibm-plex-mono`. Begründung: eigenständiges Ingenieurs-Schriftbild, identisch auf allen Rechnern, Tabellenziffern für €/kW/dB-Spalten; lokal gebundelt statt Google-CDN (DSGVO) | `package.json`, `src/main.jsx` | mittel | Erledigt 11.06.2026 |
| SK-24 | Redesign „Stahlblau & Signal" | Durchgängiges Erscheinungsbild: Design-Tokens, Stahlblau-Topbar, Haarlinien statt Schatten, Monospace-Ziffern, Status-Ampeln als CSS-Klassen, dezente 140-ms-Übergänge (mit `prefers-reduced-motion`) | `src/styles.css`, `src/App.jsx`, `src/screens/*.jsx`, `src/screens/format.js` | mittel | Erledigt 11.06.2026 |

## v0.1 Verbesserungen (offen)

| ID | Titel | Beschreibung | Dateien | Prio | Status |
|---|---|---|---|---|---|
| SK-16 | Druck-Stylesheet verfeinern | `window.print()`-Ausgabe des Handover-Screens sauber formatieren (Seitenumbrüche, keine Navigation) | `src/styles.css`, `src/screens/Handover.jsx` | mittel | Offen |
| SK-17 | Tooltips vervollständigen | Jede Frage in A–J bekommt einen „Warum fragen wir das?"-Tooltip | `src/data/fragen.js` | mittel | Erledigt 12.06.2026 |
| SK-18 | LV-Export CSV | LV-Tabelle als CSV herunterladen (ohne neue Dependency) | `src/screens/Ergebnis.jsx` | niedrig | Offen |
| SK-19 | Engine-Unit-Tests | Einzeltests für exclude>require, Status-Verschlechterung, DQ-Deckelung | `tests/engine.test.js` (neu) | mittel | Offen |
| SK-20 | Eingabevalidierung | Plausibilitätsgrenzen für Zahlenfelder (z. B. Fläche, MWh) mit Inline-Hinweis | `src/data/fragen.js`, `src/screens/Konfiguration.jsx` | mittel | Erledigt 12.06.2026 |

## Roadmap (aus HANDOVER, nicht v0.1)

| ID | Titel | Beschreibung | Prio | Status |
|---|---|---|---|---|
| SK-30 | Stufe 2: Grundpreis/Arbeitspreis | Laufzeiten 10/15/20 J., Ziel-IRR 13/15 %, Marge nur auf Arbeitspreis (HANDOVER §7/Stufe 2) | später | Offen |
| SK-31 | Monoenergetischer Pfad | Aktuell nur Roadmap-Platzhalter im UI; echte Auslegung mit Heizstab | später | Offen |
| SK-32 | Preisgleitformeln | Marktglied/Kostenglied, Indizes; aktuell nur Roadmap-Hinweis | später | Offen |
| SK-33 | Admin-Backend | Echter Editor über die 3 Datenebenen (Annahmen/Regeln/Katalog) mit Versionierung | später | Offen |
| SK-34 | BEG-Kostendeckel | Förderdeckel-Logik; aktuell nur Warnhinweis | später | Offen |
