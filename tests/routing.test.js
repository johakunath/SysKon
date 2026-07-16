// SK-105: Routing-Layer Standard / Bedingt / Sonderfall.
// Unit-Tests für die Ableitung + Integration gegen echte Presets.

import { describe, it, expect } from 'vitest'
import { berechne, STATUS_ORDER } from '../src/logic/engine.js'
import {
  routingErgebnis, ROUTING_KLASSEN, ROUTING_KLASSE_JE_STATUS, GRUND_KATEGORIEN,
} from '../src/logic/routing.js'
import { REGELN } from '../src/data/regeln.js'
import { PRESETS } from '../src/data/presets.js'

const preset = (id) => PRESETS.find(p => p.id === id).eingaben
const referenz = preset('referenz')

// Sammelt alle Status-Werte, die eine Regel setzen kann ('@feld' bleibt dynamisch).
function statusWerte(regel) {
  const wirkungen = Array.isArray(regel.dann) ? regel.dann : [regel.dann]
  return wirkungen.filter(w => w.typ === 'status').map(w => w.wert)
}

describe('Regelsatz-Invariante: routingGrund', () => {
  it('jede Regel, die schlechter als gruen setzt, hat einen gültigen routingGrund', () => {
    for (const regel of REGELN) {
      const werte = statusWerte(regel)
      if (!werte.length) continue
      // Regeln, die ausschließlich 'gruen' setzen, brauchen keinen Grund.
      if (werte.every(w => w === 'gruen')) continue
      expect(GRUND_KATEGORIEN, `${regel.id} braucht einen routingGrund`)
        .toContain(regel.routingGrund)
    }
  })

  it('Regeln ohne Status-Wirkung tragen keinen routingGrund', () => {
    for (const regel of REGELN) {
      if (statusWerte(regel).length) continue
      expect(regel.routingGrund, `${regel.id} setzt keinen Status`).toBeUndefined()
    }
  })

  it('jeder Status hat genau eine Routing-Klasse', () => {
    for (const status of STATUS_ORDER) {
      expect(ROUTING_KLASSEN).toContain(ROUTING_KLASSE_JE_STATUS[status])
    }
  })
})

