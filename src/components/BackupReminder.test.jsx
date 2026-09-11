import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { translate } from '../i18n.js'
import { formatDate } from '../utils/date.js'
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

  it('connects both actions for first and recurring reminders', () => {
    for (const kind of ['never', 'due']) {
      const onBackup = vi.fn()
      const onSnooze = vi.fn()
      const tree = BackupReminder({
        status: { kind, lastBackupAt: '2026-09-01T12:00:00Z', measurementCount: 4, changedCount: 2 },
        language: 'en', onBackup, onSnooze, preview: null, onEndPreview: () => {},
        t: (key, values) => translate('en', key, values),
      })
      const actions = tree.props.children[1].props.children[2]
      actions.props.children[0].props.onClick()
      actions.props.children[1].props.onClick()
      expect(onBackup).toHaveBeenCalledOnce()
      expect(onSnooze).toHaveBeenCalledOnce()
    }
  })

  it.each(['en', 'es', 'de', 'fr'])('uses singular wording for one newer change in %s', (language) => {
    const html = renderToStaticMarkup(<BackupReminder
      status={{ kind: 'due', lastBackupAt: '2026-09-01T12:00:00Z', measurementCount: 4, changedCount: 1 }}
      language={language} onBackup={() => {}} onSnooze={() => {}} preview={null} onEndPreview={() => {}}
      t={(key, values) => translate(language, key, values)}
    />)
    expect(html).toContain(translate(language, 'backupDueBodyOne', { date: formatDate('2026-09-01T12:00:00Z', language) }))
  })
})
