import { BACKUP_INTERVALS } from '../utils/backupReminder.js'
import { formatDate } from '../utils/date.js'

export function BackupSettings({ language, backupStatus, backupInterval, onBackupInterval, preview, onEndPreview, t }) {
  return <section className="settings-panel backup-settings-panel card">
    {preview && <div className="backup-preview-bar"><span>{t('backupPreviewActive', { state: t(`backupState_${preview}`) })}</span><button type="button" onClick={onEndPreview}>{t('backupPreviewReset')}</button></div>}
    <div className="settings-section">
      <h2>{t('backupStatus')}</h2>
      <p className="data-intro">{backupStatusText(backupStatus, language, t)}</p>
      <label>{t('backupInterval')}<select value={backupInterval} onChange={(event) => onBackupInterval(event.target.value)}>{BACKUP_INTERVALS.map((days) => <option key={days} value={days}>{t('backupEveryDays', { days })}</option>)}</select></label>
    </div>
  </section>
}

function backupStatusText(status, language, t) {
  if (!status.lastBackupAt) return status.measurementCount ? t('backupStatusNever') : t('backupStatusEmpty')
  const date = formatDate(status.lastBackupAt, language)
  if (status.changedCount > 0) return t(status.changedCount === 1 ? 'backupStatusChangedOne' : 'backupStatusChanged', { date, count: status.changedCount })
  return t('backupStatusCurrent', { date })
}
