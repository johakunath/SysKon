// Datenebene: Installationspartner (SK-102, Demo). Fiktive Partnerbetriebe
// mit Standort – Basis der Demo-Anfahrtskalkulation (src/logic/entfernung.js).
// Reale Partnernamen sind erlaubt (PO, Jul 2026); diese hier bleiben fiktiv,
// bis der PO echte Namen liefert – nicht erfinden. Städte sind real.

export const INSTALLATIONSPARTNER = [
  { id: 'partner_nord', name: 'Montagepartner Nord (fiktiv, Hamburg)', plz: '20095', lat: 53.55, lon: 10.0 },
  { id: 'partner_ost', name: 'Montagepartner Ost (fiktiv, Berlin)', plz: '10115', lat: 52.53, lon: 13.39 },
  { id: 'partner_west', name: 'Montagepartner West (fiktiv, Köln)', plz: '50667', lat: 50.94, lon: 6.96 },
  { id: 'partner_sued', name: 'Montagepartner Süd (fiktiv, München)', plz: '80331', lat: 48.14, lon: 11.57 },
]

export function findeInstallationspartner(id) {
  return INSTALLATIONSPARTNER.find(p => p.id === id) ?? null
}
