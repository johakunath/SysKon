# Demo Brief – Passion SmartZero Konfigurator

Dieses Dokument hält die Demo-Vision und strategischen Rahmenbedingungen fest,
damit Agent-Sessions dieses Gespräch nicht wiederholen müssen. Letzte Aktualisierung: Juni 2026.

---

## Hintergrund und Produkt

**Passion SmartZero Contracting** ist ein Contracting-Produkt zur Dekarbonisierung
von kleineren Mehrfamilienhäusern (MFH) durch:
- Wärmepumpen (monoenergetisch oder hybrid mit bestehendem Gas-/Ölkessel)
- Optional: SmartControl-Gerät (potenziell KI-gesteuert, wie bei Wettbewerbern)

Passion ist der Contractor – nicht der Hersteller. Kunden sind Eigentümer
heterogener Bestandsimmobilien. Das USP liegt in hochindividuellen Verträgen
für ein breites Gebäudespektrum.

---

## Demo-Ziel

**Zielgruppe**: Internes Team (ein weiterer PM, Vorgesetzte(r), 2–3 Ingenieure)

**Kernaussage**: Ein regelbasierter, konfigurierbarer Konfigurator kann die
Angebotserstellung für SmartZero 10× schneller machen als die aktuellen
Excel-Prozesse – ohne Kalkulationstiefe, Individualität oder Kontrollierbarkeit
zu verlieren.

**Aktueller Schmerz**: Selbstgepflegte Excel-Sheets, sehr langsam, nicht
skalierbar. Zielzustand: 10× Wachstum mit 1–2 Personen, die das Tool gemeinsam
mit Vertrieb, Einkauf, Controlling und Management pflegen.

**Build-or-Buy-Entscheidung**: Die Demo soll zeigen, dass diese Technologie
grundsätzlich geeignet ist – unabhängig davon, ob das Tool selbst gebaut,
eine CPQ-Lösung konfiguriert oder mit/ohne KI entwickelt wird.

---

## Wichtigste Einwände der Ingenieure (zu widerlegen)

1. **„Der Prozess ist nicht standardisierbar genug."**
   → Admin-Screen zeigt konfigurierbare Regeln, Ausschlussbedingungen und
   Preisannahmen. Standardisierung ist parametrisch, nicht starr.

2. **„Zu viel Standardisierung – wir verlieren unser USP individueller Verträge."**
   → Internsicht zeigt individuelle Kalkulation pro Objekt (WP-Sizing,
   Aufstellvariante, CapEx, GP/AP). Regeln sind editierbar; Ausnahmen sind
   steuerbar. Das Tool beschleunigt den Prozess, ersetzt aber nicht das Urteil.

---

## Demo-Szenario

Ein Sales Agent erstellt gemeinsam mit einem Kunden oder im Vorfeld eines
Gesprächs ein Angebot. Der Kunde kann auf einem Notebook mitsehen (nicht
zwingend). Der Agent kann zwischen Abschnitten springen – kein linearer Zwang.

**Referenz-Vorbild**: „Manfred" (Temondo/Techem-internes Tool für ähnliche
Angebotsprozesse, das der PM aus früherer Tätigkeit kennt).

---

## Layout-Vision (drei Screens)

### Screen 1: Konfiguration (Hauptseite – Zentrum des Tools)

```
┌──────────┬─────────────────────────────┬──────────────────────────┐
│  Links   │         Mitte               │       Rechts             │
│          │                             │                          │
│ Sektions-│  Fragen mit allem nötigen   │  Angebots-Snapshot       │
│ naviga-  │  Kontext direkt daneben:    │  (live, sofort):         │
│ tion     │  - Fragetitel               │  - GP + AP (€/a)         │
│ (A–J)    │  - Antwortfeld              │  - CapEx (Richtwert)     │
│          │  - Warum fragen wir das?    │  - Förderung (Betrag/Art)│
│          │  - Richtwert / Einordnung   │  - Komponenten & Services│
│          │  - Warnsignale              │  - Aufstellvariante      │
│          │                             │  - Gesprächskorridor     │
│          │                             │  - Nächster Schritt      │
└──────────┴─────────────────────────────┴──────────────────────────┘
```

**Wichtig**: Der Angebots-Snapshot auf der rechten Seite aktualisiert sich live
mit jeder Eingabe. Das ist der „Wow-Moment" der Demo. GP/AP, Förderung und
CapEx sollen kundenseitig sichtbar sein (nicht nur intern), da Förderung
regulatorisch offengelegt werden muss und CapEx ein zentraler Verhandlungshebel
für den Kunden ist.

### Screen 2: Angebot (Angebots-Preview)

Zeigt das Angebot in einer sauberen, dokumentähnlichen Darstellung.
- Kundensicht: Umfang, Leistungen, Preise (GP/AP), Förderung, Annahmen
- Internsicht: vollständige LV-/CapEx-Kalkulation, Margen, IRR, Regelnachweise
- PDF-Export via Drucken

### Screen 3: Admin

Demonstriert, dass das Tool durch 1–2 interne Personen pflegbar ist:
- Fragen & Playbook-Texte konfigurierbar
- Komponenten-Katalog & Preisannahmen editierbar
- Regeln einsehbar (und zukünftig editierbar)
Ziel: Kein Agency-Aufwand für laufende Pflege.

---

## Kernkomponenten des Produkts (im Tool sichtbar)

| Komponente | Beschreibung |
|---|---|
| Wärmepumpe | Luft-Wasser, Kaskade 1–6 × 20 kW, Hersteller Referenz (Buderus/Dreammaker) |
| SmartControl | Eigenes Steuergerät (potenziell KI-gesteuert); eigene Katalogposition |
| Hybrideinbindung | Bestehender Gas-/Ölkessel als Backup-Heizung (Hybrid-Pfad) |
| Hydraulik | 2 Raumheizkreise + Warmwasser, Pufferspeicher |
| Aufstellung | 5 Varianten: Außen offen, Fundament, Einhausung, Kompakt-, Vollcontainer |
| Monitoring | Betriebsmonitoring auf Basis Messkonzept |
| Service | Wartung, Instandsetzung, Betriebsführung |

---

## Was der Demo-Flow zeigen soll

1. **Gebäude eingeben** → Korridor und Komponentenliste erscheinen live
2. **Aufstellvariante wählen** → CapEx und GP/AP passen sich an
3. **Hybrid vs. Mono** → Tool zeigt, welcher Pfad für das Objekt passt und warum
4. **Förderung** → Betrag und Art werden sichtbar (Kundensicht)
5. **Zu Angebot wechseln** → Sauberes Dokument, druckbar
6. **Internsicht zeigen** → LV, CapEx-Detail, Regeln → überzeugt Ingenieure
7. **Admin zeigen** → Katalog, Preise, Regeln editierbar → überzeugt PM und Führung

---

## Abgrenzung (was das Tool nicht ist)

- Kein verbindliches Angebot (Demo-Annahmen, Vor-Ort-Aufnahme bleibt nötig)
- Kein Planungstool (kein Sizing durch LiDAR/Kartografie)
- Keine Customer-Self-Service-Bestellung
- Keine CRM- oder WeClapp-Integration (bewusst deferred)
- Keine echten Kundendaten

---

## Referenzen

- Produktroadmap: `docs/PRODUCT_ROADMAP.md`
- Aktiver Backlog: `BACKLOG.md`
- Technisches Domänenmodell: `docs/SYSTEMPAKET_MODELL.md`
- Pricing-Modell: `docs/PRICING_MODELL.md`
