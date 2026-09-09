import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Settings } from './Settings.jsx'
import { translate } from '../i18n.js'

function renderSettings(language = 'en') {
  return renderToStaticMarkup(<Settings
    language={language}
    onLanguage={() => {}}
    theme={'dark'}
    onTheme={() => {}}
    profile={{ name: '' }}
    onProfile={() => {}}
    onBackup={() => {}}
    onRestore={() => {}}
    onClearAll={() => {}}
    t={(key, values) => translate(language, key, values)}
  />)
}

describe('Settings appearance preference', () => {
  it('renders system, light, and dark choices with the saved selection', () => {
    const html = renderSettings()
    expect(html).toContain('<option value="system">Use device setting</option>')
    expect(html).toContain('<option value="light">Light</option>')
    expect(html).toContain('<option value="dark" selected="">Dark</option>')
  })
})

describe('Settings data workflow', () => {
  it.each([
    ['en', 'Data'], ['es', 'Datos'], ['de', 'Daten'], ['fr', 'Données']
  ])('renders backup-first data controls in %s', (language, heading) => {
    const html = renderSettings(language)
    expect(html).toContain(`<h2>${heading}</h2>`)
    expect(html.indexOf(translate(language, 'downloadBackup'))).toBeLessThan(html.indexOf(translate(language, 'chooseBackup')))
    expect(html).toContain(translate(language, 'backupSensitive'))
  })

  it('does not expose CSV controls in production settings', () => {
    const html = renderSettings()
    expect(html).not.toMatch(/CSV|\.csv|text\/csv/i)
  })
})
