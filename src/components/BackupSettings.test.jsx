import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { translate } from '../i18n.js'
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
})
