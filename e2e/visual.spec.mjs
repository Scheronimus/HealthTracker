import { test, expect, store } from './fixtures.mjs'

// CI uses Windows + pinned Chromium, matching the reviewed local goldens.
test.skip(process.platform !== 'win32', 'Visual baselines use the canonical Windows runner; functional tests are portable.')

async function capture(page, name) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page).toHaveScreenshot(name, { fullPage: true })
}

for (const language of ['en', 'es', 'de', 'fr']) for (const theme of ['light', 'dark']) {
  test(`Weight mobile ${language} ${theme}`, async ({ page, app }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await app({ language, theme })
    await capture(page, `weight-mobile-${language}-${theme}.png`)
  })
}

for (const theme of ['light', 'dark']) {
  for (const width of [320, 1024]) {
    test(`Weight ${width}px ${theme}`, async ({ page, app }) => {
      await page.setViewportSize({ width, height: 800 })
      await app({ theme, language: 'fr' })
      await capture(page, `weight-${width}-${theme}.png`)
    })
  }
  test(`Weight empty ${theme}`, async ({ page, app }) => {
    await app({ data: store([], { showBmi: false }), theme })
    await capture(page, `weight-empty-${theme}.png`)
  })
  test(`Weight selected tooltip ${theme}`, async ({ page, app }) => {
    await app({ theme })
    await page.getByRole('slider').focus()
    await page.getByRole('slider').press('End')
    await expect(page.locator('.chart-tooltip')).toBeVisible()
    await capture(page, `weight-tooltip-${theme}.png`)
  })
  test(`Weight expanded settings and history ${theme}`, async ({ page, app }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await app({ theme, language: 'de' })
    await page.locator('.graph-settings-button').click()
    await page.locator('.history > summary').click()
    await capture(page, `weight-expanded-${theme}.png`)
  })
  test(`Weight average and visible BMI legend ${theme}`, async ({ page, app }) => {
    await app({ theme })
    await page.locator('.graph-settings-button').click()
    await page.getByRole('switch', { name: 'Average', exact: true }).check()
    await page.getByRole('switch', { name: 'BMI zones', exact: true }).check()
    await page.locator('.graph-settings-button').click()
    await page.getByRole('slider').focus()
    await page.getByRole('slider').press('End')
    await capture(page, `weight-average-${theme}.png`)
  })
  test(`Weight BMI popover ${theme}`, async ({ page, app }) => {
    await app({ theme })
    await page.locator('.weight-bmi-info summary').click()
    await expect(page.locator('.weight-bmi-popover')).toBeVisible()
    await capture(page, `weight-bmi-popover-${theme}.png`)
  })
}
