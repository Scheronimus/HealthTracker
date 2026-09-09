import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { translate } from '../i18n.js'
import { ReleaseNotes } from './ReleaseNotes.jsx'

describe('ReleaseNotes', () => {
  it.each(['en', 'es', 'de', 'fr'])('renders localized, accessible v1.4 notes in %s', (language) => {
    const html = renderToStaticMarkup(<ReleaseNotes onDismiss={() => {}} t={(key) => translate(language, key)} />)
    expect(html).toContain('aria-labelledby="release-notes-title"')
    expect(html).toContain(translate(language, 'releaseTitle'))
    expect(html).toContain(translate(language, 'dismissReleaseNotes'))
  })
})
