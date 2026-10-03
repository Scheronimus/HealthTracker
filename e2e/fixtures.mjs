import { test as base, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

export const NOW = '2026-10-03T10:00:00.000Z'
export const weight = (date, value, id = `weight-${date}`, note = '') => ({
  id, type: 'weight', unit: 'kg', value, timestamp: `${date}T12:00:00+02:00`, note,
})
export const bloodPressure = {
  id: 'bp-preserved-record', type: 'bloodPressure', timestamp: '2026-09-30T08:00:00+02:00',
  systolicMmHg: 120, diastolicMmHg: 80, pulseBpm: 65,
}
export function store(measurements = [], profile = {}) {
  return {
    schemaVersion: 6, measurements,
    profile: { name: '', age: 40, heightCm: 172, showBmi: true, showBmiRange: false, modules: ['weight', 'bloodPressure'], ...profile },
  }
}
export function populatedStore() {
  return store([
    weight('2025-09-15', 90), weight('2025-10-05', 88), weight('2025-11-10', 86),
    weight('2026-03-10', 85), weight('2026-06-10', 84.5), weight('2026-07-04', 84),
    weight('2026-08-10', 83), weight('2026-09-01', 82), weight('2026-09-15', 81.5),
    weight('2026-10-01', 81, 'weight-latest-record', 'Current check-in\nSecond line'), bloodPressure,
  ])
}

// Seed once per isolated context, never on reload: persistence tests must see real app writes.
export const test = base.extend({
  app: async ({ page }, provide) => {
    await page.clock.setFixedTime(new Date(NOW))
    await provide(async ({ data = populatedStore(), language = 'en', theme = 'light', seenRelease = packageJson.version, url = './' } = {}) => {
      await page.addInitScript(({ data, language, theme, seenRelease, version }) => {
        if (location.pathname.startsWith('/HealthTracker/') && !sessionStorage.getItem('release-test-seeded')) {
          localStorage.setItem('health-tracker-data', JSON.stringify(data))
          localStorage.setItem('health-tracker-language', language)
          localStorage.setItem('health-tracker-theme', theme)
          localStorage.setItem('health-tracker-last-seen-release', seenRelease)
          // Suppress reminders in deterministic scenarios; tests still use the real reminder code.
          localStorage.setItem('health-tracker-backup-reminder', JSON.stringify({
            intervalDays: 14, lastBackupAt: null, backedUpRevision: 0, dataRevision: 0,
            observedStore: null, snoozedUntil: '2026-10-06T10:00:00.000Z',
          }))
          sessionStorage.setItem('release-test-seeded', version)
        }
      }, { data, language, theme, seenRelease, version: packageJson.version })
      await page.goto(url)
      await expect(page.locator('.weight-dashboard')).toBeVisible()
    })
  },
})
export { expect }
export const readStore = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('health-tracker-data')))
export async function openSettings(page) { await page.locator('.settings-button').click() }
export async function addWeight(page, { date, value, note = '' }) {
  await page.getByRole('button', { name: 'Add weight', exact: true }).click()
  await page.getByLabel('Date', { exact: true }).fill(date)
  await page.getByRole('spinbutton', { name: /^Weight/ }).fill(String(value))
  await page.getByLabel('Note (optional)', { exact: true }).fill(note)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.locator('.weight-dashboard')).toBeVisible()
}
