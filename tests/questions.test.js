import { describe, it, expect } from 'vitest'
import { ALLE_FRAGEN } from '../src/data/fragen.js'

const REQUIRED_PLAYBOOK_FIELDS = ['warum', 'warnsignale', 'einordnung']

function collectFields(bedingung, fields = []) {
  if (!bedingung) return fields
  if (bedingung.feld) fields.push(bedingung.feld)
  for (const child of bedingung.und ?? []) collectFields(child, fields)
  for (const child of bedingung.oder ?? []) collectFields(child, fields)
  return fields
}

describe('Fragenmodell', () => {
  it('formuliert jede Frage als vollständige Frage', () => {
    for (const frage of ALLE_FRAGEN) {
      expect(frage.label, frage.id).toMatch(/\?$/)
    }
  })

  it('enthält für jede Frage einen vollständigen Sales-Playbook-Text', () => {
    for (const frage of ALLE_FRAGEN) {
      expect(frage.playbook, frage.id).toBeTruthy()
      for (const field of REQUIRED_PLAYBOOK_FIELDS) {
        expect(frage.playbook[field], `${frage.id}.${field}`).toEqual(expect.any(String))
        expect(frage.playbook[field].trim().length, `${frage.id}.${field}`).toBeGreaterThan(20)
        expect(frage.playbook[field].trim().length, `${frage.id}.${field}`).toBeLessThanOrEqual(90)
      }
    }
  })

  it('ergÃ¤nzt jede Auswahloption um eine kurze ErklÃ¤rung', () => {
    for (const frage of ALLE_FRAGEN.filter(f => f.typ === 'select')) {
      for (const option of frage.optionen) {
        expect(option.hinweis, `${frage.id}.${option.wert}.hinweis`).toEqual(expect.any(String))
        expect(option.hinweis.trim().length, `${frage.id}.${option.wert}.hinweis`).toBeGreaterThan(10)
        expect(option.hinweis.trim().length, `${frage.id}.${option.wert}.hinweis`).toBeLessThanOrEqual(90)
      }
    }
  })

  it('referenziert in Sichtbarkeitsbedingungen nur bekannte Frage-IDs', () => {
    const ids = new Set(ALLE_FRAGEN.map(f => f.id))
    for (const frage of ALLE_FRAGEN) {
      for (const field of collectFields(frage.sichtbar)) {
        expect(ids.has(field), `${frage.id}.sichtbar -> ${field}`).toBe(true)
      }
    }
  })
})
