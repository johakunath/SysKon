import React from 'react'
import { kundenPreviewText } from '../screens/format.js'

// Einheitliche Liste für Annahmen, Ausschlüsse und offene Punkte. Bündelt die
// zuvor in Konfiguration und Ergebnis mehrfach gebauten Scope-Listen und wendet
// die kundensichere Wortwahl (kundenPreviewText) konsistent an.
//
// Einträge sind entweder Strings (Annahmen) oder { titel, text } (Ausschlüsse /
// offene Punkte). `strongTitel` rendert den Titel hervorgehoben (Ergebnis);
// ohne ihn wird „Titel: Text" als Fließtext gezeigt (kompakte Vorschau).
export default function ScopeListe({
  eintraege,
  preview = false,
  max,
  leer,
  listenklasse = 'kunden-liste',
  strongTitel = true,
}) {
  const sichtbar = max ? eintraege.slice(0, max) : eintraege
  if (sichtbar.length === 0) {
    return leer ? <p className="okbox">{leer}</p> : null
  }
  const t = preview ? kundenPreviewText : (x) => x
  return (
    <ul className={listenklasse}>
      {sichtbar.map((item, i) => {
        if (typeof item === 'string') return <li key={i}>{t(item)}</li>
        if (strongTitel) return <li key={i}><strong>{t(item.titel)}:</strong> {t(item.text)}</li>
        return <li key={i}>{t(`${item.titel}: ${item.text}`)}</li>
      })}
    </ul>
  )
}
