# Contracting- & Pricing-Modell (WP8 / SK-70)

Beschreibt die Demo-Pricing-Logik, die aus der internen Kostensicht ein kundenfähiges
**Richtpreis-Angebot (Demo)** mit Grundpreis (GP), Arbeitspreis (AP) und Preisgleitformel
erzeugt. Baut auf dem technischen Paketmodell aus `docs/SYSTEMPAKET_MODELL.md` (WP12) auf.
Code-Quellen sind verlinkt, nicht dupliziert. Alle Werte sind Demo-/Richtpreise – kein
freigegebenes Festpreisangebot, keine Rechts-, Förder- oder Schallgarantie.

## 1. Scope & Stop-line

- Kundensicht zeigt **GP, AP, Preisgleitformel**, enthaltene Services, Annahmen, offene Punkte und
  strukturierte Vertragsparameter.
- Interne Sicht (hinter dem `ansicht`-Toggle) zeigt Kostenaufbau, AP-Marge, resultierende CAPEX und
  eine **Zielrendite/IRR-Indikation**.
- **Nicht enthalten (bewusst):** iterativer Solver (AP-Marge bis Ziel-IRR), reale Preisindex-Reihen,
  juristische Vertragsgenerierung, dynamische Stromtarif-Optimierung. Siehe §6.

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
| **Arbeitspreis (AP), €/MWh** | `(Strom- + Gaskosten p.a.) / Wärmebedarf × (1 + ap_marge)` | `energie`, `derived.waermebedarf_mwh` |
| **Preisgleitformel** | Basisjahr + gewichtete Indizes (Lohn/Strom/Gas/Invest), Σ Gewichte = 1 | `pg_*`-Annahmen |
| Zielrendite-Indikation (intern) | `AP-Marge p.a. / Netto-CAPEX` (nicht-iterativ) | – |

**Margenregel (Roadmap Stufe 3):** Marge **nur** auf den Arbeitspreis. Keine Marge auf CAPEX, keine
Marge auf den Grundpreis. Die GP-Annuität ist reiner Kapitaldienst + fixer Service.

## 4. Kundensicht vs. interne Sicht

| Feld | Kunde (`kundenScope.contracting`) | Intern (`ergebnis.pricing`) |
|---|---|---|
| Grundpreis €/Monat & €/a | ✓ | ✓ (Aufbau) |
| Arbeitspreis €/MWh | ✓ | ✓ (Aufbau) |
| Vertragslaufzeit | ✓ | ✓ |
| Preisgleitformel (Indizes, Gewichte, Basisjahr) | ✓ | – |
| Vertragsparameter (Servicegrenze, Effizienzrisiko, Preisanpassung) | ✓ | – |
| Enthaltene Services | ✓ | – |
| Netto-CAPEX, Kapitaldienst, AP-Marge (abs./%), Zielrendite/IRR | **✗ (nie)** | ✓ |

Die Boundary wird per Test abgesichert (`tests/pricing.test.js` – „Boundary-Guard": `contracting`
enthält keine der Zeichenketten `marge`/`capex`/`irr`/`rendite`/`einkauf`).

## 5. Konfigurierbare Annahmen

Editierbar auf der Annahmen-Seite (`ANNAHMEN_META`, Gruppe „Contracting & Pricing (Demo)") in
`src/data/annahmen.js`:

- `vertragslaufzeit_default` (15 J), `kapitalkostensatz` (0,06), `ap_marge` (0,15),
  `ziel_irr` (0,13), `ziel_irr_ambition` (0,15).
- Preisgleit-Gewichte `pg_lohn`/`pg_strom`/`pg_gas`/`pg_invest` (Σ = 1) + `pg_basisjahr` (2026).

Die Vertragslaufzeit ist zusätzlich pro Angebot wählbar: Frage `vertragslaufzeit` (Sektion K, 10/15/20
Jahre, **`dq:0`** = DQ-neutral) in `src/data/fragen.js`; leeres Feld → `vertragslaufzeit_default`.

## 6. Offene Produktentscheidungen / Deferred

- **Effizienzrisiko-Allokation:** Demo-Default „Techem trägt das WP-Effizienzrisiko". Im Review
  bestätigen; ggf. geteiltes Modell als Parameter ergänzen.
- **Preisgleit-Indizes/Gewichte:** Demo-Platzhalter. Reale Indexreihen (Lohn, Strom, Gas, Inflation)
  und die rechtliche Prüfung (AVBFernwärme) sind ein Recherche-/Legal-Thema (Roadmap Stufe 3).
- **Iterativer IRR-Solver:** „AP-Marge bis Ziel-IRR" ist ein Folge-Child; dieser Stand zeigt eine
  transparente, nicht-iterative Indikation.

Roadmap-Kontext: `docs/PRODUCT_ROADMAP.md` (Stufe 3). Ticketdetails: `docs/BACKLOG_WORK_PACKAGES.md`
(WP8). Technische Grundlage: `docs/SYSTEMPAKET_MODELL.md` (WP12).
