const KEY = 'syskon_angebote_v1'

export function loadAngebote() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAngebote(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // localStorage full or unavailable
  }
}

export function neueAngebotId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
