// Komponentenauswahl-Logik (SK-103, Phase 1). React-frei.
// Wählt die günstigste geeignete Komponente je Typ aus KOMPONENTEN;
// manuelle Overrides über eingaben.komponente_<typ> werden berücksichtigt.

import { artikelKalkulation } from './artikelPreise.js'

export function komponenteGeeignet(komp, ctx) {
  const { eignung } = komp
  if (eignung.heizlast_min_kw != null && ctx.heizlast_effektiv != null && ctx.heizlast_effektiv < eignung.heizlast_min_kw) return false
  if (eignung.heizlast_max_kw != null && ctx.heizlast_effektiv != null && ctx.heizlast_effektiv > eignung.heizlast_max_kw) return false
  // ctx.technologiepfad ist in engine.js auf derived.technologiepfad_effektiv gesetzt
  if (eignung.technologiepfade && !eignung.technologiepfade.includes(ctx.technologiepfad)) return false
  if (eignung.aufstellvarianten && ctx.aufstellvariante && !eignung.aufstellvarianten.includes(ctx.aufstellvariante)) return false
  if (eignung.ww_speicher_typ != null && eignung.ww_speicher_typ !== (ctx.ww_speicher_typ ?? 'speicher')) return false
  return true
}

export function komponentenAuswahl({ typ, komponenten, ctx, override, artikel, rabattgruppen, aufschlag }) {
  const geeignet = komponenten
    .filter(k => k.typ === typ && komponenteGeeignet(k, ctx))
    .map(k => {
      const kalk = artikelKalkulation(k.artikelnummer, artikel, rabattgruppen, aufschlag)
      return { ...k, vk: kalk?.vk ?? 0 }
    })
    .sort((a, b) => a.vk - b.vk)

  if (geeignet.length === 0) return null

  const guenstigste = geeignet[0]
  const kandidaten = geeignet.map(k => ({
    id: k.id, titel: k.titel, hersteller: k.hersteller, modell: k.modell,
    technik: k.technik, vk: k.vk, delta_vk: k.vk - guenstigste.vk,
  }))

  let gewaehlt = guenstigste
  let ueberschrieben = false
  let ungueltigeWahl = false

  if (override && override !== 'auto') {
    const gefunden = geeignet.find(k => k.id === override)
    if (gefunden) { gewaehlt = gefunden; ueberschrieben = true }
    else ungueltigeWahl = true
  }

  return { gewaehlt, ueberschrieben, ungueltigeWahl, kandidaten }
}
