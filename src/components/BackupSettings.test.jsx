import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { translate } from '../i18n.js'
import { formatDate } from '../utils/date.js'
import { BackupSettings } from './BackupSettings.jsx'

function render(language = 'en') {
  return renderToStaticMarkup(<BackupSettings
    language={language}
    backupStatus={{ kind: 'current', lastBackupAt: '2026-09-01T12:00:00Z', measurementCount: 3, changedCount: 0 }}
    backupInterval={14}
    onBackupInterval={() => {}}
    t={(key, values) => translate(language, key, values)}
  />)
}

describe('BackupSettings', () => {
  it.each(['en', 'es', 'de', 'fr'])('renders localized status and interval in %s', (language) => {
    const html = render(language)
    expect(html).toContain(translate(language, 'backupStatus'))
    expect(html).toContain(translate(language, 'backupInterval'))
    expect(html).toContain('<option value="14" selected="">')
  })

  it.each(['en', 'es', 'de', 'fr'])('uses singular status wording for one newer change in %s', (language) => {
    const html = renderToStaticMarkup(<BackupSettings
      language={language}
      backupStatus={{ kind: 'changed', lastBackupAt: '2026-09-01T12:00:00Z', measurementCount: 3, changedCount: 1 }}
      backupInterval={14} onBackupInterval={() => {}}
      t={(key, values) => translate(language, key, values)}
    />)
    expect(html).toContain(translate(language, 'backupStatusChangedOne', { date: formatDate('2026-09-01T12:00:00Z', language) }))
  })

  it('identifies a development preview and offers a return to real status', () => {
    const html = renderToStaticMarkup(<BackupSettings
      language="en"
      backupStatus={{ kind: 'current', lastBackupAt: '2026-09-01T12:00:00Z', measurementCount: 3, changedCount: 0 }}
      backupInterval={14} onBackupInterval={() => {}} preview="current" onEndPreview={() => {}}
      t={(key, values) => translate('en', key, values)}
    />)
    expect(html).toContain('Development preview: Up to date')
    expect(html).toContain('Return to real status')
  })
})
