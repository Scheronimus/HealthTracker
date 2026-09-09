import { useRef, useState } from 'react'
import { languageNames } from '../i18n.js'
import productionQrUrl from '../../docs/production-app-qr.svg?url'
import { deployment } from '../../deployment.config.mjs'
import { shareAppLink } from './shareApp.js'

export function Settings({ language, onLanguage, theme, onTheme, onProfile, profile, onBackup, onRestore, onLoadDemo, onClearAll, t }) {
  const backupInput = useRef(null)
  const [message, setMessage] = useState('')
  const [shareMessage, setShareMessage] = useState('')

  async function chooseBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try { setMessage(await onRestore(await file.text())) } catch { setMessage(t('invalidBackup')) }
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

  async function shareApp() {
    setShareMessage('')
    const result = await shareAppLink(navigator, { title: t('appName'), text: t('shareAppText'), url: deployment.productionUrl })
    if (result === 'copied') setShareMessage(t('shareAppCopied'))
    if (result === 'unavailable') setShareMessage(t('shareAppUnavailable'))
  }

  return <section className="settings-panel card">
    <button className="profile-link" type="button" onClick={onProfile}><span><strong>{t('profile')}</strong><small>{profile.name || t('profileOptionalShort')}</small></span><b aria-hidden="true">›</b></button>
    <label>{t('language')}<select value={language} onChange={(event) => onLanguage(event.target.value)}>{Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
    <label>{t('theme')}<select value={theme} onChange={(event) => onTheme(event.target.value)}><option value="system">{t('themeSystem')}</option><option value="light">{t('themeLight')}</option><option value="dark">{t('themeDark')}</option></select></label>
    <div className="settings-section">
      <h2>{t('settings')}</h2>
      <p className="data-intro">{t('dataHint')}</p>
      <div className="backup-actions">
        <div className="backup-action">
          <div><strong>{t('backup')}</strong><p>{t('backupHint')}</p></div>
          <button className="primary" type="button" onClick={onBackup}>{t('downloadBackup')}</button>
        </div>
        <div className="backup-action">
          <div><strong>{t('restore')}</strong><p>{t('restoreHint')}</p></div>
          <button type="button" onClick={() => backupInput.current?.click()}>{t('chooseBackup')}</button>
        <input ref={backupInput} hidden type="file" accept="application/json,.json" onChange={chooseBackup} />
        </div>
      </div>
      {message && <p className="status" role="status">{message}</p>}
      <p className="data-warning">{t('backupSensitive')}</p>
    </div>
    {import.meta.env.DEV && <div className="debug-section">
      <strong>{t('debugTools')}</strong>
      <div className="debug-actions">
        <button className="debug-load-button" type="button" onClick={loadDemo}>{t('loadDemo')}</button>
        <button className="debug-delete-button" type="button" onClick={clearAll}>{t('clearAll')}</button>
      </div>
    </div>}
    <aside className="settings-privacy"><strong>⌂ {t('privacyTitle')}</strong><p>{t('privacyBody')}</p></aside>
    <details className="settings-share">
      <summary>{t('shareApp')}</summary>
      <div>
        <p>{t('shareAppHint')}</p>
        <img src={productionQrUrl} alt={t('shareAppQrAlt')} width="333" height="333" />
        <button className="primary share-button" type="button" onClick={shareApp}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 15 5c0 .22.02.43.07.64L8.91 9.1A3 3 0 1 0 9 14.85l6.1 3.43A3 3 0 0 0 15 19a3 3 0 1 0 .91-2.15l-6.1-3.43A3 3 0 0 0 10 12c0-.25-.03-.5-.09-.73l6.13-3.45c.52.72 1.23 1.18 1.96 1.18Z" /></svg>
          {t('shareAppButton')}
        </button>
        {shareMessage && <p className="share-status" role="status">{shareMessage}</p>}
        <a href={deployment.productionUrl}>{deployment.productionUrl}</a>
      </div>
    </details>
    <p className="settings-offline">● {t('install')}</p>
  </section>
}
