import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { Settings } from './Settings.jsx'
import { shareAppLink } from './shareApp.js'
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
    onBackupSettings={() => {}}
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

  it.each(['en', 'es', 'de', 'fr'])('keeps advanced backup controls behind a localized navigation row in %s', (language) => {
    const html = renderSettings(language)
    expect(html).toContain(translate(language, 'backupAdvanced'))
    expect(html).toContain(translate(language, 'backupAdvancedHint'))
    expect(html).not.toContain('<select value="14"')
  })
})

describe('Settings app sharing', () => {
  it.each(['en', 'es', 'de', 'fr'])('renders a localized share button below the QR code in %s', (language) => {
    const html = renderSettings(language)
    expect(html.indexOf('production-app-qr.svg')).toBeLessThan(html.indexOf(translate(language, 'shareAppButton')))
    expect(html).toContain(`>${translate(language, 'shareAppButton')}</button>`)
  })

  it('uses native sharing with the supplied public-app payload', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const payload = { title: 'Health Tracker', text: 'Open Health Tracker.', url: 'https://example.com/HealthTracker/' }
    await expect(shareAppLink({ share }, payload)).resolves.toBe('shared')
    expect(share).toHaveBeenCalledWith(payload)
  })

  it('copies the public URL when native sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const payload = { title: 'Health Tracker', text: 'Open Health Tracker.', url: 'https://example.com/HealthTracker/' }
    await expect(shareAppLink({ clipboard: { writeText } }, payload)).resolves.toBe('copied')
    expect(writeText).toHaveBeenCalledWith(payload.url)
  })

  it('treats cancelling the native share sheet as a normal outcome', async () => {
    const cancellation = new Error('Cancelled')
    cancellation.name = 'AbortError'
    await expect(shareAppLink({ share: vi.fn().mockRejectedValue(cancellation) }, { url: 'https://example.com/' })).resolves.toBe('cancelled')
  })
})
