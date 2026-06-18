# BACKLOG

Mobiler Kurzindex für aktive Arbeit. Details stehen in den verlinkten Arbeitsdokumenten, damit neue Agent-Sessions wenig Kontext laden müssen.

## Start hier

1. Lies `AGENTS.md`.
2. Wenn der Nutzer "next epic" sagt: nimm die erste nicht erledigte Zeile aus `Next Epic Queue`.
3. Plane zuerst konkret, dann bearbeite den vom Nutzer freigegebenen Umfang.
4. Wenn zusammenhängende Child-Tickets klar in einen PR gehören: mutig bündeln, aber den Diff fokussiert halten.
5. Öffne nur die für den Umfang nötigen Dateien und bei Bedarf die verlinkten Detaildokumente.
6. Nach Änderungen: `npm test`; bei UI/App-Änderungen zusätzlich `npm run build`.

## Detaildokumente

- Produkt-Roadmap nach Konzept-Pivot: `docs/PRODUCT_ROADMAP.md`
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

## Werte

- Type: `Epic|Story|Bug|UX|Tech Debt|Question`
- Priority: `P0|P1|P2|P3`
- Effort: `XS|S|M|L|XL`
- Status: `Todo|In Progress|Blocked|Done|Deferred`

## Next Epic Queue

| Order | Epic | Work Package | Outcome | Next Child | Priority | Status |
|---:|---|---|---|---|---|---|
| 1 | SK-42 | WP0 Demo-Fluss | Demo ohne verfrühte PE-Handover-/Operational-Readiness-Signale | SK-43 | P0 | Todo |
| 2 | SK-46 | WP1 Ergebnis-Modell | Ergebnis stützt Sales-Gespräch und interne Vorprüfung, nicht finales Angebot | – | P1 | Done |
| 3 | SK-50 | WP2 Konfiguration | Konfiguration wirkt wie geführtes Kundengespräch mit Live-Lösungskorridor | – | P1 | Done |
| 4 | SK-54 | WP3 Responsive | Tablet- und schmale Ansichten ohne offensichtliche Brüche | SK-57 | P1 | Todo |
| 5 | SK-66 | WP4 Sales Ownership & Role Semantics | Systempaket-Konfigurator als Tool für erfahrene Sales/KAM-Angebotsvorbereitung schärfen | SK-66 | P0 | Todo |
| 6 | SK-67 | WP5 Logisches Fragen- und Playbook-Modell | Vollständige fachliche Fragenstruktur mit admin-editierbarer Sales-Hilfe definieren | SK-67 | P0 | Todo |
| 7 | SK-68 | WP6 Aufstellvariante, Fläche & Placement-Logik | Günstigste tragfähige Aufstellvariante und praktikable MVP-Flächenprüfung definieren | SK-68 | P0 | Todo |
| 8 | SK-69 | WP7 Kundenfähiger Scope-/LV-Output | Verständliche Komponenten- und Leistungsübersicht für Gebäudeeigentümer definieren | SK-69 | P1 | Todo |
| 9 | SK-70 | WP8 Contracting-Angebot & Pricing-Logik | Realistische GP/AP-/Preisgleitformel-Logik mit internem Commercial Layer vorbereiten | SK-70 | P1 | Todo |
| 10 | SK-71 | WP9 Angebotsvarianten, Speichern, PDF & Export | Angebotsvarianten speichern, duplizieren, exportieren und später übertragen können | SK-71 | P1 | Todo |
| 11 | SK-72 | WP10 Bestehende Tools & Learnings prüfen | Vor dem Überbauen Richtpreis-, Planungs- und Solution-Finder-Learnings auswerten | SK-72 | P1 | Todo |
| 12 | SK-73 | WP11 Admin-Konfiguration & Governance | Inhalte, Produktdaten, Pricing und Sichtbarkeit ohne Codeänderungen pflegbar machen | SK-73 | P2 | Todo |

## Aktueller Fokus

WP1 + WP2 wurden gemeinsam umgesetzt. Nächster offener Queue-Punkt bleibt nach Nutzerpriorität WP0 oder WP3 prüfen.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
