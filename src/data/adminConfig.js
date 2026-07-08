import { ANNAHMEN } from './annahmen.js'
import { SEKTIONEN, ALLE_FRAGEN } from './fragen.js'
import { KATALOG } from './katalog.js'
import { ARTIKEL, RABATTGRUPPEN, DATANORM_UPDATE_DEMO } from './artikel.js'
import { wendeDatanormUpdateAn } from '../logic/artikelPreise.js'

export const ADMIN_STORAGE_KEY = 'syskon_admin_config_v1'
export const ADMIN_CONFIG_VERSION = 1


const GOVERNANCE_DEFAULTS = {
  versionLabel: 'Demo-Konfiguration v0.1',
  datenquelleStandard: 'Code-Default / lokale Admin-Überschreibung',
  confidenceStandard: 'Demo',
  kundensicht: 'Nur freigegebene Scope-, Annahmen- und offene-Punkte-Texte anzeigen.',
  internsicht: 'Kosten, Regeln, CAPEX/OPEX und technische Prüflogik bleiben intern.',
  notizen: 'Lokale Demo-Konfiguration ohne Backend, Rechtekonzept oder Freigabeprozess.',
}

const clone = (value) => JSON.parse(JSON.stringify(value))

function collectFields(bedingung, fields = []) {
  if (!bedingung) return fields
  if (bedingung.feld) fields.push(bedingung.feld)
  for (const child of bedingung.und ?? []) collectFields(child, fields)
  for (const child of bedingung.oder ?? []) collectFields(child, fields)
  return fields
}

function positionConfig(pos) {
  return {
    text: pos.text ?? '',
    begruendung: pos.begruendung ?? '',
    kunde: {
      titel: pos.kunde?.titel ?? pos.text ?? '',
      hersteller: pos.kunde?.hersteller ?? 'herstellerneutral',
      produkt: pos.kunde?.produkt ?? 'Produkt wird später festgelegt',
      leistungsklasse: pos.kunde?.leistungsklasse ?? '',
      leistungsumfang: pos.kunde?.leistungsumfang ?? '',
    },
  }
}

function extractKatalogConfig(katalog = KATALOG) {
  return Object.fromEntries(katalog.map(paket => {
    const config = {
      pakettyp: paket.pakettyp,
      gruppe: paket.gruppe,
      positionen: {},
      varianten: {},
    }
    for (const pos of paket.positionen ?? []) config.positionen[pos.id] = positionConfig(pos)
    for (const variante of paket.varianten ?? []) {
      config.varianten[variante.wert] = {
        name: variante.name,
        positionen: Object.fromEntries((variante.positionen ?? []).map(pos => [pos.id, positionConfig(pos)])),
      }
    }
    return [paket.id, config]
  }))
}

function extractFragenConfig(sektionen = SEKTIONEN) {
  const entries = []
  for (const sektion of sektionen) {
    for (const frage of sektion.fragen) {
      entries.push([frage.id, {
        label: frage.label,
        tooltip: frage.tooltip ?? '',
        hinweisKurz: frage.hinweisKurz ?? '',
        playbook: {
          warum: frage.playbook?.warum ?? '',
          warnsignale: frage.playbook?.warnsignale ?? '',
          einordnung: frage.playbook?.einordnung ?? '',
        },
        optionen: Object.fromEntries((frage.optionen ?? []).map(option => [option.wert, {
          label: option.label,
          hinweis: option.hinweis ?? '',
        }])),
      }])
    }
  }
  return Object.fromEntries(entries)
}

// SK-102: Artikelstamm-Overrides (Kurz-/Langtext, Listenpreis, Rabattgruppe)
// je Artikelnummer; Struktur analog zu fragen/katalog.
function extractArtikelConfig(artikel = ARTIKEL) {
  return Object.fromEntries(artikel.map(a => [a.artikelnummer, {
    kurztext: a.kurztext,
    langtext: a.langtext ?? '',
    listenpreis: a.listenpreis,
    rabattgruppe: a.rabattgruppe ?? null,
    preisstand: a.preisstand ?? null,
  }]))
}

export function makeDefaultAdminConfig() {
  return {
    version: ADMIN_CONFIG_VERSION,
    updatedAt: null,
    annahmen: clone(ANNAHMEN),
    fragen: extractFragenConfig(),
    katalog: extractKatalogConfig(),
    artikel: extractArtikelConfig(),
    // Über den simulierten DATANORM-Import neu angelegte Artikel (vollständige
    // Artikelobjekte, damit der Import-Stand lokal persistiert).
    artikelNeu: [],
    rabattgruppen: clone(RABATTGRUPPEN),
    datanorm: { preisstand: '2026-01-15', letzterImport: null, log: [] },
    governance: { ...GOVERNANCE_DEFAULTS },
  }
}

