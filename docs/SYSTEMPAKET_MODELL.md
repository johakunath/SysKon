# Technisches Systempaket-Modell (WP12 / SK-74)

Technische Domänenbeschreibung des MVP-Hybrid-Luft/Wasser-Wärmepumpen-Contracting-Pakets. Ziel:
Robert's Workshop-Stand in ein kohärentes Modell übersetzen, **bevor** WP8/SK-70 Preise, GP/AP und
Vertragsparameter darauf aufsetzt. Dieses Dokument beschreibt die Domäne und benennt Lücken; es ist
keine vollständige Implementierungsspezifikation. Code-Quellen sind verlinkt, nicht dupliziert.

Status: Grundlagendokument. Codeseitig in diesem Stand umgesetzt sind nur SK-76 (Mehr-Gebäude-
Blocker) und SK-78 (Vorlauftemperatur-Korridor); alle übrigen Child-Tickets bleiben Konzept/
Entscheidung bis zu freigegebenem Scope.

## 1. Produkt-Scope & Stop-line

- MVP = **Hybrid-Luft/Wasser-Wärmepumpe** (Bestandskessel deckt Spitzenlast), genau **ein Gebäude**,
  **Außenaufstellung** der WP, **≤ 2 Raumheizkreise** plus 1 TWW-Kreis.
- **Stop-line (Planungstool-Drift):** SysKon bleibt Sales-/Vorqualifizierungstool. Keine Standort-,
  Sizing- oder Placement-*Berechnung* als eigene Engine-Logik. `src/logic/calc.js` arbeitet bewusst
  mit Proxys/Heuristiken (Heizlast-Proxy, Kaskadenzahl, Schall-Demoformel) und **deklarierten**
  Außenmaßen – kein Site-Survey, keine Kartografie/LiDAR/3D. Vor jeder Erweiterung von `calc.js` um
  Standort-/Sizing-Logik prüfen, ob sie wirklich nötig ist oder extern zugekauft wird.

## 2. Systempaket als Domäne

Heute ist das „Systempaket" **emergent**: es ergibt sich aus dem Katalog (`src/data/katalog.js`,
`kategorie`-Tags), dem Regelsatz (`src/data/regeln.js`), dem Fragebogen (`src/data/fragen.js`) und
der Ableitung (`src/logic/calc.js` → `src/logic/engine.js`). Es gibt **keine** First-Class-Entität
„Paket". Zielbild: das Paket als benannte Domäne über diesen Bausteinen, mit klaren Grenzen zwischen
Technik-Scope (intern) und kundensichtbarem Umfang.

Katalog-Kategorien (Ist): `waermepumpe`, `kaskade`, `hydraulik`, `warmwasser`, `aufstellung`,
`schall`, `elektro`, `messkonzept`, `monitoring`, `service`, `demontage`.

## 3. Per-Child-Mapping (SK-75 … SK-82)

