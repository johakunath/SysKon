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

### Methode
Engine real auf den Referenzfall gerechnet (`berechne(PRESETS.referenz)`), jeden Schritt
unabhängig per Hand nachgerechnet und mit dem Engine-Output verglichen, sämtliche
Annahmen gegen branchenübliche Korridore geprüft und die Formeln auf Standardkonformität
geprüft. Referenzfall: 70 WE, 4.000 m², teilsaniert, 650 MWh/a inkl. WW, Hybrid, Einhausung.

### Gesamturteil
Die Zahlen ergeben auf den ersten Blick Sinn, sind realistisch und gehen mathematisch auf
(Hand- und Engine-Rechnung stimmen auf den Euro überein). Es werden durchweg **Standard-
Verfahren** verwendet – nichts zu Einfaches, nichts zu Kompliziertes: Volllaststunden-
Heizlastproxy, Leistungs-/Arbeitsanteil-Split für Hybrid, punktquellenbasierte Schall-
Vorprüfung mit TA-Lärm-Grenzwerten, Annuität (KWF), NPV/IRR per Bisektion, Marge nur auf
den Arbeitspreis. Befunde sind **Modellierungs-/Annahmen-Urteile, keine Rechenfehler** –
daher in diesem Pass bewusst report-only (Änderungen an Annahmen ändern Ergebnisse und
brauchen PO-Freigabe).

### Nachgerechneter Referenzfall (Hand = Engine)
| Größe | Wert | Plausibilität |
|---|---|---|
| spez. Wärmebedarf | 650 MWh ÷ 4.000 m² = **162,5 kWh/m²·a** | teilsaniertes MFH (Bj. 60–79): realistisch (130–180). ✓ |
| Heizlast (Proxy) | 650 MWh ÷ 2.200 Vbh = **295 kW** = 73,8 W/m² | deckt sich mit Flächenproxy teilsaniert (75 W/m²). ✓ konsistent |
| WP-Kaskade | 295 × 0,27 ≈ 80 kW → **4 × 20 kW** | Hybrid-Leistungsanteil ~27 % der Heizlast: Standard-Bivalenzauslegung. ✓ |
| Energie-Split | WP **422,5** / Gas **227,5** MWh (65/35) | klassisch: kleine WP-Leistung deckt großen Arbeitsanteil. ✓ |
| Strom/Gas | 128,0 MWh (JAZ 3,3) / 244,6 MWh (η 0,93) | Mengen korrekt; JAZ/η siehe C2. |
| Schall (Einhausung) | 74 − 20·log₁₀(12) − 8 − 12 = **32,4 dB(A)** < WA 40 → grün | Standard-Punktquellengleichung + TA Lärm. ✓ |
| CAPEX netto | 354,5k + 10 % = 389,95k − 105,9k Förderung = **284,1k €** | Förderung 35 % auf 302,5k förderfähig. ✓ |
| Kennzahlen | **4.058 €/WE · 71 €/m² · 3.551 €/kW** | für Hybrid-Retrofit realistisch. ✓ |
| Contracting | GP **36,6k €/a** (3.050 €/Mt) · AP **100,0 €/MWh** · IRR **13,0 %** | Annuität 0,10296 verifiziert; Marge 29,2 % (Ambition 38,4 %). |
| Wärmepreis all-in | (36,6k + 100,0×650) ÷ 650 = **156,3 €/MWh** | Contracting-Korridor 120–200 €/MWh. ✓ |

### Stärken
1. **Interne Konsistenz.** Vbh-Proxy (73,8 W/m²) und Flächenproxy (75 W/m²) ergeben dieselbe
   Heizlast-Größenordnung – die Annahmen sind aufeinander kalibriert, nicht beliebig.
2. **Domänen-korrekte Standardverfahren.** Leistungs-/Arbeitsanteil-Trennung (eine kleine
   WP deckt energetisch viel) ist die richtige Hybrid-Logik. Schall: Lp = LW − 20·log₁₀(r) − 8
   (hemisphärische Punktquelle) + 10·log₁₀(n)-Kaskade (inkohärente Addition) + TA-Lärm-
   Nachtwerte (WR 35 / WA 40 / MI 45) – exakt korrekt. Annuität (KWF) und IRR/NPV sauber.
3. **Energiepreise realistisch** (Strom-WP 240 €/MWh, Gas 80 €/MWh; Stand 2025/26).
4. **Marge nur auf AP, iterativ auf Ziel-IRR gelöst** – methodisch sauber (NPV bei Ziel-IRR
   monoton in der Marge), robust gegen hohe IRR. Erreichte IRR trifft das Ziel exakt.

