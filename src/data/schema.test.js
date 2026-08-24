import { describe, expect, it } from 'vitest'
import { createWeightMeasurement, emptyProfile, emptyStore, validateMeasurement, validateProfile, validateStore } from './schema.js'
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
    expect(validateStore({ ...emptyStore(), measurements: [item, item] })).toBe(false)
  })
  it('validates optional profile values', () => {
    expect(validateProfile(emptyProfile())).toBe(true)
    expect(validateProfile({ name: 'Alex', age: 35, heightCm: 180.5, showBmi: true, showBmiRange: true })).toBe(true)
    expect(validateProfile({ name: 'Alex', age: 131, heightCm: 180, showBmi: true, showBmiRange: false })).toBe(false)
  })
  it('migrates a version-two profile with the graph range disabled', () => {
    const legacy = { schemaVersion: 2, measurements: [], profile: { name: 'Alex', age: 35, heightCm: 180, showBmi: true } }
    expect(migrateStore(legacy).profile).toEqual({ ...legacy.profile, showBmiRange: false })
  })
  it('migrates schema three to four without changing data', () => {
    const legacy = { schemaVersion: 3, measurements: [], profile: emptyProfile() }
    expect(migrateStore(legacy)).toEqual({ ...legacy, schemaVersion: 4 })
  })
  it('migrates a version-one store without changing measurements', () => {
    const legacy = { schemaVersion: 1, measurements: [] }
    expect(migrateStore(legacy)).toEqual(emptyStore())
  })
  it('migrates the explicit version-zero shape', () => {
    expect(migrateStore({ measurements: [] })).toEqual(emptyStore())
  })
  it('rejects future schema versions', () => {
    expect(() => migrateStore({ schemaVersion: 99, measurements: [] })).toThrow('unsupportedVersion')
  })
})
