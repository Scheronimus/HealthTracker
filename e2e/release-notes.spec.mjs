import AxeBuilder from '@axe-core/playwright'
import { test, expect, readStore } from './fixtures.mjs'
import { translate } from '../src/i18n.js'

for (const language of ['en', 'es', 'de', 'fr']) {
  test(`v1.8.0 notice is localized, accessible, dashboard-only, and dismisses persistently: ${language}`, async ({ page, app }) => {
    await app({ language, seenRelease: '1.7.1' })
    const before = await readStore(page)
    const notice = page.locator('.release-notes')
    await expect(notice.getByRole('heading')).toHaveText('Health Tracker 1.8.0')
    await expect(notice.locator('li')).toHaveText([
      'releaseWeightOverview', 'releaseWeightPeriods', 'releaseWeightBmi', 'releaseCompatibility',
    ].map((key) => translate(language, key)))
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
    expect(result.violations).toEqual([])
    await page.locator('.add-entry-button').click()
    await expect(notice).toHaveCount(0)
    await page.getByRole('button', { name: translate(language, 'cancel'), exact: true }).click()
    await expect(notice).toBeVisible()
    await notice.getByRole('button', { name: translate(language, 'dismissReleaseNotes'), exact: true }).click()
    await page.reload()
    await expect(notice).toHaveCount(0)
    expect(await page.evaluate(() => localStorage.getItem('health-tracker-last-seen-release'))).toBe('1.8.0')
    expect(await readStore(page)).toEqual(before)
  })
}
