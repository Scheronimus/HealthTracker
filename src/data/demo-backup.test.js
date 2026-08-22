import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { parseBackup } from './transfer.js'

const demoPath = new URL('../../docs/dummy-weight-data-one-year.json', import.meta.url)

describe('one-year demo backup', () => {
  it('is valid and covers one year with weekly measurements', async () => {
    const data = parseBackup(await readFile(demoPath, 'utf8'))
    expect(data.measurements).toHaveLength(53)
    const timestamps = data.measurements.map(({ timestamp }) => Date.parse(timestamp))
    expect(Math.max(...timestamps) - Math.min(...timestamps)).toBe(364 * 24 * 60 * 60 * 1000)
    expect(new Set(data.measurements.map(({ id }) => id)).size).toBe(53)
  })
})
