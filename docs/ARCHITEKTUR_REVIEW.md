# SysKon – Begutachtung (Architektur / UX / Energetik)

Auftrag und Methode: siehe `docs/REVIEW_PROMPT.md`. Drei Achsen, mehrere Pässe.
Stand: Pass A abgeschlossen; B (UX/UI) und C (Energetik) folgen in eigenen Pässen.

Schweregrade: **kritisch** · **mittel** · **niedrig** · **info**.

---

## A. Architektur

### Gesamturteil
Für einen Demo-Prototyp ungewöhnlich diszipliniert. Saubere Drei-Schichten-Trennung,
ein einziger Berechnungs-Einstieg, eine deklarative Regel-/Katalog-Engine, eine solide
Admin-Override-Schicht und eine echte Testabdeckung (121 Tests). Die Schichtregeln aus
`CLAUDE.md` werden im Code tatsächlich eingehalten. Es bleiben einige echte Redundanzen
und kleinere Konsistenzpunkte – aber **kein Korrektheitsfehler** in der Kernlogik.

### Stärken
1. **Schichtung ist real, nicht nur Anspruch.** `src/logic/*` und `src/data/*` enthalten
   keine React-Importe (geprüft); React lebt nur in `screens/` + `components/`. `format.js`
   ist die einzige Brücke (importiert `STATUS_LABEL`) – für einen View-Helfer angemessen.
2. **Eine Berechnungsquelle.** `berechne()` (`engine.js`) ist der einzige Orchestrator;
   `App.jsx` memoisiert das Ergebnis genau einmal und reicht `ergebnis` an alle Screens
   durch. Keine parallelen Rechenpfade.
3. **Deklarative Engine.** `regeln.js` und `katalog.js` teilen sich eine Bedingungs-DSL,
   die `pruefeBedingung` bis zum Fixpunkt auswertet (auf 10 Durchläufe gedeckelt). Neue
   Regeln/Positionen sind reine Daten-Edits. Konfliktpolitik (exclude schlägt require,
   schlechtester Status gewinnt) ist zentralisiert.
4. **Admin-/Override-Schicht ist robust.** `adminConfig.js` extrahiert Defaults, merged
   eingehende Configs tief, validiert und fällt bei ungültigem localStorage auf Defaults
   zurück. Alle Edits laufen über `applyAdminConfig` zurück in dieselbe Engine.
5. **Kunde/Intern-Trennung ist strukturell erzwungen.** `pricing.js` liefert
   `{kunde, intern}`; Marge/CAPEX/IRR existieren nur im `intern`-Zweig. `kundenScopeBauen`
   + `kundenPreviewText` entschärfen internes Wording. Die Regel „keine Marge in der
   Kundensicht“ ist Architektur, nicht bloß Konvention.
6. **Bewusste Entdopplung bereits erfolgt.** `Ampel`, `ScopeListe`, `format.js` wurden
   extrahiert, um früheres Copy-Paste zu beseitigen (in den Kommentaren dokumentiert).
7. **Testfläche.** engine, pricing, screens, presets, adminConfig, questions – 121 Tests grün.

### Befunde (priorisiert)

| ID | Schwere | Ort | Befund |
|----|---------|-----|--------|
| A1 | niedrig (Doku) | `engine.js` Konfliktauflösung; `regeln.js` DSL-Kopf | Modul-Exclude nutzt einen **reservierten** `ziel:'modul'`-Eimer (`{typ:'exclude', ziel:'modul', wert:'<modul>'}`), getrennt von Options-Excludes, die per Feldname (z. B. `aufstellvariante`) adressiert werden. Korrekt und getestet, aber im DSL-Kommentar nicht erklärt – stolperträchtig. Empfehlung: eine Zeile im `regeln.js`-Kopf ergänzen. |
| A2 | niedrig | `engine.js` (LV-`eintrag`) | **Doppelter Objektschlüssel** `variante` im selben Literal (gleicher Wert). → **behoben** in diesem Pass. |
| A3 | mittel | `calc.js` / `format.js` / `katalog.js` | Aufstellvarianten-Labels lagen dreifach vor (`AUFSTELLVARIANTEN_META[v].label`, `VARIANTEN_NAME`, je `varianten[].name`). Driftgefahr. → **behoben**: `VARIANTEN_NAME` wird jetzt aus `AUFSTELLVARIANTEN_META` abgeleitet (eine Quelle). Katalog-`varianten[].name` bleibt als katalogseitiger Text bestehen. |
| A4 | niedrig | `Konfiguration.jsx` `SEKTION_KURZ` | Map deckt nur A–J ab; `fragen.js` hat Sektion **K** (Vertrag & Angebot). Fällt auf den vollen Titel zurück (funktioniert), aber inkonsistenter Nav-Stil. Empfehlung: `K: 'Vertrag'` ergänzen. |
| A5 | niedrig | `screens/Handover.jsx` | Nur von Tests importiert, im App-Fluss **nicht geroutet** (laut Kommentar bewusst zurückgestellt). Getestetes Totgewicht – behalten ist okay, aber als „deferred“ führen, damit es nicht verrottet. |
| A6 | niedrig | `engine.js` (`kundenScopeBauen`), `Ergebnis.jsx`, `Konfiguration.jsx` | LV-Gruppierung (group-by-`gruppe` + `LV_GRUPPEN`-Reihenfolge) ist an ~3 Stellen ähnlich nachgebaut. Ein gemeinsamer Helfer würde Duplikation entfernen. |
| A7 | info | `adminConfig.js` | `applyAdminConfig` klont `annahmen` pro Änderung per JSON-Deep-Clone. Bei dieser Größe unkritisch (einmal pro Änderung memoisiert). Keine Maßnahme. |

### Effizienz
Keine Performance-Sorge: eine memoisierte Top-Level-Berechnung, reines Render-nach-unten,
beschränkter Fixpunkt, schlanke Abhängigkeiten (nur react/react-dom/fontsource). Engine ist
O(Regeln × Durchläufe) auf winzigen Eingaben. Build ~315 kB JS (gzip ~94 kB) – größtenteils
React; angemessen.

### In diesem Pass umgesetzt
- **A2** doppelter `variante`-Schlüssel entfernt (`engine.js`).
- **A3** `VARIANTEN_NAME` aus `AUFSTELLVARIANTEN_META` abgeleitet (`format.js`) – eine Quelle
  für Varianten-Labels.
- Verifiziert: `npm test` (121/121 grün) und `npm run build` erfolgreich.
- **A1 war ein Fehlbefund**: ein zunächst vermuteter Bug (`excluded.modul`) wurde durch die
  bestehende Testsuite als korrektes, beabsichtigtes Verhalten widerlegt und zurückgenommen.

### Offene Empfehlungen (nicht umgesetzt)
- A1 (DSL-Kommentar zum `ziel:'modul'`-Eimer), A4 (`SEKTION_KURZ` K), A5 (Handover als
  deferred führen), A6 (gemeinsamer LV-Gruppierungs-Helfer). Alle niedrig.

---

## B. UX/UI
_(Folgepass – noch offen.)_

## C. Energetik
_(Folgepass – noch offen.)_
