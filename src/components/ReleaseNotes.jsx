export function ReleaseNotes({ onDismiss, t }) {
  return <aside className="release-notes card" aria-labelledby="release-notes-title">
    <div>
      <p className="release-eyebrow">{t('whatsNew')}</p>
      <h2 id="release-notes-title">{t('releaseTitle')}</h2>
      <ul>
        <li>{t('releaseBackupReminders')}</li>
        <li>{t('releaseBackupSettings')}</li>
      </ul>
    </div>
    <button type="button" onClick={onDismiss} aria-label={t('dismissReleaseNotes')}>{t('close')}</button>
  </aside>
}
