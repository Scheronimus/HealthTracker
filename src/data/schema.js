export const SCHEMA_VERSION = 4
export const BACKUP_KIND = 'health-tracker-backup'
export const STORAGE_KEY = 'health-tracker-data'
export const LANGUAGE_KEY = 'health-tracker-language'
export const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'fr']

export function emptyStore() {
  return { schemaVersion: SCHEMA_VERSION, measurements: [], profile: emptyProfile() }
}

export function emptyProfile() {
  return { name: '', age: null, heightCm: null, showBmi: false, showBmiRange: false }
}

export function validateProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return false
  return typeof profile.name === 'string' && profile.name.length <= 100
    && (profile.age === null || (Number.isInteger(profile.age) && profile.age >= 0 && profile.age <= 130))
    && (profile.heightCm === null || (Number.isFinite(profile.heightCm) && profile.heightCm >= 50 && profile.heightCm <= 300))
    && typeof profile.showBmi === 'boolean'
    && typeof profile.showBmiRange === 'boolean'
}

export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  const bytes = new Uint8Array(16)
  globalThis.crypto?.getRandomValues?.(bytes)
  if (bytes.some(Boolean)) return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

export function createWeightMeasurement({ value, timestamp, note = '' }) {
  return { id: createId(), type: 'weight', value: Number(value), unit: 'kg', timestamp, note: note.trim() }
}

export function createBloodPressureMeasurement({ timestamp, period, systolicMmHg, diastolicMmHg, pulseBpm }) {
  return { id: createId(), type: 'bloodPressure', timestamp, period, systolicMmHg: Number(systolicMmHg), diastolicMmHg: Number(diastolicMmHg), pulseBpm: Number(pulseBpm) }
}

export function validateWeightMeasurement(item) {
  return item.type === 'weight' && item.unit === 'kg'
    && Number.isFinite(item.value) && item.value > 0 && item.value <= 1000
    && typeof item.note === 'string' && item.note.length <= 1000
}

export function validateBloodPressureMeasurement(item) {
  return item.type === 'bloodPressure'
    && (item.period === 'morning' || item.period === 'evening')
    && Number.isInteger(item.systolicMmHg) && item.systolicMmHg >= 50 && item.systolicMmHg <= 300
    && Number.isInteger(item.diastolicMmHg) && item.diastolicMmHg >= 30 && item.diastolicMmHg <= 200
    && item.systolicMmHg > item.diastolicMmHg
    && Number.isInteger(item.pulseBpm) && item.pulseBpm >= 30 && item.pulseBpm <= 250
}

export function validateMeasurement(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false
  return typeof item.id === 'string' && item.id.length >= 8
    && typeof item.timestamp === 'string' && !Number.isNaN(Date.parse(item.timestamp))
    && (validateWeightMeasurement(item) || validateBloodPressureMeasurement(item))
}

export function validateStore(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (value.schemaVersion !== SCHEMA_VERSION || !Array.isArray(value.measurements) || !validateProfile(value.profile)) return false
  if (!value.measurements.every(validateMeasurement)) return false
  if (new Set(value.measurements.map(({ id }) => id)).size !== value.measurements.length) return false
  const slots = value.measurements.filter(({ type }) => type === 'bloodPressure').map((item) => `${new Date(item.timestamp).getFullYear()}-${new Date(item.timestamp).getMonth()}-${new Date(item.timestamp).getDate()}-${item.period}`)
  return new Set(slots).size === slots.length
}

export function validateBackup(value) {
  return Boolean(value && value.kind === BACKUP_KIND && typeof value.exportedAt === 'string'
    && !Number.isNaN(Date.parse(value.exportedAt)) && validateStore(value.data))
}
