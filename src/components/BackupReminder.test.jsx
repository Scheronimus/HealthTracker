import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { translate } from '../i18n.js'
import { BackupReminder } from './BackupReminder.jsx'

function render(kind, language = 'en', preview = null) {
  return renderToStaticMarkup(<BackupReminder
    status={{ kind, lastBackupAt: '2026-09-01T12:00:00Z', measurementCount: 4, changedCount: 2 }}
    language={language}
    onBackup={() => {}}
    onSnooze={() => {}}
    preview={preview}
    onEndPreview={() => {}}
    t={(key, values) => translate(language, key, values)}
  />)
}

describe('BackupReminder', () => {
  it.each(['en', 'es', 'de', 'fr'])('renders localized direct actions in %s', (language) => {
    const html = render('due', language)
    expect(html).toContain(translate(language, 'backupReminderTitle'))
    expect(html).toContain(translate(language, 'downloadBackup'))
    expect(html).toContain(translate(language, 'backupRemindLater'))
  })

  it('uses a stronger non-error treatment when overdue', () => {
    expect(render('overdue')).toContain('backup-reminder-overdue')
  })

  it('hides non-actionable real states but identifies development previews', () => {
    expect(render('current')).toBe('')
    const preview = render('current', 'en', 'current')
    expect(preview).toContain('Development preview')
    expect(preview).toContain('Return to real status')
  })

  it('confirms download initiation without claiming successful storage', () => {
    const html = render('downloaded')
    expect(html).toContain('Backup download started')
    expect(html).not.toContain('Remind me')
  })
})
