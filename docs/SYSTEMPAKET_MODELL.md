# Technisches Systempaket-Modell (WP12 / SK-74)

Technische Domänenbeschreibung des MVP-Hybrid-Luft/Wasser-Wärmepumpen-Contracting-Pakets. Ziel:
Robert's Workshop-Stand in ein kohärentes Modell übersetzen, **bevor** WP8/SK-70 Preise, GP/AP und
Vertragsparameter darauf aufsetzt. Dieses Dokument beschreibt die Domäne und benennt Lücken; es ist
keine vollständige Implementierungsspezifikation. Code-Quellen sind verlinkt, nicht dupliziert.

Status: Grundlagendokument. Codeseitig umgesetzt: SK-76 (Mehr-Gebäude-Blocker), SK-78
(Vorlauftemperatur-Korridor), SK-77 (WP-Produktstamm Referenz), SK-81 (Berechnungs-/
Output-Grenzen), SK-79 (Aufstellung & Schallschutzkonzept), SK-75 (Datenquellen &
Provenienzmodell), SK-80 (Messkonzept/Strombeschaffung) und SK-82 (Elektroanschluss-Notiz
dokumentiert). Übrige Child-Tickets bleiben Konzept/Entscheidung bis zu freigegebenem Scope.

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
| **SK-75** Datenherkunft & Provenienz | Proto-Signale: `dq`-Gewichte (`fragen.js`), `verbrauchsquelle`, `heizlast_geschaetzt` (`calc.js`), `*_bekannt`/`unbekannt`-Muster | **Umgesetzt** (§14): `QUELLENTYPEN` + `FELD_PROVENIENZ` in `src/data/provenienz.js`; alle dq>0-Felder haben Zielattribute (Quelle, Erfassungsweg, Aktualität, Vertrauen, kundensichtbare Annahme); manuell vs. skalierbar getrennt; `followUp` erzeugt Sales-Folgeaktion. Referenz: `docs/PROVENIENZ_MODELL.md`. |
| **SK-76** Ausschluss-/Standardfit-Logik | Blocker R04 (>2 Heizkreise), R16 (keine Außenfläche), R17 (Nicht-Hybrid) in `regeln.js` | **Umgesetzt:** Mehr-Gebäude-Blocker **R19** + Frage `anzahl_gebaeude` (§5). R04/R16/R17 mit Sales-sicheren Warn-Texten ergänzt (§9). Nicht-Luft/Wasser über R17 abgedeckt. |
| **SK-77** WP-Produktstamm, Sizing & Kaskade | `wp_luft_wasser` (Preis/kW), `wp_modul_kw: 20`, `wp_module = ceil(kw/20)` in `annahmen.js`/`calc.js` | **Umgesetzt** (§11): `WP_PRODUKT_REFERENZ` in `annahmen.js`; `wp_modul`-Katalogposition ist herstellerneutral (Komponenten-Layer wählt die WP); Kaskadenlimits, COP-Referenz, Einsatzgrenzen dokumentiert. |
| **SK-78** Standardhydraulik, WW & Regelung | `hydraulik_grundpaket`, `pufferspeicher`, `heizkreis_erweiterung`, `speicher_ww`, `frischwasserstation` | **Umgesetzt:** Vorlauftemperatur-Korridor (§6), Raumheizkreis-Klärung, FWS/Speicher-Varianten-Split und Puffer-Sizing-Feld (§10). Herstellerregelung/potentialfreier Kontakt: noch Konzept. |
| **SK-79** Aufstellung & Schall | 4 Varianten `fundament`, `einhausung`, `kompakt_container`, `vollcontainer`; `schallhaube`, `schallschutzwand` + Schall-Demoformel | **Umgesetzt** (§13): 5. Variante `aussen_offen` ergänzt; `einhausung` mit absorptiver Schallschutzwand (Demo-Referenz); Container-Entscheidung (2 Größen bleiben); Schallgutachten + Schallschutzzaun als Katalog-Scope-Lines. Schallformel bleibt Demo-Vorprüfung. |
| **SK-80** Messkonzept, Monitoring, Strombezug, Förderung | `messkonzept_basis`, `monitoring_basis`/`_plus`, BEG-Förderannahmen | **Umgesetzt** (§15): Messkonzept-Paket getrennt von Monitoring; `STROMBESCHAFFUNG_MODELL` verknüpft Strompreisannahme, Preisgleit-Gewicht und Messkonzept-Voraussetzung. |
| **SK-81** Berechnungs-/Output-Grenzen | `ableiten()` mischt Sizing/Energie/Placement/Schall; Engine baut LV + interne Kennzahlen | **Umgesetzt** (§12): `BERECHNUNGS_DOMAENEN` + `SERVICEGRENZE` in `calc.js`; `bereich`-Tags auf opex-Katalogpositionen; `bereichsSummen` im Engine-Return. |
| **SK-82** Elektroanschluss | `elektro_grundpaket`, `zaehlerschrank`, `kabelweg_*` (generisch) | **Umgesetzt** (§16): Elektro-Paket bleibt generisch (`k_elektro: 25000`); Scope-Grenze und Entscheidungsrahmen für Kevin-W./Patrick-L.-Notiz dokumentiert. |

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

