import React, { useMemo, useState } from 'react'
import { ANNAHMEN_META } from '../data/annahmen.js'
import { ADMIN_STORAGE_KEY, makeDefaultAdminConfig, mergeWithDefaults, validateAdminConfig } from '../data/adminConfig.js'
import { REGELN } from '../data/regeln.js'
import { bedingungText, wirkungText } from './format.js'
import Testfaelle from './Testfaelle.jsx'

const PRIMARY_TABS = [
  ['fragen', 'Fragen & Playbook', 'Fragetexte, Optionshinweise und Sales-Playbook-Texte bearbeiten.'],
  ['katalog_preise', 'Katalog & Preise', 'Leistungsumfang und Demo-Richtpreise pflegen: Pakettexte, Kundentitel, Preisannahmen.'],
  ['regeln', 'Regeln & Annahmen', 'Aktive Entscheidungsregeln einsehen; Governance-Felder verwalten.'],
]
const SECONDARY_TABS = [
  ['testfaelle', 'Testfälle'],
  ['import', 'Import/Export'],
]

const clone = (value) => JSON.parse(JSON.stringify(value))

function updateNested(setAdminConfig, mutator) {
  setAdminConfig(prev => {
    const next = clone(prev)
    mutator(next)
    return next
  })
}

function TextField({ label, value, onChange, rows = 1 }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {rows > 1 ? (
        <textarea rows={rows} value={value ?? ''} onChange={e => onChange(e.target.value)} />
      ) : (
        <input value={value ?? ''} onChange={e => onChange(e.target.value)} />
      )}
    </label>
  )
}

