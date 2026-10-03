import { test, expect, NOW, store, weight, bloodPressure, readStore, openSettings, addWeight } from './fixtures.mjs'
import { productionServer } from './production-server.mjs'

const backup = (data) => ({ kind: 'health-tracker-backup', formatVersion: 1, exportedAt: NOW, data })
async function upload(page, content) {
  await page.locator('input[type=file]').setInputFiles({ name: 'test-backup.json', mimeType: 'application/json', buffer: Buffer.from(content) })
}

test('downloaded backup round-trips through the UI without replacing edited records', async ({ page, app }) => {
  await app()
  const before = await readStore(page)
  await openSettings(page)
  const downloaded = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download backup', exact: true }).click()
  const file = await downloaded
  expect(file.suggestedFilename()).toBe('health-tracker-2026-10-03.json')
  const stream = await file.createReadStream()
  let text = ''
  for await (const chunk of stream) text += chunk.toString()
  const exported = JSON.parse(text)
  expect(exported.data).toEqual(before)
  expect(exported.exportedAt).toBe(NOW)
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await addWeight(page, { date: '2026-10-02', value: 80.5 })
  await page.locator('.entry-link').nth(1).click()
  await page.getByRole('spinbutton').fill('81.2')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  const updated = await readStore(page)
  await openSettings(page)
  page.once('dialog', (dialog) => dialog.accept())
  await upload(page, text)
  await expect(page.getByRole('status')).toContainText('Restore complete')
  expect(await readStore(page)).toEqual(updated)
})

test('restore merges missing records, keeps local IDs/profile/Blood Pressure, and skips future records', async ({ page, app }) => {
  const local = store([weight('2026-10-01', 81, 'collision-weight'), bloodPressure], { name: 'Local' })
  await app({ data: local })
  await openSettings(page)
  const imported = store([
    weight('2026-10-01', 99, 'collision-weight'), weight('2026-09-15', 83, 'new-backup-weight'),
    weight('2026-10-04', 80, 'future-backup-weight'), { ...bloodPressure, systolicMmHg: 140 },
  ], { name: 'Imported' })
  page.once('dialog', (dialog) => dialog.accept())
  await upload(page, JSON.stringify(backup(imported)))
  await expect(page.getByRole('status')).toContainText('Restore complete')
  // The confirmation render can precede the storage effect, especially in WebKit.
  await expect.poll(async () => (await readStore(page)).measurements.length).toBe(3)
  const restored = await readStore(page)
  expect(restored.measurements).toHaveLength(3)
  expect(restored.measurements).toContainEqual(local.measurements[0])
  expect(restored.measurements).toContainEqual(bloodPressure)
  expect(restored.measurements.some(({ id }) => id === 'future-backup-weight')).toBe(false)
  expect(restored.profile).toEqual(local.profile)
})

test('invalid backup variants and cancelled restore leave storage unchanged', async ({ page, app }) => {
  await app()
  const before = await readStore(page)
  await openSettings(page)
  for (const text of [
    '{broken', JSON.stringify(backup({ ...before, schemaVersion: 999 })),
    JSON.stringify(backup({ ...before, measurements: [before.measurements[0], before.measurements[0]] })),
    JSON.stringify(backup({ ...before, measurements: [{ ...before.measurements[0], unit: 'lb' }] })),
    JSON.stringify(backup({ ...before, measurements: [{ ...before.measurements[0], timestamp: 'invalid-date' }] })),
  ]) {
    await upload(page, text)
    await expect(page.getByRole('status')).toHaveText('That file is not a valid Health Tracker backup.')
    expect(await readStore(page)).toEqual(before)
  }
  page.once('dialog', (dialog) => dialog.dismiss())
  await upload(page, JSON.stringify(backup(store([weight('2026-10-02', 80)]))))
  expect(await readStore(page)).toEqual(before)
})

test('legacy store migrates in the browser and keeps original measurement timestamps', async ({ page, app }) => {
  const legacy = { schemaVersion: 1, measurements: [weight('2026-09-01', 85)] }
  await app({ data: legacy })
  const saved = await readStore(page)
  expect(saved.schemaVersion).toBe(6)
  expect(saved.measurements).toEqual(legacy.measurements)
  await expect(page.locator('.weight-hero strong')).toHaveText('85.0 kg')
  await page.reload()
  expect((await readStore(page)).measurements).toEqual(legacy.measurements)
})

test('production service worker reloads offline and retains offline edits after reconnect', async ({ page, context, app }) => {
  const requests = []
  page.on('request', (request) => requests.push(request.url()))
  const origin = await productionServer()
  try {
    await app({ data: store([weight('2026-10-01', 81), bloodPressure]), url: origin.url })
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), { timeout: 30_000 }).toBe(true)
    expect(await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)).toBe(origin.url)
    const manifestUrl = await page.locator('link[rel=manifest]').getAttribute('href')
    const manifest = await (await context.request.get(new URL(manifestUrl, page.url()).href)).json()
    expect(manifest.scope).toBe('/HealthTracker/')
    expect(manifest.start_url).toBe('/HealthTracker/')
    await origin.stop()
    // Negative control: raw HTTP cannot reach the origin; the browser must use its cache.
    await expect(context.request.get(origin.url, { timeout: 2000 })).rejects.toThrow()
    await page.reload()
    await expect(page.locator('.weight-hero strong')).toHaveText('81.0 kg')
    await addWeight(page, { date: '2026-10-02', value: 80.5, note: 'Saved offline' })
    await page.reload()
    await expect(page.locator('.entry-link').first()).toContainText('Saved offline')
    await origin.start()
    await page.reload()
    await expect(page.locator('.weight-hero strong')).toHaveText('80.5 kg')
    expect((await readStore(page)).measurements).toContainEqual(bloodPressure)
    expect(requests.filter((url) => /^https?:/.test(url)).every((url) => new URL(url).origin === new URL(origin.url).origin)).toBe(true)
    await openSettings(page)
    await expect(page.locator('.debug-section')).toHaveCount(0)
  } finally { await origin.stop() }
})

test('appearance and language persist; System follows emulated device theme', async ({ page, app }) => {
  await app()
  await openSettings(page)
  await page.getByRole('combobox', { name: /^Appearance/ }).selectOption('system')
  await page.emulateMedia({ colorScheme: 'dark' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.emulateMedia({ colorScheme: 'light' })
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('combobox', { name: /^Appearance/ }).selectOption('dark')
  await page.getByRole('combobox', { name: /^Language/ }).selectOption('fr')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('.weight-hero > span')).toHaveText('Poids actuel')
})
