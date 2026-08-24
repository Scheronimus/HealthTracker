import { SCHEMA_VERSION, validateStore } from './schema.js'

const migrations = {
  1: (legacy) => ({ schemaVersion: 1, measurements: legacy.measurements ?? [] }),
  2: (versionOne) => ({ ...versionOne, schemaVersion: 2, profile: { name: '', age: null, heightCm: null, showBmi: false } }),
  3: (versionTwo) => ({ ...versionTwo, schemaVersion: 3, profile: { ...versionTwo.profile, showBmiRange: false } }),
  4: (versionThree) => ({ ...versionThree, schemaVersion: 4 }),
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
