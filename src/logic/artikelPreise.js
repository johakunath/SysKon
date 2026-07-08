// Reine Artikel-Preislogik (kein React, SK-102): EK/VK-Kette wie in
// klassischen CPQ-Systemen. Listenpreis − Rabatt (Rabattgruppe des Lieferanten,
// sonst Generalrabatt) = Einkaufspreis (EK); EK × (1 + Aufschlag) = Verkaufs-
// preis (VK), der im LV erscheint. Alle Werte sind Demo-Annahmen.

import { LIEFERANTEN } from '../data/artikel.js'

export function findeArtikel(artikelnummer, artikel) {
  return artikel.find(a => a.artikelnummer === artikelnummer) ?? null
}

export function lieferantName(lieferantId) {
  return LIEFERANTEN.find(l => l.id === lieferantId)?.name ?? lieferantId
}

// Rabattsatz eines Artikels: individueller Gruppenrabatt des Lieferanten,
// sonst Generalrabatt; ohne Konditionen 0.
export function rabattFuer(artikel, rabattgruppen) {
  const konditionen = rabattgruppen?.[artikel.lieferant]
  if (!konditionen) return 0
  const gruppenRabatt = artikel.rabattgruppe != null ? konditionen.gruppen?.[artikel.rabattgruppe] : undefined
  const rabatt = gruppenRabatt ?? konditionen.generalrabatt ?? 0
  return Number.isFinite(rabatt) ? rabatt : 0
}

// Volle Kalkulation eines Artikels für LV/Admin-Anzeige.
// Liefert null bei unbekannter Artikelnummer (Engine erzeugt dann eine Warnung).
export function artikelKalkulation(artikelnummer, artikel, rabattgruppen, aufschlag = 0) {
  const a = findeArtikel(artikelnummer, artikel)
  if (!a || !Number.isFinite(a.listenpreis)) return null
  const rabatt = rabattFuer(a, rabattgruppen)
  const ek = a.listenpreis * (1 - rabatt)
  const vk = ek * (1 + (Number.isFinite(aufschlag) ? aufschlag : 0))
  return {
    artikelnummer: a.artikelnummer,
    lieferant: a.lieferant,
    lieferantName: lieferantName(a.lieferant),
    kurztext: a.kurztext,
    rabattgruppe: a.rabattgruppe,
    listenpreis: a.listenpreis,
    rabatt,
    ek,
    aufschlag,
    vk,
    preisstand: a.preisstand,
  }
}

const clone = (value) => JSON.parse(JSON.stringify(value))

// Simulierter DATANORM-Import (reine Funktion, testbar): wendet ein Update
// (Preisänderungen, neue Artikel, Konditionsänderungen) auf einen Artikel-/
// Rabattgruppen-Stand an und liefert den neuen Stand plus Import-Protokoll.
// Ein zweiter Lauf mit identischem Preisstand meldet „keine Änderungen".
export function wendeDatanormUpdateAn(basisArtikel, basisRabattgruppen, update) {
  const artikel = clone(basisArtikel)
  const rabattgruppen = clone(basisRabattgruppen)
  const log = { aktualisiert: [], neu: [], rabattgruppenGeaendert: [], preisstand: update.preisstand, quelle: update.quelle }

  for (const [nummer, listenpreis] of Object.entries(update.preisaenderungen ?? {})) {
    const a = artikel.find(x => x.artikelnummer === nummer)
    if (!a) continue
    if (a.listenpreis !== listenpreis || a.preisstand !== update.preisstand) {
      log.aktualisiert.push({ artikelnummer: nummer, alt: a.listenpreis, neu: listenpreis })
      a.listenpreis = listenpreis
      a.preisstand = update.preisstand
    }
  }

  for (const neu of update.neueArtikel ?? []) {
    if (artikel.some(x => x.artikelnummer === neu.artikelnummer)) continue
    artikel.push(clone(neu))
    log.neu.push({ artikelnummer: neu.artikelnummer, kurztext: neu.kurztext })
  }

  for (const [lieferantId, aenderung] of Object.entries(update.rabattgruppenAenderungen ?? {})) {
    const konditionen = (rabattgruppen[lieferantId] ??= { generalrabatt: 0, gruppen: {} })
    if (aenderung.generalrabatt != null && aenderung.generalrabatt !== konditionen.generalrabatt) {
      log.rabattgruppenGeaendert.push({ lieferant: lieferantId, gruppe: 'Generalrabatt', alt: konditionen.generalrabatt, neu: aenderung.generalrabatt })
      konditionen.generalrabatt = aenderung.generalrabatt
    }
    for (const [gruppe, satz] of Object.entries(aenderung.gruppen ?? {})) {
      if (konditionen.gruppen[gruppe] !== satz) {
        log.rabattgruppenGeaendert.push({ lieferant: lieferantId, gruppe, alt: konditionen.gruppen[gruppe] ?? null, neu: satz })
        konditionen.gruppen[gruppe] = satz
      }
    }
  }

  const unveraendert = log.aktualisiert.length === 0 && log.neu.length === 0 && log.rabattgruppenGeaendert.length === 0
  return { artikel, rabattgruppen, log, unveraendert }
}
