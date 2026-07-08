// Reine Demo-Distanzlogik (kein React, SK-102). Ersatz für eine echte
// Google-Maps-Distance-Matrix-Anfrage: deterministische Fahrstrecken-Schätzung
// aus PLZ-Leitzonen-Zentroiden (Luftlinie × Straßenfaktor). Bewusst offline,
// ohne API-Key und ohne neue Abhängigkeit – zeigt nur, WIE eine CPQ-Anfahrts-
// kalkulation auf Basis der Fahrstrecke Partner → Projektadresse aussieht.

// Zentroide der zweistelligen PLZ-Leitzonen (grobe Demo-Näherung, kein Geodatensatz).
const PLZ_ZONEN = {
  '01': [51.05, 13.74], '02': [51.15, 14.97], '03': [51.76, 14.33], '04': [51.34, 12.37],
  '06': [51.48, 11.97], '07': [50.88, 11.59], '08': [50.72, 12.49], '09': [50.83, 12.92],
  '10': [52.52, 13.40], '12': [52.44, 13.45], '13': [52.57, 13.35], '14': [52.40, 13.06],
  '15': [52.35, 14.06], '16': [52.83, 13.49], '17': [53.56, 13.26], '18': [54.09, 12.14],
  '19': [53.63, 11.41],
  '20': [53.55, 10.00], '21': [53.46, 10.02], '22': [53.60, 9.93], '23': [53.87, 10.69],
  '24': [54.32, 10.14], '25': [53.92, 9.24], '26': [53.30, 8.05], '27': [53.30, 8.91],
  '28': [53.08, 8.80], '29': [52.86, 10.35],
  '30': [52.37, 9.73], '31': [52.15, 9.79], '32': [52.12, 8.75], '33': [51.94, 8.70],
  '34': [51.31, 9.49], '35': [50.62, 8.72], '36': [50.55, 9.68], '37': [51.53, 9.93],
  '38': [52.26, 10.52], '39': [52.13, 11.62],
  '40': [51.22, 6.77], '41': [51.19, 6.44], '42': [51.26, 7.15], '44': [51.51, 7.47],
  '45': [51.45, 7.01], '46': [51.53, 6.79], '47': [51.43, 6.76], '48': [51.96, 7.63],
  '49': [52.27, 8.05],
  '50': [50.94, 6.96], '51': [51.02, 7.20], '52': [50.78, 6.08], '53': [50.73, 7.10],
  '54': [49.75, 6.64], '55': [49.99, 8.05], '56': [50.36, 7.59], '57': [50.87, 8.02],
  '58': [51.36, 7.47], '59': [51.68, 7.82],
  '60': [50.11, 8.68], '61': [50.23, 8.62], '63': [49.98, 9.10], '64': [49.87, 8.65],
  '65': [50.08, 8.24], '66': [49.24, 7.00], '67': [49.44, 7.90], '68': [49.49, 8.47],
  '69': [49.40, 8.69],
  '70': [48.78, 9.18], '71': [48.90, 9.19], '72': [48.49, 9.05], '73': [48.70, 9.65],
  '74': [49.14, 9.22], '75': [48.89, 8.70], '76': [49.01, 8.40], '77': [48.47, 7.94],
  '78': [47.93, 8.51], '79': [47.99, 7.85],
  '80': [48.14, 11.57], '81': [48.11, 11.53], '82': [47.93, 11.30], '83': [47.86, 12.13],
  '84': [48.54, 12.15], '85': [48.55, 11.55], '86': [48.37, 10.90], '87': [47.73, 10.31],
  '88': [47.78, 9.61], '89': [48.40, 9.99],
  '90': [49.45, 11.08], '91': [49.47, 10.99], '92': [49.44, 11.86], '93': [49.01, 12.10],
  '94': [48.57, 13.43], '95': [50.20, 11.80], '96': [49.98, 10.90], '97': [49.79, 9.95],
  '98': [50.61, 10.69], '99': [50.98, 11.03],
}

// PLZ normalisieren: Zahleneingabe (führende Null geht im Zahlenfeld verloren)
// oder String; vierstellige Werte werden als PLZ mit führender Null gelesen.
export function normalisierePlz(plz) {
  if (plz == null || plz === '') return null
  const s = String(plz).trim().replace(/\D/g, '')
  if (s.length === 4) return '0' + s
  if (s.length !== 5) return null
  return s
}

export function plzKoordinaten(plz) {
  const norm = normalisierePlz(plz)
  if (!norm) return null
  const zone = PLZ_ZONEN[norm.slice(0, 2)]
  return zone ? { lat: zone[0], lon: zone[1] } : null
}

const RAD = Math.PI / 180
const ERDRADIUS_KM = 6371

export function luftlinieKm(a, b) {
  const dLat = (b.lat - a.lat) * RAD
  const dLon = (b.lon - a.lon) * RAD
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLon / 2) ** 2
  return 2 * ERDRADIUS_KM * Math.asin(Math.sqrt(h))
}

// Fahrstrecke (einfach) zwischen Partner-Standort und Projekt-PLZ.
// strassenfaktor rechnet Luftlinie in eine plausible Straßenstrecke um (Demo).
// Liefert null, wenn PLZ oder Partnerkoordinaten fehlen (Engine nutzt Fallback).
export function fahrstreckeKm(partner, projektPlz, strassenfaktor = 1.3) {
  if (!partner || partner.lat == null || partner.lon == null) return null
  const ziel = plzKoordinaten(projektPlz)
  if (!ziel) return null
  const km = luftlinieKm({ lat: partner.lat, lon: partner.lon }, ziel) * strassenfaktor
  // Mindestdistanz: auch innerhalb derselben Leitzone fährt der Monteur (Demo: 10 km).
  return Math.max(10, Math.round(km))
}