describe('routingErgebnis', () => {
  it('gruen wird Standard, ohne Grundkategorie', () => {
    const r = routingErgebnis({
      status: 'gruen',
      quellen: [{ regelId: 'R11', wert: 'gruen', routingGrund: null, begruendung: 'x' }],
    })
    expect(r.klasse).toBe('standard')
    expect(r.grundKategorie).toBeNull()
  })

  it('rot wird Sonderfall', () => {
    const r = routingErgebnis({
      status: 'rot',
      quellen: [{ regelId: 'R17', wert: 'rot', routingGrund: 'produktgrenze', begruendung: 'x' }],
    })
    expect(r.klasse).toBe('sonderfall')
    expect(r.grundKategorie).toBe('produktgrenze')
  })

  it('gelb und orange werden beide Bedingt', () => {
    for (const status of ['gelb', 'orange']) {
      expect(routingErgebnis({ status, quellen: [] }).klasse).toBe('bedingt')
    }
  })

  // Kernpunkt von SK-105: der Status allein trennt diese beiden Fälle nicht.
  it('trennt Bedingt-wegen-Daten von Bedingt-wegen-Fachprüfung', () => {
    const daten = routingErgebnis({
      status: 'gelb',
      quellen: [{ regelId: 'R10', wert: 'gelb', routingGrund: 'daten', begruendung: 'x' }],
    })
    const fach = routingErgebnis({
      status: 'orange',
      quellen: [{ regelId: 'R06', wert: 'orange', routingGrund: 'fachpruefung', begruendung: 'x' }],
    })
    expect(daten.klasse).toBe(fach.klasse)
    expect(daten.grundKategorie).toBe('daten')
    expect(fach.grundKategorie).toBe('fachpruefung')
    expect(daten.naechsteAktion).not.toBe(fach.naechsteAktion)
  })

  it('nur Quellen auf der finalen Statusstufe begründen die Einordnung', () => {
    const r = routingErgebnis({
      status: 'orange',
      quellen: [
        { regelId: 'R10', wert: 'gelb', routingGrund: 'daten', begruendung: 'schwächer' },
        { regelId: 'R06', wert: 'orange', routingGrund: 'fachpruefung', begruendung: 'entscheidend' },
      ],
    })
    expect(r.gruende.map(g => g.regelId)).toEqual(['R06'])
    expect(r.grundKategorie).toBe('fachpruefung')
  })

  it('bei mehreren Gründen gewinnt die stärkste Kategorie', () => {
    const r = routingErgebnis({
      status: 'rot',
      quellen: [
        { regelId: 'A', wert: 'rot', routingGrund: 'daten', begruendung: 'x' },
        { regelId: 'B', wert: 'rot', routingGrund: 'produktgrenze', begruendung: 'y' },
      ],
    })
    expect(r.grundKategorie).toBe('produktgrenze')
  })

  it('offeneDaten sind nach DQ-Gewicht sortiert und auf 5 begrenzt', () => {
    const fehlendeDaten = Array.from({ length: 8 }, (_, i) => ({ id: `f${i}`, dq: i }))
    const r = routingErgebnis({ status: 'gelb', quellen: [], fehlendeDaten })
    expect(r.offeneDaten).toHaveLength(5)
    expect(r.offeneDaten[0].dq).toBe(7)
  })

  it('mutiert die übergebenen fehlendeDaten nicht', () => {
    const fehlendeDaten = [{ id: 'a', dq: 1 }, { id: 'b', dq: 9 }]
    routingErgebnis({ status: 'gelb', quellen: [], fehlendeDaten })
    expect(fehlendeDaten.map(f => f.id)).toEqual(['a', 'b'])
  })
})

describe('Routing in berechne()', () => {
  it('jedes Preset liefert eine gültige Routing-Klasse passend zum Status', () => {
    for (const p of PRESETS) {
      const erg = berechne(p.eingaben)
      expect(ROUTING_KLASSEN, p.id).toContain(erg.routing.klasse)
      expect(erg.routing.klasse, p.id).toBe(ROUTING_KLASSE_JE_STATUS[erg.status])
      expect(erg.routing.naechsteAktion, p.id).toBeTruthy()
    }
  })

  it('jede Nicht-Standard-Einordnung ist auf mindestens eine Regel zurückführbar', () => {
    for (const p of PRESETS) {
      const erg = berechne(p.eingaben)
      if (erg.routing.klasse === 'standard') continue
      expect(erg.routing.gruende.length, p.id).toBeGreaterThan(0)
      expect(erg.routing.grundKategorie, p.id).not.toBeNull()
    }
  })

  it('Referenzfall ist Bedingt wegen fehlender Daten (Heizlast-Proxy, R14)', () => {
    const erg = berechne(referenz)
    expect(erg.routing.klasse).toBe('bedingt')
    expect(erg.routing.grundKategorie).toBe('daten')
    expect(erg.routing.gruende.some(g => g.regelId === 'R14')).toBe(true)
  })

  it('Mehr-Gebäude-Fall ist Sonderfall wegen Produktgrenze (R19)', () => {
    const erg = berechne({ ...referenz, anzahl_gebaeude: 2 })
    expect(erg.routing.klasse).toBe('sonderfall')
    expect(erg.routing.grundKategorie).toBe('produktgrenze')
    expect(erg.routing.gruende.some(g => g.regelId === 'R19')).toBe(true)
  })

  it('statusQuellen bleibt frei vom Engine-Sonderfall SYS', () => {
    for (const p of PRESETS) {
      const erg = berechne(p.eingaben)
      expect(erg.statusQuellen.every(q => q.regelId !== 'SYS'), p.id).toBe(true)
    }
  })
})
