# Arbeitsregeln für Agent-Sessions (SysKon)

Demo-Prototyp „Projektentwicklungs-Konfigurator" (Configure-to-Order, Stufe 1).
Fachliche Quelle: `HANDOVER.md` (Abschnitt 2 ist verbindlich). Dieses Projekt wird
ausschließlich per Vibe Coding entwickelt — kein Programmierer im Loop.

## Workflow (immer)

1. `BACKLOG.md` lesen. Genau EIN Item wählen, Status auf `In Arbeit` setzen.
2. Nur die Dateien lesen, die laut Dateikarte (unten) für das Item nötig sind — nie das ganze Repo.
3. Umsetzen. `npm test` muss grün sein. Bei UI-Änderungen zusätzlich `npm run build`.
4. Backlog-Item auf `Erledigt` + Datum setzen. Neue Erkenntnisse/Folgearbeiten als neue Items eintragen.
5. Ein Commit pro Backlog-Item (`SK-XX: Kurzbeschreibung`), Push auf den Feature-Branch.

## Dateikarte (was liegt wo)

| Aufgabe betrifft… | Dateien |
|---|---|
| Demo-Annahmen, Preise, Schallgrenzen, Förderquoten | `src/data/annahmen.js` |
| Regeln R01–R18 (Wenn-Dann) | `src/data/regeln.js` |
| Pakete, Varianten, LV-Positionen, Kostenformeln | `src/data/katalog.js` |
| Fragebogen A–J, Sichtbarkeit, Tooltips, Pflichtfragen | `src/data/fragen.js` |
| Presets / Testfälle 1–4 | `src/data/presets.js` |
| Regel-Engine (Fixpunkt, Statuslogik, DQ-Score) | `src/logic/engine.js` |
| Berechnungen (Heizlast, Kaskade, Schall, Kosten, Förderung) | `src/logic/calc.js` |
| Screen 1 Konfiguration (3-Spalten-Layout) | `src/screens/Konfiguration.jsx` |
| Screen 2 Ergebnis (Tabs: Ergebnis / LV / Kosten) | `src/screens/Ergebnis.jsx` |
| Screen 3 Handover/Prüfliste/Druck | `src/screens/Handover.jsx` |
| Screen 4 Annahmen & Regeln (editierbar) | `src/screens/Annahmen.jsx` |
| Screen 5 Testfälle (speichern/Diff) | `src/screens/Testfaelle.jsx` |
| Navigation, globaler State | `src/App.jsx` |
| Anzeige-Helfer (€-Format, Regel-Texte) | `src/screens/format.js` |
| Styling | `src/styles.css` |
| Validierung der 4 Presets | `tests/presets.test.js` |
| Render-Smoke-Test aller Screens | `tests/screens.test.jsx` |

## Eiserne Regeln

- **Fachlogik und Zahlen nur deklarativ in `src/data/` ändern.** Engine und Calc bleiben generisch.
- `src/logic/` und `src/data/` importieren **kein React** (bleiben pur testbar).
- **Keine neuen Dependencies** ohne eigenes Backlog-Item mit Begründung.
- Alle Zahlen sind **Demo-Annahmen** und müssen im UI so gekennzeichnet bleiben. Keine echten Firmen-/Kunden-/Projektnamen (HANDOVER §2.10).
- Schallrechnung ist eine Demo-Abschätzung, nie als rechtsverbindlich darstellen.
- Statusstufen: `gruen` < `gelb` < `orange` < `rot` — Engine nimmt immer die schlechteste.
- UI-Sprache Deutsch. Keine Smartphone-Optimierung nötig (Notebook bis großer Bildschirm).

## Token-Effizienz

- Kleine Items, kleine Diffs. Erst Dateikarte, dann gezielt lesen.
- Bei Fragen zur Fachlogik: zuerst `HANDOVER.md` Abschnitt 2–6 (nicht Abschnitt 7, der ist nur Hintergrund).
- Regeln/Annahmen/Katalog ändern heißt fast nie Engine ändern. Wenn doch: Test zuerst erweitern.
