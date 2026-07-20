# BACKLOG

Mobiler Kurzindex für aktive Arbeit. Details stehen in den verlinkten Arbeitsdokumenten, damit neue Agent-Sessions wenig Kontext laden müssen.

## Start hier

1. Lies `AGENTS.md`.
2. Wenn der Nutzer "next epic" sagt: nimm die erste nicht erledigte Zeile aus `Next Epic Queue`.
3. Plane zuerst konkret, dann bearbeite den vom Nutzer freigegebenen Umfang.
4. Wenn zusammenhängende Child-Tickets klar in einen PR gehören: mutig bündeln, aber den Diff fokussiert halten.
5. Öffne nur die für den Umfang nötigen Dateien und bei Bedarf die verlinkten Detaildokumente.
6. Nach Änderungen: `npm test`; bei UI/App-Änderungen zusätzlich `npm run build`.
7. Erledigte Work Packages aus `BACKLOG.md` und `docs/BACKLOG_WORK_PACKAGES.md` entfernen und in `docs/BACKLOG_ARCHIVE.md` archivieren, damit aktive Agent-Sessions wenig Kontext laden.

## Detaildokumente

- Produkt-Roadmap nach Konzept-Pivot: `docs/PRODUCT_ROADMAP.md`
- Demo-Vision und Stakeholder-Brief: `docs/DEMO_BRIEF.md`
- Arbeitsgruppen und Ticketdetails: `docs/BACKLOG_WORK_PACKAGES.md`
- Code- und Produktkontext für Agenten: `docs/CODEBASE_NOTES.md`
- Erledigte / historische Tickets: `docs/BACKLOG_ARCHIVE.md`
- Produktbrief: `HANDOVER.md` -> `docs/HANDOVER_FULL.md`

## Produktfokus

SysKon ist primär ein Sales-facing Co-Creation- und Vorqualifizierungs-Prototyp für Wärmepumpen-Contracting-Gespräche, kein PE-Handover- oder Planungstool.

- Sales Tool first, PE engine underneath.
- Kundengespräch unterstützen, keine Customer-Self-Service-Bestellstrecke.
- Frühe Konfiguration und Erklärung, kein finales Angebot und keine Engineering-Auslegung.
- Richtpreis, Lösungskorridor und nächster sinnvoller Schritt statt verbindlichem Angebot.
- Demo-Zielgruppe Jun 2026: internes Team (PM, Führung, Ingenieure). Siehe `docs/DEMO_BRIEF.md`.

## Werte

- Type: `Epic|Story|Bug|UX|Tech Debt|Question`
- Priority: `P0|P1|P2|P3`
- Effort: `XS|S|M|L|XL`
- Status: `Todo|In Progress|Blocked|Done|Deferred`

## Next Epic Queue

Reihenfolge nach Demo-Vision Jun 2026. Details und Einwände der Ingenieure: `docs/DEMO_BRIEF.md`.

| Order | Epic | Outcome | Hängt ab von | Priority | Effort | Status |
|---:|---|---|---|---|---|---|
| 1 | SK-101 Sidebar-/Ergebnis-Konsolidierung & Vertragstyp | Konfiguration-Sidebar entschlackt, Ergebnis in Info/Aktionen gesplittet, Vertragstyp-Frage (AVB/Individual), Vendor-Namen-Bereinigung | SK-95 (Angebots-Snapshot Sidebar, Done) | P1 | L | Done |
| 2 | SK-102 Katalog- & Kostendatenbank (CPQ-Demo) | Artikelstamm mit Rabattgruppen + simulierter DATANORM-Import, EK/VK-Kette im LV, Installations-Einzelpositionen, Anfahrt aus PLZ-Demo-Distanz, Service als Vertragsartikel (OpEx) | – | P1 | XL | Done |
| 3 | SK-103 Offer-Config-Workflow-Bundle | Monitoring-Merge, Prüfpunkte-Nav-Step, AVB-Dual-Offer (15/20 J), Komponenten-Layer Phase 1 (WP+Speicher), Vendor-Scrub | SK-102 | P1 | XL | Done |
| 4 | SK-104 Angebotsseite-Redesign & Komponenten-Layer Phase 2 | Angebotsseite 3-Spalten-Layout (Rahmendaten links, Auswahl mittig, Vorschau rechts ab 50 %), Komponenten-Typen Regelung + Monitoring, „Demo"- und Platzhalter-Namen aus der UI | SK-103 | P1 | L | Done |
| 5 | SK-105 Routing-Layer Standard/Bedingt/Sonderfall | Sales-facing Einordnung als Ableitung aus dem Status-Layer, inkl. Grundkategorie (Daten vs. Fachprüfung vs. Kaufmännisch vs. Produktgrenze) und nächster Aktion | – | P1 | S | Done |
| 6 | SK-106 Entscheidungsprotokoll & Export | Versionierter Export (JSON/CSV) mit Entscheidungsprotokoll (gefeuerte Regeln, Status-Quellen, Routing-Gründe, Konflikte) für Nachvollziehbarkeit. **Kein** Excel-Eingabekontrakt mehr (SysKon rechnet, s. u.); Excel-Struktur liegt noch nicht vor | SK-105, SK-107 (Regelversion) | P2 | S | Todo |
| 7 | SK-107 Engine-Entkopplung + Regelversion | Drei Hard-Codings aus `engine.js` lösen (R11-Lookup, SYS-Sonderfall, Hybrid-Texte in `kundenScopeBauen`) + `REGELSATZ_VERSION` stempeln | – | P2 | S | Todo |
| 8 | SK-108 Kaufmännische Excel-Logik übernehmen | Bestehende kaufmännische Excel-Kalkulationslogik nach SysKon überführen (PO-Wunsch). **Erst nach ausdrücklicher Freigabe starten**; Umfang und Quelle vorher klären | SK-107 | P1 | L | Blocked |
| 9 | SK-72 Bestehende Tools & Learnings | Discovery: bestehende Contractor-Tools auswerten (erfordert Input vom PO) | – | P1 | M | Blocked |
| – | WP17 Seminar-Learnings WP | SK-109..112 umgesetzt (WW-Konzept, VL-Potenzial, Monitoring-Framing, Netzanschluss); SK-113..115 deferred. Details: `docs/BACKLOG_WORK_PACKAGES.md`, Abgleich: `docs/SEMINAR_ABGLEICH_WP.md` | – | P2 | S | Done |

