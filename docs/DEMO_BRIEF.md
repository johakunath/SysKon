# Demo Brief – SysKon / Passion SmartZero

Erfasst Jun 2026. Referenz für zukünftige Agent-Sessions, damit der Demo-Kontext
nicht neu erarbeitet werden muss.

---

## Produkt

**Passion SmartZero Contracting** — Wärmepumpen-Contracting zur Dekarbonisierung
von kleineren Mehrfamilienhäusern. Technologiepfade:
- Hybrid (WP + bestehender Gas- oder Ölkessel)
- Monoenergetisch (WP ersetzt Bestandsheizung vollständig)
- Passion SmartControl als eigenes Produkt-/Servicepaket (ggf. KI-gesteuert;
  Wettbewerber bieten dies bereits an)

Der Contractor (Passion) übernimmt Installation, Betrieb und Wartung.
Vertragsparameter: Grundpreis + Arbeitspreis (kWh), Laufzeiten 10/15/20 Jahre.

---

## Demo-Szenario

**Anlass**: Internes Team-Meeting — Produktmanager, Führungskraft, Engineers.

**These, die bewiesen werden soll**:
> Ein konfigurierbares, regelbasiertes Tool kann den Angebotsprozess
> 10× schneller machen als Excel, ohne Kalkulations-Tiefe, individuelle
> Vertragsgestaltung oder Kontrollierbarkeit zu verlieren. Und ohne hohe
> Implementierungs- oder Wartungskosten.

**Kontext**: Aktuell werden Angebote über selbst gepflegte Excel-Sheets
erstellt — sehr langsam, nicht skalierbar. Das Ziel ist mittelfristig 10×
Skalierung, mit 1–2 Personen, die das Tool gemeinsam mit Supply Chain,
Sales und Management warten.

**Primäres Vorbild**: „Manfred" bei Temondo/Techem — ein CPQ-Konfigurator
für ähnliche Anwendungsfälle. SysKon soll zeigen, dass dieses Konzept für
SmartZero umsetzbar ist — ob mit AI-Unterstützung, Eigenentwicklung oder
einer bestehenden CPQ-Lösung.

---

## Der zentrale Einwand (Engineers)

Engineers sind skeptisch aus zwei Gründen:
1. **Zu starr**: „Wir können den Angebotsprozess nicht genug standardisieren,
   weil jedes Gebäude und jeder Vertrag individuell ist."
2. **Zu simpel**: „Wenn wir standardisieren, verlieren wir unser USP —
   hochindividuelle Verträge für eine heterogene Immobilienbranche."

**Die Antwort des Tools**: Das Admin-Panel zeigt, dass Fragen, Regeln,
Katalog und Preisannahmen vollständig konfigurierbar sind. Das Internsicht-
Modus zeigt, dass alle individuellen Kalkulationspunkte erhalten bleiben
und nachvollziehbar sind. Standardisierung ersetzt nicht individuelle
Entscheidung — sie strukturiert und beschleunigt sie.

---

## Nutzungskontext des Tools

**Primäre Nutzung**: Sales-Agent führt das Tool während eines Kundengesprächs
(Telefon oder vor Ort, Kunde sieht Bildschirm). Agents können zwischen
Sektionen springen — kein starrer Pfad nötig.

**Zielgruppe Sales-Agent**: Technisch versierte Verkäufer, die Gebäudetechnik
verstehen. Technische Sprache ist OK und notwendig für Glaubwürdigkeit.

**Kundensicht**: Kunde sieht das Tool bei bestimmten Momenten — vor allem
den Angebots-Snapshot auf der rechten Seite und ggf. die Angebots-Preview.

---

## Gewünschtes 3-Screen-Layout

### Screen 1: Konfiguration (Hauptseite — Zentrum der Demo)

```
[Linke Spalte]         [Mitte]                    [Rechte Spalte]
Sektions-Navigation    Fragen                      Angebots-Snapshot
A Gebäude              + inline Kontext            ─────────────────
B Wärme                  (warum, Richtwert,         Contracting-Preis:
C Bestand                Einordnung direkt          GP: X €/Jahr
D Temperatur             neben der Frage)           AP: X ct/kWh
E Heizraum                                         ─────────────────
F Aufstellung                                       Komponenten:
G Schall                                            • WP 2 × 20 kW
H Elektro                                           • SmartControl
I Commercial                                        • Hydraulikpaket
J Service                                           • Monitoring
                                                   ─────────────────
                                                    CapEx: ~X €
                                                    Förderung: ~X €
                                                   ─────────────────
                                                    Status + nächster
                                                    Schritt
```

**Wichtig**: Der Angebots-Snapshot auf der rechten Seite ist der
„Money Shot" der Demo. Er zeigt dem Kunden sofort Contracting-Preis,
was installiert wird, und Förderung — alles live aktualisiert.

### Screen 2: Angebot (Offer Preview)

Saubere Dokumenten-Ansicht des Kundenangebots. Zeigt:
- GP/AP, Laufzeit, Vertragsparameter
- Komponentenliste mit Umfang
- Förderindikation
- Annahmen und offene Punkte

### Screen 3: Admin (Konfigurierbarkeit demonstrieren)

Zeigt, dass das Tool wartbar ist:
- Fragen & Playbook (Gesprächshilfen pro Frage konfigurierbar)
- Katalog & Preise (Komponenten, Kosten, Scope-Texte)
- Regeln (regelbasierte Logik, nachvollziehbar)

Goal für Audience: „Ein PM + ein Engineer können das ohne Agentur pflegen."

---

## Was für den aktuellen Demozweck NICHT prioritär ist

- Vollständige Kundendokument-Ästhetik (Branding, Logo, Druckqualität)
- Geführter Gesprächsfluss (Agents springen selbst durch die Sektionen)
- Narrative Einführung / Onboarding
- CRM-Integration
- Echte Förderzeitreihen oder rechtliche Freigabe

---

## Nächste Epics (grob, Details in BACKLOG_WORK_PACKAGES.md)

- SK-95: Angebots-Snapshot in Konfiguration-Sidebar (GP/AP + CapEx + Komponenten + Förderung)
- SK-96: Förderung kundenseitig sichtbar
- SK-97: SmartControl als Katalogobjekt
- SK-98: Inline-Fragenkontext (alles Nötige neben der Frage)
- SK-99: Admin auf Demo-Reife bringen (3 klare Bereiche)
- SK-100: Angebot als Dokument (sauberes Layout, kein Web-App-Feeling)
