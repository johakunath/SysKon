import React from 'react'

// Status-Ampel als wiederverwendbares Element. Ersetzt die zuvor in fünf
// Screens handgeschriebenen `ampel <groesse> <status>`-Spans.
// Status wird sonst nur per Farbe transportiert; aria-label/title geben ihn auch
// für Screenreader und als Hover-Text aus (Review B5).
const AMPEL_LABEL = {
  gruen: 'Status grün',
  gelb: 'Status gelb',
  orange: 'Status orange',
  rot: 'Status rot',
  unbekannt: 'Status unbekannt',
}

export default function Ampel({ status, groesse }) {
  const groessenKlasse = groesse ? ` ${groesse}` : ''
  const stufe = status ?? 'unbekannt'
  const label = AMPEL_LABEL[stufe] ?? AMPEL_LABEL.unbekannt
  return <span className={`ampel${groessenKlasse} ${stufe}`} role="img" aria-label={label} title={label} />
}
