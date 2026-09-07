import { describe, expect, it } from 'vitest'
import { translate } from './i18n.js'

describe('v1.3 interface translations', () => {
  it.each(['en', 'es', 'de', 'fr'])('provides future-measurement and appearance text in %s', (language) => {
    for (const key of ['futureMeasurement', 'futureMeasurementLabel', 'latestWeightHint', 'theme', 'themeSystem', 'themeLight', 'themeDark']) {
      expect(translate(language, key, { weight: '79.6' })).not.toBe(key)
    }
  })
})
