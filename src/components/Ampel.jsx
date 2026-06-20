import React from 'react'

// Status-Ampel als wiederverwendbares Element. Ersetzt die zuvor in fünf
// Screens handgeschriebenen `ampel <groesse> <status>`-Spans.
export default function Ampel({ status, groesse }) {
  const groessenKlasse = groesse ? ` ${groesse}` : ''
  return <span className={`ampel${groessenKlasse} ${status ?? 'unbekannt'}`} />
}