| Ticket | Ist-Stand im Code | Lücke / Ziel |
|---|---|---|
| **SK-75** Datenherkunft & Provenienz | Proto-Signale: `dq`-Gewichte (`fragen.js`), `verbrauchsquelle`, `heizlast_geschaetzt` (`calc.js`), `*_bekannt`/`unbekannt`-Muster | Formales Provenienzmodell je Feld (Quelle, Erfassungsweg, Aktualität, Confidence, kundensichtbare Annahme); Asset-Manager-/Stammdaten als Quellen; manuell vs. skalierbar trennen. Noch Konzept. |
| **SK-76** Ausschluss-/Standardfit-Logik | Blocker R04 (>2 Heizkreise), R16 (keine Außenfläche), R17 (Nicht-Hybrid) in `regeln.js` | **Umgesetzt:** Mehr-Gebäude-Blocker **R19** + Frage `anzahl_gebaeude` (§5). R04/R16/R17 mit Sales-sicheren Warn-Texten ergänzt (§9). Nicht-Luft/Wasser über R17 abgedeckt. |
| **SK-77** WP-Produktstamm, Sizing & Kaskade | `wp_luft_wasser` (Preis/kW), `wp_modul_kw: 20`, `wp_module = ceil(kw/20)` in `annahmen.js`/`calc.js` | Produktstamm-Zielfelder (Hersteller/Familie/Modell, Leistungsklasse, COP/JAZ, Kaskadenlimits, Einsatzgrenzen); Buderus/Dreammaker als Referenz dokumentieren, nicht hart codieren. Noch Konzept. |
| **SK-78** Standardhydraulik, WW & Regelung | `hydraulik_grundpaket`, `pufferspeicher`, `heizkreis_erweiterung`, `speicher_ww`, `frischwasserstation` | **Umgesetzt:** Vorlauftemperatur-Korridor (§6), Raumheizkreis-Klärung, FWS/Speicher-Varianten-Split und Puffer-Sizing-Feld (§10). Herstellerregelung/potentialfreier Kontakt: noch Konzept. |
| **SK-79** Aufstellung & Schall | 4 Varianten `fundament`, `einhausung`, `kompakt_container`, `vollcontainer`; `schallhaube`, `schallschutzwand` + Schall-Demoformel | Mapping auf Robert's Entwurf; Entscheidung Containeranzahl; „außen ungeschützt" als Low-CAPEX-Variante prüfen; ATEC als Schallberechnungs-Service; Rockwool-Zaun als Scope-Line. Entscheidung offen (§7). |
| **SK-80** Messkonzept, Monitoring, Strombezug, Förderung | `messkonzept_basis`, `monitoring_basis`/`_plus`, BEG-Förderannahmen | Messkonzept als eigener Scope-/Regelblock neben Monitoring; Strombeschaffung als Commercial/Betrieb-Annahme; Verknüpfung mit Preisgleitformel. Noch Konzept. |
| **SK-81** Berechnungs-/Output-Grenzen | `ableiten()` mischt Sizing/Energie/Placement/Schall; Engine baut LV + interne Kennzahlen | Getrennte Domänen Invest / COP-JAZ / Betriebsführung / Instandsetzung; kundenfähiger Scope ohne interne Kosten/Marge/IRR; Servicegrenze als Parameter. Noch Konzept (vgl. CODEBASE_NOTES Split-Vorschlag). |
| **SK-82** Elektroanschluss | `elektro_grundpaket`, `zaehlerschrank`, `kabelweg_*` (generisch) | Bleibt generisch bis zur Kevin-W./Patrick-L.-Notiz; danach Inputs/Blocker/Scope/Kundentexte ableiten. Keine erfundenen Anschlussdetails. Noch Konzept. |

## 4. Kundensicht vs. interne Sicht

Die Trennung existiert bereits und ist die Grenze, auf der WP8 aufsetzt:

- `ansicht`-State (`'kunde'` | `'intern'`) in `src/App.jsx`; Umschalter im Ergebnis-Header.
- Engine baut einen kundensicheren `kundenScope` (Gruppen, Annahmen, Ausschlüsse, offene Punkte)
  **getrennt** von internem `lv`/`opex`/`kennzahlen`/`warnungen` (`src/logic/engine.js`).
- `Ergebnis.jsx` schaltet Detailtiefe über `const intern = ansicht === 'intern'`.
- Kundensichere Wortwahl: `kundenPreviewText` in `src/screens/format.js`; zentrale Texte in
  `src/data/texte.js`.

Regel für WP12-Erweiterungen: keine internen Kosten-/Margen-/IRR-/Subventionsinterna in den
`kundenScope` einführen. Neue Blocker tragen eine Sales-sichere Begründung (Warnung) **und** einen
internen nächsten Schritt.

## 5. Umgesetzt: Mehr-Gebäude-Blocker (SK-76)

Robert nennt „Versorgung von mehr als 1 Gebäude" als Hard Blocker; der Regelsatz hatte dafür keine
Regel. Ergänzt:

- Frage `anzahl_gebaeude` (Sektion A, `typ:'zahl'`, `dq:0` → DQ-neutral) in `src/data/fragen.js`.
  Leeres Feld = Annahme „ein Gebäude" (Operator `>` feuert nicht auf leerem Feld).
- Regel **R19** in `src/data/regeln.js`: `anzahl_gebaeude > 1` → Status `rot` + Hinweis-Warnung.
- Test in `tests/engine.test.js` (`WP12: Mehr-Gebäude-Blocker`).

## 6. Umgesetzt: Vorlauftemperatur-Korridor (SK-78, PO-Entscheidung)

PO-Entscheidung im Review: ein harter Stopp bei 55 °C ist zu eng. Fachliche Grundlage: moderne
R290-Luft/Wasser-WP erreichen bis 70 °C (2025er Top-Modelle 75 °C), und im Hybrid deckt der
Bestandskessel die kältesten Spitzenlasttage mit der höchsten Vorlauftemperatur ab. Daher **kein**
harter Status-Stopp auf Temperatur; standardfähige Obergrenze **70 °C**:

| `vorlauftemp_klasse` | Statuswirkung | Regel |
|---|---|---|
| `<=45`, `46-50`, `51-55` | keine (grün-fähig) | – |
| `56-60`, `61-65` | keine; **nicht stillschweigend** akzeptiert: Hinweis-Warnung | **R09** |
| `66-70` | `gelb` + Engineering-Warnung (interne Klärung) | **R20** |
| `>70` | `orange` + Engineering-Warnung (Fachprüfung) | **R21** |

