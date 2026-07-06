// Anzeige-Helfer für die Screens (kein Fachwissen hier hinein!)

import { STATUS_LABEL } from '../logic/engine.js'
import { AUFSTELLVARIANTEN_META } from '../logic/calc.js'

export const euro = (n) => n == null ? '–'
  : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export const num = (n, stellen = 0) => n == null ? '–'
  : new Intl.NumberFormat('de-DE', { maximumFractionDigits: stellen }).format(n)

export const prozent = (n) => n == null ? '–' : `${Math.round(n * 100)} %`

// Aufstellvarianten-Anzeigenamen: eine Quelle (AUFSTELLVARIANTEN_META in calc.js),
// statt die Labels in Logik und Anzeige doppelt zu pflegen.
export const VARIANTEN_NAME = Object.fromEntries(
  Object.entries(AUFSTELLVARIANTEN_META).map(([wert, meta]) => [wert, meta.label])
)

// Status-Titel mit Fallback auf das Status-Label – einheitlich für alle
// Screens, statt den Ausdruck mehrfach inline zu wiederholen.
export const korridorTitel = (ergebnis) =>
  ergebnis.statusKorridor?.titel ?? STATUS_LABEL[ergebnis.status]

// Interne Begriffe für die Kundensicht entschärfen (Preise, Förder-/CAPEX-Wording).
export function kundenPreviewText(text) {
  return String(text ?? '')
    .replace(/€\/WE/g, 'pro WE')
    .replace(/€\/m²/g, 'pro m²')
    .replace(/€\/m2/g, 'pro m²')
    .replace(/€/g, '')
    .replace(/Interne Förderprüfung klären/g, 'Interne Prüfung klären')
    .replace(/Förderprüfung/g, 'interne Prüfung')
    .replace(/Förderlogik/g, 'interne Prüflogik')
    .replace(/Förderberatung/g, 'Beratung zu externen Programmen')
    .replace(/Förderannahme/g, 'interne Annahme')
    .replace(/förderfähig/g, 'zu prüfen')
    .replace(/Förderung/g, 'interne Prüfung')
    .replace(/CAPEX/g, 'interne Kalkulation')
    .replace(/OPEX/g, 'Betrieb')
    .replace(/Netto|Brutto|Marge/g, '')
}

// Bedingung der Regel-DSL lesbar machen (für Screen 4)
export function bedingungText(b) {
  if (!b) return '–'
  if (b.und) return b.und.map(bedingungText).join(' UND ')
  if (b.oder) return '(' + b.oder.map(bedingungText).join(' ODER ') + ')'
  const wert = Array.isArray(b.wert) ? `[${b.wert.join(', ')}]` : String(b.wert)
  return `${b.feld} ${b.op} ${wert}`
}

export function wirkungText(dann) {
  const liste = Array.isArray(dann) ? dann : [dann]
  return liste.map(w => {
    if (w.typ === 'require') return `require: ${w.modul}`
    if (w.typ === 'exclude') return `exclude: ${Array.isArray(w.wert) ? w.wert.join(', ') : w.wert}`
    if (w.typ === 'warn') return `warn (${w.kategorie})`
    if (w.typ === 'status') return `status: ${w.wert}`
    return w.typ
  }).join(' + ')
}