- **SK-77 Produktstamm:** Systemtechnik Süd als Referenz-Default, ohne Alternativen zu blockieren. (Umgesetzt §11)
- **SK-81 Servicegrenze:** vor Heizkreisverteiler als strukturierter Parameter umgesetzt. (Umgesetzt §12)

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

## 11. Umgesetzt: WP-Produktstamm Referenz (SK-77)

`src/data/annahmen.js` exportiert `WP_PRODUKT_REFERENZ` — die strukturierte Referenz für das
aktuelle Referenzprodukt:

| Feld | Wert | Bedeutung |
|---|---|---|
| `hersteller` | Systemtechnik Süd | Referenzstand |
| `produktfamilie` | Luft-Wasser-WP-Kaskade | |
| `leistungsklasse_je_modul_kw` | 20 | stimmt mit `ANNAHMEN.wp_modul_kw` überein |
| `kaskade_min` / `kaskade_max` | 1 / 6 | stimmt mit `ANNAHMEN.wp_module_max` überein |
| `cop_referenz_a2w35` | 3,5 | Demo-Referenzwert |
| `vorlauf_max_standard_c` | 65 | Standardbereich (R09 Hinweis) |
| `vorlauf_max_technisch_c` | 70 | technisches Maximum (R20/R21) |
| `aussentemp_min_c` | −20 | Einsatzgrenze Außentemperatur |
| `kuehlmittel` | R290 | |
| `sizing_methode` | Leistungsanteil × Heizlast ÷ Modulleistung | Demo-Heuristik |

Der `wp_modul`-Katalogeintrag (`src/data/katalog.js`) zeigt in der `kunde`-Sektion jetzt
Systemtechnik Süd als Referenzhersteller, die Luft-Wasser-WP-Kaskade als Produktfamilie und den
Kaskadenkorridor „1–6 Module à 20 kW, max. 120 kW". Der Hinweis „Alternativhersteller nach
technischer Prüfung möglich" ist Pflichtbestandteil des Textes.

Nicht hart codiert: `WP_PRODUKT_REFERENZ` ist ein separater Export; der Katalog referenziert
keinen Import und bleibt für Alternativprodukte editierbar.

Tests in `tests/engine.test.js` (`WP12 SK-77: WP-Produktstamm Referenz`).

## 12. Umgesetzt: Berechnungs- und Output-Grenzen (SK-81)

Die vier Berechnungsdomänen sind jetzt explizit benannt und strukturell getrennt:

| Domäne | Beschreibung | Code-Quelle |
|---|---|---|
| **Invest** | Einmalige Investitionskosten (CAPEX) | `lv.*`; Katalog `tag:"capex"` |
| **COP/JAZ** | Energieeffizienz, Jahreswärmebedarf, Betriebsstrom/-gas | `energieIndikation()`; `energie.*` |
| **Betriebsführung** | Monitoring und Datendienst (OPEX) | Katalog `tag:"opex"` `bereich:"betriebsfuehrung"` |
| **Wartung/Instandsetzung** | Wartung, Instandhaltung, Instandsetzung (OPEX) | Katalog `tag:"opex"` `bereich:"wartung_instandsetzung"` |

`src/logic/calc.js` exportiert `BERECHNUNGS_DOMAENEN` (Dokumentationskonstante) und `SERVICEGRENZE`
(Default: `vor_heizkreisverteiler`; Sekundärheizkreise außerhalb Standard-Scope).

`src/data/katalog.js` trägt `bereich`-Felder auf allen opex-Positionen:
- `om_basis` / `om_komfort` → `bereich: 'wartung_instandsetzung'`
- `mon_pa` → `bereich: 'betriebsfuehrung'`

`src/logic/engine.js` gibt `bereichsSummen` im Ergebnisobjekt zurück:
- `invest` (= `lv.netto`)
- `cop_jaz` (Energie-KPIs aus `derived.energie`)
- `betriebsfuehrung_pa` (Summe Betriebsführungs-OPEX)
- `wartung_instandsetzung_pa` (Summe Wartungs-OPEX)

