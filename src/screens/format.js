// Anzeige-Helfer für die Screens (kein Fachwissen hier hinein!)

export const euro = (n) => n == null ? '–'
  : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export const num = (n, stellen = 0) => n == null ? '–'
  : new Intl.NumberFormat('de-DE', { maximumFractionDigits: stellen }).format(n)

export const prozent = (n) => n == null ? '–' : `${Math.round(n * 100)} %`

export const VARIANTEN_NAME = {
  fundament: 'Standard-Fundament',
  einhausung: 'Schutz-/Schall-Einhausung',
  kompakt_container: 'Kompakt-Container',
  vollcontainer: 'Vollcontainer',
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
