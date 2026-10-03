import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  updateSnapshots: 'none',
  workers: 2,
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4178/HealthTracker/',
    locale: 'en-US',
    timezoneId: 'Europe/Berlin',
    viewport: { width: 375, height: 800 },
    hasTouch: true,
    serviceWorkers: 'allow',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    ...['chromium', 'firefox', 'webkit'].map((browserName) => ({
      name: browserName, use: { browserName }, testIgnore: '**/visual.spec.mjs',
    })),
    { name: 'visual', use: { browserName: 'chromium' }, testMatch: '**/visual.spec.mjs' },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4178 --strictPort',
    url: 'http://127.0.0.1:4178/HealthTracker/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
