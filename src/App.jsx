import { useState } from 'react'
import { EntryForm } from './components/EntryForm.jsx'
import { History } from './components/History.jsx'
import { Settings } from './components/Settings.jsx'
import { Summary } from './components/Summary.jsx'
import { createBackup, mergeRestore, parseBackup, weightCsv } from './data/transfer.js'
import { loadLanguage, saveLanguage } from './data/storage.js'
import { useHealthData } from './hooks/useHealthData.js'
import { translate } from './i18n.js'
import { downloadText } from './utils/download.js'
import './App.css'

export default function App() {
  const [language, setLanguage] = useState(loadLanguage)
  const [editing, setEditing] = useState(null)
  const { store, setStore, measurements, add, update, remove } = useHealthData()
  const t = (key, values) => translate(language, key, values)
  function changeLanguage(next) { setLanguage(next); saveLanguage(next) }
  function save(item) { editing ? update(item) : add(item); setEditing(null) }
  function deleteItem(id) { if (confirm(t('deleteConfirm'))) { remove(id); if (editing?.id === id) setEditing(null) } }
  function filename(extension) { return `health-tracker-${new Date().toISOString().slice(0, 10)}.${extension}` }
  function restore(text) {
    const imported = parseBackup(text)
    if (!confirm(t('restoreConfirm'))) return ''
    const result = mergeRestore(store, imported)
    setStore(result.data)
    return t('restoreDone', result)
  }
  return <>
    <header><div className="brand"><img src={`${import.meta.env.BASE_URL}app-icon.svg`} alt="" /><div><h1>{t('appName')}</h1><p>{t('tagline')}</p></div></div></header>
    <main>
      <aside className="privacy"><strong>⌂ {t('privacyTitle')}</strong><span>{t('privacyBody')}</span></aside>
      <Summary measurements={measurements} t={t} />
      <div className="layout"><EntryForm key={editing?.id ?? 'new'} editing={editing} onSave={save} onCancel={() => setEditing(null)} t={t} /><History measurements={measurements} language={language} onEdit={setEditing} onDelete={deleteItem} t={t} /></div>
      <Settings language={language} onLanguage={changeLanguage} onBackup={() => downloadText(filename('json'), JSON.stringify(createBackup(store), null, 2), 'application/json')} onCsv={() => downloadText(filename('csv'), weightCsv(measurements), 'text/csv;charset=utf-8')} onRestore={restore} t={t} />
      <p className="offline-note">● {t('install')}</p>
    </main>
    <footer>Health Tracker · {new Date().getFullYear()}</footer>
  </>
}