export function applyAdminConfig(config = makeDefaultAdminConfig()) {
  const safe = mergeWithDefaults(config)
  const sektionen = SEKTIONEN.map(sektion => ({
    ...sektion,
    fragen: sektion.fragen.map(frage => {
      const edit = safe.fragen[frage.id] ?? {}
      return {
        ...frage,
        label: edit.label ?? frage.label,
        tooltip: edit.tooltip ?? frage.tooltip,
        hinweisKurz: edit.hinweisKurz ?? '',
        playbook: { ...frage.playbook, ...(edit.playbook ?? {}) },
        optionen: frage.optionen?.map(option => ({
          ...option,
          label: edit.optionen?.[option.wert]?.label ?? option.label,
          hinweis: edit.optionen?.[option.wert]?.hinweis ?? option.hinweis,
        })),
      }
    }),
  }))

  const katalog = KATALOG.map(paket => {
    const edit = safe.katalog[paket.id] ?? {}
    const applyPosition = (pos) => {
      const posEdit = edit.positionen?.[pos.id]
      return {
        ...pos,
        text: posEdit?.text ?? pos.text,
        begruendung: posEdit?.begruendung ?? pos.begruendung,
        kunde: { ...(pos.kunde ?? {}), ...(posEdit?.kunde ?? {}) },
      }
    }
    const applyVariantPosition = (variante, pos) => {
      const posEdit = edit.varianten?.[variante.wert]?.positionen?.[pos.id]
      return {
        ...pos,
        text: posEdit?.text ?? pos.text,
        begruendung: posEdit?.begruendung ?? pos.begruendung,
        kunde: { ...(pos.kunde ?? {}), ...(posEdit?.kunde ?? {}) },
      }
    }
    return {
      ...paket,
      pakettyp: edit.pakettyp ?? paket.pakettyp,
      gruppe: edit.gruppe ?? paket.gruppe,
      positionen: paket.positionen?.map(applyPosition),
      varianten: paket.varianten?.map(variante => ({
        ...variante,
        name: edit.varianten?.[variante.wert]?.name ?? variante.name,
        positionen: variante.positionen?.map(pos => applyVariantPosition(variante, pos)),
      })),
    }
  })

  // SK-102: effektiver Artikelstamm = Code-Defaults + lokale Overrides
  // + per Demo-Import neu angelegte Artikel.
  const bekannt = new Set(ARTIKEL.map(a => a.artikelnummer))
  const artikel = [
    ...ARTIKEL,
    ...(safe.artikelNeu ?? []).filter(a => a?.artikelnummer && !bekannt.has(a.artikelnummer)),
  ].map(a => {
    const edit = safe.artikel[a.artikelnummer]
    return edit
      ? { ...a, kurztext: edit.kurztext ?? a.kurztext, langtext: edit.langtext ?? a.langtext,
          listenpreis: edit.listenpreis ?? a.listenpreis, rabattgruppe: edit.rabattgruppe ?? a.rabattgruppe,
          preisstand: edit.preisstand ?? a.preisstand }
      : { ...a }
  })

  return {
    annahmen: clone(safe.annahmen),
    sektionen,
    alleFragen: sektionen.flatMap(s => s.fragen.map(f => ({ ...f, sektion: s.id }))),
    katalog,
    artikel,
    rabattgruppen: clone(safe.rabattgruppen),
    datanorm: clone(safe.datanorm),
    governance: { ...safe.governance },
  }
}

