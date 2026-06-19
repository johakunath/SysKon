import { ANNAHMEN } from './annahmen.js'
import { SEKTIONEN, ALLE_FRAGEN } from './fragen.js'
import { KATALOG } from './katalog.js'

export const ADMIN_STORAGE_KEY = 'syskon_admin_config_v1'
export const ADMIN_CONFIG_VERSION = 1

const DEFAULT_SHORT_HINTS = {
  gebaeudetyp: 'Innenstadt oder Blockrand verschärft Schall- und Platzprüfung.',
  aussenflaeche_vorhanden: 'Ohne belastbare Außenfläche entsteht im MVP kein Standardfit.',
  verbrauchsquelle: 'Nur Abrechnung oder Messung macht den Verbrauch belastbar.',
  ww_bereitung: 'Zentrale Warmwasserbereitung zieht Speicher-/WW-Scope nach sich.',
  heizlast_bekannt: 'Ohne Heizlast bleibt die Leistung nur eine Richtindikation.',
  technologiepfad: 'Nur Hybrid ist im MVP standardfähig; andere Pfade sind Sonderfall.',
  kessel_zustand: 'Schlecht oder unbekannt heißt: Restlaufzeit und Einbindung klären.',
  kessel_nutzbar: 'Hybrid setzt einen weiter nutzbaren Kessel voraus.',
  anzahl_heizkreise: 'Mehr als zwei Heizkreise ist im MVP ein Sonderfall.',
  vorlauftemp_klasse: 'Über 65 °C braucht der Standard-Hybrid fachliche Prüfung.',
  heizraum_groesse_ok: 'Zu wenig Raum verschiebt den Fokus auf Außenaufstellung oder Container.',
  zugang_ok: 'Enge Türen oder Treppen können Speicher und Hydraulik praktisch blockieren.',
  aussenflaeche_m2: 'Fluchtwege, Grenzen und Stellplätze zählen nicht als frei nutzbare Fläche.',
  aussenflaeche_typ: 'Dach, Garage oder Garten nicht als Standardfläche zusagen.',
  aussenflaeche_laenge_m: 'Entscheidend ist ein zusammenhängendes Rechteck, nicht nur die m².',
  aussenflaeche_breite_m: 'Wartungs- und Fluchtwege dürfen die nutzbare Breite nicht aufzehren.',
  zugang_logistik: 'Schwierige Zufahrt oder fehlender Kran spricht gegen Container.',
  platz_prioritaet: 'Priorität erklärt die Empfehlung, darf Blocker aber nicht überstimmen.',
  aufstellvariante: 'Auswahl bleibt Vergleichspunkt; gesperrte Varianten nicht als Empfehlung verkaufen.',
  schallhaube: 'Hilft nur bei Fundament und ersetzt keine Schallprüfung.',
  kran_zugang: 'Container sind nur mit belastbarer Anlieferung und Kranstellung plausibel.',
  abstand_fenster: 'Kleine Abstände dominieren die Schallrisiko-Einschätzung.',
  gebietstyp: 'Demo-Grenzwert, keine rechtsverbindliche Schallbewertung.',
  netzanschluss_bekannt: 'Unbekannte Anschlussleistung bleibt Elektro-Klärpunkt.',
  foerderung_annahme: 'Nur Demo-Annahme, keine Förderberatung oder Zusage.',
  service_variante: 'Service ist laufender Betrieb, nicht Teil des einmaligen LV.',
}

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
        hinweisKurz: DEFAULT_SHORT_HINTS[frage.id] ?? frage.hinweisKurz ?? '',
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

export function makeDefaultAdminConfig() {
  return {
    version: ADMIN_CONFIG_VERSION,
    updatedAt: null,
    annahmen: clone(ANNAHMEN),
    fragen: extractFragenConfig(),
    katalog: extractKatalogConfig(),
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

  return {
    annahmen: clone(safe.annahmen),
    sektionen,
    alleFragen: sektionen.flatMap(s => s.fragen.map(f => ({ ...f, sektion: s.id }))),
    katalog,
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
    governance: { ...defaults.governance, ...(incoming.governance ?? {}) },
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
