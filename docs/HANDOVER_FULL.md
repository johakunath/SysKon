# HANDOVER: Projektentwicklungs-Konfigurator (Configure-to-Order, Stufe 1)

Stand: 11.06.2026, 22:00 CET
Quelle: Konzept-Thread Claude Chat (Johannes + Claude)
Zweck: Startdokument für den Build v0.1 in Claude Code oder Cowork. Ins Repo-Root legen.
Lesereihenfolge für die Build-Instanz: Abschnitt 2 (Entscheidungen) ist verbindlich. Abschnitt 7 (Original-Prompt) ist der fachliche Scope. Bei Konflikt gelten die Entscheidungen in Abschnitt 2.

---

## 1. Status & nächster Schritt

- Konzeptphase abgeschlossen am 11.06.2026. Layout, Paketlogik, Regelarchitektur und Demo-Referenzfall sind entschieden.
- Nächster Schritt: Repo anlegen, diese Datei als `HANDOVER.md` ins Root, dann Build v0.1 gemäß Abschnitt 3 bis 6.
- Kein produktionsreifes Tool. Interner klickbarer Prototyp, Zielgeräte Notebook bis großer Bildschirm, Tablet ok, keine Smartphone-Optimierung.

## 2. Verbindliche Konzeptentscheidungen (11.06.2026)

1. **Paketlogik: modulare Pakettypen, keine S/M/L-Endpakete.** Sechs Pakettypen (Wärmepumpe, Hybrid-Einbindung, Hydraulik, Aufstellung, Monitoring, Service) mit je 2 bis 5 Varianten. Ergänzt um kuratierte Startkonfigurationen: die vier Testfälle aus Prompt §17 sind Presets (gespeicherte Eingabesätze, keine Pakete). Demos starten nie mit leerem Formular.
2. **Konfigurationslogik: deklarative Regel-Engine.** Jede Regel ist ein einfaches Wenn-Dann: WENN Bedingung (UND/ODER über Eingaben und Zwischenergebnisse) DANN genau eine Wirkung. Vier Wirkungstypen:
   - `require`: Modul/LV-Position erzwingen
   - `exclude`: Option oder Aufstellvariante sperren
   - `warn`: Hinweis bzw. Prüfpunkt an Ergebnis und Handover anhängen
   - `status`: Statusstufe verschlechtern oder deckeln
   Regeln liegen als JSON-Daten vor, nicht hartkodiert. Engine wertet alle Regeln in Schleife aus, bis sich nichts mehr ändert. Konfliktauflösung: `exclude` schlägt `require`; Status nimmt immer die schlechteste ausgelöste Stufe. Schema-Beispiel:
   ```json
   {
     "id": "R04",
     "wenn": { "feld": "anzahl_heizkreise", "op": ">", "wert": 2 },
     "dann": { "typ": "status", "wert": "ausschluss" },
     "begruendung": "MVP unterstützt maximal zwei Heizkreise"
   }
   ```