export function mergeWithDefaults(config) {
  const defaults = makeDefaultAdminConfig()
  const incoming = config && typeof config === 'object' ? config : {}
  const merged = {
    ...defaults,
    ...incoming,
    annahmen: { ...defaults.annahmen, ...(incoming.annahmen ?? {}) },
    fragen: { ...defaults.fragen },
    katalog: { ...defaults.katalog },
    artikel: { ...defaults.artikel },
    artikelNeu: Array.isArray(incoming.artikelNeu) ? clone(incoming.artikelNeu) : [],
    rabattgruppen: { ...defaults.rabattgruppen },
    datanorm: { ...defaults.datanorm, ...(incoming.datanorm ?? {}) },
    governance: { ...defaults.governance, ...(incoming.governance ?? {}) },
  }

  for (const [nummer, artikelEdit] of Object.entries(incoming.artikel ?? {})) {
    merged.artikel[nummer] = { ...(defaults.artikel[nummer] ?? {}), ...artikelEdit }
  }
  for (const [lieferantId, konditionen] of Object.entries(incoming.rabattgruppen ?? {})) {
    merged.rabattgruppen[lieferantId] = {
      ...(defaults.rabattgruppen[lieferantId] ?? { generalrabatt: 0, gruppen: {} }),
      ...konditionen,
      gruppen: { ...(defaults.rabattgruppen[lieferantId]?.gruppen ?? {}), ...(konditionen.gruppen ?? {}) },
    }
  }

  for (const [id, frage] of Object.entries(incoming.fragen ?? {})) {
    merged.fragen[id] = {
      ...(defaults.fragen[id] ?? {}),
      ...frage,
      playbook: { ...(defaults.fragen[id]?.playbook ?? {}), ...(frage.playbook ?? {}) },
      optionen: { ...(defaults.fragen[id]?.optionen ?? {}), ...(frage.optionen ?? {}) },
    }
  }
  for (const [id, paket] of Object.entries(incoming.katalog ?? {})) {
    merged.katalog[id] = {
      ...(defaults.katalog[id] ?? {}),
      ...paket,
      positionen: { ...(defaults.katalog[id]?.positionen ?? {}), ...(paket.positionen ?? {}) },
      varianten: { ...(defaults.katalog[id]?.varianten ?? {}), ...(paket.varianten ?? {}) },
    }
  }
  return merged
}

export function validateAdminConfig(config) {
  const errors = []
  const incoming = config && typeof config === 'object' ? config : {}
  const merged = mergeWithDefaults(config)
  const defaultQuestionIds = new Set(ALLE_FRAGEN.map(f => f.id))

  if (incoming.fragen) {
    for (const frage of ALLE_FRAGEN) {
      if (!incoming.fragen[frage.id]) errors.push(`Frage "${frage.id}" fehlt.`)
      for (const option of frage.optionen ?? []) {
        if (incoming.fragen[frage.id] && !incoming.fragen[frage.id].optionen?.[option.wert]) {
          errors.push(`Option "${frage.id}.${option.wert}" fehlt.`)
        }
      }
    }
  }

  for (const key of Object.keys(ANNAHMEN)) {
    if (typeof merged.annahmen[key] !== 'number' || !Number.isFinite(merged.annahmen[key])) {
      errors.push(`Annahme "${key}" muss eine Zahl sein.`)
    }
  }

  for (const frage of ALLE_FRAGEN) {
    const edit = merged.fragen[frage.id]
    if (!edit) errors.push(`Frage "${frage.id}" fehlt.`)
    if (typeof edit?.label !== 'string' || !edit.label.trim().endsWith('?')) errors.push(`Frage "${frage.id}" braucht ein Frage-Label.`)
    for (const field of ['warum', 'warnsignale', 'einordnung']) {
      if (typeof edit?.playbook?.[field] !== 'string') errors.push(`Frage "${frage.id}" braucht playbook.${field}.`)
    }
    for (const option of frage.optionen ?? []) {
      const opt = edit?.optionen?.[option.wert]
      if (!opt) errors.push(`Option "${frage.id}.${option.wert}" fehlt.`)
      if (typeof opt?.label !== 'string') errors.push(`Option "${frage.id}.${option.wert}" braucht ein Label.`)
      if (typeof opt?.hinweis !== 'string') errors.push(`Option "${frage.id}.${option.wert}" braucht einen Hinweis.`)
    }
    for (const field of collectFields(frage.sichtbar)) {
      if (!defaultQuestionIds.has(field)) errors.push(`Sichtbarkeit "${frage.id}" referenziert unbekanntes Feld "${field}".`)
    }
  }

  // SK-102: Artikelstamm und Rabattgruppen validieren.
  for (const [nummer, artikelEdit] of Object.entries(merged.artikel ?? {})) {
    if (typeof artikelEdit?.listenpreis !== 'number' || !Number.isFinite(artikelEdit.listenpreis) || artikelEdit.listenpreis < 0) {
      errors.push(`Artikel "${nummer}" braucht einen Listenpreis ≥ 0.`)
    }
    if (typeof artikelEdit?.kurztext !== 'string' || !artikelEdit.kurztext.trim()) {
      errors.push(`Artikel "${nummer}" braucht einen Kurztext.`)
    }
  }
  const rabattOk = (satz) => typeof satz === 'number' && Number.isFinite(satz) && satz >= 0 && satz <= 1
  for (const [lieferantId, konditionen] of Object.entries(merged.rabattgruppen ?? {})) {
    if (!rabattOk(konditionen?.generalrabatt)) errors.push(`Rabattgruppen "${lieferantId}": Generalrabatt muss zwischen 0 und 1 liegen.`)
    for (const [gruppe, satz] of Object.entries(konditionen?.gruppen ?? {})) {
      if (!rabattOk(satz)) errors.push(`Rabattgruppe "${lieferantId}.${gruppe}" muss zwischen 0 und 1 liegen.`)
    }
  }

  const positionIds = new Set()
  for (const paket of KATALOG) {
    const edit = merged.katalog[paket.id]
    if (!edit) errors.push(`Katalogpaket "${paket.id}" fehlt.`)
    const checkPos = (pos, posEdit) => {
      if (positionIds.has(pos.id)) errors.push(`Katalogposition "${pos.id}" ist nicht eindeutig.`)
      positionIds.add(pos.id)
      if (!posEdit) errors.push(`Katalogposition "${pos.id}" fehlt.`)
      for (const field of ['titel', 'hersteller', 'produkt', 'leistungsumfang']) {
        if (typeof posEdit?.kunde?.[field] !== 'string' || !posEdit.kunde[field].trim()) {
          errors.push(`Kundendaten "${pos.id}.${field}" müssen gefüllt sein.`)
        }
      }
    }
    for (const pos of paket.positionen ?? []) checkPos(pos, edit?.positionen?.[pos.id])
    for (const variante of paket.varianten ?? []) {
      if (!edit?.varianten?.[variante.wert]) errors.push(`Katalogvariante "${paket.id}.${variante.wert}" fehlt.`)
      for (const pos of variante.positionen ?? []) checkPos(pos, edit?.varianten?.[variante.wert]?.positionen?.[pos.id])
    }
  }

  return errors
}