function AnnahmenTab({ adminConfig, setAdminConfig }) {
  const setze = (key, value) => updateNested(setAdminConfig, next => {
    next.annahmen[key] = value === '' ? 0 : parseFloat(value)
  })

  return (
    <div className="karten-reihe admin-grid">
      {ANNAHMEN_META.map(gruppe => (
        <div className="karte" key={gruppe.gruppe}>
          <h3>{gruppe.gruppe}</h3>
          <table className="fakten">
            <tbody>
              {gruppe.felder.map(([key, label, einheit]) => (
                <tr key={key}>
                  <td>{label} <span className="einheit">({einheit})</span></td>
                  <td className="r">
                    <input
                      className="inline-zahl"
                      type="number"
                      step="any"
                      value={adminConfig.annahmen[key]}
                      onChange={e => setze(key, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

function FragenTab({ adminConfig, setAdminConfig, sektionen }) {
  const setFrage = (id, field, value) => updateNested(setAdminConfig, next => {
    next.fragen[id][field] = value
  })
  const setPlaybook = (id, field, value) => updateNested(setAdminConfig, next => {
    next.fragen[id].playbook[field] = value
  })
  const setOption = (id, wert, field, value) => updateNested(setAdminConfig, next => {
    next.fragen[id].optionen[wert][field] = value
  })

  return (
    <div className="admin-stack">
      {sektionen.map(sektion => (
        <section key={sektion.id} className="karte">
          <h3>{sektion.id} · {sektion.titel}</h3>
          <div className="admin-list">
            {sektion.fragen.map(frage => {
              const edit = adminConfig.fragen[frage.id]
              return (
                <article key={frage.id} className="admin-edit-card">
                  <div className="admin-edit-head">
                    <strong>{frage.id}</strong>
                    <span>{frage.typ} · DQ {frage.dq ?? 0}</span>
                  </div>
                  <div className="admin-editor-grid">
                    <TextField label="Frage" value={edit.label} onChange={v => setFrage(frage.id, 'label', v)} />
                    <TextField label="Kurzer Hinweis" value={edit.hinweisKurz} onChange={v => setFrage(frage.id, 'hinweisKurz', v)} />
                    <TextField label="Tooltip" value={edit.tooltip} rows={2} onChange={v => setFrage(frage.id, 'tooltip', v)} />
                    <TextField label="Warum" value={edit.playbook.warum} rows={2} onChange={v => setPlaybook(frage.id, 'warum', v)} />
                    <TextField label="Warnsignale" value={edit.playbook.warnsignale} rows={2} onChange={v => setPlaybook(frage.id, 'warnsignale', v)} />
                    <TextField label="Sales-Einordnung" value={edit.playbook.einordnung} rows={2} onChange={v => setPlaybook(frage.id, 'einordnung', v)} />
                  </div>
                  {frage.optionen?.length ? (
                    <div className="admin-optionen">
                      {frage.optionen.map(option => {
                        const opt = edit.optionen[option.wert]
                        return (
                          <div key={option.wert} className="admin-option-row">
                            <code>{option.wert}</code>
                            <input value={opt.label} onChange={e => setOption(frage.id, option.wert, 'label', e.target.value)} />
                            <input value={opt.hinweis} onChange={e => setOption(frage.id, option.wert, 'hinweis', e.target.value)} />
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function KatalogTab({ adminConfig, setAdminConfig, katalog }) {
  const setPaket = (paketId, field, value) => updateNested(setAdminConfig, next => {
    next.katalog[paketId][field] = value
  })
  const setPosition = (paketId, posId, field, value) => updateNested(setAdminConfig, next => {
    next.katalog[paketId].positionen[posId][field] = value
  })
  const setPositionKunde = (paketId, posId, field, value) => updateNested(setAdminConfig, next => {
    next.katalog[paketId].positionen[posId].kunde[field] = value
  })
  const setVariante = (paketId, variante, value) => updateNested(setAdminConfig, next => {
    next.katalog[paketId].varianten[variante].name = value
  })
  const setVarPosition = (paketId, variante, posId, field, value) => updateNested(setAdminConfig, next => {
    next.katalog[paketId].varianten[variante].positionen[posId][field] = value
  })
  const setVarPositionKunde = (paketId, variante, posId, field, value) => updateNested(setAdminConfig, next => {
    next.katalog[paketId].varianten[variante].positionen[posId].kunde[field] = value
  })

  const renderPosition = (paketId, pos, edit, onText, onKunde) => (
    <article key={pos.id} className="admin-edit-card">
      <div className="admin-edit-head">
        <strong>{pos.id}</strong>
        <span>{pos.tag?.toUpperCase()} · {pos.einheit}</span>
      </div>
      <div className="admin-editor-grid">
        <TextField label="Interner Positionstext" value={edit.text} onChange={v => onText(pos.id, 'text', v)} />
        <TextField label="Begründung" value={edit.begruendung} rows={2} onChange={v => onText(pos.id, 'begruendung', v)} />
        <TextField label="Kundentitel" value={edit.kunde.titel} onChange={v => onKunde(pos.id, 'titel', v)} />
        <TextField label="Hersteller" value={edit.kunde.hersteller} onChange={v => onKunde(pos.id, 'hersteller', v)} />
        <TextField label="Produkt" value={edit.kunde.produkt} onChange={v => onKunde(pos.id, 'produkt', v)} />
        <TextField label="Leistungsklasse" value={edit.kunde.leistungsklasse} onChange={v => onKunde(pos.id, 'leistungsklasse', v)} />
        <TextField label="Leistungsumfang" value={edit.kunde.leistungsumfang} rows={3} onChange={v => onKunde(pos.id, 'leistungsumfang', v)} />
      </div>
    </article>
  )

  return (
    <div className="admin-stack">
      {katalog.map(paket => {
        const edit = adminConfig.katalog[paket.id]
        return (
          <section key={paket.id} className="karte">
            <div className="admin-edit-head">
              <h3>{paket.id}</h3>
              <span>{paket.varianten ? 'Variantenpaket' : 'Paket'}</span>
            </div>
            <div className="admin-editor-grid">
              <TextField label="Pakettyp" value={edit.pakettyp} onChange={v => setPaket(paket.id, 'pakettyp', v)} />
              <TextField label="Gruppe" value={edit.gruppe} onChange={v => setPaket(paket.id, 'gruppe', v)} />
            </div>
            {(paket.positionen ?? []).map(pos => renderPosition(
              paket.id,
              pos,
              edit.positionen[pos.id],
              (posId, field, value) => setPosition(paket.id, posId, field, value),
              (posId, field, value) => setPositionKunde(paket.id, posId, field, value),
            ))}
            {(paket.varianten ?? []).map(variante => (
              <div key={variante.wert} className="admin-variant">
                <TextField label={`Variante ${variante.wert}`} value={edit.varianten[variante.wert].name} onChange={v => setVariante(paket.id, variante.wert, v)} />
                {variante.positionen.map(pos => renderPosition(
                  paket.id,
                  pos,
                  edit.varianten[variante.wert].positionen[pos.id],
                  (posId, field, value) => setVarPosition(paket.id, variante.wert, posId, field, value),
                  (posId, field, value) => setVarPositionKunde(paket.id, variante.wert, posId, field, value),
                ))}
              </div>
            ))}
          </section>
        )
      })}
    </div>
  )
}

function GovernanceTab({ adminConfig, setAdminConfig, ergebnis }) {
  const setGov = (field, value) => updateNested(setAdminConfig, next => {
    next.governance[field] = value
  })
  const statusByRule = Object.fromEntries(ergebnis.statusQuellen.map(q => [q.regelId, q.wert]))

  return (
    <div className="admin-stack">
      <div className="karte">
        <h3>Governance & Sichtbarkeit</h3>
        <p className="hinweis">Diese Angaben beschreiben lokale Demo-Overrides. Sie ersetzen kein Rollen-, Freigabe- oder Backend-Konzept.</p>
        <div className="admin-editor-grid">
          <TextField label="Version" value={adminConfig.governance.versionLabel} onChange={v => setGov('versionLabel', v)} />
          <TextField label="Standard-Datenquelle" value={adminConfig.governance.datenquelleStandard} onChange={v => setGov('datenquelleStandard', v)} />
          <TextField label="Standard-Confidence" value={adminConfig.governance.confidenceStandard} onChange={v => setGov('confidenceStandard', v)} />
          <TextField label="Kundensicht" value={adminConfig.governance.kundensicht} rows={2} onChange={v => setGov('kundensicht', v)} />
          <TextField label="Interne Sicht" value={adminConfig.governance.internsicht} rows={2} onChange={v => setGov('internsicht', v)} />
          <TextField label="Notizen" value={adminConfig.governance.notizen} rows={3} onChange={v => setGov('notizen', v)} />
        </div>
      </div>

      <div className="karte">
        <h3>Regeln (read-only)</h3>
        <p className="hinweis">Regeln bleiben in diesem SK-73-Pass nicht editierbar. Änderungen an der DSL brauchen später einen eigenen Regel-Editor mit stärkerer Validierung.</p>
        <div className="table-scroll">
          <table className="lv">
            <thead>
              <tr><th>Nr</th><th>Wenn</th><th>Dann</th><th>Governance</th><th>Ausgelöst</th></tr>
            </thead>
            <tbody>
              {REGELN.map(r => (
                <tr key={r.id} className={ergebnis.gefeuert.includes(r.id) ? 'gewaehlt' : ''}>
                  <td><strong>{r.id}</strong></td>
                  <td className="code">{bedingungText(r.wenn)}</td>
                  <td className="code">{wirkungText(r.dann)}</td>
                  <td>
                    <span className="hinweis">intern · versioniert im Code</span>
                    <div>{statusByRule[r.id] ? `Statuswirkung: ${statusByRule[r.id]}` : 'Keine direkte Statuswirkung im aktuellen Lauf'}</div>
                  </td>
                  <td>{ergebnis.gefeuert.includes(r.id) ? '● ja' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ImportExportTab({ adminConfig, setAdminConfig, resetAdminConfig }) {
  const exportText = useMemo(() => JSON.stringify(adminConfig, null, 2), [adminConfig])
  const [text, setText] = useState(exportText)
  const [meldung, setMeldung] = useState('')
  const errors = validateAdminConfig(adminConfig)

  const importieren = () => {
    try {
      const parsed = JSON.parse(text)
      const merged = mergeWithDefaults(parsed)
      const importErrors = validateAdminConfig(merged)
      if (importErrors.length) {
        setMeldung(`Import blockiert: ${importErrors.slice(0, 4).join(' ')}`)
        return
      }
      setAdminConfig(merged)
      setMeldung('Import übernommen.')
    } catch {
      setMeldung('Import blockiert: JSON ist ungültig.')
    }
  }

  const herunterladen = () => {
    const blob = new Blob([exportText], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'syskon-admin-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-stack">
      <div className="karte">
        <h3>Import / Export</h3>
        <p className="hinweis">Speicherort: <code>{ADMIN_STORAGE_KEY}</code>. Exportierte JSON-Dateien sind Demo-Konfigurationen, keine Produktionsfreigabe.</p>
        <div className="zeile">
          <button onClick={() => setText(exportText)}>Aktuelle Konfiguration in Textfeld laden</button>
          <button onClick={herunterladen}>JSON herunterladen</button>
          <button className="primaer" onClick={importieren}>JSON importieren</button>
          <button onClick={resetAdminConfig}>Auf Demo-Defaults zurücksetzen</button>
        </div>
        {meldung ? <p className={meldung.includes('blockiert') ? 'warnbox' : 'okbox'}>{meldung}</p> : null}
        {errors.length ? (
          <p className="warnbox">Aktuelle Konfiguration hat Validierungshinweise: {errors.slice(0, 4).join(' ')}</p>
        ) : <p className="okbox">Aktuelle Konfiguration ist valide.</p>}
        <textarea className="admin-json" value={text} onChange={e => setText(e.target.value)} />
      </div>

      <div className="karte">
        <h3>Lokaler Reset</h3>
        <p className="hinweis">Der Reset löscht nur lokale Demo-Overrides im Browser und stellt die Code-Defaults wieder her.</p>
        <button onClick={() => setAdminConfig(makeDefaultAdminConfig())}>Defaults anwenden</button>
      </div>
    </div>
  )
}

export default function Annahmen({
  adminConfig = makeDefaultAdminConfig(),
  setAdminConfig = () => {},
  resetAdminConfig = () => {},
  ergebnis,
  sektionen = [],
  katalog = [],
  eingaben = {},
  setEingaben = () => {},
  annahmen = {},
  setScreen = () => {},
}) {
  const [tab, setTab] = useState('fragen')
  const updated = adminConfig.updatedAt ? new Date(adminConfig.updatedAt).toLocaleString('de-DE') : 'noch nicht lokal geändert'
  const tabBeschreibung = PRIMARY_TABS.find(([id]) => id === tab)?.[2]

  return (
    <div className="seite">
      <div className="admin-banner no-print">
        ⚙ Admin-Bereich · lokale Demo-Konfiguration · Änderungen wirken sofort auf Eingaben, Angebot und Kundenumfang.
      </div>
      <div className="karte">
        <div className="druckkopf">
          <div>
            <h2>Admin-Konfiguration & Governance</h2>
            <p className="hinweis">Version: {adminConfig.governance.versionLabel} · Letzte lokale Änderung: {updated}</p>
          </div>
          <button onClick={resetAdminConfig}>Demo-Defaults</button>
        </div>
        <div className="tabs-sekundaer admin-tabs no-print">
          {PRIMARY_TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'tab aktiv' : 'tab'} onClick={() => setTab(id)}>{label}</button>
          ))}
          <span className="admin-tabs-trenner" role="separator" />
          {SECONDARY_TABS.map(([id, label]) => (
            <button key={id} className={`tab tab-nebensache${tab === id ? ' aktiv' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        {tabBeschreibung && <p className="admin-tab-beschreibung">{tabBeschreibung}</p>}
      </div>

      {tab === 'fragen' && <FragenTab adminConfig={adminConfig} setAdminConfig={setAdminConfig} sektionen={sektionen} />}
      {tab === 'katalog_preise' && (
        <>
          <p className="admin-bereich-label">Preise & Demo-Annahmen</p>
          <AnnahmenTab adminConfig={adminConfig} setAdminConfig={setAdminConfig} />
          <p className="admin-bereich-label">Katalog & Leistungsumfang</p>
          <KatalogTab adminConfig={adminConfig} setAdminConfig={setAdminConfig} katalog={katalog} />
        </>
      )}
      {tab === 'regeln' && <GovernanceTab adminConfig={adminConfig} setAdminConfig={setAdminConfig} ergebnis={ergebnis} />}
      {tab === 'testfaelle' && (
        <Testfaelle
          eingaben={eingaben}
          setEingaben={setEingaben}
          annahmen={annahmen}
          ergebnis={ergebnis}
          setScreen={setScreen}
          katalog={katalog}
          sektionen={sektionen}
        />
      )}
      {tab === 'import' && <ImportExportTab adminConfig={adminConfig} setAdminConfig={setAdminConfig} resetAdminConfig={resetAdminConfig} />}
    </div>
  )
}
