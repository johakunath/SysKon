// SK-105: Routing-Layer Standard / Bedingt / Sonderfall.
// Kein React. Leitet aus dem internen 4-stufigen Status (gruen<gelb<orange<rot)
// die Sales-facing Einordnung ab.
//
// Wichtig: Das Routing ist eine ABLEITUNG, keine zweite Wahrheit. Der
// Status-Layer bleibt unverändert die interne Guardrail; das Routing beantwortet
// nur die Sales-Frage „darf ich hier allein weiterarbeiten?".
//
// Klassen:
//   standard   – im freigegebenen Korridor; Sales arbeitet ohne Fachbeteiligung weiter
//   bedingt    – grundsätzlich möglich, aber Daten/Klärung/Fachprüfung nötig
//   sonderfall – außerhalb der Produktgrenzen; konventioneller Prozess
//
// Die Grundkategorie beantwortet „warum bedingt?" – die Frage, die der reine
// Status NICHT trennt: R10 (dünne Datenlage) und R06 (Schall/Fachprüfung)
// landen beide im Band gelb/orange, brauchen aber völlig verschiedene
// nächste Schritte und verschiedene Owner.

export const ROUTING_KLASSEN = ['standard', 'bedingt', 'sonderfall']

export const ROUTING_KLASSE_JE_STATUS = {
  gruen: 'standard',
  gelb: 'bedingt',
  orange: 'bedingt',
  rot: 'sonderfall',
}

// Reihenfolge = Priorität: die stärkste Einschränkung bestimmt den nächsten
// Schritt, wenn mehrere Regeln denselben Status ausgelöst haben.
export const GRUND_KATEGORIEN = ['produktgrenze', 'fachpruefung', 'kaufmaennisch', 'daten']

export const GRUND_META = {
  produktgrenze: {
    label: 'Produktgrenze',
    bedeutung: 'Der Fall liegt außerhalb des freigegebenen Standardumfangs.',
  },
  fachpruefung: {
    label: 'Fachprüfung',
    bedeutung: 'Eine technische Bewertung muss den Fall freigeben.',
  },
  kaufmaennisch: {
    label: 'Kaufmännische Klärung',
    bedeutung: 'Vertrags- oder Preisrahmen muss abgestimmt werden.',
  },
  daten: {
    label: 'Fehlende Daten',
    bedeutung: 'Es fehlen Angaben, nicht die Eignung.',
  },
}

export const ROUTING_META = {
  standard: {
    titel: 'Standard',
    bedeutung: 'Alle Pflichtkriterien erfüllt: mit freigegebenen Komponenten und Regeln weiterarbeiten.',
  },
  bedingt: {
    titel: 'Bedingt',
    bedeutung: 'Grundsätzlich geeignet, aber ein Punkt muss vor externer Nutzung geklärt werden.',
  },
  sonderfall: {
    titel: 'Sonderfall',
    bedeutung: 'Außerhalb der Produktgrenzen: in den konventionellen Prozess geben.',
  },
  unbekannt: {
    titel: 'Noch nicht einordenbar',
    bedeutung: 'Es fehlen Pflichtdaten, bevor der Fall eingeordnet werden kann.',
  },
}

