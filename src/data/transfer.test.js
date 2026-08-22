import { describe, expect, it } from 'vitest'
import { createBackup, mergeRestore, parseBackup, weightCsv } from './transfer.js'

const item = { id: 'record-123456', type: 'weight', value: 70.5, unit: 'kg', timestamp: '2026-08-22T08:00:00.000Z', note: 'a, "note"' }
const store = { schemaVersion: 1, measurements: [item] }

describe('backup and export', () => {
  it('round-trips a versioned backup', () => expect(parseBackup(JSON.stringify(createBackup(store)))).toEqual(store))
  it('never overwrites matching IDs during merge', () => {
    const changed = { ...item, value: 99 }
    const result = mergeRestore(store, { schemaVersion: 1, measurements: [changed] })
    expect(result).toMatchObject({ added: 0, duplicates: 1 })
    expect(result.data.measurements[0].value).toBe(70.5)
  })
  it('escapes CSV values', () => expect(weightCsv([item])).toContain('"a, ""note"""'))
  it('rejects malformed backup data', () => expect(() => parseBackup('{"nope":true}')).toThrow('invalidBackup'))
})
