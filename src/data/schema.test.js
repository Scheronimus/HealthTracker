import { describe, expect, it } from 'vitest'
import { createWeightMeasurement, emptyStore, validateMeasurement, validateStore } from './schema.js'
import { migrateStore } from './migrations.js'

describe('measurement schema', () => {
  it('creates valid collision-resistant weight records', () => {
    const first = createWeightMeasurement({ value: '72.4', timestamp: '2026-08-22T08:00:00.000Z', note: 'Morning' })
    const second = createWeightMeasurement({ value: 72.4, timestamp: '2026-08-22T08:00:00.000Z' })
    expect(validateMeasurement(first)).toBe(true)
    expect(first.id).not.toBe(second.id)
  })
  it('rejects invalid measurements and duplicate IDs', () => {
    const item = createWeightMeasurement({ value: 72, timestamp: '2026-08-22T08:00:00.000Z' })
    expect(validateMeasurement({ ...item, value: -1 })).toBe(false)
    expect(validateStore({ schemaVersion: 1, measurements: [item, item] })).toBe(false)
  })
  it('migrates the explicit version-zero shape', () => {
    expect(migrateStore({ measurements: [] })).toEqual(emptyStore())
  })
  it('rejects future schema versions', () => {
    expect(() => migrateStore({ schemaVersion: 99, measurements: [] })).toThrow('unsupportedVersion')
  })
})
