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
    expect(validateProfile({ name: 'Alex', age: 35, heightCm: 180.5, showBmi: true, showBmiRange: true, modules: ['bloodPressure', 'weight'] })).toBe(true)
    expect(validateProfile({ name: 'Alex', age: 131, heightCm: 180, showBmi: true, showBmiRange: false, modules: ['weight'] })).toBe(false)
    expect(validateProfile({ ...emptyProfile(), modules: [] })).toBe(false)
    expect(validateProfile({ ...emptyProfile(), modules: ['weight', 'weight'] })).toBe(false)
  })
  it('migrates a version-two profile with the graph range disabled', () => {
    const legacy = { schemaVersion: 2, measurements: [], profile: { name: 'Alex', age: 35, heightCm: 180, showBmi: true } }
    expect(migrateStore(legacy).profile).toEqual({ ...legacy.profile, showBmiRange: false, modules: ['weight', 'bloodPressure'] })
  })
  it('migrates schema three to the current version without changing non-pressure data', () => {
    const legacy = { schemaVersion: 3, measurements: [], profile: emptyProfile() }
    expect(migrateStore(legacy)).toEqual({ ...legacy, schemaVersion: 6 })
  })
  it('removes the legacy period label while preserving blood-pressure readings', () => {
    const pressure = { id: 'pressure-123', type: 'bloodPressure', timestamp: '2026-08-22T18:00:00.000Z', period: 'evening', systolicMmHg: 125, diastolicMmHg: 80, pulseBpm: 62 }
    const legacy = { schemaVersion: 4, measurements: [pressure], profile: emptyProfile() }
    const migratedPressure = { ...pressure }
    delete migratedPressure.period
    expect(migrateStore(legacy)).toEqual({ ...legacy, schemaVersion: 6, measurements: [migratedPressure] })
  })
  it('adds default module preferences to schema five profiles', () => {
    const profile = { name: '', age: null, heightCm: null, showBmi: false, showBmiRange: false }
    expect(migrateStore({ schemaVersion: 5, measurements: [], profile }).profile.modules).toEqual(['weight', 'bloodPressure'])
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
