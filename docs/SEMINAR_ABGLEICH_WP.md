# Seminar-Abgleich: WP17 Wärmepumpen-Learnings

Erstellungsdatum: 2026-07-20. Basis: Top-10-Erkenntnisse aus einem WP-Seminar (Copilot-Zusammenfassung).

## Abgleich

| # | Learning | Ist-Zustand | Entscheidung |
|---|---|---|---|
| 1 | Vorlauftemperatur = größter Hebel; VL-Potenzial als KPI | `vorlauftemp_klasse` treibt JAZ, aber VL-Potenzial nicht als Botschaft sichtbar; kein Heizkurven-Feld | **Umgesetzt (SK-110)** — `vorlauftemp_potenzial` in `calc.js`, neue Frage `heizkurve_geprueft`, Hinweis-Regel R25, KPI-Zeile in Ergebnis |
| 2 | Monitoring = Pflicht, nicht Nice-to-have | Monitoring-Baustein existiert (Basic/Plus), aber nur optional | **Umgesetzt (SK-111)** — als Standard-Empfehlung geframt; Auto-Alerts NICHT (Betriebsebene) |
| 3 | Warmwasser häufig das eigentliche Problem; Wohnungsstation, Zirkulationsverluste | Speicher + FWS vorhanden; Wohnungsstation und Zirkulation fehlten | **Umgesetzt (SK-109)** — `wohnungsstation`-Option + Frage `ww_zirkulation` + Hinweis-Regel R24 + Katalog-Variante + Artikel WT-WST-40 |
| 4 | PV+WP = Standard | Nicht vorhanden; PV explizit außerhalb MVP | **Deferred (SK-113)** — Scope-Entscheidung PO |
| 5 | Stromkosten wichtiger als WP; Preisgleitklausel auf Strom | `STROMBESCHAFFUNG_MODELL`, `pg_strom` bereits umgesetzt (SK-80). Lastmanagement fehlt | **Bereits erfüllt** (Strom-Preisgleit); Lastmanagement → Backlog (SK-115) |
| 6 | Hausanschluss/Netzanschluss früh prüfen; Anschlussleistung, SMGW | `netzanschluss_bekannt` (bool), R08, `elektro`-Paket; kein kVA-Wert | **Umgesetzt (SK-112)** — Feld `anschlussleistung_kva` + Electrical-Check-Hinweis R26 |
| 7 | Luft-Wasser Standard, Sole/Abwasser/Quartier = Sonderlösung | Nur Luft-Wasser; Nicht-Luft/Wasser ist Hard-Blocker | **Keine Änderung** — Seminar bestätigt Design; Sole/Abwasser bewusst NICHT |
| 8 | Hybridlösungen bleiben wichtig | Hybrid (WP-Grundlast + Gas-Spitzenlast) ist Kern-MVP-Pfad | **Keine Änderung** — bereits zentral |
| 9 | Platzmangel lösbar (Container etc.) | 5 Aufstellvarianten inkl. Container/Einhausung | **Keine Änderung** |
| 10 | Portfolio statt Einzelobjekt | Multi-Gebäude ist Hard-Blocker (R19); nur Einzelobjekt | **Deferred (SK-114)** — separates Navigator-Epic |

## Bewusst nicht umgesetzt

- **PV/Mieterstrom (4/5):** außerhalb MVP; volles Rechenmodul wäre Scope-Explosion.
- **Sole-/Abwasser-WP (7):** Standardisierungsthese des Seminars selbst: „Sole/Abwasser = Sonderlösung". Hard-Blocker bleibt.
- **Portfolio/Quartier (10):** eigenes Navigator-Produkt, nicht der Einzelobjekt-CPQ.
- **Auto-Alerts / Lastmanagement (2/5):** Laufzeit-/Betriebsebene, nicht Aufgabe eines Konfigurationstools.

## Kernsatz

„Erfolg = Objektselektion + niedrige VL-Temp + intelligentes WW + Stromkostenoptimierung + Monitoring" — deckt sich mit dem bestehenden Systempaket-/Status-Ansatz. SK-109..112 stärken genau diese Achsen.
