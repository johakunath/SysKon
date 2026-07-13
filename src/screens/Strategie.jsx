import React, { useEffect, useState } from 'react'

// Strategie-Deck (Jul 2026, PO-Anweisung): 4 Slides zur Einordnung von SysKon —
// warum ein Konfigurator, Iterationsstufen (Schnell-Check vs. SysKon), Scope,
// Architektur. Reiner Präsentationsinhalt, daher lebt der Text hier in der View
// und nicht in src/data/. Format-Vorbild: Full-Screen-Slides mit Pfeiltasten,
// Vor/Zurück-Buttons und Punkt-Indikator.

const SLIDES = [
  {
    id: 'warum',
    kicker: 'Executive Summary',
    titel: 'Warum SysKon?',
    inhalt: (
      <>
        <p className="slide-these">
          Der größte Engpass bei der Skalierung von SmartZero Contracting ist nicht der Markt,
          sondern die eigene Organisation: Product-Operations-Fit und die Fähigkeit,
          schnell valide Angebote zu erstellen.
        </p>
        <div className="slide-karten drei">
          <div className="karte slide-karte">
            <h3>Heute: Excel</h3>
            <p>
              Angebote entstehen über selbst gepflegte Excel-Sheets — langsam, fehleranfällig
              und nicht skalierbar. Jedes Angebot ist Handarbeit einzelner Wissensträger.
            </p>
          </div>
          <div className="karte slide-karte">
            <h3>Warum keine starren Systempakete?</h3>
            <p>
              Gebäude und Verträge sind heterogen: Statische Pakete sind zu starr, volle
              Handarbeit zu langsam. Ein regelbasierter Konfigurator strukturiert und
              beschleunigt individuelle Entscheidungen, statt sie zu ersetzen.
            </p>
          </div>
          <div className="karte slide-karte">
            <h3>Ziel</h3>
            <p>
              10× schnellerer Angebotsprozess ohne Verlust von Kalkulationstiefe und
              Kontrolle — wartbar durch 1–2 Personen gemeinsam mit Supply Chain, Sales
              und Management.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: 'iterationen',
    kicker: 'Vom Kurzcheck zur skalierbaren Version',
    titel: 'Iterationsstufen',
    inhalt: (
      <>
        <div className="slide-stufen">
          <div className="karte slide-karte stufe">
            <span className="stufe-label">Stufe 0</span>
            <h3>Excel heute</h3>
            <p>
              Manuell gepflegte Sheets je Angebot. Funktioniert für einzelne Projekte,
              skaliert aber nicht.
            </p>
          </div>
          <div className="stufe-pfeil" aria-hidden="true">→</div>
          <div className="karte slide-karte stufe">
            <span className="stufe-label">Stufe 1</span>
            <h3>Schnell-Check (frühe MVP-Phase)</h3>
            <p>
              Machbarkeits-Kurzcheck mit minimalen Daten: Im Messdienstleister-Bestand
              VL-/RL-Temperaturen aus den Wärmemengenzählern auslesen. Bei neuen Objekten
              pauschal prüfen — Heizkörper? Fußbodenheizung? Warmwasser? — plus
              kWh/m²-Abschätzung, Aufstellfläche grob per Karten-/Luftbild vorqualifizieren
              und die Wirtschaftlichkeit grob einschätzen.
            </p>
            <p className="stufe-hinweis">
              Bewusst <strong>nicht</strong> als „Simple-Modus" in SysKon gebaut —
              der Schnell-Check ist die Excel-Vorstufe zur schnellen Vorqualifizierung.
            </p>
          </div>
          <div className="stufe-pfeil" aria-hidden="true">→</div>
          <div className="karte slide-karte stufe stufe-ziel">
            <span className="stufe-label">Stufe 2</span>
            <h3>SysKon</h3>
            <p>
              Die langfristig skalierbare Version: geführtes Kundengespräch, Regelwerk und
              Katalog, Artikeldatenbank mit EK-/VK-Kette, Contracting-Preislogik
              (GP/AP, Ziel-IRR) — vollständig konfigurierbar über den Admin-Bereich.
            </p>
          </div>
        </div>
        <p className="slide-kernaussage">
          Schnell-Check und SysKon konkurrieren nicht: Der Schnell-Check qualifiziert
          Objekte vor, SysKon macht daraus ein valides Richtpreis-Angebot.
        </p>
      </>
    ),
  },
  {
    id: 'scope',
    kicker: 'Erwartungsmanagement',
    titel: 'Scope: ist / ist nicht',
    inhalt: (
      <div className="slide-karten zwei">
        <div className="karte slide-karte scope-ist">
          <h3>SysKon ist …</h3>
          <ul>
            <li>ein Sales-Co-Creation- und Vorqualifizierungs-Tool fürs Kundengespräch</li>
            <li>Richtpreis, Lösungskorridor und nächster sinnvoller Schritt</li>
            <li>PE-/Engineering-Logik als interne Guardrails unter der Sales-Experience</li>
            <li>vollständig konfigurierbar: Fragen, Regeln, Katalog und Preisannahmen</li>
          </ul>
        </div>
        <div className="karte slide-karte scope-nicht">
          <h3>SysKon ist nicht …</h3>
          <ul>
            <li>ein Planungstool — keine Standort-, LiDAR- oder 3D-Placement-Berechnung</li>
            <li>eine Customer-Self-Service-Bestellstrecke ohne Sales-/interne Prüfung</li>
            <li>eine Rechts-, Förder- oder Schallgarantie</li>
            <li>eine Quelle produktiver Kalkulationswerte — nur Demo-Annahmen und Richtpreise</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'architektur',
    kicker: 'Drei Schichten, ein Berechnungspfad',
    titel: 'Architektur',
    inhalt: (
      <>
        <div className="slide-karten drei">
          <div className="karte slide-karte schicht">
            <span className="stufe-label">Daten</span>
            <h3>Deklarativ, React-frei</h3>
            <p>
              Fragen, Regeln, Katalog, Artikel und Annahmen sind reine Daten.
              Neue Regeln, Preise oder Artikel sind Daten-Edits, kein Code.
            </p>
          </div>
          <div className="karte slide-karte schicht">
            <span className="stufe-label">Logik</span>
            <h3>Ein Einstieg: berechne()</h3>
            <p>
              Regel-Engine mit Status-Eskalation (grün &lt; gelb &lt; orange &lt; rot) und
              Contracting-Kalkulation mit struktureller Trennung von Kunden- und Internsicht.
            </p>
          </div>
          <div className="karte slide-karte schicht">
            <span className="stufe-label">UI</span>
            <h3>Screens als reine Darstellung</h3>
            <p>
              Konfiguration, Angebot und Admin-Bereich rendern das eine memoisierte
              Ergebnis — keine parallelen Rechenpfade.
            </p>
          </div>
        </div>
        <p className="slide-kernaussage">
          Querschnitt: Admin-Override-Schicht macht alles konfigurierbar (Demo via
          localStorage), über 120 Regressionstests sichern Regeln und Preise ab,
          keine Abhängigkeiten außer React.
        </p>
      </>
    ),
  },
]

// `start` nur für Tests (Server-Render zeigt genau einen Slide).
export default function Strategie({ start = 0 }) {
  const [aktiv, setAktiv] = useState(start)

  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLElement && /^(input|textarea|select)$/i.test(e.target.tagName)) return
      if (e.key === 'ArrowRight') setAktiv(i => Math.min(i + 1, SLIDES.length - 1))
      else if (e.key === 'ArrowLeft') setAktiv(i => Math.max(i - 1, 0))
      else if (e.key === 'Home') setAktiv(0)
      else if (e.key === 'End') setAktiv(SLIDES.length - 1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const slide = SLIDES[aktiv]

  return (
    <main className="strategie" aria-label="Strategie-Präsentation">
      <section className="slide" key={slide.id}>
        <p className="slide-kicker">{slide.kicker}</p>
        <h2>{slide.titel}</h2>
        {slide.inhalt}
      </section>
      <nav className="slide-nav" aria-label="Slide-Navigation">
        <button
          className="slide-pfeil"
          onClick={() => setAktiv(i => Math.max(i - 1, 0))}
          disabled={aktiv === 0}
          aria-label="Vorheriger Slide"
        >
          ‹
        </button>
        <div className="slide-dots" role="group" aria-label="Slide auswählen">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              className={`slide-dot${i === aktiv ? ' aktiv' : ''}`}
              onClick={() => setAktiv(i)}
              aria-label={`Slide ${i + 1}: ${s.titel}`}
              aria-current={i === aktiv ? 'true' : undefined}
            />
          ))}
        </div>
        <span className="slide-zaehler">{`${aktiv + 1} / ${SLIDES.length}`}</span>
        <button
          className="slide-pfeil"
          onClick={() => setAktiv(i => Math.min(i + 1, SLIDES.length - 1))}
          disabled={aktiv === SLIDES.length - 1}
          aria-label="Nächster Slide"
        >
          ›
        </button>
      </nav>
    </main>
  )
}
