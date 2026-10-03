import AxeBuilder from '@axe-core/playwright'
import { test, expect, populatedStore, store, weight, openSettings } from './fixtures.mjs'

async function scan(page, testInfo, state) {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
  await testInfo.attach(`${state}-axe`, { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' })
  expect(result.violations, `${state}: ${JSON.stringify(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })))}`).toEqual([])
}

for (const language of ['en', 'es', 'de', 'fr']) for (const theme of ['light', 'dark']) {
  test(`accessible dashboard, BMI popover, and entry: ${language}/${theme}`, async ({ page, app }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await app({ language, theme })
    await scan(page, testInfo, 'dashboard')
    await page.locator('.weight-bmi-info summary').click()
    await expect(page.locator('.weight-bmi-popover')).toBeVisible()
    await scan(page, testInfo, 'bmi-popover')
    await page.locator('.weight-bmi-info summary').press('Escape')
    await page.locator('.add-entry-button').click()
    await scan(page, testInfo, 'entry')
  })
}

for (const theme of ['light', 'dark']) {
  test(`accessible empty state, settings, and profile: ${theme}`, async ({ page, app }, testInfo) => {
    await app({ data: store([], { showBmi: false }), theme })
    await scan(page, testInfo, 'empty')
    await openSettings(page)
    await scan(page, testInfo, 'settings')
    await page.getByRole('button', { name: /Profile Optional personal details/ }).click()
    await scan(page, testInfo, 'profile')
  })
}

test('all BMI band badges have AA text contrast in both themes and reuse chart semantic colors', async ({ page, app }) => {
  await app()
  for (const theme of ['light', 'dark']) for (const [bmi, band] of [
    [17, 'bmiBelow'], [22, 'bmiWithin'], [28, 'bmiAbove'], [32, 'bmiClass1'], [37, 'bmiClass2'], [42, 'bmiClass3'],
  ]) {
    const data = populatedStore()
    data.measurements = [weight('2026-10-01', bmi * (1.72 ** 2))]
    await page.evaluate(({ data, theme }) => {
      localStorage.setItem('health-tracker-data', JSON.stringify(data))
      localStorage.setItem('health-tracker-theme', theme)
    }, { data, theme })
    await page.reload()
    await expect(page.locator('.weight-bmi-value')).toHaveClass(`weight-bmi-value ${band}`)
    const colors = await page.locator('.weight-bmi-value').evaluate((element) => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 1
      const context = canvas.getContext('2d')
      const rgb = (color) => {
        context.fillStyle = color
        context.fillRect(0, 0, 1, 1)
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3)
      }
      const style = getComputedStyle(element)
      return { foreground: rgb(style.color), background: rgb(style.backgroundColor), semantic: style.getPropertyValue('--bmi-color').trim() }
    })
    const luminance = (channels) => {
      const linear = channels.map((channel) => { const value = channel / 255; return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4 })
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
    }
    const light = luminance(colors.foreground), dark = luminance(colors.background)
    expect((Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05)).toBeGreaterThanOrEqual(4.5)
    await page.getByRole('switch', { name: 'BMI zones' }).check()
    const chartColor = await page.locator(`.bmi-swatch.${band}`).evaluate((element) => getComputedStyle(element).getPropertyValue('--bmi-color').trim())
    expect(colors.semantic).toBe(chartColor)
  }
})
