import { useState } from 'react'
import packageJson from '../package.json'
import { EntryForm } from './components/EntryForm.jsx'
import { History } from './components/History.jsx'
import { ProfileForm } from './components/ProfileForm.jsx'
import { Settings } from './components/Settings.jsx'
import { Summary } from './components/Summary.jsx'
import { WeightChart } from './components/WeightChart.jsx'
import { BloodPressureDashboard } from './components/BloodPressureDashboard.jsx'
import { BloodPressureEntryForm } from './components/BloodPressureEntryForm.jsx'
import { BloodPressureWeek } from './components/BloodPressureWeek.jsx'
import { createBackup, mergeRestore, mergeWeightImport, parseBackup, parseWeightImportCsv, weightCsv } from './data/transfer.js'
import { filterBySpan } from './utils/chart.js'
import { loadLanguage, saveLanguage } from './data/storage.js'
import { useHealthData } from './hooks/useHealthData.js'
import { translate } from './i18n.js'
import { downloadText } from './utils/download.js'
import { FEATURES } from './features.js'
import { groupBloodPressurePeriods, measurementPeriodStart } from './utils/bloodPressure.js'
import { localDateValue } from './utils/date.js'
import './App.css'

export default function App() {
  const [language, setLanguage] = useState(loadLanguage)
  const [screen, setScreen] = useState('dashboard')
  const [feature, setFeature] = useState('weight')
  const [editing, setEditing] = useState(null)
  const [entryPreset, setEntryPreset] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [chartSpan, setChartSpan] = useState('threeMonths')
  const { store, setStore, measurements, add, update, remove } = useHealthData()
  const weightMeasurements = measurements.filter(({ type }) => type === 'weight')
  const bloodPressureMeasurements = measurements.filter(({ type }) => type === 'bloodPressure')
  const visibleMeasurements = filterBySpan(weightMeasurements, chartSpan)
  const bloodPressureWeeks = groupBloodPressurePeriods(bloodPressureMeasurements)
  const t = (key, values) => translate(language, key, values)
  function changeLanguage(next) { setLanguage(next); saveLanguage(next) }
  function showScreen(next) { setScreen(next); window.scrollTo(0, 0) }
  function openEntry(item = null, preset = null) { setEditing(item); setEntryPreset(preset); showScreen('entry') }
  function closeEntry() { setEditing(null); setEntryPreset(null); showScreen(selectedWeek ? 'bpWeek' : 'dashboard') }
  function saveProfile(profile) { setStore((current) => ({ ...current, profile })); showScreen('settings') }
  function changeBmiZones(showBmiRange) { setStore((current) => ({ ...current, profile: { ...current.profile, showBmiRange } })) }
  function save(item) {
    editing ? update(item) : add(item)
    if (selectedWeek && item.type === 'bloodPressure') {
      const nextMeasurements = [...bloodPressureMeasurements.filter((entry) => entry.id !== item.id), item]
      const anchor = nextMeasurements.map((entry) => localDateValue(entry.timestamp)).sort()[0]
      setSelectedWeek(measurementPeriodStart(localDateValue(item.timestamp), anchor))
      setEditing(null)
      setEntryPreset(null)
      showScreen('bpWeek')
    } else closeEntry()
  }
  function deleteItem(id) {
    if (!confirm(t(feature === 'weight' ? 'deleteConfirm' : 'deleteBloodPressureConfirm'))) return
    remove(id)
    if (selectedWeek) { setSelectedWeek(null); setEditing(null); setEntryPreset(null); showScreen('dashboard') }
    else closeEntry()
  }
  function filename(extension) { return `health-tracker-${new Date().toISOString().slice(0, 10)}.${extension}` }
  function clearAll() {
    if (!confirm(t('clearAllConfirm'))) return ''
    setStore((current) => ({ ...current, measurements: [] }))
    return t('clearAllDone')
  }
  function switchFeature(next) { setFeature(next); setSelectedWeek(null); showScreen('dashboard') }
  function openWeek(start) { setSelectedWeek(start); showScreen('bpWeek') }
  function closeWeek() { setSelectedWeek(null); showScreen('dashboard') }
  async function loadDemo() {
    const { createCombinedDemoStore } = await import('./data/demo.js')
    const result = mergeRestore(store, createCombinedDemoStore())
    setStore(result.data)
    return t('demoLoaded', result)
  }
  function importCsv(text) {
    const parsed = parseWeightImportCsv(text)
    if (!confirm(t('csvImportConfirm', { count: parsed.measurements.length }))) return ''
    const result = mergeWeightImport(store, parsed.measurements)
    setStore(result.data)
    return t('csvImportDone', { ...result, skipped: parsed.skipped })
  }  function restore(text) {
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
          <button className="add-entry-button" type="button" onClick={() => openEntry()} aria-label={t(feature === 'weight' ? 'add' : 'addBloodPressure')} title={t(feature === 'weight' ? 'add' : 'addBloodPressure')}>+</button>
        </div>
      </div>}
      {screen === 'entry' && <div className="topbar entry-topbar">
        <button className="header-action" type="button" onClick={closeEntry}>{t('cancel')}</button>
        <h1>{editing ? t(feature === 'weight' ? 'edit' : 'editBloodPressure') : t(feature === 'weight' ? 'add' : 'addBloodPressure')}</h1>
        <button className="header-action save-action" type="submit" form="entry-form">{t('save')}</button>
      </div>}
      {screen === 'profile' && <div className="topbar entry-topbar">
        <button className="header-action" type="button" onClick={() => showScreen('settings')}>{t('cancel')}</button>
        <h1>{t('profile')}</h1>
        <button className="header-action save-action" type="submit" form="profile-form">{t('save')}</button>
      </div>}
      {screen === 'settings' && <div className="topbar settings-topbar">
        <button className="header-action" type="button" onClick={() => showScreen('dashboard')}>{t('close')}</button>
        <h1>{t('menu')}</h1>
        <span aria-hidden="true" />
      </div>}
      {screen === 'bpWeek' && <div className="topbar settings-topbar">
        <button className="header-action" type="button" onClick={closeWeek}>{t('back')}</button>
        <h1>{t('measurementWeek')}</h1>
        <span aria-hidden="true" />
      </div>}
    </header>

    {screen === 'dashboard' && <main>
      <nav className="feature-nav" aria-label={t('healthAreas')}>{FEATURES.map((item) => <button key={item.id} type="button" className={feature === item.id ? 'active' : ''} aria-pressed={feature === item.id} onClick={() => switchFeature(item.id)}>{t(item.labelKey)}</button>)}</nav>
      {feature === 'weight' && <>
        <WeightChart measurements={visibleMeasurements} language={language} span={chartSpan} onSpanChange={setChartSpan} profile={store.profile} onBmiZonesChange={changeBmiZones} t={t} />
        <Summary measurements={weightMeasurements} visibleMeasurements={visibleMeasurements} span={chartSpan} language={language} profile={store.profile} t={t} />
        <History measurements={weightMeasurements} language={language} onEdit={openEntry} t={t} />
      </>}
      {feature === 'bloodPressure' && <BloodPressureDashboard weeks={bloodPressureWeeks} language={language} onSlot={openEntry} onSelectWeek={openWeek} t={t} />}
    </main>}
    {screen === 'entry' && <main className="entry-screen">
      {feature === 'weight'
        ? <EntryForm key={editing?.id ?? 'new'} editing={editing} measurements={weightMeasurements} onSave={save} onDelete={deleteItem} t={t} />
        : <BloodPressureEntryForm key={editing?.id ?? `${entryPreset?.date}-${entryPreset?.period}`} editing={editing} preset={entryPreset} measurements={bloodPressureMeasurements} onSave={save} onDelete={deleteItem} t={t} />}
      <p className="entry-privacy">{t('privacyBody')}</p>
    </main>}
    {screen === 'profile' && <main className="entry-screen">
      <ProfileForm profile={store.profile} onSave={saveProfile} t={t} />
    </main>}
    {screen === 'settings' && <main className="settings-screen">
      <Settings language={language} onLanguage={changeLanguage} profile={store.profile} onProfile={() => showScreen('profile')} onBackup={() => downloadText(filename('json'), JSON.stringify(createBackup(store), null, 2), 'application/json')} onCsv={() => downloadText(filename('csv'), weightCsv(measurements), 'text/csv;charset=utf-8')} onCsvImport={importCsv} onRestore={restore} onLoadDemo={import.meta.env.DEV ? loadDemo : undefined} onClearAll={clearAll} t={t} />
    </main>}
    {screen === 'bpWeek' && <main>{bloodPressureWeeks.find((week) => week.start === selectedWeek) && <BloodPressureWeek week={bloodPressureWeeks.find((week) => week.start === selectedWeek)} language={language} onSlot={openEntry} t={t} detailed />}</main>}
    <footer className="app-version">Health Tracker · v{packageJson.version} · {new Date().getFullYear()}</footer>
  </>
}
