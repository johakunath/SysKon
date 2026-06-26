// Gemeinsame LV-Gruppierung (React-frei). Ordnet Positionen nach der festen
// LV_GRUPPEN-Reihenfolge und liefert nur nicht-leere Gruppen zurück. Ersetzt die
// zuvor in engine.js (kundenScopeBauen) und Ergebnis.jsx doppelt gebaute Logik
// (Architektur-Review A6).
import { LV_GRUPPEN } from '../data/katalog.js'

// positionen: Array mit { gruppe, ... }. extraGruppen: zusätzliche Gruppennamen,
// die am Ende der Reihenfolge ergänzt werden (z. B. 'Service / Betrieb (p.a.)').
export function gruppiereNachGruppe(positionen, extraGruppen = []) {
  const namen = [...new Set([...LV_GRUPPEN, ...positionen.map(p => p.gruppe), ...extraGruppen])]
  return namen
    .map(name => ({ name, positionen: positionen.filter(p => p.gruppe === name) }))
    .filter(gruppe => gruppe.positionen.length > 0)
}
