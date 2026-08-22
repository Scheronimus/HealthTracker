import { useRef, useState } from 'react'
import { languageNames } from '../i18n.js'

export function Settings({ language, onLanguage, onBackup, onCsv, onRestore, t }) {
  const input = useRef(null)
  const [message, setMessage] = useState('')

  async function choose(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try { setMessage(await onRestore(await file.text())) } catch { setMessage(t('invalidBackup')) }
    event.target.value = ''
  }

  return <section className="settings-panel card">
    <label>{t('language')}<select value={language} onChange={(event) => onLanguage(event.target.value)}>{Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
    <div className="settings-section">
      <h2>{t('settings')}</h2>
      <div className="data-actions">
        <button onClick={onBackup}>{t('backup')}</button>
        <button onClick={onCsv}>{t('csv')}</button>
        <button onClick={() => input.current?.click()}>{t('restore')}</button>
        <input ref={input} hidden type="file" accept="application/json,.json" onChange={choose} />
      </div>
      {message && <p className="status" role="status">{message}</p>}
      <p className="hint">{t('dataHint')}</p>
    </div>
    <aside className="settings-privacy"><strong>⌂ {t('privacyTitle')}</strong><p>{t('privacyBody')}</p></aside>
    <p className="settings-offline">● {t('install')}</p>
  </section>
}
