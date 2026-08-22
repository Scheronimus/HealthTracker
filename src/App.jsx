import { useState } from 'react'
import { EntryForm } from './components/EntryForm.jsx'
import { History } from './components/History.jsx'
import { Settings } from './components/Settings.jsx'
import { Summary } from './components/Summary.jsx'
import { WeightChart } from './components/WeightChart.jsx'
import { createBackup, mergeRestore, parseBackup, weightCsv } from './data/transfer.js'
import { filterBySpan } from './utils/chart.js'
import { loadLanguage, saveLanguage } from './data/storage.js'
import { useHealthData } from './hooks/useHealthData.js'
import { translate } from './i18n.js'
import { downloadText } from './utils/download.js'
import './App.css'

export default function App() {
  const [language, setLanguage] = useState(loadLanguage)
  const [screen, setScreen] = useState('dashboard')
  const [editing, setEditing] = useState(null)
  const [chartSpan, setChartSpan] = useState('threeMonths')
  const { store, setStore, measurements, add, update, remove } = useHealthData()
  const visibleMeasurements = filterBySpan(measurements, chartSpan)
  const t = (key, values) => translate(language, key, values)
  function changeLanguage(next) { setLanguage(next); saveLanguage(next) }
  function showScreen(next) { setScreen(next); window.scrollTo(0, 0) }
  function openEntry(item = null) { setEditing(item); showScreen('entry') }
  function closeEntry() { setEditing(null); showScreen('dashboard') }
  function save(item) { editing ? update(item) : add(item); closeEntry() }
  function deleteItem(id) { if (confirm(t('deleteConfirm'))) { remove(id); closeEntry() } }
  function filename(extension) { return `health-tracker-${new Date().toISOString().slice(0, 10)}.${extension}` }
  function clearAll() {
    if (!confirm(t('clearAllConfirm'))) return ''
    setStore((current) => ({ ...current, measurements: [] }))
    return t('clearAllDone')
  }
  async function loadDemo() {
    const { createIrregularDemoStore } = await import('./data/demo.js')
    const result = mergeRestore(store, createIrregularDemoStore())
    setStore(result.data)
    return t('demoLoaded', result)
  }
  function restore(text) {
    const imported = parseBackup(text)
    if (!confirm(t('restoreConfirm'))) return ''
    const result = mergeRestore(store, imported)
    setStore(result.data)
    return t('restoreDone', result)
  }

  return <>
    <header className="app-header">
      {screen === 'dashboard' && <div className="topbar dashboard-topbar">
        <div className="brand"><img src={`${import.meta.env.BASE_URL}app-icon.svg`} alt="" /><div><h1>{t('appName')}</h1><p>{t('tagline')}</p></div></div>
        <div className="dashboard-actions">
          <button className="settings-button" type="button" onClick={() => showScreen('settings')} aria-label={t('menu')} title={t('menu')}>⚙</button>
          <button className="add-entry-button" type="button" onClick={() => openEntry()} aria-label={t('add')} title={t('add')}>+</button>
        </div>
      </div>}
      {screen === 'entry' && <div className="topbar entry-topbar">
        <button className="header-action" type="button" onClick={closeEntry}>{t('cancel')}</button>
        <h1>{editing ? t('edit') : t('add')}</h1>
        <button className="header-action save-action" type="submit" form="entry-form">{t('save')}</button>
      </div>}
      {screen === 'settings' && <div className="topbar settings-topbar">
        <button className="header-action" type="button" onClick={() => showScreen('dashboard')}>{t('close')}</button>
        <h1>{t('menu')}</h1>
        <span aria-hidden="true" />
      </div>}
    </header>

    {screen === 'dashboard' && <main>
      <WeightChart measurements={visibleMeasurements} language={language} span={chartSpan} onSpanChange={setChartSpan} t={t} />
      <Summary measurements={measurements} visibleMeasurements={visibleMeasurements} span={chartSpan} t={t} />
      <History measurements={measurements} language={language} onEdit={openEntry} t={t} />
    </main>}
    {screen === 'entry' && <main className="entry-screen">
      <EntryForm key={editing?.id ?? 'new'} editing={editing} onSave={save} onDelete={deleteItem} t={t} />
      <p className="entry-privacy">{t('privacyBody')}</p>
    </main>}
    {screen === 'settings' && <main className="settings-screen">
      <Settings language={language} onLanguage={changeLanguage} onBackup={() => downloadText(filename('json'), JSON.stringify(createBackup(store), null, 2), 'application/json')} onCsv={() => downloadText(filename('csv'), weightCsv(measurements), 'text/csv;charset=utf-8')} onRestore={restore} onLoadDemo={import.meta.env.DEV ? loadDemo : undefined} onClearAll={clearAll} t={t} />
    </main>}
    <footer>Health Tracker · {new Date().getFullYear()}</footer>
  </>
}
