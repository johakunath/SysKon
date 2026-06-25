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
| 1 | SK-95 Angebots-Snapshot Sidebar | GP + AP + CapEx + Förderung + Komponenten live in Konfiguration-Sidebar | SK-70 (GP/AP-Engine, Done) | P1 | M | Todo |
| 2 | SK-96 Förderung kundenseitig | Förderungsbetrag/-art kundenseitig sichtbar (regulatorisch geboten) | SK-95 | P1 | S | Todo |
| 3 | SK-97 SmartControl Katalog | SmartControl als eigenes Katalogobjekt (inkl. KI-Variante) | – | P2 | S | Todo |
| 4 | SK-98 Inline-Fragenkontext | Alle Infos zur Fragenbeantwortung inline neben der Frage sichtbar | – | P2 | M | Todo |
| 5 | SK-99 Admin Demo-Reife | Admin auf 3 klare Bereiche vereinfachen; zeigt Pflegbarkeit durch 1–2 Personen | – | P2 | S | Todo |
| 6 | SK-100 Angebot als Dokument | Kundensicht dokumentähnlich (Logo, Name, Datum, klare Sektionen) | – | P3 | M | Todo |
| 7 | SK-72 Bestehende Tools & Learnings | Discovery: Techem-Tools auswerten (erfordert Input vom PO) | – | P1 | M | Blocked |

## Aktueller Fokus

WP9/SK-71 (Angebotsvarianten/Speichern/PDF), SK-58 (Sales-first Framing), SK-60 (Live-Gesprächs-Vorschau), SK-61 (Sales-safe Semantics) und SK-62 (Internal engine guardrails) sind abgeschlossen (PR #23, PR #24). Die Demo-Vision wurde Jun 2026 mit dem PO konkretisiert: drei Screens (Konfiguration als Hauptseite, Angebot, Admin), Fokus auf Live-Angebots-Snapshot in der rechten Sidebar mit GP/AP + CapEx + Förderung + Komponenten. Nächste Priorität ist SK-95 (Sidebar-Snapshot). SK-72 (Discovery) bleibt geblockt bis der PO Zugang zu Techem-Bestandstools bereitstellt.

## Child-Tickets

Die vollständigen Child-Tickets stehen in `docs/BACKLOG_WORK_PACKAGES.md`. Dort ist jedes Epic so sortiert, dass das nächste offene Child oben steht.
