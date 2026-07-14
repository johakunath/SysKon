# Datenquellen & Provenienzmodell (SK-75)

Beschreibt, woher jedes Eingabefeld seinen Wert bezieht, wie verlässlich die Quelle ist und
welche Sales-Folgeaktion bei schwacher oder fehlender Quelle nötig ist. Ziel: Scheingenauigkeit
vermeiden und manuell vs. skalierbare Quellen trennbar machen.

Codeumsetzung: `src/data/provenienz.js` exportiert `QUELLENTYPEN` und `FELD_PROVENIENZ`.

## Quellentypen-Taxonomie

| ID | Label | Skalierbar | Beschreibung |
|---|---|---|---|
| `tes_abrechnung` | TES-Abrechnung | ja | Verbrauchs- und Abrechnungsdaten aus bestehenden Heizkostenerfassungsverträgen mit einem Messdienstleister. Stärkste schnell verfügbare Datenquelle. |
| `asset_manager` | Asset Manager | ja | Stamm- und Betriebsdaten aus dem Asset-Management-System des Messdienstleisters. Zielquelle für skalierbare automatisierte Befüllung. |
| `stammdaten` | Stammdaten / CRM | ja | Strukturierte Daten aus CRM, Liegenschaftsdatenbank oder Vertragsstamm. Pflege variiert. |
| `kunde_manuell` | Kundenangabe (manuell) | nein | Vom Kunden im Gespräch genannte Information ohne externen Beleg. Verlässlichkeit stark variierend. |
| `sales_manuell` | Sales-Einschätzung (manuell) | nein | Von Sales eingeschätzte oder ausgewählte Information. Kein externer Beleg. |
| `abschaetzung` | Proxy / Abschätzung | nein | Aus anderen Feldern berechnet oder per Demo-Heuristik abgeschätzt. Kein reales Quelldokument. |

**Manuell vs. skalierbar:** Die drei skalierbaren Quellen (`tes_abrechnung`, `asset_manager`,
`stammdaten`) sind langfristige Integrationsziele. Alle drei erzeugen weniger Gesprächsaufwand,
höhere Aktualität und mehr Vertrauen als manuelle Quellen. Felder mit `skalierbar: true` in
`FELD_PROVENIENZ` sind Kandidaten für automatisierte Befüllung aus diesen Quellen.

## Per-Feld-Provenienz

Jedes fachlich wichtige Eingabefeld hat fünf Zielattribute:
- **Quelle**: bevorzugte Datenquelle (erster Eintrag) und Fallbacks
- **Erfassungsweg**: wie der Wert heute in die Demo gelangt
- **Aktualität**: `aktuell` = letztes Abrechnungsjahr/Echtzeit; `historisch` = Stammdaten; `einmalig` = Gesprächserfassung; `berechnet` = Proxy
- **Vertrauen**: Confidence-Niveau der Zielquelle (`hoch`/`mittel`/`niedrig`)
- **Kundensicht**: wie der Wert nach außen kommuniziert wird

### Sektion A – Gebäude & Gesprächsrahmen

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `gebaeudetyp` | stammdaten → sales_manuell | historisch | mittel | ja | – |
| `wohneinheiten` | stammdaten → asset_manager → kunde_manuell | historisch | hoch | ja | – |
| `anzahl_gebaeude` | sales_manuell → stammdaten | einmalig | hoch | ja | – |
| `flaeche` | stammdaten → asset_manager → kunde_manuell | historisch | mittel | ja | Unplausible Fläche im Verhältnis zu WE/Verbrauch nachfragen |
| `baujahrklasse` | stammdaten → asset_manager | historisch | hoch | ja | – |
| `sanierungsstand` | kunde_manuell → sales_manuell | einmalig | **niedrig** | nein | Energieausweis oder Modernisierungshistorie anfordern |
| `heizraum_vorhanden` | kunde_manuell → asset_manager | einmalig | mittel | ja | Vor-Ort-Begehung einplanen |
| `aussenflaeche_vorhanden` | kunde_manuell → sales_manuell | einmalig | mittel | nein | Vor-Ort-Begehung einplanen |

