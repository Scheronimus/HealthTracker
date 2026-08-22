import { useRef, useState } from 'react'
import { languageNames } from '../i18n.js'

export function Settings({ language, onLanguage, onProfile, profile, onBackup, onCsv, onCsvImport, onRestore, onLoadDemo, onClearAll, t }) {
  const backupInput = useRef(null)
  const csvInput = useRef(null)
  const [message, setMessage] = useState('')

  async function chooseBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try { setMessage(await onRestore(await file.text())) } catch { setMessage(t('invalidBackup')) }
    event.target.value = ''
  }

  async function chooseCsv(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try { setMessage(await onCsvImport(await file.text())) } catch (error) { setMessage(t('invalidCsv', { line: error.line ?? '?' })) }
    event.target.value = ''
  }

  async function loadDemo() {
    setMessage(t('demoLoading'))
    setMessage(await onLoadDemo())
  }

  function clearAll() {
    const result = onClearAll()
    if (result) setMessage(result)
  }

  return <section className="settings-panel card">
    <button className="profile-link" type="button" onClick={onProfile}><span><strong>{t('profile')}</strong><small>{profile.name || t('profileOptionalShort')}</small></span><b aria-hidden="true">›</b></button>
    <label>{t('language')}<select value={language} onChange={(event) => onLanguage(event.target.value)}>{Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
    <div className="settings-section">
      <h2>{t('settings')}</h2>
      <div className="data-actions">
        <button onClick={onBackup}>{t('backup')}</button>
        <button onClick={onCsv}>{t('csv')}</button>
        <button onClick={() => csvInput.current?.click()}>{t('importCsv')}</button>
        <input ref={csvInput} hidden type="file" accept="text/csv,.csv" onChange={chooseCsv} />
        <button onClick={() => backupInput.current?.click()}>{t('restore')}</button>
        <input ref={backupInput} hidden type="file" accept="application/json,.json" onChange={chooseBackup} />
      </div>
      {message && <p className="status" role="status">{message}</p>}
      <p className="hint">{t('dataHint')}</p>
    </div>
    {import.meta.env.DEV && <div className="debug-section">
      <strong>{t('debugTools')}</strong>
      <div className="debug-actions">
        <button className="debug-load-button" type="button" onClick={loadDemo}>{t('loadDemo')}</button>
        <button className="debug-delete-button" type="button" onClick={clearAll}>{t('clearAll')}</button>
      </div>
    </div>}
    <aside className="settings-privacy"><strong>⌂ {t('privacyTitle')}</strong><p>{t('privacyBody')}</p></aside>
    <p className="settings-offline">● {t('install')}</p>
  </section>
}
