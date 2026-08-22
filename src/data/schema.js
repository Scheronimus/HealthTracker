export const SCHEMA_VERSION = 1
export const BACKUP_KIND = 'health-tracker-backup'
export const STORAGE_KEY = 'health-tracker-data'
export const LANGUAGE_KEY = 'health-tracker-language'
export const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'fr']

export function emptyStore() {
  return { schemaVersion: SCHEMA_VERSION, measurements: [] }
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

export function validateMeasurement(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return false
  return typeof item.id === 'string' && item.id.length >= 8
    && item.type === 'weight' && item.unit === 'kg'
    && Number.isFinite(item.value) && item.value > 0 && item.value <= 1000
    && typeof item.timestamp === 'string' && !Number.isNaN(Date.parse(item.timestamp))
    && typeof item.note === 'string' && item.note.length <= 1000
}

export function validateStore(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  if (value.schemaVersion !== SCHEMA_VERSION || !Array.isArray(value.measurements)) return false
  if (!value.measurements.every(validateMeasurement)) return false
  return new Set(value.measurements.map(({ id }) => id)).size === value.measurements.length
}

export function validateBackup(value) {
  return Boolean(value && value.kind === BACKUP_KIND && typeof value.exportedAt === 'string'
    && !Number.isNaN(Date.parse(value.exportedAt)) && validateStore(value.data))
}
