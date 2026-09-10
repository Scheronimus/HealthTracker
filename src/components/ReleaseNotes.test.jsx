import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { translate } from '../i18n.js'
import { ReleaseNotes } from './ReleaseNotes.jsx'

describe('ReleaseNotes', () => {
  it.each(['en', 'es', 'de', 'fr'])('renders localized, accessible v1.5.1 notes in %s', (language) => {
    const html = renderToStaticMarkup(<ReleaseNotes onDismiss={() => {}} t={(key) => translate(language, key)} />)
    expect(html).toContain('aria-labelledby="release-notes-title"')
    expect(html).toContain(translate(language, 'releaseTitle'))
    expect(translate(language, 'releaseTitle')).toBe('Health Tracker 1.5.1')
    expect(html).toContain(translate(language, 'releaseHeaderActions'))
    expect(html).toContain(translate(language, 'releaseNoticePlacement'))
    expect(html).toContain(translate(language, 'dismissReleaseNotes'))
  })
})
