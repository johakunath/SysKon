# Codebase Notes

Token-sparsame Orientierung für Agenten. Für Details nur die verlinkten Dateien öffnen.

## Kurzüberblick

- Stack: React 18 + Vite + Vitest, reine Client-App.
- Domäne: Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für erfahrene Sales-/KAM-Nutzer in der Systempaket-Konfiguration. Interne Prüf-, LV- und Techniklogik dient als Guardrail. Alle Werte sind Demo-Annahmen, keine kundenfertigen oder rechtlichen Aussagen.
- Architektur: UI in `src/screens/`, Daten in `src/data/`, React-freie Logik in `src/logic/`.

## Wichtigste Dateien

| Thema | Dateien | Wann öffnen |
|---|---|---|
| Navigation und globaler Zustand | `src/App.jsx` | Screen-Namen, Tabs, Admin-Modus, Preset-State |
| Konfiguration | `src/screens/Konfiguration.jsx`, `src/data/fragen.js` | Fragen, Tooltips, Live-Preview, Eingabe-UX |
| Ergebnis / LV / Kosten | `src/screens/Ergebnis.jsx`, `src/data/katalog.js` | Analyse, Leistungspositionen, Kostenanzeige, CSV |
| Regeln und Status | `src/logic/engine.js`, `src/data/regeln.js` | Status, Warnungen, Excludes/Requires, DQ |
| Technisches Paketmodell | `docs/SYSTEMPAKET_MODELL.md` | WP12-Domäne, Blocker/Korridore, Per-Child-Mapping |
| Contracting & Pricing | `src/logic/pricing.js`, `docs/PRICING_MODELL.md` | GP/AP/Preisgleitformel, Kundensicht vs. interne Commercial-Sicht (WP8) |
| Rechenlogik | `src/logic/calc.js`, `src/data/annahmen.js` | Heizlast, Schall, Energie, Demo-Parameter |
| Tests | `tests/*.js`, `tests/*.jsx` | Statusregeln, Presets, Render-Smoke |

## Aktuelle Code-Findings

- Gesamtstatus: `src/logic/engine.js` berechnet `ergebnis.status` aus `src/data/regeln.js` plus SYS-Sonderfall, wenn die gewählte Aufstellvariante gesperrt ist.
- Status-Reihenfolge: `gruen < gelb < orange < rot`; die Engine behält immer den schlechtesten Status.
- Datenqualität: `dqScore()` nutzt sichtbare Pflichtfragen aus `src/data/fragen.js`; `unbekannt` zählt nicht als beantwortet.
- Handover: Code existiert in `src/screens/Handover.jsx`, ist aber im sichtbaren Demo-Fluss ausgeblendet.
- Roadmap nach Produkt-Pivot: `docs/PRODUCT_ROADMAP.md`. Aktuelle Leitlinie: Sales/KAM führt das Gespräch; interne Fachlogik läuft als Guardrail mit.
- Die größten Kontextdateien sind `src/styles.css`, `src/screens/Ergebnis.jsx`, `src/logic/engine.js`, `src/data/fragen.js`, `src/screens/Konfiguration.jsx` und `src/data/katalog.js`.

## Skalierungs- und Token-Effizienz-Vorschlag

Der nächste sinnvolle Strukturgewinn ist eine kleine fachliche Trennung in `src/logic/engine.js`: Regel-Auswertung, LV-Aufbau und Ergebnis-Zusammenbau sollten in eigene React-freie Module wandern, z. B. `rulesEngine.js`, `buildLv.js`, `assembleResult.js`. Das reduziert die Leselast für künftige Tickets, weil Statusänderungen nicht mehr automatisch Kosten- und LV-Kontext mitziehen.

Nicht sofort nötig: ein großer Architekturumbau. Die aktuelle Dateigröße ist für einen Prototyp noch tragbar; zuerst sollten Status- und Ergebnis-Semantik geklärt werden.

## Nächste sichere Verbesserung

Nach `SK-43` und `SK-44`: `engine.js` nur mechanisch splitten, ohne Verhalten zu ändern. Akzeptanz: alle bestehenden Tests bleiben grün, keine UI-Texte ändern sich.