Invariante: `betriebsfuehrung_pa + wartung_instandsetzung_pa ≈ opex.summe_pa`.

Kundensicht-Garantie bleibt unverändert: `kundenScope` enthält weiterhin keine Marge/CAPEX/IRR.

Tests in `tests/engine.test.js` (`WP12 SK-81: Berechnungs- und Output-Grenzen`).

## 13. Umgesetzt: Aufstellung & Schallschutzkonzept (SK-79)

Mapping Robert's-Draft-Kategorien auf SysKon-Varianten und getroffene Produktentscheidungen:

| SysKon-Variante | Robert's Draft | Entscheidung |
|---|---|---|
| `aussen_offen` *(neu)* | outside unprotected | **Neu**: günstigste Low-CAPEX-Variante ohne Wetterschutz. Nur für standortgeeignete Mikrolage. |
| `fundament` | Fundament | **Halten**: Standardaufstellung mit Fundament und Witterungsschutz; breitester Anwendungsbereich. |
| `einhausung` | outside with fence / Schallschutzzaun | **Halten + Präzisieren**: entspricht Robert's "outside with fence". Demo-Referenzprodukt: absorptiver Schallschutzzaun (Demo-Referenz). Schall und Vandalismusschutz ohne Container. |
| `kompakt_container` | in Container (compact) | **Halten**: vorkonfektionierte Kompakt-Container-Lösung (~30 m²). Zwei Container-Größen bleiben − Platzbedarf und Budget differieren signifikant. |
| `vollcontainer` | in Container (full) | **Halten**: begehbarer Vollcontainer mit integrierter Technik (~45 m²). Höchste Standardisierung, minimale Heizraumabhängigkeit. |

Codeumsetzung:

- `src/logic/calc.js`: `AUFSTELLVARIANTEN` hat 5 Einträge; `AUFSTELLVARIANTEN_META` ergänzt um `aussen_offen`; `AUFSTELLUNG_VARIANTEN_MAPPING` dokumentiert Entscheidungen je Variante.
- `src/data/katalog.js`: `aussen_offen`-Variante im Aufstellungspaket; `einhausung`-Beschreibung verweist auf absorptive Schallschutzwand (Demo-Referenz); zwei neue Pakete:
  - `schall_zaun`: absorptiver Schallschutzzaun (Demo-Referenz, bei `schallsensibilitaet=hoch` + offener/Fundament-Variante)
  - `schall_gutachten`: Schallberechnungsservice Fachplaner (bei `schallsensibilitaet=hoch`)
- `src/data/fragen.js`: `aufstellvariante`-Frage hat 5 Optionen; `schallhaube`-Frage sichtbar für `['fundament', 'aussen_offen']`.
- `src/data/annahmen.js`: `k_aussen_offen`, `k_schallschutzzaun`, `k_schallberechnung` als editierbare Demo-Annahmen.

Schallformel-Einordnung: Die Demo-Vorprüfung (`schallBewertung()` in `calc.js`) bleibt **keine rechtsverbindliche Schallberechnung**. Ein Fachplaner-Schallgutachten (Demo-Referenz: Schallplan Nord, fiktiv) ist der vorgesehene Weg für den rechtsverbindlichen Nachweis.

Tests in `tests/engine.test.js` (`WP12 SK-79: Aufstellung & Schallschutzkonzept`).

## 14. Umgesetzt: Datenquellen & Provenienzmodell (SK-75)

Alle fachlich wichtigen Eingabefelder haben jetzt deklarierte Zielattribute. Codeumsetzung in
`src/data/provenienz.js` (reine Datenkonstanten, kein React, kein Runtime-Impact):

| Export | Inhalt |
|---|---|
| `QUELLENTYPEN` | 6 Quellentypen mit Label, Beschreibung, `skalierbar`-Flag |
| `FELD_PROVENIENZ` | 43 Felder mit `quelle`, `erfassungsweg`, `aktualitaet`, `vertrauen`, `skalierbar`, `kundenAnnahme`, `followUp` |
| `VERTRAUEN_WERTE` | `['hoch', 'mittel', 'niedrig']` – Enum-Referenz |
| `AKTUALITAET_WERTE` | `['aktuell', 'historisch', 'einmalig', 'berechnet']` – Enum-Referenz |

Quellentypen: `tes_abrechnung`, `asset_manager`, `stammdaten` (skalierbar);
`kunde_manuell`, `sales_manuell`, `abschaetzung` (manuell).

Skalierbare Felder (Integrationskandidaten): `jahresverbrauch`, `vorlauftemp_klasse`,
`wohneinheiten`, `flaeche`, `baujahrklasse`, `gaskessel_vorhanden`, `heizraum_vorhanden` u.a.

