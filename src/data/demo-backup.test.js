import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { createIrregularDemoStore } from './demo.js'
import { parseBackup } from './transfer.js'

const weeklyPath = new URL('../../docs/dummy-weight-data-one-year.json', import.meta.url)
const irregularPath = new URL('../../docs/dummy-weight-data-one-year-irregular.json', import.meta.url)
const DAY = 24 * 60 * 60 * 1000

async function readBackup(path) {
  return parseBackup(await readFile(path, 'utf8'))
}

describe('one-year demo backups', () => {
  it('provides a valid year of weekly measurements', async () => {
    const data = await readBackup(weeklyPath)
    expect(data.measurements).toHaveLength(53)
    const timestamps = data.measurements.map(({ timestamp }) => Date.parse(timestamp))
    expect(Math.max(...timestamps) - Math.min(...timestamps)).toBe(364 * DAY)
    expect(new Set(data.measurements.map(({ id }) => id)).size).toBe(53)
  })

  it('provides daily, forgotten, irregular, and resumed-daily phases', async () => {
    const data = await readBackup(irregularPath)
    expect(data).toEqual(createIrregularDemoStore())
    expect(data.measurements).toHaveLength(240)
    const start = Date.parse(data.measurements[0].timestamp)
    const days = data.measurements.map(({ timestamp }) => (Date.parse(timestamp) - start) / DAY)
    expect(days.filter((day) => day >= 0 && day < 90)).toEqual(Array.from({ length: 90 }, (_, day) => day))
    expect(days.some((day) => day >= 90 && day < 120)).toBe(false)
    const irregular = days.filter((day) => day >= 120 && day < 240)
    const intervals = irregular.slice(1).map((day, index) => day - irregular[index])
    expect(intervals.every((interval) => interval >= 3 && interval <= 7)).toBe(true)
    expect(days.filter((day) => day >= 240)).toEqual(Array.from({ length: 125 }, (_, index) => index + 240))
    expect(days.at(-1)).toBe(364)
  })
})
