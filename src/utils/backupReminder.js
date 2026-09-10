export const BACKUP_REMINDER_KEY = 'health-tracker-backup-reminder'
export const BACKUP_INTERVALS = [7, 14, 30]
export const DEFAULT_BACKUP_INTERVAL_DAYS = 14
export const BACKUP_SNOOZE_DAYS = 3
export const FIRST_BACKUP_MEASUREMENT_COUNT = 3
export const BACKUP_PREVIEW_STATES = ['normal', 'empty', 'never', 'current', 'changed', 'due', 'overdue', 'snoozed', 'downloaded', 'storageUnsupported', 'storageDenied']

const DAY_MS = 24 * 60 * 60 * 1000

export function defaultBackupReminder() {
  return {
    intervalDays: DEFAULT_BACKUP_INTERVAL_DAYS,
    lastBackupAt: null,
    backedUpRevision: 0,
    dataRevision: 0,
    observedStore: null,
    snoozedUntil: null,
    storageProtection: 'unknown',
  }
}

export function loadBackupReminder(storage = localStorage) {
  let parsed
  try { parsed = JSON.parse(storage.getItem(BACKUP_REMINDER_KEY)) } catch { return defaultBackupReminder() }
  const fallback = defaultBackupReminder()
  if (!parsed || !BACKUP_INTERVALS.includes(parsed.intervalDays)) return fallback
  return {
    ...fallback,
    ...parsed,
    lastBackupAt: validDate(parsed.lastBackupAt),
    snoozedUntil: validDate(parsed.snoozedUntil),
    backedUpRevision: validRevision(parsed.backedUpRevision),
    dataRevision: validRevision(parsed.dataRevision),
    observedStore: typeof parsed.observedStore === 'string' ? parsed.observedStore : null,
    storageProtection: ['unknown', 'granted', 'denied', 'unsupported'].includes(parsed.storageProtection) ? parsed.storageProtection : 'unknown',
  }
}

export function saveBackupReminder(value, storage = localStorage) {
  storage.setItem(BACKUP_REMINDER_KEY, JSON.stringify(value))
  return value
}

export function observeBackupChanges(store, storage = localStorage) {
  const current = loadBackupReminder(storage)
  const observedStore = storeFingerprint(store)
  if (current.observedStore === observedStore) return current
  const next = {
    ...current,
    observedStore,
    dataRevision: current.observedStore === null ? current.dataRevision : current.dataRevision + 1,
  }
  return saveBackupReminder(next, storage)
}

export function recordBackupDownload(store, now = new Date(), storage = localStorage) {
  const current = observeBackupChanges(store, storage)
  return saveBackupReminder({
    ...current,
    lastBackupAt: now.toISOString(),
    backedUpRevision: current.dataRevision,
    snoozedUntil: null,
  }, storage)
}

export function setBackupInterval(intervalDays, storage = localStorage) {
  if (!BACKUP_INTERVALS.includes(Number(intervalDays))) return loadBackupReminder(storage)
  return saveBackupReminder({ ...loadBackupReminder(storage), intervalDays: Number(intervalDays) }, storage)
}

export function snoozeBackupReminder(now = new Date(), storage = localStorage) {
  const current = loadBackupReminder(storage)
  return saveBackupReminder({ ...current, snoozedUntil: new Date(now.getTime() + BACKUP_SNOOZE_DAYS * DAY_MS).toISOString() }, storage)
}

export function setStorageProtection(storageProtection, storage = localStorage) {
  if (!['granted', 'denied', 'unsupported'].includes(storageProtection)) return loadBackupReminder(storage)
  return saveBackupReminder({ ...loadBackupReminder(storage), storageProtection }, storage)
}

export async function requestPersistentStorage(storageManager = globalThis.navigator?.storage) {
  if (!storageManager?.persist) return 'unsupported'
  try {
    if (await storageManager.persisted?.()) return 'granted'
    return await storageManager.persist() ? 'granted' : 'denied'
  } catch { return 'denied' }
}

export function backupReminderStatus(store, reminder, now = new Date()) {
  const measurementCount = store.measurements.length
  const changedCount = Math.max(0, reminder.dataRevision - reminder.backedUpRevision)
  const base = { ...reminder, measurementCount, changedCount, kind: 'empty' }
  if (measurementCount === 0) return base
  if (!reminder.lastBackupAt) {
    return { ...base, kind: measurementCount >= FIRST_BACKUP_MEASUREMENT_COUNT ? 'never' : 'waiting' }
  }
  if (changedCount === 0) return { ...base, kind: 'current' }
  if (reminder.snoozedUntil && Date.parse(reminder.snoozedUntil) > now.getTime()) return { ...base, kind: 'snoozed' }
  const ageDays = Math.floor((now.getTime() - Date.parse(reminder.lastBackupAt)) / DAY_MS)
  if (ageDays < reminder.intervalDays) return { ...base, kind: 'changed', ageDays }
  return { ...base, kind: ageDays >= reminder.intervalDays * 2 ? 'overdue' : 'due', ageDays }
}

export function previewBackupStatus(kind, reminder = defaultBackupReminder(), now = new Date()) {
  const days = reminder.intervalDays
  const latest = (age) => new Date(now.getTime() - age * DAY_MS).toISOString()
  const common = { ...reminder, measurementCount: 12, changedCount: 5, lastBackupAt: latest(days), kind }
  if (kind === 'empty') return { ...common, measurementCount: 0, changedCount: 0 }
  if (kind === 'never') return { ...common, lastBackupAt: null, changedCount: 3 }
  if (kind === 'current') return { ...common, changedCount: 0, lastBackupAt: latest(2) }
  if (kind === 'changed') return { ...common, lastBackupAt: latest(2) }
  if (kind === 'overdue') return { ...common, lastBackupAt: latest(days * 2), ageDays: days * 2 }
  if (kind === 'snoozed') return { ...common, snoozedUntil: new Date(now.getTime() + DAY_MS).toISOString() }
  if (kind === 'downloaded') return { ...common, changedCount: 0, lastBackupAt: now.toISOString() }
  return { ...common, ageDays: days }
}

function validDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : null
}

function validRevision(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0
}

function storeFingerprint(store) {
  const text = JSON.stringify(store)
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `${text.length}-${(hash >>> 0).toString(36)}`
}