### Befunde (priorisiert)
| ID | Schwere | Ort | Befund |
|----|---------|-----|--------|
| C1 | niedrig (Modell) | `annahmen.js` `wp_leistungsanteil`/`wp_deckungsanteil`; `calc.js` | 0,27 (Leistung) und 0,65 (Energie) sind **unabhängige Konstanten**, nicht aus einem Bivalenzpunkt abgeleitet. Ihre Kombination impliziert **~5.281 WP-Volllaststunden** – am oberen, gerade noch vertretbaren Rand (typ. Auslegung 1.800–2.500 Vlh; als Grundlast-WP real ~5.000–6.000 Betriebsstunden plausibel). Empfehlung: implizite Vlh als Leitplanke ausweisen / interne Warnung bei > ~3.000, mittelfristig aus Bivalenzpunkt herleiten. |
| C2 | niedrig (Modell) | `annahmen.js` `jaz`; `calc.js` `energieIndikation` | **JAZ ist eine flache Konstante (3,3)**, entkoppelt vom Vorlauftemperaturniveau. Regeln R09/R20/R21 warnen nur; die Energie-/COP-Rechnung verschlechtert die JAZ nicht mit steigender VL-Temperatur. Im Referenzfall (56–60 °C) ist 3,3 vertretbar bis leicht optimistisch. Empfehlung: JAZ je `vorlauftemp_klasse` staffeln. |
| C3 | info | `engine.js` Förderlogik | **Contingency ist implizit nicht förderfähig**: `foerderfaehig` wird auf der Zwischensumme (ohne Contingency) berechnet, `netto = brutto − foerderung` zieht aber vom Brutto (inkl. Contingency) ab. Konservativ und vertretbar (kein Zuschuss auf den Risikopuffer) – als bewusste Entscheidung dokumentieren, damit es nicht als Fehler gelesen wird. |
| C4 | niedrig (kaufm.) | `pricing.js` | Die AP-Marge (29 %, Ambition 39 %) ist hoch, weil der Hybrid weiter 35 % Gas verbrennt → geringe variable Einsparung gegenüber CAPEX-lastigem System; die IRR reagiert stark auf den Energie-Split. All-in 156 €/MWh bleibt plausibel. Empfehlung: Sensitivität Energie-Split ↔ IRR intern sichtbar machen. |

### In diesem Pass umgesetzt
- Keine Code-Änderung (alle Befunde sind Annahmen-/Modellurteile mit Ergebniswirkung → PO-Freigabe).
- Verifiziert: Hand- und Engine-Rechnung des Referenzfalls deckungsgleich; Formeln standardkonform.

### Offene Empfehlungen (nicht umgesetzt)
C1 (Bivalenzpunkt/Vlh-Leitplanke), C2 (JAZ je VL-Klasse), C3 (Doku Contingency/Förderung),
C4 (Sensitivität Energie-Split/IRR). Alle ohne Dringlichkeit für den Demo-Zweck.

---

## Umsetzung der Empfehlungen (Folge-PR)
Nach dem Review-PR (#29: A2, A3, B1, B3) wurden in einem Folge-PR die offenen Empfehlungen umgesetzt:

| Punkt | Status | Umsetzung |
|---|---|---|
| A1 | erledigt | DSL-Kommentar zum reservierten `ziel:'modul'`-Eimer in `regeln.js`. |
| A5 | erledigt | `Handover.jsx` als „Deferred Surface“ in `docs/CODEBASE_NOTES.md` geführt. |
| A6 | erledigt | gemeinsamer Helfer `src/logic/lv.js` (`gruppiereNachGruppe`); `engine.js` + `Ergebnis.jsx` nutzen ihn. |
| B2 | erledigt | `?`-Tiefenhilfe (Tooltip + Playbook) in der Konfiguration; reaktiviert die vorhandene `.tooltip`-CSS. |
| B5 | erledigt | `Ampel` mit `role="img"`+`aria-label`/`title` (Status nicht mehr nur farblich). |
| C1 | erledigt | `derived.wp_volllaststunden` abgeleitet und in der internen Energie-Karte gezeigt; Kopplungs-Kommentar. |
| C2 | erledigt | JAZ je Vorlauftemperatur-Klasse (`ANNAHMEN.jaz_*`, `resolveJaz`); `56-60`/unbekannt = 3,3 (Referenz unverändert). |
| C3 | erledigt | Contingency-nicht-förderfähig in `engine.js` + `CODEBASE_NOTES.md` dokumentiert. |
| C4 | erledigt | Sensitivität Energie-Split↔IRR (`pricing.intern.sensitivitaet`) in der internen Commercial-Karte. |
| B4 | zurückgestellt | Progressive Offenlegung der internen Dichte: bewusste Designentscheidung, kein Eingriff nötig. |
| B6 | by design | Keine Mobil-Optimierung (Desktop-Tool laut Zielgeräte-Kommentar in `styles.css`). |
| A7 | by design | JSON-Deep-Clone in `applyAdminConfig` bei dieser Größe unkritisch. |

## Fazit (alle drei Pässe)
SysKon ist architektonisch diszipliniert, für Sales und Ingenieure gut bedienbar und
energetisch mit realistischen, mathematisch konsistenten Standardverfahren hinterlegt.
Umgesetzt wurden vier Low-Risk-Fixes (A2, A3, B1, B3) sowie der Folge-PR mit A1, A5, A6, B2, B5,
C1–C4; B4/B6/A7 bleiben bewusst offen/by-design. Kein Korrektheitsfehler in Kernlogik oder
Energetik.
