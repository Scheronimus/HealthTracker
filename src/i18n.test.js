import { describe, expect, it } from 'vitest'
import { translate, translations } from './i18n.js'

describe('interface translations', () => {
  it.each(['en', 'es', 'de', 'fr'])('provides future-measurement and appearance text in %s', (language) => {
    for (const key of ['futureMeasurement', 'futureMeasurementLabel', 'latestWeightHint', 'theme', 'themeSystem', 'themeLight', 'themeDark']) {
      expect(translate(language, key, { weight: '79.6' })).not.toBe(key)
    }
  })

  it.each(['en', 'es', 'de', 'fr'])('keeps the Health Tracker product name in shared text in %s', (language) => {
    expect(translate(language, 'shareAppText')).toContain('Health Tracker')
  })
})

describe('translation contract', () => {
  const languages = ['en', 'es', 'de', 'fr']
  const placeholders = (text) => [...text.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]).sort()

  it.each(languages.slice(1))('matches the English keys and placeholders in %s', (language) => {
    expect(Object.keys(translations[language]).sort()).toEqual(Object.keys(translations.en).sort())
    for (const key of Object.keys(translations.en)) {
      expect(placeholders(translations[language][key]), key).toEqual(placeholders(translations.en[key]))
    }
  })

  it.each(languages)('provides the data and v1.5 release-note wording in %s', (language) => {
    for (const key of ['settings', 'downloadBackup', 'backupHint', 'restore', 'restoreHint', 'backupSensitive', 'whatsNew', 'releaseTitle', 'releaseSharing', 'dismissReleaseNotes']) {
      expect(translate(language, key)).not.toBe(key)
    }
  })

  it('uses Datensicherung consistently in the German recovery workflow', () => {
    for (const key of ['backup', 'downloadBackup', 'restore', 'chooseBackup', 'restoreHint', 'restoreConfirm', 'invalidBackup', 'dataHint', 'backupSensitive']) {
      expect(translate('de', key), key).toContain('Datensicherung')
    }
  })
})