## Aktueller Fokus

SK-105 ist umgesetzt: Routing-Layer Standard/Bedingt/Sonderfall (`src/logic/routing.js`) als **Ableitung** aus dem bestehenden 4-Status-Layer — der Status bleibt unverändert die interne Guardrail. Kern ist die Grundkategorie (`daten` | `fachpruefung` | `kaufmaennisch` | `produktgrenze`), die der Status allein nicht trennt: R10 (dünne Daten) und R06 (Schall) landen beide auf gelb/orange, brauchen aber verschiedene Owner und nächste Schritte. Die Kategorie ist als `routingGrund` an der Regel hinterlegt (Daten, nicht Engine-Logik); `tests/routing.test.js` erzwingt die Invariante für neue Regeln. Sichtbar als Badge in Live-Preview und Angebotsseite; die Grundkategorie und der Regel-Nachweis bleiben der Internsicht vorbehalten.

### PO-Entscheid Jul 2026: SysKon rechnet

**SysKon ist die Rechen-Quelle der Wahrheit für den Pilot.** `src/logic/pricing.js` bleibt autoritativ (GP/AP/IRR, iterative Marge bis Ziel-IRR). Excel als Quelle der Wahrheit ist nur eine Option für eine spätere Scope-Entscheidung.

Folgen:
- Ein Excel-**Eingabekontrakt** ist für den Pilot nicht nötig → SK-106 auf die reine Nachvollziehbarkeit reduziert (Entscheidungsprotokoll/Export), Excel-Struktur liegt ohnehin noch nicht vor.
- Gewünschte Richtung (PO): die **bestehende kaufmännische Excel-Logik nach SysKon übernehmen** → SK-108, braucht ausdrückliche Freigabe vor Umsetzung.

### Bewusst nicht umgesetzt (ChatGPT-Input Jul 2026)

- **Generic-Core-/Produkt-Pack-Layer für spätere Produkte (z. B. BHKW):** abgelehnt. Die Engine ist über Parameter-Injection (`opts.regeln/katalog/annahmen/fragen/artikel/komponenten`) bereits generisch; ein Produkt-Pack-Layer für ein nicht freigegebenes Produkt wäre spekulative Abstraktion mit dauerhafter Pflegelast. Stattdessen: SK-107 löst die drei realen Hard-Codings.
- **Analytics-/BI-Datenschicht:** zurückgestellt, kein Pilotnutzen, bräuchte Persistenz.
- **Namensgebung:** Der Input benennt durchgehend den Firmennamen und den internen Pilot-Produktnamen und fordert produktspezifische Logik unter dieser Bezeichnung. Beide Namen bleiben laut PO gesperrt; Produktregelsätze bekommen bei Bedarf generische IDs (z. B. `waermepumpe_hybrid`). **Neu (PO, Jul 2026):** Der frühere pauschale Vendor-Bann war zu weit gefasst — reale Lieferanten-, Hersteller- und Partnernamen sind erlaubt. Siehe `CLAUDE.md`.

SK-104 ist umgesetzt: (1) Angebotsseite (intern) als 3-Spalten-Layout — Rahmendaten links (Gebäudeparameter, Status-Ampel, „Warum dieser Status", Datenlage), Bearbeitung/Auswahl mittig (Empfehlung + Komponenten-Auswahl), Angebotsvorschau/Ergebnisse rechts ab 50 % (LV, CAPEX, Pricing, Energie, OPEX, dann Aktionen + Gesprächsergebnis); Kundensicht bleibt 2-spaltig; (2) Komponenten-Layer um Typen Regelung + Monitoring erweitert (SmartControl-/Monitoring-Pakete in den Komponenten-Layer überführt, Varianten-Fragen entfallen); (3) „Demo" aus allen sichtbaren UI-Texten entfernt (Kommentare/Konstanten-Namen bleiben); (4) Herstellernamen bereinigt: „Dreammaker"→„Systemtechnik Süd" (realer Hersteller), interner Pilot-Produktname entfernt, Suffixe „(fiktiver Hersteller)"/„(Demo-Referenz)" raus. Davor: SK-103 (Monitoring-Merge, Prüfpunkte-Nav, AVB-Dual-Offer, Komponenten-Layer Phase 1). Details: `docs/BACKLOG_WORK_PACKAGES.md`. SK-72 bleibt geblockt.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