### Sektion B – Wärmebedarf & Datenlage

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `jahresverbrauch` | **tes_abrechnung** → kunde_manuell → abschaetzung | aktuell | hoch | ja | Bei Schätzung: Abrechnung/Energieausweis anfordern |
| `verbrauchsquelle` | sales_manuell | einmalig | hoch | nein | Bei Schätzung: Abrechnung nachfordern |
| `ww_enthalten` | kunde_manuell → tes_abrechnung | einmalig | **niedrig** | ja | Abrechnungsstruktur klären |
| `ww_bereitung` | kunde_manuell → asset_manager | einmalig | mittel | ja | Bei unbekannt: vor Scope-Aussage klären |
| `ww_speicher_typ` | kunde_manuell → asset_manager | einmalig | mittel | ja | Im weiteren Prozess konkretisieren |
| `heizlast_bekannt` | sales_manuell | einmalig | hoch | nein | – |
| `heizlast_kw` | stammdaten → abschaetzung | historisch | mittel | ja | Heizlastberechnung EN 12831 anfordern |

### Sektion C – Bestandssystem & Hybridfähigkeit

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `technologiepfad` | sales_manuell | einmalig | hoch | nein | – |
| `gaskessel_vorhanden` | kunde_manuell → asset_manager | einmalig | mittel | ja | Anlagendaten über Asset Manager abrufen |
| `kessel_zustand` | kunde_manuell | einmalig | **niedrig** | nein | Wartungshistorie und Service-Datum anfordern |
| `kessel_nutzbar` | kunde_manuell → sales_manuell | einmalig | **niedrig** | nein | Vor Scope-Aussage technisch prüfen lassen |
| `anzahl_heizkreise` | kunde_manuell → asset_manager | einmalig | mittel | ja | Bei >2: Hydrauliksonderfall intern klären |
| `pufferspeicher_vorhanden` | kunde_manuell → asset_manager | einmalig | **niedrig** | ja | – |

### Sektion D – Temperaturniveau & Heizflächen

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `vorlauftemp_klasse` | **asset_manager** → tes_abrechnung → kunde_manuell | aktuell | hoch | ja | Bei unbekannt: vor Empfehlung erfassen |
| `heizkoerper_ausreichend` | sales_manuell → kunde_manuell | einmalig | **niedrig** | nein | – |
| `hydraulischer_abgleich` | kunde_manuell | einmalig | **niedrig** | nein | – |

### Sektion E – Heizraum & Innenaufstellung

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `heizraum_groesse_ok` | kunde_manuell → sales_manuell | einmalig | **niedrig** | nein | Vor-Ort-Begehung und Aufmaß einplanen |
| `zugang_ok` | kunde_manuell → sales_manuell | einmalig | **niedrig** | nein | Türbreiten und Zugang vor Ort messen |
| `platz_speicher` | kunde_manuell | einmalig | **niedrig** | nein | – |

### Sektion F – Außenaufstellung & Standort

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `aussenflaeche_m2` | sales_manuell → stammdaten | einmalig | mittel | ja | Genaues Aufmaß vor Variantenentscheidung |
| `aussenflaeche_typ` | sales_manuell → kunde_manuell | einmalig | mittel | nein | – |
| `aussenflaeche_laenge_m` | sales_manuell → kunde_manuell | einmalig | **niedrig** | nein | Aufmaß vor Ort |
| `aussenflaeche_breite_m` | sales_manuell → kunde_manuell | einmalig | **niedrig** | nein | Aufmaß vor Ort |
| `zugang_logistik` | sales_manuell → kunde_manuell | einmalig | **niedrig** | nein | Zufahrt und Kranzugänglichkeit klären |
| `aufstellvariante` | sales_manuell | einmalig | mittel | nein | Bei offenen Blockern: nicht final zusagen |
| `entfernung_heizraum` | sales_manuell → kunde_manuell | einmalig | **niedrig** | nein | – |
| `kran_zugang` | kunde_manuell → sales_manuell | einmalig | **niedrig** | nein | Vor Containerentscheidung klären |

