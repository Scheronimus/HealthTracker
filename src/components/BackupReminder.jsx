import { formatDate } from '../utils/date.js'

export function BackupReminder({ status, language, onBackup, onSnooze, preview, onEndPreview, t }) {
  const visible = ['never', 'due', 'overdue', 'downloaded'].includes(status.kind)
  if (!visible && !preview) return null

  return <div className={`backup-reminder-wrap ${preview ? 'is-preview' : ''}`}>
    {preview && <div className="backup-preview-bar"><span>{t('backupPreviewActive', { state: t(`backupState_${preview}`) })}</span><button type="button" onClick={onEndPreview}>{t('backupPreviewReset')}</button></div>}
    {visible && <aside className={`backup-reminder card backup-reminder-${status.kind}`} aria-labelledby="backup-reminder-title">
      <div className="backup-reminder-icon" aria-hidden="true">⇩</div>
      <div className="backup-reminder-copy">
        <h2 id="backup-reminder-title">{status.kind === 'never' ? t('backupFirstTitle') : status.kind === 'downloaded' ? t('backupDownloadedTitle') : t('backupReminderTitle')}</h2>
        <p>{reminderMessage(status, language, t)}</p>
      </div>
      {status.kind !== 'downloaded' && <div className="backup-reminder-actions">
        <button className="primary" type="button" onClick={onBackup}>{t('downloadBackup')}</button>
        <button type="button" onClick={onSnooze}>{t('backupRemindLater')}</button>
      </div>}
    </aside>}
  </div>
}

function reminderMessage(status, language, t) {
  if (status.kind === 'never') return t('backupFirstBody', { count: status.measurementCount })
  if (status.kind === 'downloaded') return t('backupDownloadedBody')
  const prefix = status.kind === 'overdue' ? 'backupOverdueBody' : 'backupDueBody'
  return t(status.changedCount === 1 ? `${prefix}One` : prefix, {
    date: formatDate(status.lastBackupAt, language),
    count: status.changedCount,
  })
}
