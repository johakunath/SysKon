import React, { useEffect, useState } from 'react'

// Strategie-Deck (Jul 2026, PO-Anweisung): 5 Slides zur Einordnung von CPQ bei TS —
// Entscheidungsthese, durchgängiger Datenfluss, Nutzen, Scope/Governance und
// SysKon als Machbarkeitsnachweis. Reiner Präsentationsinhalt, daher lebt der Text hier in der View
// und nicht in src/data/. Format-Vorbild: Full-Screen-Slides mit Pfeiltasten,
// Vor/Zurück-Buttons und Punkt-Indikator.

const SLIDES = [
  {
    id: 'warum',
    kicker: 'Entscheidungsthese',
    titel: 'CPQ für TS: vom Einzelwissen zum skalierbaren Prozess',
    inhalt: (
      <>
        <p className="slide-these">
          Ein CPQ macht wiederkehrende technische und kaufmännische Entscheidungen nutzbar,
          ohne Engineering-Freigaben oder Expertenurteil zu ersetzen.
        </p>
        <div className="slide-karten drei">
          <div className="karte slide-karte">
            <h3>Heute: verteiltes Wissen</h3>
            <p>
              Angebots- und Konfigurationswissen liegt in Excel-Dateien, Köpfen und
              Einzelfallabstimmungen. Daten werden mehrfach erfasst; Quelle, Version und
              Freigabestatus sind nicht immer eindeutig.
            </p>
          </div>
          <div className="karte slide-karte">
            <h3>Zielbild: gemeinsame Logik</h3>
            <p>
              Fragen, Regeln, Artikel, Kosten und Preislogik bilden eine versionierte Basis.
              Standardfälle werden reproduzierbar bearbeitet; Abweichungen sichtbar an die
              richtige Fachstelle übergeben.
            </p>
          </div>
          <div className="karte slide-karte">
            <h3>Entscheidung</h3>
            <p>
              CPQ als gemeinsame TS-Fähigkeit aufbauen und zunächst an einem klar begrenzten
              Produkt- und Anwendungskorridor mit realen Fällen validieren.
            </p>
          </div>
        </div>
        <p className="slide-kernaussage">
          Nicht weniger Engineering, sondern Engineering dort, wo fachliche Beurteilung
          tatsächlich erforderlich ist.
        </p>
      </>
    ),
  },
  {
    id: 'datenfluss',
    kicker: 'Zielprozess',
    titel: 'Ein Datenfluss vom Erstkontakt bis zum Betrieb',
    inhalt: (
      <>
        <div className="slide-prozess">
          <div className="karte slide-karte prozess-schritt">
            <span className="stufe-label">1 · Qualifizieren</span>
            <p>Kunden-, Objekt- und Messdaten strukturiert mit Quelle und Aktualität erfassen.</p>
          </div>
          <div className="karte slide-karte prozess-schritt">
            <span className="stufe-label">2 · Konfigurieren</span>
            <p>Regeln erzeugen Lösungskorridor, Ausschlüsse und notwendige Prüfschritte.</p>
          </div>
          <div className="karte slide-karte prozess-schritt">
            <span className="stufe-label">3 · Kalkulieren</span>
            <p>Versionierte Artikel-, Kosten- und Preislogik liefert interne und externe Sicht.</p>
          </div>
          <div className="karte slide-karte prozess-schritt">
            <span className="stufe-label">4 · Prüfen & übergeben</span>
            <p>Standardfälle laufen weiter; Ausnahmen, Annahmen und offene Punkte werden geroutet.</p>
          </div>
          <div className="karte slide-karte prozess-schritt">
            <span className="stufe-label">5 · Lernen</span>
            <p>Erkenntnisse aus Umsetzung und Betrieb verbessern Regeln, Katalog und Kalkulation.</p>
          </div>
        </div>
        <p className="slide-kernaussage">
          CPQ ist keine weitere isolierte Oberfläche, sondern die Orchestrierungsschicht
          zwischen bestehenden Daten, Fachlogik und Prozessen.
        </p>
      </>
    ),
  },
  {
    id: 'nutzen',
    kicker: 'Wertschöpfung',
    titel: 'Nutzen für TS entsteht vor allem im Datenfluss',
    inhalt: (
      <>
        <div className="slide-karten vier">
          <div className="karte slide-karte">
            <h3>Sales & Qualifizierung</h3>
            <p>Vollständigere Eingangsdaten, frühere No-fit-Erkennung und weniger Rückfragen vor der Übergabe.</p>
          </div>
          <div className="karte slide-karte">
            <h3>Product Engineering & Engineering</h3>
            <p>Wiederkehrende Prüfungen als Regeln; nachvollziehbare Annahmen und Fokus auf echte Ausnahmen.</p>
          </div>
          <div className="karte slide-karte">
            <h3>Supply Chain & Umsetzung</h3>
            <p>Regelbasierter Scope und Artikelbezug, konsistentere Übergaben und weniger späte Änderungen.</p>
          </div>
          <div className="karte slide-karte">
            <h3>Betrieb & Management</h3>
            <p>Rückfluss von Umsetzungs- und Betriebsdaten; messbare Prozessqualität, Risiken und Engpässe.</p>
          </div>
        </div>
        <p className="slide-kpi">
          <strong>Messbar über:</strong> Angebotsdurchlaufzeit · Klärschleifen · Engineering-Stunden je
          qualifiziertem Fall · manuelle Datenübertragungen · späte Scope-Änderungen · Kalkulationsabweichungen
        </p>
        <p className="slide-kernaussage">
          Der größte Nutzen entsteht nicht nur durch schnellere Angebote, sondern durch weniger
          Medienbrüche, Doppelarbeit und Reibung entlang der gesamten Wertschöpfung.
        </p>
      </>
    ),
  },
  {
    id: 'scope',
    kicker: 'Scope & Governance',
    titel: 'Automatisierung mit Engineering-Guardrails',
    inhalt: (
      <>
        <div className="slide-karten drei">
          <div className="karte slide-karte scope-ist">
            <h3>CPQ soll …</h3>
            <ul>
              <li>qualifizieren, konfigurieren und Preis- sowie Lösungskorridor erzeugen</li>
              <li>Quellen, Annahmen, Versionen und offene Punkte dokumentieren</li>
              <li>Standardfälle, Prüfbedarf und Ausschlüsse unterscheiden</li>
              <li>Freigaben und Übergaben strukturiert unterstützen</li>
            </ul>
          </div>
          <div className="karte slide-karte scope-nicht">
            <h3>CPQ soll nicht …</h3>
            <ul>
              <li>Detailplanung, technische Freigabe oder Expertenurteil ersetzen</li>
              <li>Rechts-, Förder-, Schall- oder Standortnachweise garantieren</li>
              <li>Ausnahmen ohne Fachprüfung freigeben</li>
              <li>bestehende führende Systeme ersetzen</li>
            </ul>
          </div>
          <div className="karte slide-karte">
            <h3>Dafür braucht es Governance</h3>
            <ul>
              <li>benannte Owner für Fragen, Regeln, Artikel, Kosten und Preise</li>
              <li>Versionierung, Vier-Augen-Freigabe, Tests und Release-Prozess</li>
              <li>klare Daten- und Schnittstellenverantwortung</li>
              <li>definierte Schwellen für automatische Bearbeitung und Review</li>
            </ul>
          </div>
        </div>
        <p className="slide-kernaussage">
          Den Standard standardisieren, Ausnahmen sichtbar machen und kontrolliert zu den
          richtigen Experten routen.
        </p>
      </>
    ),
  },
  {
    id: 'machbarkeit',
    kicker: 'Machbarkeitsnachweis',
    titel: 'SysKon beweist das Prinzip — nicht das Produktionssystem',
    inhalt: (
      <>
        <div className="slide-karten drei">
          <div className="karte slide-karte scope-ist">
            <h3>Im Prototyp belegt</h3>
            <ul>
              <li>geführter Prozess über elf Themenblöcke</li>
              <li>datengetriebene Fragen, Regeln, Artikel und Preislogik</li>
              <li>ein Berechnungspfad mit Status-Eskalation</li>
              <li>getrennte Kunden- und Internsicht; 176 bestandene Tests</li>
            </ul>
          </div>
          <div className="karte slide-karte scope-nicht">
            <h3>Noch nicht belegt</h3>
            <ul>
              <li>produktive, fachlich freigegebene Stammdaten</li>
              <li>Schnittstellen, zentrale Persistenz, IAM und Audit Trail</li>
              <li>Security, Skalierung, Betrieb und Supportmodell</li>
              <li>Validierung der Regeln und Werte an realen Fällen</li>
            </ul>
          </div>
          <div className="karte slide-karte">
            <h3>Nächster sinnvoller Schritt</h3>
            <ul>
              <li>einen Produkt- und Anwendungskorridor auswählen</li>
              <li>Daten-, Regel- und Freigabeverantwortung festlegen</li>
              <li>Ausgangs-KPIs erheben und reale Fälle pilotieren</li>
              <li>erst nach messbarer Wirkung gezielt erweitern</li>
            </ul>
          </div>
        </div>
        <p className="slide-kernaussage">
          SysKon reduziert das technische Machbarkeitsrisiko. Die nächste Aufgabe ist,
          Datenqualität, Governance, Integration und Prozesswirkung nachzuweisen.
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
