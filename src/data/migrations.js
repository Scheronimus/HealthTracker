import { SCHEMA_VERSION, validateStore } from './schema.js'

const migrations = {
  1: (legacy) => ({ schemaVersion: 1, measurements: legacy.measurements ?? [] }),
  2: (versionOne) => ({ ...versionOne, schemaVersion: 2, profile: { name: '', age: null, heightCm: null, showBmi: false } }),
  3: (versionTwo) => ({ ...versionTwo, schemaVersion: 3, profile: { ...versionTwo.profile, showBmiRange: false } }),
  4: (versionThree) => ({ ...versionThree, schemaVersion: 4 }),
  5: (versionFour) => ({
    ...versionFour,
    schemaVersion: 5,
    measurements: versionFour.measurements.map((item) => {
      if (item.type !== 'bloodPressure') return item
      const measurement = { ...item }
      delete measurement.period
      return measurement
    }),
  }),
  6: (versionFive) => ({ ...versionFive, schemaVersion: 6, profile: { ...versionFive.profile, modules: ['weight', 'bloodPressure'] } }),
  7: (versionSix) => {
    const modules = versionSix.profile?.modules
    if (!Array.isArray(modules) || !modules.length || new Set(modules).size !== modules.length) throw new Error('invalidData')
    return { ...versionSix, schemaVersion: 7, goals: [], profile: { ...versionSix.profile, modules: [...modules.filter((id) => id !== 'goals'), 'goals'] } }
  },
}

export function migrateStore(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('invalidData')
  let current = structuredClone(input)
  const initialVersion = Number(current.schemaVersion ?? 0)
  if (!Number.isInteger(initialVersion) || initialVersion < 0 || initialVersion > SCHEMA_VERSION) {
    throw new Error('unsupportedVersion')
  }
  current.schemaVersion = initialVersion
  while (current.schemaVersion !== SCHEMA_VERSION) {
    const migrate = migrations[current.schemaVersion + 1]
    if (!migrate) throw new Error('unsupportedVersion')
    current = migrate(current)
  }
  if (!validateStore(current)) throw new Error('invalidData')
  return current
}