// SK-102: simulierter DATANORM-Import auf eine Admin-Konfiguration anwenden.
// Kein echter Parser – die „Datei" ist DATANORM_UPDATE_DEMO. Preise werden
// überschrieben, neue Artikel ergänzt, Konditionen aktualisiert und der Lauf
// im Import-Log protokolliert (idempotent: zweiter Lauf meldet keine Änderungen).
export function applyDatanormDemoImport(config, update = DATANORM_UPDATE_DEMO, dateiname = null) {
  const safe = mergeWithDefaults(config)
  const effective = applyAdminConfig(safe)
  const ergebnis = wendeDatanormUpdateAn(effective.artikel, effective.rabattgruppen, update)

  const next = clone(safe)
  for (const eintrag of ergebnis.log.aktualisiert) {
    const edit = (next.artikel[eintrag.artikelnummer] ??= {})
    edit.listenpreis = eintrag.neu
    edit.preisstand = update.preisstand
  }
  for (const neu of update.neueArtikel ?? []) {
    if (!ergebnis.log.neu.some(n => n.artikelnummer === neu.artikelnummer)) continue
    next.artikelNeu = [...(next.artikelNeu ?? []), clone(neu)]
    next.artikel[neu.artikelnummer] = {
      kurztext: neu.kurztext, langtext: neu.langtext ?? '', listenpreis: neu.listenpreis,
      rabattgruppe: neu.rabattgruppe ?? null, preisstand: neu.preisstand ?? update.preisstand,
    }
  }
  next.rabattgruppen = ergebnis.rabattgruppen
  next.datanorm = {
    preisstand: ergebnis.unveraendert ? safe.datanorm.preisstand : update.preisstand,
    letzterImport: new Date().toISOString(),
    log: [
      { zeitpunkt: new Date().toISOString(), dateiname: dateiname ?? update.quelle,
        aktualisiert: ergebnis.log.aktualisiert.length, neu: ergebnis.log.neu.length,
        rabattgruppenGeaendert: ergebnis.log.rabattgruppenGeaendert.length,
        unveraendert: ergebnis.unveraendert },
      ...(safe.datanorm.log ?? []).slice(0, 9),
    ],
  }
  return { config: next, log: ergebnis.log, unveraendert: ergebnis.unveraendert }
}

export function loadAdminConfig() {
  if (typeof window === 'undefined' || !window.localStorage) return makeDefaultAdminConfig()
  try {
    const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY)
    if (!raw) return makeDefaultAdminConfig()
    const parsed = JSON.parse(raw)
    const merged = mergeWithDefaults(parsed)
    return validateAdminConfig(merged).length ? makeDefaultAdminConfig() : merged
  } catch {
    return makeDefaultAdminConfig()
  }
}

export function saveAdminConfig(config) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(config))
}

export function touchAdminConfig(config) {
  return { ...mergeWithDefaults(config), updatedAt: new Date().toISOString() }
}
