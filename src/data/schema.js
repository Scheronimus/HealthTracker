export const SCHEMA_VERSION = 6
import { DEFAULT_MODULES, MODULE_DATA_BY_TYPE } from '../modules/catalog.js'
export { createWeightMeasurement } from '../modules/weight/model.js'
export { createBloodPressureMeasurement } from '../modules/blood-pressure/model.js'
export { createId } from '../utils/id.js'

export { DEFAULT_MODULES }
export const BACKUP_KIND = 'health-tracker-backup'
export const STORAGE_KEY = 'health-tracker-data'
export const LANGUAGE_KEY = 'health-tracker-language'
export const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'fr']

export function emptyStore() {
  return { schemaVersion: SCHEMA_VERSION, measurements: [], profile: emptyProfile() }
}

export function emptyProfile() {
  return { name: '', age: null, heightCm: null, showBmi: false, showBmiRange: false, modules: [...DEFAULT_MODULES] }
}

export function validateProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return false
  return typeof profile.name === 'string' && profile.name.length <= 100
    && (profile.age === null || (Number.isInteger(profile.age) && profile.age >= 0 && profile.age <= 130))
    && (profile.heightCm === null || (Number.isFinite(profile.heightCm) && profile.heightCm >= 50 && profile.heightCm <= 300))
    && typeof profile.showBmi === 'boolean'
    && typeof profile.showBmiRange === 'boolean'
    && Array.isArray(profile.modules) && profile.modules.length > 0
    && profile.modules.every((module) => DEFAULT_MODULES.includes(module))
    && new Set(profile.modules).size === profile.modules.length
}

export function validateMeasurement(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false
  return typeof item.id === 'string' && item.id.length >= 8
    && typeof item.timestamp === 'string' && !Number.isNaN(Date.parse(item.timestamp))
    && Boolean(MODULE_DATA_BY_TYPE[item.type]?.validateMeasurement(item))
}

export function validateStore(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (value.schemaVersion !== SCHEMA_VERSION || !Array.isArray(value.measurements) || !validateProfile(value.profile)) return false
  if (!value.measurements.every(validateMeasurement)) return false
  if (new Set(value.measurements.map(({ id }) => id)).size !== value.measurements.length) return false
  for (const [type, module] of Object.entries(MODULE_DATA_BY_TYPE)) if (module.validateCollection && !module.validateCollection(value.measurements.filter((item) => item.type === type))) return false
  return true
}

export function validateBackup(value) {
  return Boolean(value && value.kind === BACKUP_KIND && typeof value.exportedAt === 'string'
    && !Number.isNaN(Date.parse(value.exportedAt)) && validateStore(value.data))
}