Umgesetzt in `src/data/regeln.js` (R09 umgewidmet, R20/R21 ergänzt), Tooltip + Optionstexte in
`src/data/fragen.js`, Tests in `tests/engine.test.js` (`WP12: Vorlauftemperatur-Korridor`).

## 7. Offene Produktentscheidungen

- **SK-79 Aufstellung:** Containeranzahl (zwei Größen vs. ein Konzept), „außen ungeschützt" als
  eigene Low-CAPEX-Variante, ATEC als Schallberechnungs-Service-Line, Rockwool-Zaun als Scope-Line.
  Noch keine Katalogänderung – erst Produktentscheidung.
- **SK-77 Produktstamm:** Buderus/Dreammaker als Referenz-Default, ohne Alternativen zu blockieren.
- **SK-81 Servicegrenze:** ggf. vor Heizkreisverteiler – als strukturierter Parameter vorbereiten.

## 8. Abhängigkeiten

- **WP10/SK-72** (Tool-Learnings) ist als Input vorgesehen, aber noch `Todo` – WP12 läuft vorerst
  ohne dessen Ergebnisse weiter.
- **WP7** kundenfähiger Scope, **WP8/SK-70** Pricing/Contracting und **WP11** Admin/Governance
  setzen auf diesem Modell auf.

Roadmap-Kontext: `docs/PRODUCT_ROADMAP.md`. Ticketdetails: `docs/BACKLOG_WORK_PACKAGES.md` (WP12).

## 9. Umgesetzt: Hard-Blocker-Warnungen (SK-76)

Alle drei verbleibenden Hard-Blocker-Regeln haben jetzt sowohl `status: rot` als auch eine begleitende
`warn`-Wirkung mit Sales-sicherer Begründung und internem nächsten Schritt – analog R19:

| Regel | Bedingung | Warn-Text (Kategorie: hinweis) |
|---|---|---|
| **R04** | `anzahl_heizkreise > 2` | Mehr als zwei Raumheizkreise → hydraulischen Sonderfall intern klären |
| **R16** | `aussenflaeche_vorhanden = nein` | Keine Außenfläche → Alternativpfad prüfen oder Sonderfall markieren |
| **R17** | `technologiepfad != hybrid` | Nur Hybrid-Pfad standardfähig → als Sonderfall bewerten oder Roadmap nennen |

Außerdem wurde die Frage `anzahl_heizkreise` in `src/data/fragen.js` umbenannt in
„Wie viele **Raumheizkreise** sind vorhanden?" mit Tooltip-Klärung, dass der TWW-Kreis separat geplant
wird. Das verhindert falsch-positive R04-Blockierungen bei korrekter 2R+1TWW-Eingabe.

Tests in `tests/engine.test.js` (`WP12 SK-76: Hard-Blocker-Warnungen`).

## 10. Umgesetzt: FWS/Speicher-Varianten und Puffer-Sizing (SK-78)

**FWS vs. Speicher:** Der `speicher_ww`-Katalogeintrag (`src/data/katalog.js`) ist jetzt ein
variantenbasiertes Paket (`variantenFeld: 'ww_speicher_typ'`) mit zwei Varianten:

- **Brauchwasserspeicher** (`wert: 'speicher'`): klassische Lösung, Positions-ID `speicher_ww_modul`,
  Kostenannahme `k_speicher_ww`. Fallback-Variante (Index 0) bei fehlendem oder unbekanntem Typ.
- **Frischwasserstation** (`wert: 'fws'`): hygienischer Durchflussbetrieb, Positions-ID `fws_modul`,
  Kostenannahme `k_fws` (25.000 € Demo).

Neue Frage `ww_speicher_typ` (Sektion B, sichtbar bei `ww_bereitung = zentral`, DQ: 1) ermöglicht die
Variantenwahl im Gespräch. Rückwärtskompatibel: vorhandene Presets ohne `ww_speicher_typ` fallen auf
Brauchwasserspeicher zurück.

**Puffer-Sizing:** `src/logic/calc.js` (`ableiten()`) gibt das Feld `puffer_empfehlung_liter` aus:
`puffer_liter_je_kw × wp_modul_kw` (Demo-Anhaltswert: 30 L/kW × 20 kW = 600 L). Beide Parameter
sind editierbar in `src/data/annahmen.js`.

Tests in `tests/engine.test.js` (`WP12 SK-78: FWS/Speicher-Varianten und Puffer-Sizing`).
