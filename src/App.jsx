import { useState } from 'react'
import packageJson from '../package.json'
import { ProfileForm } from './components/ProfileForm.jsx'
import { Settings } from './components/Settings.jsx'
import { createBackup, mergeHealthImport, mergeRestore, parseBackup, parseHealthImportCsv } from './data/transfer.js'
import { loadLanguage, saveLanguage } from './data/storage.js'
import { useHealthData } from './hooks/useHealthData.js'
import { translate } from './i18n.js'
import { downloadText } from './utils/download.js'
import { MODULES_BY_ID } from './modules/registry.jsx'
import './App.css'

export default function App() {
  const [language, setLanguage] = useState(loadLanguage)
  const { store, setStore, measurements, add, update, remove } = useHealthData()
  const [screen, setScreen] = useState('dashboard')
  const [feature, setFeature] = useState(() => store.profile.modules[0])
  const [editing, setEditing] = useState(null)
  const [entryPreset, setEntryPreset] = useState(null)
  const [moduleStates, setModuleStates] = useState({})
  const activeModule = MODULES_BY_ID[feature]
  const moduleMeasurements = measurements.filter(({ type }) => type === activeModule.measurementType)
  const moduleState = moduleStates[feature] ?? activeModule.initialState
  const visibleModules = store.profile.modules.map((id) => MODULES_BY_ID[id]).filter(Boolean)
  const ActiveDashboard = activeModule.Dashboard
  const ActiveEntryForm = activeModule.EntryForm
  const csvExportModule = visibleModules.find((module) => module.csv?.export)
  const t = (key, values) => translate(language, key, values)
  function changeLanguage(next) { setLanguage(next); saveLanguage(next) }
  function showScreen(next) { setScreen(next); window.scrollTo(0, 0) }
  function setActiveModuleState(next) { setModuleStates((current) => ({ ...current, [feature]: next })) }
  function openEntry(item = null, preset = null) { setEditing(item); setEntryPreset(preset); showScreen('entry') }
  function closeEntry() { setEditing(null); setEntryPreset(null); showScreen('dashboard') }
  function saveProfile(profile) { setStore((current) => ({ ...current, profile })); setFeature(profile.modules[0]); showScreen('settings') }
  function save(item) {
    editing ? update(item) : add(item)
    if (activeModule.afterSave) setActiveModuleState(activeModule.afterSave({ item, measurements: moduleMeasurements, state: moduleState }))
    closeEntry()
  }
  function deleteItem(id) {
    if (!confirm(t(activeModule.labels.deleteConfirm))) return
    remove(id)
    closeEntry()
  }
  function filename(extension) { return `health-tracker-${new Date().toISOString().slice(0, 10)}.${extension}` }
  function clearAll() {
    if (!confirm(t('clearAllConfirm'))) return ''
    setStore((current) => ({ ...current, measurements: [] }))
    return t('clearAllDone')
  }
  function switchFeature(next) { setFeature(next); showScreen('dashboard') }
  async function loadDemo() {
    const { createCombinedDemoStore } = await import('./data/demo.js')
    const result = mergeRestore(store, createCombinedDemoStore())
    setStore(result.data)
    return t('demoLoaded', result)
  }
  function importCsv(text) {
    const parsed = parseHealthImportCsv(text)
    if (!confirm(t(parsed.labels.confirm, { count: parsed.measurements.length }))) return ''
    const result = mergeHealthImport(store, parsed)
    setStore(result.data)
    return t(parsed.labels.done, { ...result, skipped: parsed.skipped })
  }  function restore(text) {
    const imported = parseBackup(text)
    if (!confirm(t('restoreConfirm'))) return ''
    const result = mergeRestore(store, imported)
    setStore(result.data)
    if (!result.data.profile.modules.includes(feature)) setFeature(result.data.profile.modules[0])
    return t('restoreDone', result)
  }

  return <>
    <header className="app-header">
      {screen === 'dashboard' && <div className="topbar dashboard-topbar">
        <div className="brand"><img src={`${import.meta.env.BASE_URL}app-icon.svg`} alt="" /><div><h1>{t('appName')}</h1><label className="module-selector"><span className="visually-hidden">{t('healthAreas')}</span><select value={feature} onChange={(event) => switchFeature(event.target.value)}>{visibleModules.map((item) => <option key={item.id} value={item.id}>{t(item.labelKey)}</option>)}</select></label></div></div>
        <div className="dashboard-actions">
          <button className="settings-button" type="button" onClick={() => showScreen('settings')} aria-label={t('menu')} title={t('menu')}>⚙</button>
          <button className="add-entry-button" type="button" onClick={() => openEntry()} aria-label={t(activeModule.labels.add)} title={t(activeModule.labels.add)}>+</button>
        </div>
      </div>}
      {screen === 'entry' && <div className="topbar entry-topbar">
        <button className="header-action" type="button" onClick={closeEntry}>{t('cancel')}</button>
        <h1>{t(editing ? activeModule.labels.edit : activeModule.labels.add)}</h1>
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
    </header>

    {screen === 'dashboard' && <main>
      <ActiveDashboard measurements={moduleMeasurements} language={language} profile={store.profile} state={moduleState} onStateChange={setActiveModuleState} onProfileChange={(profile) => setStore((current) => ({ ...current, profile }))} onEdit={openEntry} t={t} />
    </main>}
    {screen === 'entry' && <main className="entry-screen">
      <ActiveEntryForm key={`${feature}-${editing?.id ?? entryPreset?.date ?? 'new'}-${entryPreset?.slot ?? ''}`} editing={editing} preset={entryPreset} measurements={moduleMeasurements} onSave={save} onDelete={deleteItem} t={t} />
      <p className="entry-privacy">{t('privacyBody')}</p>
    </main>}
    {screen === 'profile' && <main className="entry-screen">
      <ProfileForm profile={store.profile} onSave={saveProfile} t={t} />
    </main>}
    {screen === 'settings' && <main className="settings-screen">
      <Settings language={language} onLanguage={changeLanguage} profile={store.profile} onProfile={() => showScreen('profile')} onBackup={() => downloadText(filename('json'), JSON.stringify(createBackup(store), null, 2), 'application/json')} onCsv={csvExportModule ? () => downloadText(filename('csv'), csvExportModule.csv.export(measurements), 'text/csv;charset=utf-8') : undefined} onCsvImport={importCsv} onRestore={restore} onLoadDemo={import.meta.env.DEV ? loadDemo : undefined} onClearAll={clearAll} t={t} />
    </main>}
    <footer className="app-version">Health Tracker · v{packageJson.version} · {new Date().getFullYear()}</footer>
  </>
}