Felder mit `followUp !== null` bezeichnen den Sales-Nachfassschritt bei schwacher Quelle
(z. B. `sanierungsstand → Energieausweis anfordern`, `abstand_fenster → Schallgutachten beauftragen`).

Manuell vs. skalierbar: 18 Felder sind als `skalierbar: true` markiert und sind
Integrationskandidaten für TES-Abrechnung, Asset Manager oder Stammdaten/CRM.

Referenz: `docs/PROVENIENZ_MODELL.md`. Tests in `tests/engine.test.js` (`WP12 SK-75: Datenquellen & Provenienzmodell`).

## 15. Umgesetzt: Messkonzept, Monitoring, Strombeschaffung (SK-80)

### Messkonzept vs. Monitoring

| Scope | Katalog-ID | Inhalt | Annahme |
|---|---|---|---|
| **Messkonzept Basis** | `messkonzept_basis` | WP-Eigenstromzähler (Zweirichtungszähler/WP-Sondertarif), Fernablesung-Anschluss, Übergabedokumentation | `k_messkonzept_basis: 4500` € |
| **Monitoring Basic** | `mon_basic` / `mon_basic2` | Datenlogger, Fernablesung-Betrieb, Reporting-Infrastruktur (aufbauend auf Messkonzept Basis) | `k_monitoring_basic: 5000` € |
| **Monitoring Plus** | `mon_plus` | Erweiterte Sensorik und Effizienz-Reporting | `k_monitoring_plus: 12000` € |

**Trennung:** Messkonzept = gesetzliches Messkonzept / Zählerinfrastruktur (einmalig, Pflicht im Contracting). Monitoring = Betriebsführungs-Infrastruktur (aufbauend). In früheren Versionen war der Zähler fälschlicherweise im Monitoring-Text enthalten.

### STROMBESCHAFFUNG_MODELL (Dokumentationskonstante)

Exportiert aus `src/data/annahmen.js`. Keine Rechenlogik – verknüpft die drei zusammenhängenden Annahmen:

- `strompreis_annahme: 'strompreis_wp'` → 240 €/MWh (Demo-Energiekostengrundlage)
- `preisgleitformel_anteil: 'pg_strom'` → 27 % Stromkostenanteil in der AVBFernwärme §24-Preisgleitformel
- `messkonzept_voraussetzung: 'messkonzept_basis'` → separater WP-Zähler als technische Voraussetzung für WP-Sondertarif-Abrechnung und JAZ-Messung

Modell `'wp_sondertarif'`: Der Contractor beschafft WP-Strom über WP-Sondertarif (HTT/NTT). Strombeschaffung ist kein direkter BEG-Fördergegenstand (`foerderung: 'keine_direkte'`).

### BEG-Förderannahme

BEG bleibt Demo-Annahme. `f_messkonzept: 0` in `ANNAHMEN` (Zählerinfrastruktur kein BEG-Gegenstand). Interne Sicht via `sichtModus='intern'` zeigt den Subventionseffekt auf CAPEX; Kundensicht zeigt nur Annahmen und offene Prüfungen.

Tests in `tests/engine.test.js` (`WP12 SK-80: Messkonzept & Strombeschaffung`).

## 16. Umgesetzt: Elektroanschluss-Notiz (SK-82)

**Entscheidung:** Das Elektro-Paket bleibt generisch bis zur Kevin-W./Patrick-L.-Notiz.

Aktueller Stand: `elektro_netz`-Position in `katalog.js` mit `k_elektro: 25000` € (Demo-Pauschale). Leistungsumfang: "Elektroanbindung der Wärmepumpe inklusive Vorbereitung des Mess- und Anschlusskonzepts." Förderanteil: `f_elektro: 0.8`.

**Scope-Grenze:** Elektro-Paket deckt den Anschluss bis zum Übergabepunkt Netzanschluss. Messkonzept Basis (§15) beginnt ab Zähler.

**Was sich nach Vorliegen der Kevin-W./Patrick-L.-Notiz ändert:**
- Neue Eingabefelder (Netzanschluss-Typ, Zählerschrank-Klasse, Kabelweg-Kategorie)
- Neue Blocker-Regeln (z. B. Netzanschluss unzureichend → kein Standard-Scope)
- Angepasste Scope-Lines im LV (differenzierte Positionen statt Pauschale)
- Kundentexte mit konkreten Anschluss- und Koordinationshinweisen

Keine erfundenen Anschluss-, Zähler- oder Netzdetails vor Vorliegen der Notiz.
