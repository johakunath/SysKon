# Contracting- & Pricing-Modell (WP8 / SK-70)

Beschreibt die Demo-Pricing-Logik, die aus der internen Kostensicht ein kundenfähiges
**Richtpreis-Angebot (Demo)** mit Grundpreis (GP), Arbeitspreis (AP) und Preisgleitformel
erzeugt. Baut auf dem technischen Paketmodell aus `docs/SYSTEMPAKET_MODELL.md` (WP12) auf.
Code-Quellen sind verlinkt, nicht dupliziert. Alle Werte sind Demo-/Richtpreise – kein
freigegebenes Festpreisangebot, keine Rechts-, Förder- oder Schallgarantie.

## 1. Scope & Stop-line

- Kundensicht zeigt **GP, AP, Preisgleitformel**, enthaltene Services, Annahmen, offene Punkte und
  strukturierte Vertragsparameter.
- Interne Sicht (hinter dem `ansicht`-Toggle) zeigt Kostenaufbau, die auf die **Ziel-IRR gelöste
  AP-Marge**, resultierende CAPEX und die **erreichte IRR** (Cashflow-basiert).
- **Nicht enthalten (bewusst):** reale Preisindex-Zeitreihen, finale juristische Vertrags-/
  AVBFernwärme-Freigabe, dynamische Stromtarif-Optimierung. Siehe §6.

## 2. Datenfluss

`src/logic/pricing.js` ist React-frei und wird von `src/logic/engine.js` (`berechne()`) orchestriert,
**nachdem** LV, OPEX und Energie berechnet sind. `contractingPreise({ lv, opex, energie, derived,
eingaben, annahmen })` liefert ein Objekt mit zwei Zweigen:

- `kunde` → fließt in `kundenScope.contracting` (kundensicher).
- `intern` → wird als `ergebnis.pricing` zurückgegeben (nur interne Sicht).

Diese Trennung erzwingt die Grenze bereits in der Datenschicht: in die Kundensicht gelangt **nur** der
`kunde`-Zweig – nie Marge, Einkaufslogik, Subventionsinterna, interner Gesamt-CAPEX oder IRR.

## 3. Formeln (Demo)

| Größe | Demo-Formel | Quelle |
|---|---|---|
| **Grundpreis (GP), €/a** | `Annuität(Netto-CAPEX, kapitalkostensatz, laufzeit) + OPEX p.a.` | `lv.netto`, `opex.summe_pa` |
| Annuitätenfaktor | `i·(1+i)^n / ((1+i)^n − 1)`; `i=0 ⇒ 1/n` | `annuitaetenfaktor()` |
| **Arbeitspreis (AP), €/MWh** | `(Strom- + Gaskosten p.a.) / Wärmebedarf × (1 + effektiveMarge)` | `energie`, `derived.waermebedarf_mwh` |
| **Effektive AP-Marge** | iterativ (Bisektion) so gelöst, dass Cashflow-IRR = Ziel-IRR | `loeseApMargeFuerIrr()` |
| Cashflow je Jahr | `Kapitaldienst + Marge × variable Energiekosten` (Service/Energie heben sich auf) | – |
| IRR | Bisektion über `kapitalwert(rate, cashflows) = 0` | `irr()` |
| **Preisgleitformel** | `P/P0 = a + Σ wₖ·(Iₖ/I0ₖ)`; Festanteil `a` + Index-Gewichte, Σ = 1 | `preisgleitformelBauen()`, `preisgleitWert()` |

**Margenregel (Roadmap Stufe 3):** Marge **nur** auf den Arbeitspreis. Keine Marge auf CAPEX, keine
Marge auf den Grundpreis. Die GP-Annuität ist reiner Kapitaldienst + fixer Service. Die einzige
Renditestellschraube ist damit die AP-Marge; sie wird iterativ auf die Ziel-IRR gelöst.

**IRR-Solver:** Jahres-Cashflow = `Kapitaldienst + Marge × variable Energiekosten` (Energie- und
Servicekosten kürzen sich gegen ihre Erlösanteile). `loeseApMargeFuerIrr()` bisektiert die Marge in
`[0, 3]`, bis die Cashflow-IRR die Ziel-IRR trifft. Flags: `bereitsErreicht` (Ziel ≤ Kapitalkosten,
Marge 0) und `gedeckelt` (Ziel auch bei 300 % Marge nicht erreichbar – Hinweis, dass GP/Annahmen zu
prüfen sind). Hinweis: Bei kleiner Energiemenge relativ zur CAPEX steigt die nötige Marge stark, weil
nur der AP Rendite trägt – im Demo bewusst sichtbar, vom PO zu bewerten.

