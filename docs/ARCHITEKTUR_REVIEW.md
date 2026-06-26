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

### Methode
Quellcode aller Screens + `styles.css` gelesen und die gebaute App live betrachtet
(Chromium-Screenshots der Konfiguration und beider Ergebnis-Sichten, Desktop 1440×900).
Personas laut Produktfokus: **Vertrieb (Sales/KAM)** und **Energie-Ingenieure**.

### Gesamturteil
Für die Zielpersonas gut geeignet. Klares, ruhiges „Präzisionswerkzeug“-Erscheinungsbild
(Stahlblau, Haarlinien, Monospace-Ziffern für €/kW/dB), durchgängiges Design-System
(Token-, Typo- und Abstands-Skala), saubere Navigation und eine überzeugende Trennung von
**Kundensicht** (dokumentartiges Richtpreis-Angebot) und **Internsicht** (Kalkulation,
Prüfpunkte). Im Großen wie im Detail gut lesbar. Hauptpunkte: ein konkreter Navigations-Bug
(behoben) und ein verstecktes Hilfetext-Potenzial für Ingenieure.

### Stärken
1. **Dual-Persona-Modell sitzt.** Der Kundensicht/Internsicht-Umschalter trennt ein echtes,
   dokumentartiges Angebot (Logo, Label „Richtpreis-Angebot (Demo)“, Name, Datum,
   Komponentenkarten mit Hersteller/Produkt/Leistung, „enthalten/prüfen“-Badges) sauber von
   der internen Kalkulation (CAPEX/OPEX/Energie/Commercial). Bedient beide Personas mit einer
   Datenbasis.
2. **Navigation & Orientierung.** 3-Spalten-Konfiguration: links Abschnittsanker A–K mit
   Fortschritt (n/m, ✓) und aktiver Hervorhebung (IntersectionObserver-Scrollspy), Mitte die
   Fragen, rechts die sticky „Gesprächs-Vorschau“. Man weiß jederzeit, wo man ist und was noch fehlt.
3. **Inline-Kontext an der Frage (SK-98).** Jede Frage zeigt Label, Antwortkarten mit
   Optionshinweis und einen separaten Gesprächshinweis – ohne Modal/Klick. Gut für schnelle Gespräche.
4. **Lesbarkeit/Detail.** Tabellen mit Tabellenziffern, Gruppenkopfzeilen, rechtsbündige Beträge,
   aufklappbare Begründungen je LV-Position, Ampel + Korridor-Titel mit Handlungsaussage.
   Statusfarben mit ausreichend Kontrast; Hinweis-/OK-/Warn-Boxen einheitlich.
5. **Zugänglichkeit (für einen Demo-Prototyp solide).** Radiogruppen mit `role` +
   `aria-labelledby`, Labels an Eingaben, sichtbare Fokus-Ringe, `prefers-reduced-motion`
   respektiert, dekoratives Logo `aria-hidden`.
6. **Druck/Export.** Eigene Print-Styles (A4, Druckkopf, umbruchsichere Karten,
   farbtreue Ampeln) und CSV-Export der Kalkulation.

### Befunde (priorisiert)

| ID | Schwere | Ort | Befund |
|----|---------|-----|--------|
| B1 | mittel | `Konfiguration.jsx` `SEKTION_KURZ` | **Nav-Labels passten nicht zu den Abschnitts-Überschriften:** Nav zeigte „Commercial“ (Überschrift „I · Förderannahme“) und „Service“ (Überschrift „J · Betrieb & Monitoring“); Abschnitt **K** („Vertrag & Angebot“) fehlte ganz und fiel auf den Volltitel zurück. Verwirrende Navigation. → **behoben**: I→„Förderung“, J→„Betrieb“, K→„Vertrag“. |
| B2 | mittel | `Konfiguration.jsx` `Frage`; `fragen.js` (`tooltip`, `playbook`); `styles.css` `.tooltip*` | **Tiefe Hilfe ist autorisiert, aber im Live-Fluss unsichtbar.** Pro Frage existieren `tooltip` und ein Sales-Playbook (`warum`/`warnsignale`/`einordnung`) – beide nur im **Admin** editierbar/sichtbar. Im Konfigurations-Fluss wird **nur** `hinweisKurz` (auf 150 Zeichen gekürzt) gezeigt; die `.tooltip`-CSS ist im Live-Fluss toter Code. Besonders Ingenieure würden „warum/warnsignale“ schätzen. Empfehlung: on-demand-Disclosure (z. B. „?“/„Mehr“ je Frage), das das vorhandene Playbook wiederverwendet. Kein Low-Risk-Auto-Fix (Feature) – als Empfehlung geführt. |
| B3 | niedrig | `styles.css` | **Token-Drift:** `--fs-s` war nirgends definiert (Tippfehler für `--fs-sm`) und wurde in 4 Regeln genutzt → Schriftgröße ungültig/geerbt; `--fl` (Hintergrund Angebots-Dokumentkopf) undefiniert. → **behoben** (`--fs-sm`, `--karte`). Zusätzlich nutzen einige Regeln ad-hoc-Fallbacks (`var(--text-2,#555)`, `--bg-2`, `--gruen`) statt der Token – kosmetisch, gemeldet. |
| B4 | niedrig | Internsicht `Ergebnis.jsx` | Hohe Informationsdichte (Summary-Strip → KPIs → LV-Tabelle → 4 Kennzahlen-Karten). Gut gruppiert, aber für Erst-Sales viel auf einmal. Summary-Strip und „Warum dieser Korridor entsteht“ mildern das. Kein Eingriff nötig; ggf. progressive Offenlegung erwägen. |
| B5 | niedrig | `Ampel.jsx` + Aufruforte | Status teils nur über Farbe (z. B. Ampel-Punkt ohne Textbegleitung in einzelnen Vorschau-Zeilen). Meist mit Textlabel kombiniert; für volle Barrierefreiheit ein `title`/sr-only-Text am Ampel-Punkt ergänzen. |
| B6 | info | `styles.css` Media-Queries | Mobil bewusst nicht optimiert (Desktop-Tool laut Kommentar). Für die Personas vertretbar; Tablet-Korridor (901–1180px) ist abgedeckt. |

### In diesem Pass umgesetzt
- **B1** `SEKTION_KURZ` an die Abschnitts-Überschriften angeglichen (I/J korrigiert, K ergänzt).
- **B3** CSS-Token-Tippfehler behoben (`--fs-s`→`--fs-sm`, `--fl`→`--karte`).
- Verifiziert: `npm test` (121/121) und `npm run build` erfolgreich; Sichtprüfung per Screenshots.

### Offene Empfehlungen (nicht umgesetzt)
- **B2** tiefe Hilfe (Tooltip/Playbook) on-demand im Konfigurations-Fluss zugänglich machen
  (Feature-Entscheidung, größerer Eingriff). B4/B5/B6 wie beschrieben.

## C. Energetik
_(Folgepass – noch offen.)_