### Sektion G – Schall & Umfeld

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `abstand_fenster` | sales_manuell → kunde_manuell | einmalig | **niedrig** | nein | Bei Grenzwertnähe: Schallberechnung durch Fachplaner beauftragen |
| `gebietstyp` | stammdaten → sales_manuell | historisch | mittel | ja | Bebauungsplan-Auszug bei Grenzwertnähe |
| `schallsensibilitaet` | sales_manuell | einmalig | **niedrig** | nein | – |

### Sektion H – Elektrik & Netzanschluss

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `netzanschluss_bekannt` | sales_manuell → stammdaten | einmalig | mittel | ja | Bei unbekannt: EVU-Anschlussbestätigung anfordern |
| `zaehlerschrank_ok` | kunde_manuell → sales_manuell | einmalig | **niedrig** | nein | – |
| `kabelweg` | sales_manuell → kunde_manuell | einmalig | **niedrig** | nein | – |

### Sektion I – Förderannahme

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `foerderung_annahme` | sales_manuell | einmalig | **niedrig** | nein | Bei unsicher: interne Förderprüfung als nächsten Schritt |

### Sektion J – Betrieb & Monitoring

| Feld | Quelle (Ziel → Fallback) | Aktualität | Vertrauen | Skalierbar | Sales-Folgeaktion |
|---|---|---|---|---|---|
| `monitoring_variante` | sales_manuell | einmalig | hoch | nein | – |
| `service_variante` | sales_manuell | einmalig | hoch | nein | – |

## Manuell vs. skalierbar – Zusammenfassung

**Skalierbare Felder** (langfristiger Integrationspfad):

| Quelle | Felder (Auswahl) |
|---|---|
| `tes_abrechnung` | `jahresverbrauch`, `ww_enthalten`, `vorlauftemp_klasse` |
| `asset_manager` | `wohneinheiten`, `flaeche`, `baujahrklasse`, `vorlauftemp_klasse`, `gaskessel_vorhanden`, `heizraum_vorhanden`, `ww_bereitung`, `anzahl_heizkreise` |
| `stammdaten` | `gebaeudetyp`, `wohneinheiten`, `flaeche`, `baujahrklasse`, `gebietstyp`, `netzanschluss_bekannt`, `aussenflaeche_m2` |

**Rein manuelle Felder** (keine skalierbare Zielquelle heute):
`sanierungsstand`, `kessel_zustand`, `kessel_nutzbar`, `heizkoerper_ausreichend`,
`hydraulischer_abgleich`, `aufstellvariante`, `abstand_fenster`, `foerderung_annahme` u.a.

## Sales-Follow-up-Logik

Felder mit `vertrauen: 'niedrig'` und nicht-leerem `followUp` erzeugen im Gespräch einen
**offenen Punkt** statt Scheingenauigkeit. In SysKon v0.1 wird dieser Mechanismus über das
`unbekannt`-Optionsmuster, den DQ-Score (`dq`-Gewichte in `fragen.js`) und die Playbooks
(Warnsignale/Einordnung je Frage) abgebildet.

Langfristig: Felder mit `followUp !== null` können einen strukturierten
„Offene Punkte"-Block im Sales-Output erzeugen (Scope: WP9/SK-71 oder späterer Story).

## Einschränkungen & Nicht-Ziele

- Dieses Modell beschreibt **Ziel-Provenienz**, nicht die aktuelle Demo-Datenfluss-Implementierung.
  In v0.1 kommen alle Werte aus manueller Formulareingabe; `tes_abrechnung` und `asset_manager`
  sind Integrationsziele ohne aktive Anbindung.
- Keine live API-Calls, kein Datenpersistenz-Layer und kein Authentifizierungsmodell in v0.1.
- Keine Herstellerkostendetails, Subventionsinterna oder interne Margenlogik in der Kundensicht.