**Preisgleitformel (AVBFernwärme §24-orientiert):** Festanteil `a` plus gewichtete Verhältnisse
amtlicher Indizes (Destatis: Tariflöhne, Erzeugerpreise Strom/Gas, Verbraucherpreisindex). Im
Basisjahr (alle `Iₖ = I0ₖ`) ergibt sich Faktor 1. `preisgleitWert()` ist der Evaluator für reale
Indexstände.

## 4. Kundensicht vs. interne Sicht

| Feld | Kunde (`kundenScope.contracting`) | Intern (`ergebnis.pricing`) |
|---|---|---|
| Grundpreis €/Monat & €/a | ✓ | ✓ (Aufbau) |
| Arbeitspreis €/MWh | ✓ | ✓ (Aufbau) |
| Vertragslaufzeit | ✓ | ✓ |
| Preisgleitformel (Festanteil, Indizes, Gewichte, Basisjahr) | ✓ | – |
| Vertragsparameter (Servicegrenze, Effizienzrisiko, Preisanpassung) | ✓ | – |
| Enthaltene Services | ✓ | – |
| Netto-CAPEX, Kapitaldienst, AP-Marge (Ziel/Ambition), erreichte IRR | **✗ (nie)** | ✓ |

Die Boundary wird per Test abgesichert (`tests/pricing.test.js` – „Boundary-Guard": `contracting`
enthält keine der Zeichenketten `marge`/`capex`/`irr`/`rendite`/`einkauf`).

## 5. Konfigurierbare Annahmen

Editierbar auf der Annahmen-Seite (`ANNAHMEN_META`, Gruppe „Contracting & Pricing (Demo)") in
`src/data/annahmen.js`:

- `vertragslaufzeit_default` (15 J), `kapitalkostensatz` (0,06), `ziel_irr` (0,13),
  `ziel_irr_ambition` (0,15). `ap_marge` (0,15) ist nur noch **Fallback**, wenn der IRR-Solver nicht
  greift (z. B. keine variable Energiemenge).
- Preisgleit-Gewichte `pg_fest` (Festanteil) + `pg_lohn`/`pg_strom`/`pg_gas`/`pg_invest` (Σ = 1) +
  `pg_basisjahr` (2026).

Pro Angebot wählbar (Sektion K, **`dq:0`** = DQ-neutral, in `src/data/fragen.js`):
- `vertragslaufzeit` (10/15/20 Jahre; leer → `vertragslaufzeit_default`).
- `effizienzrisiko` (`techem`/`geteilt`/`kunde`; leer → `techem`). Mapping auf kundensichere Texte in
  `EFFIZIENZRISIKO_TEXT` (`src/logic/pricing.js`).

## 6. Stand & verbleibendes Deferred

Umgesetzt (Folge-PR zu WP8):
- **Iterativer IRR-Solver:** AP-Marge wird per Bisektion auf die Ziel-IRR gelöst (`irr()`,
  `loeseApMargeFuerIrr()`); die interne Sicht zeigt erreichte IRR, Ziel-/Ambitionsmarge und das
  `gedeckelt`-Flag statt der früheren nicht-iterativen Indikation.
- **Preisgleitformel (AVBFernwärme §24-Struktur):** Festanteil + gewichtete amtliche Indizes mit
  Evaluator `preisgleitWert()`; Indexreferenzen (Destatis) benannt.
- **Effizienzrisiko-Allokation:** parameterisiert (Frage `effizienzrisiko`, Default Techem).

Verbleibend offen:
- **Reale Index-Zeitreihen:** `preisgleitWert()` ist evaluierbar, aber die Indexstände sind noch
  Platzhalter (Basisjahr ⇒ Faktor 1). Anbindung echter Reihen (Lohn, Strom, Gas, Inflation) offen.
- **Finale AVBFernwärme-/Rechtsfreigabe:** Struktur ist §24-orientiert, ersetzt aber keine juristische
  Prüfung; keine finale Vertragsgenerierung.
- **Effizienzrisiko-Default:** „Techem trägt das Risiko" im Review bestätigen; ein numerischer Effekt
  (z. B. JAZ-Risikoaufschlag) ist bewusst noch nicht modelliert.
- **Renditemodell-Bewertung:** Da nur der AP Marge trägt, kann die nötige Marge bei kleiner
  Energiemenge hoch werden – vom PO zu bewerten, ob GP/Annahmen anzupassen sind.

Roadmap-Kontext: `docs/PRODUCT_ROADMAP.md` (Stufe 3). Ticketdetails: `docs/BACKLOG_WORK_PACKAGES.md`
(WP8). Technische Grundlage: `docs/SYSTEMPAKET_MODELL.md` (WP12).