3. **Drei getrennte Datenebenen:** Annahmen (Preise, JAZ, Schallgrenzen, Zuschläge, Förderquoten), Regeln (JSON-Liste), Komponentenkatalog (Pakete mit LV-Positionen: Menge, Einheit, Kostenformel, Förderflag, CapEx/Opex-Tag). Der CapEx/Opex-Tag je Position bereitet Stufe 2 (Grundpreis/Arbeitspreis) ohne Mehraufwand vor. Ein späterer Admin-Bereich ist nur ein Editor über diese drei Datensätze.
4. **Layout: Option A mit B-Struktur.** Links Eingabekategorien A bis J als kollabierende Sektionen mit Fortschrittsanzeige, Mitte dynamische Fragen der aktiven Sektion mit Tooltips, rechts Live-Panel (Status-Ampel, Datenqualitätsscore, Paketstack, Kostensumme). Irrelevante Fragen werden ausgeblendet, Folgefragen erscheinen abhängig von Antworten. LV-Ansicht mit aufklappbarer Begründung je Position (Element aus Layoutoption C).
5. **Kein Admin-Backend in v0.1.** Stattdessen Annahmen-&-Regeln-Seite mit inline editierbaren Demo-Werten und Live-Neuberechnung.
6. **Status und Datenqualität sind zwei getrennte Achsen.** Status: grün (Richt-LV-fähig), gelb (PE-Prüfung), orange (Engineering-Prüfung), rot (nicht standardfähig). Datenqualitätsscore: gewichteter Anteil beantworteter Pflichtfragen. DQ unter 60 % deckelt den Status auf gelb („kein belastbares Richt-LV").
7. **WP-Modul: 20 kW thermisch je Einheit.** Kaskade 1 bis 6 Module, also 20 bis 120 kW. Schall-Kaskadenzuschlag: +10·log10(n) dB auf den Einzelmodul-Schallleistungspegel.
8. **Warmwasser:** Eingabe „WW im Jahresverbrauch enthalten ja/nein". Heizlast-Proxy nutzt 1.900 Vollbenutzungsstunden ohne WW, 2.200 mit WW. WW zentral erzwingt das Speicher-/WW-Modul (Regel R03).
9. **Scope-Schärfungen v0.1:** monoenergetischer Pfad nur als Roadmap-Platzhalter sichtbar; PE-/Planungsaufwand als interner Score 1 bis 5, nie als LV-Kostenposition; Testfall-Funktion (speichern, neu rechnen, Diff-Tabelle) ist Teil von v0.1; Preisgleitformeln und BEG-Kostendeckel nur als Roadmap-/Warnhinweis; PDF-Export via `window.print()`.
10. **Datenschutz:** generische Namen, alle Zahlen als Demo-Annahmen gekennzeichnet, keine internen Kalkulationswerte (siehe Prompt §2).

## 3. Referenzdaten

### 3.1 Original-Annahmen aus dem Prompt (§10), unverändert dokumentiert

- 70 WE, 3.800 bis 4.200 m² beheizte Fläche, Bestandsgebäude
- Wärmebedarf ca. 900 bis 1.100 MWh/a
- installierte WP-Leistung beispielhaft 60 bis 80 kW
- Gesamt-/Spitzenleistung im System 180 bis 220 kW
- JAZ 3,2 bis 3,5; Kesselwirkungsgrad 92 bis 95 %
- Strom WP 230 bis 260 €/MWh; Gas 70 bis 90 €/MWh
- Förderung 35 %; Contingency ca. 10 %

### 3.2 Plausibilitätsbefund (11.06.2026)

900 bis 1.100 MWh/a bei 180 bis 220 kW Spitzenleistung entspricht 4.500 bis 5.500 Vollbenutzungsstunden. Das ist unplausibel (typisch MFH: 1.800 bis 2.500 Vbh). Zentrale Warmwasserbereitung erklärt die hohen MWh teilweise: ein unsaniertes 4.000-m²-Gebäude mit zentraler WW kann ~1.000 MWh/a erreichen. WW erhöht aber kaum die Spitzenlast (gepufferte, flache Last). Die kW-Angabe bleibt damit der inkonsistente Wert: zu 1.000 MWh/a gehören eher 450 bis 550 kW Heizlast.

### 3.3 Demo-Referenzfall v0.1 (entschieden)

| Größe | Wert |
|---|---|
| Wohneinheiten / Fläche | 70 WE / 4.000 m², teilsaniert |
| Jahreswärmebedarf | 650 MWh/a, davon ~150 MWh Warmwasser (zentral) |
| Heizlast | ~300 kW (≈ 2.150 Vbh) |
| WP-Leistung | 80 kW = 4 × 20-kW-Module (Kaskade) |
| WP-Deckungsanteil | 65 % der Wärmemenge, Rest Gas-Bestandskessel |

## 4. Regelsatz v0.1 (18 Regeln)

| Nr | Wenn | Dann (Typ) |
|---|---|---|
| R01 | Technologiepfad = Hybrid | Bestandskesselprüfung als Prüfpunkt (warn) |
| R02 | Technologiepfad = Hybrid | fossile Einheit Förderanteil 0 % (förderlogik) |
| R03 | Warmwasser zentral | Speicher-/WW-Modul (require) |
| R04 | Heizkreise > 2 | nicht standardfähig (status: rot) |
| R05 | Außenfläche unzureichend | Kompakt- und Vollcontainer gesperrt (exclude) |
| R06 | Innenstadtlage UND Schall-Ampel gelb oder rot | Engineering-Prüfung (status: orange) |
| R07 | Schallpegel am Immissionsort > Grenzwert | Schallmaßnahme erzwingen oder Variante sperren (require/exclude) |
| R08 | Netzanschluss unbekannt | Elektroprüfung als Prüfpunkt (warn) UND status ≥ gelb |
| R09 | Vorlauftemperatur > 65 °C | Warnung + Engineering-Prüfung (warn + status: orange) |
| R10 | DQ-Score < 60 % | Status gedeckelt auf gelb, Hinweis „kein belastbares Richt-LV" |
| R11 | alle Grün-Kriterien erfüllt (freistehend, Außenfläche ok, Schall grün, ≤ 2 HK, Kessel nutzbar, Verbrauch plausibel, WW geklärt, Netz prüfbar) | status: grün |
| R12 | Bestandskesselzustand unbekannt | status ≥ gelb |
| R13 | Förderung unsicher | warn + status ≥ gelb |
| R14 | Heizlast nur geschätzt (Proxy) | status ≥ gelb |
| R15 | Heizraumgröße oder Zugang problematisch | status ≥ orange |
| R16 | weder Innen- noch Außenaufstellung möglich | status: rot |
| R17 | Technologiepfad außerhalb MVP | status: rot |
| R18 | Schall-Ampel: Lp = LW_Kaskade − 20·log10(r) − 8, Abschläge Haube −8 / Einhausung −12 / Container −15 dB; Lp ≤ Grenzwert − 3 grün, ± 3 gelb, darüber orange | (berechnung + status) |

Hinweis: R18 ist eine Demo-Abschätzung, keine rechtsverbindliche Schallberechnung. Im UI so kennzeichnen.

## 5. Demo-Annahmen v0.1 (alle editierbar auf der Annahmen-Seite)

| Annahme | Demo-Wert |
|---|---|
| Strompreis WP | 240 €/MWh |
| Gaspreis | 80 €/MWh |
| JAZ Wärmepumpe | 3,3 |
| Kesselwirkungsgrad | 93 % |
| Vollbenutzungsstunden | 1.900 ohne WW / 2.200 mit WW |
| WP-Deckungsanteil Hybrid | 65 % der Wärmemenge |
| Schallleistungspegel je 20-kW-Modul | 68 dB(A); Kaskade +10·log10(n) |
| Nachtgrenzwerte | WR 35 / WA 40 / MI 45 dB(A) |
| Förderquote | 35 % auf förderfähigen Anteil |
| Förderanteile je Paket | WP 100 %, Hydraulik/Speicher 100 %, Hybrid-Einbindung 50 %, Elektro 80 %, Umfeld 80 %, fossil 0 % |
| Kostenbausteine (einmalig) | WP-Paket 1.100 €/kW; Hybrid-Einbindung 25 k€; Hydraulik 40 k€; Speicher/WW 30 k€; Elektro/Netz 25 k€; Monitoring Basic 5 k€; Installation/IBN 60 k€; Umfeldmaßnahmen 30 k€ |
| Aufstellzuschläge | Fundament 15 k€ / Einhausung 35 k€ / Kompakt-Container 120 k€ / Vollcontainer 280 k€ |
| Laufende Kosten | Monitoring 1,5 k€/a; O&M 1,5 % der Brutto-LV-Kosten p.a. |
| Contingency | 10 % |

Kostenformel Stufe 1: Brutto-LV = Summe Pakete + Contingency; Förderung = förderfähiger Anteil × 35 %; Netto-LV = Brutto − Förderung. Keine Marge, kein Kundenpreis. Energieindikation: Strom WP = WP-Wärme / JAZ; Gas = Restwärme / Wirkungsgrad.

## 6. Screens und Testfälle v0.1

| Screen | Inhalt |
|---|---|
| 1 Konfiguration | Sektionen A–J, dynamische Fragen, Live-Panel rechts |
| 2 Ergebnis | Tabs: Konfigurationsergebnis / LV gruppiert mit Begründung je Position / Kostenübersicht inkl. €/WE, €/m², €/kW |
| 3 Handover | Prüfliste, fehlende Daten/Fotos/Dokumente, PE- und Engineering-Prüfpunkte, Empfehlung, Druck-Export |
| 4 Annahmen & Regeln | editierbare Demo-Werte, Regelliste als Wenn-Dann-Tabelle |
| 5 Testfälle | speichern, auflisten, Rechenlauf, Diff-Tabelle gegen Referenzlauf |

Testfälle: die vier synthetischen Fälle aus Prompt §17 als Presets. Die dort genannten Erwartungen dienen als Validierung der Regel-Engine (Testfall 1 grün-gelb mit Einhausung, Testfall 2 Container-Alternative, Testfall 3 Engineering-Prüfung, Testfall 4 Ausschluss wegen vier Heizkreisen).

## 7. Original-Prompt (verbatim)

Der vollständige ursprüngliche Auftrag folgt unten. Er definiert den fachlichen Scope. Bei Widerspruch gelten die Entscheidungen in Abschnitt 2 (z. B. WP-Modulgröße 20 statt 40 kW, korrigierter Referenzfall).


---

# Auftrag: Konzept und erster klickbarer Prototyp für einen Configure-to-Order-Projektentwicklungs-Konfigurator

## 0. Wichtigste Vorgabe

Erstelle zuerst ein durchdachtes Produkt- und Toolkonzept und danach einen ersten klickbaren Prototypen.

Es geht nicht darum, ein produktionsreifes Angebotstool zu bauen. Es geht darum, einen überzeugenden internen Prototypen zu schaffen, der zeigt, wie ein regelbasierter Configure-to-Order-Ansatz die Projektentwicklung und LV-Erstellung für Wärmepumpen-Contracting in Bestands-MFH beschleunigen kann.

Bitte gib nicht zuerst technische Architektur, Dateien, Frameworks oder Implementierungsdetails vor. Entscheide das später selbst passend. In diesem Auftrag geht es primär um das WAS, nicht um das WIE.

## 1. Kontext

Wir entwickeln einen internen Prototypen für standardisiertes Wärme-Contracting in Bestands-Mehrfamilienhäusern.

Der größte Bottleneck im Geschäft ist nicht nur Akquise, sondern vor allem: Projektentwicklung, Vorqualifizierung, technische Machbarkeit, Auslegung, Konfiguration der Lösung, Leistungsverzeichnis, Kostenlogik, Übergabe an Planung / Engineering, spätere Angebotserstellung.

Die aktuelle Arbeitsweise basiert stark auf Fachwissen, Excel-Kalkulationen, manuellen Entscheidungen und Rückfragen. Das Tool soll diese Logik sichtbarer, reproduzierbarer und testbarer machen.

Ziel ist kein starres S/M/L/XL-Festpaket, sondern ein Configure-to-Order-Modell:

> Aus Gebäudedaten, technischen Regeln, Aufstellvarianten, Komponentenpaketen, Kostendaten und Abhängigkeiten wird ein strukturiertes Leistungsverzeichnis abgeleitet.

## 2. Namens- und Datenschutzvorgaben

Im Prototyp und in allen sichtbaren Texten: keine echten Firmennamen, keine Kundennamen, keine internen Projektnamen, keine Referenz auf konkrete externe Anbieter, keine echten Projektdaten, keine erkennbaren Daten aus internen Kalkulationen.

Verwende generische Namen wie: Projektentwicklungs-Konfigurator, Wärme-Systemkonfigurator, Configure-to-Order-Prototyp, Systempaket-Konfigurator, Richt-LV-Konfigurator, Bestands-MFH, Kompakt-Einhausung, Kompakt-Container, Vollcontainer, Monitoring Basic, Monitoring Plus.

Alle Zahlen müssen als plausible Demo-Annahmen gekennzeichnet werden. Sie dürfen nicht so wirken, als wären sie aus einer echten internen Datei kopiert.

## 3. Produktziel

Der Prototyp soll zeigen:

1. Wie aus Gebäudedaten eine technische Lösung abgeleitet werden kann.
2. Wie aus technischen Entscheidungen ein Leistungsverzeichnis entsteht.
3. Welche Komponenten automatisch ausgewählt werden.
4. Welche Komponenten abhängig voneinander sind.
5. Welche Aufstellvarianten möglich sind.
6. Welche Fälle standardfähig, prüfpflichtig oder nicht standardfähig sind.
7. Wie eine Kostenlogik ohne vollständigen Artikelstamm aussehen kann.
8. Wie Förderannahmen in einer ersten vereinfachten Logik wirken.
9. Wie Projektentwicklung und Engineering eine saubere Übergabe bekommen.
10. Wie das Tool später zu einem vollständigen Wärmelieferungs-Angebotskonfigurator ausgebaut werden kann.

Kernbotschaft:

> Nicht das gesamte Gebäude wird standardisiert, sondern die Entscheidungs-, Komponenten-, Kosten- und Übergabelogik.

## 4. Iterationsmodell

### Stufe 1: Richt-LV- und Projektentwicklungs-Konfigurator

Das ist der Fokus des ersten Prototyps.

Ziel: aus Gebäudedaten ein strukturiertes Leistungsverzeichnis erzeugen. Keine Marge, kein finales Kundenangebot, keine vollständige IRR-Logik, keine Vertragslogik, keine Preisgleitformeln, keine produktive Kalkulation.

Enthalten: Gebäudedaten erfassen, Gebäudeeignung bewerten, Technologiepfad vorschlagen, Aufstellvariante wählen, Komponentenpakete / Modulbausteine ableiten, Abhängigkeiten zwischen Komponenten abbilden, LV-Positionen generieren, Kosten plausibel berechnen, Förderung vereinfacht berücksichtigen, Datenqualität und Prüfreife anzeigen, Planungs-/Engineering-Handover erzeugen.

Wichtig: Planungs- und Projektentwicklungsaufwand wird in Stufe 1 nicht als LV-Kostenposition in die Vollkosten gerechnet. Das sind Strukturkosten und sollen später aus der Arbeitspreismarge getragen werden. Sie können aber als Bottleneck-/Aufwandsindikator sichtbar gemacht werden.

### Stufe 2: Wärmelieferungs-Angebotskonfigurator

Spätere Ausbaustufe. Zusätzlich: Laufzeitvarianten 10, 15, 20 Jahre; Ziel-IRR 13 % Default, 15 % Ambitions-/Managementszenario; Grundpreis; Arbeitspreis; Marge nur auf dem Arbeitspreis; keine Marge auf Investitionskosten; keine Marge auf Grundpreis; Arbeitspreismarge wird iterativ angepasst, bis über die Laufzeit Ziel-IRR erreicht wird; Opex; Finanzierung; Erlöse; Vertragsmodule; Preisgleitformeln; Kundenangebotsvorschau.

### Parallelprojekt: Test- und Validierungsumgebung

Das ist keine lineare Stufe, sondern ein paralleler Ausbau.

Ziel: Ein erzeugtes LV oder später Angebot kann als Testfall gespeichert werden. Mehrere Testfälle decken verschiedene Angebotsvarianten ab. Bei neuen Preisen, Regeln, Abhängigkeiten oder Produktversionen kann ein Testlauf gestartet werden. Der Testlauf berechnet alle Testfälle neu. Die Ergebnisse werden tabellarisch mit dem letzten Referenzlauf verglichen. Abweichungen bei Kosten, Komponenten, Förderung, Angebotsstatus und später Preisen/IRR werden sichtbar.

Das ist wichtig, damit neue Produktversionen nicht unbemerkt falsche Ergebnisse erzeugen.

## 5. Fachlicher Scope des MVP

### Gebäudesegment

Fokus: Bestands-Mehrfamilienhäuser, Wohngebäude, ca. 8 bis 50 Wohneinheiten als Hypothese. Diese Spanne ist kein hartes Ausschlusskriterium. Selektion basiert auf mehreren Faktoren, vor allem benötigter Leistung, Platz, Schall, Hydraulik, Datenqualität und Aufstellbarkeit.

Haupt-Use-Case: freistehendes Mehrfamilienhaus, typisches Gebäude aus ca. 1960er bis 1980er Jahren, teilweise saniert, ausreichend Außenfläche, Wärmepumpe außen oder nahe am Gebäude aufstellbar, Heizraum grundsätzlich nutzbar.

Neben-Use-Case: verdichtete Innenstadtbebauung, wenig Platz, Konkurrenz zu Wärmenetzlösungen, Schall und Aufstellung schwieriger. Nicht primärer Standardfall, aber als Prüffall abbilden.

### Technologie-Scope

Im MVP nur:

1. Luft-Wasser-Wärmepumpe hybrid mit bestehendem Gasheizkessel
2. perspektivisch monoenergetische / monovalente Luft-Wasser-Wärmepumpe mit Heizstab, aber nicht erster Use Case

Nicht im MVP: Gas-only-Referenz, Gas green ready, Biomasse / Pellet, Fernwärme, BHKW, PV, Batterie, Mieterstrom, vollumfänglicher Sanierungsfahrplan.

Wichtig: Der erste Use Case ist Hybrid-Wärmepumpe mit bestehendem Gasheizkessel.

Vereinfachte Arbeitsweise: vorhandener Heizkreis wird weiter genutzt; maximal zwei Heizkreise zulässig; mehr als zwei Heizkreise ist ein Ausschluss- oder Engineering-Sonderfall; Wärmepumpe speist zuerst in den Pufferspeicher; bestehender Gasheizkessel leistet nach, falls erforderlich; Heizstab ist optional für monoenergetische Fälle oder als Backup zu denken; Wärmepumpenstromtarif wird angenommen.

## 6. Aufstellvarianten

Bitte die Aufstellvarianten als zentrale Konfigurationsachse behandeln.

### Variante 1: Standard-Fundament

Wärmepumpe oder Wärmepumpenkaskade auf kleinem Fundament außen am Gebäude, ggf. Standard-Schallhaube, Verbindungen gehen in den Heizraum, Speicher, Hydraulik, Regelung und weitere Komponenten im Heizraum.

Charakter: niedrigster Zusatz-CapEx, geringster Standardisierungsgrad, viel hängt vom Heizraum ab, gut für freistehende Gebäude mit Platz.

### Variante 2: Schutz-/Schall-Einhausung

Wärmepumpe außen, einfacher Schutzzaun, Schallwand Richtung Gebäude oder Nachbarschaft, Vandalismusschutz, einfacher Witterungsschutz optional, einfache Schalldämmung.

Charakter: mittlerer CapEx-Zuschlag, Schall- und Vandalismusrisiken besser adressierbar, wahrscheinlich wichtiger MVP-Baustein, braucht Außenfläche, aber weniger als Container.

### Variante 3: Kompakt-Container

Kleiner vorkonfektionierter Technikcontainer, größer als ein Standardgehäuse, wesentliche Komponenten vormontiert, Verbindung zum Gebäude erforderlich, mehrere Einheiten theoretisch nebeneinander möglich.

Charakter: hoher CapEx-Zuschlag, reduziert potenziell Planungs- und Montageaufwand, verbessert Standardisierung, braucht deutlich Platz, relevant für freistehende Gebäude, nicht für dichte Innenstadt.

### Variante 4: Vollcontainer

Größerer, ggf. begehbarer Technikcontainer, möglichst viel Technik im Container, Heizraum wird stark entlastet, „hinstellen, anschließen, betreiben" als Zielbild.

Charakter: deutlich teuerste Variante, maximaler Standardisierungsgrad, hoher Platzbedarf, wahrscheinlich kein Default, als strategische oder Premium-Variante sichtbar machen.

### Aufstelllogik

Bitte nicht nur Kosten zeigen, sondern Trade-offs:

| Variante | CapEx | Platzbedarf | Schallschutz | Vorkonfektionierung | Heizraumabhängigkeit | Standardisierung |
|---|---|---|---|---|---|---|
| Fundament | niedrig | niedrig-mittel | niedrig-mittel | niedrig | hoch | niedrig |
| Einhausung | mittel | mittel | mittel-hoch | niedrig-mittel | hoch | mittel |
| Kompakt-Container | hoch | hoch | mittel-hoch | hoch | mittel | hoch |
| Vollcontainer | sehr hoch | sehr hoch | hoch | sehr hoch | niedrig | sehr hoch |

Die exakten Preise sind Demo-Annahmen. Bitte plausible, gerundete Werte verwenden.

## 7. Schalllogik

Schall darf nicht nur als „niedrig/mittel/hoch" modelliert werden. Bitte eine konkretere Schall-Vorprüfung vorsehen.

Benötigt: Schallleistungspegel der Wärmepumpe am Austritt / Gerät; Abstand zum nächstgelegenen Immissionsort; zulässiger Immissionsrichtwert am Gebäude / Nachbargebäude; Tag-/Nacht-Betrachtung, mindestens Nachtwert als kritischster Wert; einfache Abschätzung des Schalldruckpegels am Immissionsort; Ergebnis als Ampel.

Beispielhafte Eingaben: Schallleistungspegel Gerät in dB(A), Entfernung zum nächsten Fenster / Nachbargebäude in m, Gebietstyp oder Grenzwertklasse, Nachtgrenzwert in dB(A), Schallhaube vorhanden ja/nein, Schallwand/Einhausung vorhanden ja/nein, Container vorhanden ja/nein.

Beispielhafte Logik: berechne geschätzten Pegel am Immissionsort, vergleiche mit Grenzwert. Wenn unter Grenzwert: schallseitig vorläufig möglich. Wenn nahe am Grenzwert: prüfpflichtig. Wenn über Grenzwert: alternative Aufstellvariante oder Engineering-Prüfung.

Bitte konkrete dB-Werte als Demo-Annahmen nutzen, aber klar kennzeichnen, dass keine rechtsverbindliche Schallberechnung erfolgt.

## 8. Eingabelogik

Die bisherigen 10–15 Eingabefelder sind zu dünn. Bitte einen sinnvollen MVP-Fragebogen entwerfen, der detailliert genug ist, aber nicht zu einem 100-Fragen-Tool wird.

Wichtig: Fragen sollen dynamisch sein. Irrelevante Fragen sollen ausgeblendet werden. Folgefragen sollen abhängig von vorherigen Antworten erscheinen. Antworten müssen konkret sein, nicht nur grobe Labels. Tooltips sollen erklären, warum die Frage gestellt wird.

### Eingabekategorien

**A. Gebäudegrunddaten:** Gebäudetyp, Wohneinheiten, Mietfläche / beheizte Fläche, Baujahrklasse, Sanierungsstand / Dämmstandard, Anzahl Hauseingänge / Gebäudeteile, Keller / Heizraum vorhanden, Dach / Außenfläche / Hof verfügbar.

**B. Wärmebedarf und Leistung:** Jahreswärmeverbrauch, Verbrauchsquelle, Heizlast bekannt ja/nein, Heizlast in kW falls bekannt, Heizlast-Proxy aus Verbrauch, Fläche oder WE, Vollbenutzungsstunden als Annahme, Warmwasser enthalten ja/nein, Warmwasser zentral/dezentral/unbekannt.

**C. Bestandssystem:** bestehender Wärmeerzeuger, Gasheizung vorhanden ja/nein, Alter Bestandskessel, Zustand Bestandskessel, Bestandskessel weiter nutzbar ja/nein/unbekannt, Anzahl Heizkreise, maximal zwei Heizkreise zulässig, Pufferspeicher vorhanden ja/nein, Speicher nutzbar ja/nein/unbekannt.

**D. Temperaturniveau:** Vorlauftemperatur differenziert abfragen: ≤ 45 °C, 46–50 °C, 51–55 °C, 56–60 °C, 61–65 °C, 66–70 °C, > 70 °C, unbekannt. Zusätzlich: Auslegungs-Vorlauftemperatur bekannt ja/nein, gemessene Vorlauftemperatur oder Schätzwert, Heizkörper ausreichend ja/nein/unbekannt, hydraulischer Abgleich vorhanden ja/nein/unbekannt.

**E. Aufstellung innen:** Heizraumgröße ausreichend ja/nein/unbekannt, Zugang / Türbreite ausreichend ja/nein/unbekannt, Platz für Speicher ja/nein/unbekannt, Platz für Hydraulik ja/nein/unbekannt, Rückbau Altanlage nötig ja/nein, besondere Keller-/Brandschutz-/Zugangsrisiken.

**F. Aufstellung außen:** Außenfläche vorhanden ja/nein, geschätzte verfügbare Fläche, Entfernung zum Heizraum, Leitungstrasse einfach/mittel/schwierig, Fundament möglich ja/nein/unbekannt, Zaun/Einhausung möglich ja/nein/unbekannt, Container möglich ja/nein/unbekannt, Kran-/Anlieferzugang möglich ja/nein/unbekannt.

**G. Schall:** Abstand zum nächsten Fenster, Abstand zur Grundstücksgrenze, Gebietstyp / Grenzwertannahme, Nachtgrenzwert, Geräuschsensibilität hoch/mittel/niedrig, Schallhaube möglich, Schallwand möglich, Einhausung möglich.

**H. Elektrik / Netzanschluss:** Wärmepumpenstromtarif angenommen, Netzanschlussleistung bekannt ja/nein, Zählerschrank geeignet ja/nein/unbekannt, Kabelweg einfach/mittel/schwierig, Netzanschlussprüfung erforderlich ja/nein, Lastmanagement möglich ja/nein/unbekannt.

**I. Förderung:** BEG-Förderung annehmen ja/nein/unsicher, Contractor-Modell ja, Förderquote Default 35 %, förderfähiger Anteil abhängig von erneuerbarem Teil, fossile Einheit nicht förderfähig, Umfeldmaßnahmen nur förderfähig wenn mit erneuerbarem Teil verbunden.

**J. Monitoring / Betrieb:** Monitoring Basic verpflichtend, Monitoring über Hersteller möglich ja/nein/unbekannt, zusätzliche Monitoringlösung nötig ja/nein, Fernablesung erforderlich, spätere Fernsteuerung nur Zukunftsoption, Betriebsführung optional später.

## 9. Konfigurationslogik

Bitte analysiere und entscheide, ob für diesen Prototyp besser mit wenigen großen Systempaketen oder mit mehreren kombinierbaren Pakettypen gearbeitet wird.

Die Hypothese ist:

> Große S/M/L/XL-Endpakete reichen vermutlich nicht. Wahrscheinlicher ist eine modulare Paketlogik: Wärmepumpenpaket + Hydraulikpaket + Aufstellpaket + Monitoringpaket + Servicepaket + später Vertragspaket.

Bitte diese Frage im Konzept ausdrücklich offen bewerten und eine Empfehlung abgeben.

### Mögliche Pakettypen

**Wärmepumpenpaket:** Leistungsklasse, Anzahl Geräte / Kaskade, herstellerneutral, COP-Annahme, Schallleistungspegel-Annahme, Stromanschlussanforderung.

**Hybridpaket:** Einbindung bestehender Gasheizung, Regelungslogik, Pufferspeicher, Nachheizlogik, Förderfähigkeitsgrenzen.

**Hydraulikpaket:** maximal zwei Heizkreise, Pumpengruppen, hydraulischer Abgleich, Speicher / Puffer, Regelung, Warmwasser-Integration.

**Aufstellpaket:** Fundament, Schallhaube, Einhausung, Kompakt-Container, Vollcontainer.

**Monitoringpaket:** Monitoring Basic verpflichtend, Monitoring Plus optional, Herstellerdaten oder externe Lösung, Mess-/Billing-Komponenten.

**Servicepaket:** Wartung, Störungsdienst, Schornsteinfeger falls relevant, Reparaturpauschalen, Betriebskostenpositionen.

**Später: Vertragspaket:** Laufzeit, Grundpreis, Arbeitspreis, Preisgleitformel, Servicelevel, Vertragsmodule.

### Komponentenabhängigkeiten

Bitte modellieren: Wenn Hybrid, dann Bestandskesselprüfung erforderlich. Wenn Hybrid, dann fossile Einheit nicht förderfähig. Wenn zentral Warmwasser, dann Speicher-/WW-Modul erforderlich. Wenn > 2 Heizkreise, dann Ausschluss oder Engineering-Sonderfall. Wenn Außenfläche schlecht, dann Container nicht möglich. Wenn Innenstadt + Schall kritisch, dann Engineering-Prüfung. Wenn Schallpegel zu hoch, dann Schallhaube/Einhausung/anderer Standort prüfen. Wenn Netzanschluss unbekannt, dann Elektroprüfung. Wenn Vorlauftemperatur > 65 °C, dann Standard-Hybrid nur mit Warnung / Engineering. Wenn Datenqualität niedrig, dann kein belastbares Richt-LV.

## 10. Kostenlogik

Die Kostenwerte sollen plausible Demo-Werte sein. Bitte leicht runden, abstrahieren und nicht exakt wie aus einer internen Matrix wirken lassen.

### Referenzannahmen für mittelgroßes Bestands-MFH

Bitte als Basis ein synthetisches Beispiel verwenden: 70 WE; 3.800 bis 4.200 m² beheizte Fläche; Bestandsgebäude; Wärmebedarf ca. 900 bis 1.100 MWh/a; Hybrid-WP mit bestehendem Gasheizkessel; installierte WP-Leistung beispielhaft 60 bis 80 kW; Gesamt-/Spitzenleistung im System höher, z. B. 180 bis 220 kW; Wärmepumpen-COP/JAZ als Demo ca. 3,2 bis 3,5; Gas-Kesselwirkungsgrad als Demo ca. 92 bis 95 %; Strompreis Wärmepumpe als Demo ca. 230 bis 260 €/MWh; Gaspreis als Demo ca. 70 bis 90 €/MWh; Förderung 35 % auf förderfähigen erneuerbaren Anteil; Contingency ca. 10 %.

[Anmerkung 11.06.2026: MWh/kW-Verhältnis inkonsistent, siehe HANDOVER Abschnitt 3.2; für v0.1 gilt der Demo-Referenzfall in Abschnitt 3.3.]

### Kostenlogik Stufe 1

Stufe 1 berechnet ein LV ohne Marge.

Brutto-LV-Kosten = Wärmepumpenpaket + Hybrid-Einbindung + Hydraulikpaket + Warmwasser-/Speicherpaket + Aufstellpaket + Elektro-/Netzanschlusspaket + Monitoringpaket + Installation / Inbetriebnahme + Umfeldmaßnahmen + Contingency

Förderung = förderfähiger Anteil × 35 %

Netto-LV-Kosten = Brutto-LV-Kosten − Förderung

Wichtig: keine Marge, kein endgültiger Contracting-Kundenpreis, PE-/Planungskosten nicht als Vollkostenposition rechnen, PE-Aufwand nur als interner Aufwandsscore anzeigen.

### Kostenlogik Stufe 2

Später: Netto-LV-Kosten werden finanziert; Grundpreis deckt fixe/kapitalbezogene Bestandteile; Arbeitspreis enthält variable Energiekosten und Marge; Marge liegt nur auf dem Arbeitspreis; Arbeitspreismarge wird iterativ angepasst, bis Ziel-IRR erreicht ist; Ziel-IRR Default 13 %, alternatives Szenario 15 %.

### Energie- und Betriebskosten

Bitte im MVP zeigen: Stromverbrauch WP = WP-Wärmeerzeugung / COP; Gasverbrauch Kessel = Gas-Wärmeerzeugung / Wirkungsgrad; Energiekosten Strom; Energiekosten Gas; O&M p.a.; Monitoring p.a.; einfache Wärmekostenindikation. Aber keine vollständige Vertragskalkulation in Stufe 1.

## 11. Förderung

MVP-Annahme: BEG-Förderung, Contractor-Modell, 35 % Förderquote, förderfähig ist der erneuerbare Teil, nicht förderfähig ist die fossile Einheit, Umfeldmaßnahmen sind nur förderfähig wenn sie mit dem erneuerbaren Teil zusammenhängen, Förderlogik ist Demo-Logik, keine Förderberatung.

Bei Hybrid: Wärmepumpenpaket förderfähig, fossiler Kessel nicht förderfähig, Hybrid-Einbindung anteilig prüfen, Umfeldmaßnahmen anteilig oder pauschal als förderfähig/nicht förderfähig markieren, Förderunsicherheit als Warnung anzeigen.

## 12. Preisgleitformeln, nur Zukunftsnotiz

Bitte nicht vollständig im MVP bauen, aber im Konzept als späteres Modul aufnehmen. Später zu recherchieren: Standardlogik für Wärmelieferverträge, Preisgleitformel mit Marktglied und Kostenglied, Lohnindex, Stromindex, Gasindex, ggf. Verbraucherpreisindex, relevante offizielle Veröffentlichungen und Indizes, juristische Prüfung erforderlich. Im MVP nur als Roadmap-Hinweis anzeigen.

## 13. Admin-/Konfigurationsbereich

Eine zentrale offene Produktfrage:

> Muss der Admin-Bereich direkt im ersten Prototyp gebaut werden oder reicht zunächst eine sichtbare Annahmen-/Regelseite?

Bitte das im Konzept bewerten.

Anforderung: Das Tool soll später so aufgebaut sein, dass folgende Logik konfigurierbar wird: Komponenten, Kosten, Pakettypen, Abhängigkeiten zwischen Komponenten, Abhängigkeiten zwischen Gebäudedaten und Komponenten, Ausschlussregeln, Warnregeln, Förderannahmen, O&M-Annahmen, Energiepreise, Aufstellzuschläge, Schallgrenzen, Statuslogik, Versionen.

Für den ersten Prototyp reicht eventuell: sichtbare Annahmen-/Regelseite, editierbare Demo-Werte, klare Trennung von Regeln, Annahmen und UI, noch kein vollständiges Backend. Bitte aber so denken, dass ein echter Admin-Bereich nahtlos anschließen kann.

Governance später: Product Management primär verantwortlich, Projektentwicklung unterstützt, Engineering liefert technische Regeln, Procurement/Supply Chain liefert Kosten und Komponenten, Finance liefert IRR-/Preislogik, Legal liefert Vertrags- und Preisgleitlogik.

## 14. Layout-Entscheidung

Bitte nicht sofort ein Layout final festlegen. Erstelle zuerst eine Entscheidungsvorlage und, wenn möglich, mehrere einfache Mockup-Varianten.

**Layoutoption A: Klassische Konfiguratoransicht.** Links Navigation / Eingaben, Mitte relevante Multiple-Choice-Fragen, rechts Live-Vorschau des LV. Irrelevante Fragen werden ausgeblendet, Tooltips erklären Fachlogik. Vorteil: sehr nah an bekannten Angebotsgeneratoren, gut für Live-Demo, zeigt Ursache-Wirkung klar. Risiko: kann bei vielen Fragen überladen werden.

**Layoutoption B: Multistep-Wizard.** Schritt 1 Gebäude, Schritt 2 Bestandssystem, Schritt 3 Aufstellung, Schritt 4 Schall / Elektrik, Schritt 5 Systemmodule, Schritt 6 LV, Schritt 7 Handover. Vorteil: klare Führung, gut für weniger erfahrene Nutzer. Risiko: weniger Live-Konfigurationsgefühl.

**Layoutoption C: LV-zentrierter Baukasten.** Links Navigation, Hauptbereich zeigt LV-Linien / Komponentenblöcke, jede LV-Linie kann über Fragen/Toggles konfiguriert werden, Abhängigkeiten zwischen LV-Positionen werden sichtbar, rechts Kosten- und Statusvorschau. Vorteil: sehr gut für Projektentwicklung, zeigt wie ein LV „zusammengebaut" wird, macht Abhängigkeiten transparent. Risiko: für Management eventuell weniger intuitiv.

**Layoutoption D: Entscheidungsbaum + Ergebnis.** Oben oder links Entscheidungsbaum, Fragen führen durch Gebäudefit und Technologiepfad, danach generiertes LV, starke Visualisierung von Ausschlüssen und Prüfpfaden. Vorteil: gut für Regelvalidierung, zeigt CTO-Logik klar. Risiko: weniger wie ein Angebots-/LV-Tool.

**Erwartung an Claude:** 1. Die Layoutoptionen bewerten. 2. Eine Empfehlung für den ersten Prototyp geben. 3. Optional 2–3 einfache Playdummy-/Mockup-Varianten erstellen. 4. Danach erst den ersten klickbaren Prototyp umsetzen.

Zielgeräte: Notebook, Full-HD-Bildschirm, größerer Bildschirm, Tablet okay, keine Smartphone-Optimierung nötig.

## 15. Ergebnisansichten

Der Prototyp sollte mindestens folgende Ergebnisbereiche haben:

**A. Konfigurationsergebnis:** empfohlener Technologiepfad, gewählte Aufstellvariante, gewählte Paket-/Modulkombination, Datenqualität, Status: Richt-LV-fähig, PE-Prüfung, Engineering-Prüfung, nicht standardfähig.

**B. Leistungsverzeichnis.** Gruppiert nach: Wärmepumpenpaket, Hybrid-Einbindung, Hydraulik, Speicher / Warmwasser, Aufstellung, Schallmaßnahmen, Elektro / Netzanschluss, Monitoring, Installation / Inbetriebnahme, Umfeldmaßnahmen, Contingency, Förderung. Für jede Position: Position, Menge, Einheit, Kosten, automatisch/manuell, Begründung, förderfähig ja/nein/anteilig, prüfpflichtig ja/nein.

**C. Kostenübersicht:** Brutto-LV-Kosten, förderfähiger Anteil, Förderung, Netto-LV-Kosten, O&M p.a., Energiekostenindikator, Monitoring p.a., Kosten je WE, Kosten je m², Kosten je kW, Warnhinweis: keine Marge / kein Kundenangebot.

**D. Prüfliste / Handover:** fehlende Daten, benötigte Fotos, benötigte Dokumente, PE-Prüfpunkte, Engineering-Prüfpunkte, Förderprüfung, Schallprüfung, Netzanschlussprüfung, Bestandskesselprüfung, Entscheidungsempfehlung für nächsten Schritt.

**E. Annahmen und Regeln:** sichtbare Demo-Annahmen, Energiepreise, Kostenannahmen, Förderlogik, Schallgrenzen, Aufstellzuschläge, Abhängigkeitsregeln, Statusregeln.

**F. Testfallfunktion.** Mindestens konzeptionell, besser als einfacher erster MVP-Baustein: aktuelle Konfiguration als Testfall speichern, Testfälle auflisten, aktuellen Rechenlauf starten, Ergebnis mit vorherigem Lauf vergleichen, Differenzen tabellarisch anzeigen.

## 16. Status- und Ausschlusslogik

**Standardfähig / Richt-LV-fähig:** freistehendes Bestands-MFH, Außenfläche ausreichend, Schall rechnerisch vorläufig einhaltbar, maximal zwei Heizkreise, Bestandskessel bei Hybrid grundsätzlich nutzbar, Verbrauch oder Heizlast plausibel, Warmwasserfrage geklärt, Netzanschluss zumindest vorläufig unkritisch oder prüfbar.

**PE-Prüfung:** Datenqualität mittel, Bestandskesselzustand unbekannt, Förderung unsicher, Warmwasser zentral mit unklarer Speicherlösung, Heizlast nur geschätzt, Aufstellvariante noch nicht bestätigt.

**Engineering-Prüfung:** Schallgrenze knapp oder überschritten, Außenfläche eingeschränkt, Innenstadtlage, Netzanschluss unbekannt oder kritisch, mehrdeutige Hydraulik, hoher Vorlauftemperaturbereich, Heizraum-/Zugangsprobleme, Containerlogik mit hohem Platzbedarf.

**Nicht standardfähig / Ausschluss:** mehr als zwei Heizkreise im vereinfachten MVP, keine geeignete Innen- oder Außenaufstellung, Schall nicht plausibel lösbar, keine ausreichenden Eingangsdaten, Technologiepfad außerhalb MVP, dezentrale oder ungeklärte Sonderstruktur, die Standardlogik bricht.

## 17. Beispiel-Testfälle

**Testfall 1: Standard-Hybrid.** Freistehendes MFH, 36 WE, 2.400 m², Baujahr 1975, mittlerer Sanierungsstand, Gas-Bestandskessel nutzbar, zentrale Wärmeversorgung, maximal zwei Heizkreise, VL 60 °C, Außenfläche gut, Abstand nächstes Fenster 12 m, Schallgrenze Nacht 40 dB(A), Netzanschluss unbekannt aber prüfbar, Förderung angenommen. Erwartung: WP hybrid empfohlen, Schutz-/Schall-Einhausung oder Standard-Fundament als Variante, Status gelb oder grün-gelb, Bestandskessel- und Netzanschlussprüfung.

**Testfall 2: Freistehend mit viel Platz, Containeroption.** 48 WE, 3.600 m², Gas-Bestandskessel nutzbar, Heizraum eng, Außenfläche sehr gut, Abstand nächstes Fenster 20 m, VL 55–60 °C, zwei Heizkreise, Warmwasser zentral. Erwartung: WP hybrid, Kompakt-Container als attraktive Alternative, höherer CapEx, geringerer Umsetzungs-/Heizraumrisiko-Score.

**Testfall 3: Innenstadt-Prüffall.** 24 WE, 1.800 m², wenig Außenfläche, Abstand nächstes Fenster 5 m, Schallgrenze Nacht 35 dB(A), Netzanschluss unbekannt, Heizraum klein, VL unbekannt, Bestandskessel unbekannt. Erwartung: Engineering-Prüfung, kein belastbares Richt-LV, Schall-/Platz-/Datenrisiken prominent.

**Testfall 4: Ausschluss wegen Hydraulik.** 42 WE, 3.200 m², vier Heizkreise, zentrale WW, Gas-Bestandskessel vorhanden, Außenfläche gut. Erwartung: nicht standardfähig im MVP, Engineering-Sonderfall, Begründung: mehr als zwei Heizkreise.

## 18. Qualitätsanforderungen an den Prototyp

Der Prototyp ist erfolgreich, wenn er folgende Fragen beantwortet: 1. Welche Gebäudedaten werden benötigt? 2. Welche Technologie wird empfohlen? 3. Warum wird diese Technologie empfohlen? 4. Welche Aufstellvariante ist plausibel? 5. Welche Komponenten landen im LV? 6. Warum landen diese Komponenten im LV? 7. Was kostet die Lösung grob? 8. Was ist förderfähig? 9. Welche Daten fehlen? 10. Welche Prüfungen sind nötig? 11. Ist der Fall richt-LV-fähig oder prüfpflichtig? 12. Was ändert sich, wenn man eine Eingabe ändert? 13. Was ändert sich, wenn man eine andere Aufstellvariante wählt? 14. Kann man Ergebnisse als Testfall speichern? 15. Kann man spätere Regel-/Kostenänderungen gegen Testfälle prüfen?

## 19. Nicht bauen / nicht behaupten

Kein verbindliches Kundenangebot, keine echte Förderberatung, keine echte Schallberechnung, keine rechtliche Prüfung, keine echte Contracting-Kalkulation, keine echte IRR-Engine in Stufe 1, keine CRM-Integration, keine ERP-Integration, keine echten Kundendaten, keine exakten internen Kalkulationswerte, keine Gas-only-Referenz, keine Biomasse-/Pellet-Option im MVP, keine Smartphone-Version.

## 20. Erwarteter erster Output von Claude

**A. Konzeptentscheidung:** empfohlener Produktzuschnitt für Stufe 1, Abgrenzung zu Stufe 2, Bewertung Systempakete vs modulare Pakettypen, Empfehlung für Konfigurationslogik, Empfehlung für Layoutvariante, offene fachliche Fragen.

**B. Prototyp-Plan:** welche Screens / Bereiche der erste Prototyp haben soll, welche Beispieltestfälle enthalten sein sollen, welche Demo-Annahmen genutzt werden, welche Regeln modelliert werden, welche Ergebnisansichten enthalten sein sollen.

**C. Entscheidungsvorlage Layout:** mindestens 2 Layoutvarianten vergleichen, Empfehlung abgeben, kurz begründen.

**D. Danach erster klickbarer Prototyp:** kein produktionsreifes Tool, kein Overengineering, Fokus auf Klarheit, Fachlogik, Demo-Wirkung und spätere Erweiterbarkeit.

### Zusatzhinweis

Die Tech-Matrix-Werte wurden im Prompt bewusst nicht exakt übernommen, sondern in plausible Demo-Bandbreiten übersetzt. Das reduziert das Risiko, dass interne Daten erkennbar werden.

*Ende Original-Prompt. Erstellt 11.06.2026, 20:19 Berlin. Status A bis C abgeschlossen im Konzept-Thread, dokumentiert in Abschnitt 2 bis 6 dieses Handovers. D (Build v0.1) ist der nächste Schritt.*
