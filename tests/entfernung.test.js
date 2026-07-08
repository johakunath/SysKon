// SK-102: Demo-Distanzlogik (PLZ-Leitzonen, Haversine × Straßenfaktor)
// und Anfahrt-Ableitung in calc.js.

import { describe, it, expect } from 'vitest'
import { fahrstreckeKm, luftlinieKm, normalisierePlz, plzKoordinaten } from '../src/logic/entfernung.js'
import { INSTALLATIONSPARTNER, findeInstallationspartner } from '../src/data/partner.js'
import { anfahrtAbleitung } from '../src/logic/calc.js'
import { ANNAHMEN } from '../src/data/annahmen.js'

const partnerNord = findeInstallationspartner('partner_nord')

describe('SK-102: normalisierePlz', () => {
  it('akzeptiert Strings und Zahlen, ergänzt führende Null bei 4 Stellen', () => {
    expect(normalisierePlz('20095')).toBe('20095')
    expect(normalisierePlz(20095)).toBe('20095')
    expect(normalisierePlz(1067)).toBe('01067')
  })

  it('lehnt leere und unplausible Werte ab', () => {
    expect(normalisierePlz('')).toBeNull()
    expect(normalisierePlz(null)).toBeNull()
    expect(normalisierePlz('123')).toBeNull()
    expect(normalisierePlz('123456')).toBeNull()
  })
})

describe('SK-102: fahrstreckeKm', () => {
  it('ist deterministisch und plausibel (Hamburg → Kiel ≈ 90–140 km Demo)', () => {
    const km = fahrstreckeKm(partnerNord, '24103', ANNAHMEN.anfahrt_strassenfaktor)
    expect(km).toBe(fahrstreckeKm(partnerNord, '24103', ANNAHMEN.anfahrt_strassenfaktor))
    expect(km).toBeGreaterThan(80)
    expect(km).toBeLessThan(150)
  })

  it('nutzt die Mindestdistanz innerhalb derselben Leitzone', () => {
    const km = fahrstreckeKm(partnerNord, '20144', ANNAHMEN.anfahrt_strassenfaktor)
    expect(km).toBeGreaterThanOrEqual(10)
    expect(km).toBeLessThan(30)
  })

  it('liefert null bei fehlender PLZ oder fehlendem Partner', () => {
    expect(fahrstreckeKm(partnerNord, '', 1.3)).toBeNull()
    expect(fahrstreckeKm(null, '20095', 1.3)).toBeNull()
  })

  it('luftlinieKm: Hamburg → München ≈ 600 km', () => {
    const muenchen = findeInstallationspartner('partner_sued')
    const km = luftlinieKm({ lat: partnerNord.lat, lon: partnerNord.lon }, { lat: muenchen.lat, lon: muenchen.lon })
    expect(km).toBeGreaterThan(550)
    expect(km).toBeLessThan(650)
  })

  it('alle Partner-PLZ liegen in bekannten Leitzonen', () => {
    for (const p of INSTALLATIONSPARTNER) {
      expect(plzKoordinaten(p.plz), `PLZ ${p.plz} von ${p.id}`).not.toBeNull()
    }
  })
})

describe('SK-102: anfahrtAbleitung (calc.js)', () => {
  it('mit PLZ und Partner: Quelle plz_demo, km_gesamt = einfach × 2 × Fahrten', () => {
    const a = anfahrtAbleitung({ projekt_plz: 24103, installationspartner: 'partner_nord' }, ANNAHMEN)
    expect(a.anfahrt_quelle).toBe('plz_demo')
    expect(a.anfahrt_partner_label).toContain('Nord')
    expect(a.anfahrt_km_gesamt).toBe(Math.round(a.anfahrt_km_einfach * 2 * ANNAHMEN.anfahrt_fahrten))
  })

  it('ohne PLZ oder Partner greift die Fallback-Distanz', () => {
    const a = anfahrtAbleitung({}, ANNAHMEN)
    expect(a.anfahrt_quelle).toBe('fallback')
    expect(a.anfahrt_km_einfach).toBe(ANNAHMEN.anfahrt_fallback_km)
  })
})