// PE/Engineering-Warnungen (R01, R02 …) sind Teil jedes Standard-Hybrid-Falls.
// Sie degradieren die Routing-Klasse NICHT — das würde `standard` unerreichbar
// machen, da R01 auf jeden Hybrid-Fall feuert und Hybrid der einzige
// standardfähige Pfad ist. Stattdessen macht `naechsteAktion` die laufenden
// Prüfpunkte für Sales sichtbar, ohne die Einordnung selbst zu ändern.
const AKTION = {
  standard: (pruefpunktCount = 0) =>
    pruefpunktCount > 0
      ? `Im Standardpfad weiterarbeiten; ${pruefpunktCount} interne Prüfpunkt${pruefpunktCount === 1 ? '' : 'e'} beachten.`
      : 'Im Standardpfad weiterarbeiten; Annahmen im Gespräch sichtbar halten.',
  bedingt: {
    daten: 'Offene Pflichtdaten einsammeln und danach erneut einordnen.',
    fachpruefung: 'Fachprüfung einplanen; Ergebnis erst danach extern verwenden.',
    kaufmaennisch: 'Vertragliche Klärung anstoßen, bevor die Variante angeboten wird.',
    fallback: 'Offene Punkte klären, bevor Umfang oder Preis weitergegeben werden.',
  },
  sonderfall: {
    produktgrenze: 'Kein Standardfit: in den konventionellen Prozess geben oder zurückstellen.',
    fallback: 'Als Sonderfall markieren und den konventionellen Prozess einleiten.',
  },
}

function naechsteAktion(klasse, grundKategorie, pruefpunktCount = 0) {
  if (klasse === 'standard') return AKTION.standard(pruefpunktCount)
  const je = AKTION[klasse]
  if (!je) return 'Konfiguration vervollständigen und anschließend erneut einordnen.'
  return je[grundKategorie] ?? je.fallback
}

// Entscheidend sind die Regeln, die den Fall auf die FINALE Statusstufe gehoben
// haben. Regeln auf schwächeren Stufen sind für die Einordnung nicht ursächlich
// und würden die Begründung nur verwässern.
function decisiveQuellen(quellen, status) {
  return quellen.filter(q => q.wert === status)
}

function staerksteKategorie(gruende) {
  const vorhanden = gruende.map(g => g.routingGrund).filter(Boolean)
  return GRUND_KATEGORIEN.find(k => vorhanden.includes(k)) ?? null
}

/**
 * Leitet die Sales-Einordnung aus dem Engine-Status ab.
 *
 * @param {object} args
 * @param {string} args.status         Finaler Status der Engine.
 * @param {Array}  args.quellen        Status-Quellen inkl. `routingGrund` (SYS eingeschlossen).
 * @param {Array}  args.fehlendeDaten  Offene Pflichtfragen ({ id, sektion, label, dq }).
 * @param {Array}  args.warnungen      Engine-Warnungen ({ regelId, kategorie, status }).
 *                                     Warn-only PE/Engineering-Regeln (R01, R02 …) degradieren
 *                                     die Routing-Klasse nicht, werden aber als `pruefpunktCount`
 *                                     im Ergebnis mitgeführt, damit die `naechsteAktion` sie
 *                                     für Sales sichtbar machen kann.
 * @returns {object} routing
 */
export function routingErgebnis({ status, quellen = [], fehlendeDaten = [], warnungen = [] }) {
  const klasse = ROUTING_KLASSE_JE_STATUS[status] ?? null
  const meta = ROUTING_META[klasse] ?? ROUTING_META.unbekannt

  const gruende = decisiveQuellen(quellen, status).map(q => ({
    regelId: q.regelId,
    routingGrund: q.routingGrund ?? null,
    begruendung: q.begruendung,
  }))
  const grundKategorie = klasse === 'standard' ? null : staerksteKategorie(gruende)

  // Nur intern relevante Warnkategorien zählen; Förderwarnungen und reine
  // Hinweise betreffen keinen internen Prüfverantwortlichen.
  const pruefpunktCount = warnungen.filter(
    w => w.kategorie === 'pe' || w.kategorie === 'engineering'
  ).length

  return {
    klasse,
    titel: meta.titel,
    bedeutung: meta.bedeutung,
    grundKategorie,
    grundLabel: grundKategorie ? GRUND_META[grundKategorie].label : null,
    gruende,
    pruefpunktCount,
    naechsteAktion: naechsteAktion(klasse, grundKategorie, pruefpunktCount),
    offeneDaten: fehlendeDaten.slice().sort((a, b) => b.dq - a.dq).slice(0, 5),
  }
}
