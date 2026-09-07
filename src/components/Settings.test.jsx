import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Settings } from './Settings.jsx'

describe('Settings appearance preference', () => {
  it('renders system, light, and dark choices with the saved selection', () => {
    const html = renderToStaticMarkup(<Settings
      language={'en'}
      onLanguage={() => {}}
      theme={'dark'}
      onTheme={() => {}}
      profile={{ name: '' }}
      onProfile={() => {}}
      onBackup={() => {}}
      onCsvImport={() => {}}
      onRestore={() => {}}
      onClearAll={() => {}}
      t={(key) => key}
    />)
    expect(html).toContain('<option value="system">themeSystem</option>')
    expect(html).toContain('<option value="light">themeLight</option>')
    expect(html).toContain('<option value="dark" selected="">themeDark</option>')
  })
})
