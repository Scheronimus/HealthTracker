import { describe, expect, it, vi } from 'vitest'
import { BACKUP_REMINDER_KEY, backupReminderStatus, defaultBackupReminder, loadBackupReminder, observeBackupChanges, previewBackupStatus, recordBackupDownload, requestPersistentStorage, setBackupInterval, snoozeBackupReminder } from './backupReminder.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: vi.fn((key) => values.get(key) ?? null),
    setItem: vi.fn((key, value) => values.set(key, value)),
  }
}

const measurement = (id) => ({ id, type: 'weight', timestamp: '2026-09-01T12:00:00.000Z', value: 80, note: '' })
const store = (count = 0) => ({ schemaVersion: 6, measurements: Array.from({ length: count }, (_, index) => measurement(String(index))), profile: { name: '', age: null, heightCm: null, showBmi: false, showBmiZones: false, modules: ['weight', 'bloodPressure'] } })

describe('backup reminder preferences', () => {
  it('uses safe defaults for absent or malformed preferences', () => {
    const storage = memoryStorage()
    expect(loadBackupReminder(storage)).toEqual(defaultBackupReminder())
    storage.setItem(BACKUP_REMINDER_KEY, '{bad')
    expect(loadBackupReminder(storage)).toEqual(defaultBackupReminder())
  })

  it('tracks meaningful store changes without storing health data', () => {
    const storage = memoryStorage()
    const first = observeBackupChanges(store(1), storage)
    const unchanged = observeBackupChanges(store(1), storage)
    const changed = observeBackupChanges(store(2), storage)
    expect(first.dataRevision).toBe(0)
    expect(unchanged.dataRevision).toBe(0)
    expect(changed.dataRevision).toBe(1)
    expect(changed.observedStore).not.toContain('timestamp')
    expect(storage.setItem).toHaveBeenCalled()
  })

  it('records a download against the current revision and clears snooze', () => {
    const storage = memoryStorage()
    observeBackupChanges(store(3), storage)
    observeBackupChanges(store(4), storage)
    snoozeBackupReminder(new Date('2026-09-01T00:00:00Z'), storage)
    const result = recordBackupDownload(store(4), new Date('2026-09-02T00:00:00Z'), storage)
    expect(result.lastBackupAt).toBe('2026-09-02T00:00:00.000Z')
    expect(result.backedUpRevision).toBe(result.dataRevision)
    expect(result.snoozedUntil).toBeNull()
  })

  it('accepts only supported reminder intervals', () => {
    const storage = memoryStorage()
    expect(setBackupInterval(30, storage).intervalDays).toBe(30)
    expect(setBackupInterval(9, storage).intervalDays).toBe(30)
  })
})

describe('backup reminder state', () => {
  const now = new Date('2026-09-30T12:00:00Z')

  it('waits for three measurements before the first reminder', () => {
    expect(backupReminderStatus(store(0), defaultBackupReminder(), now).kind).toBe('empty')
    expect(backupReminderStatus(store(2), defaultBackupReminder(), now).kind).toBe('waiting')
    expect(backupReminderStatus(store(3), defaultBackupReminder(), now).kind).toBe('never')
  })

  it('distinguishes current, changed, due, overdue, and snoozed data', () => {
    const base = { ...defaultBackupReminder(), lastBackupAt: '2026-09-16T12:00:00Z', dataRevision: 5, backedUpRevision: 4 }
    expect(backupReminderStatus(store(3), { ...base, backedUpRevision: 5 }, now).kind).toBe('current')
    expect(backupReminderStatus(store(3), { ...base, lastBackupAt: '2026-09-29T12:00:00Z' }, now).kind).toBe('changed')
    expect(backupReminderStatus(store(3), base, now).kind).toBe('due')
    expect(backupReminderStatus(store(3), { ...base, lastBackupAt: '2026-09-02T12:00:00Z' }, now).kind).toBe('overdue')
    expect(backupReminderStatus(store(3), { ...base, snoozedUntil: '2026-10-01T12:00:00Z' }, now).kind).toBe('snoozed')
  })

  it('builds deterministic development previews', () => {
    expect(previewBackupStatus('empty', defaultBackupReminder(), now).measurementCount).toBe(0)
    expect(previewBackupStatus('overdue', defaultBackupReminder(), now)).toMatchObject({ kind: 'overdue', ageDays: 28 })
    expect(previewBackupStatus('downloaded', defaultBackupReminder(), now)).toMatchObject({ kind: 'downloaded', changedCount: 0 })
  })
})

describe('persistent storage request', () => {
  it('handles supported, denied, and unsupported browsers', async () => {
    await expect(requestPersistentStorage(undefined)).resolves.toBe('unsupported')
    await expect(requestPersistentStorage({ persisted: vi.fn().mockResolvedValue(true), persist: vi.fn() })).resolves.toBe('granted')
    await expect(requestPersistentStorage({ persisted: vi.fn().mockResolvedValue(false), persist: vi.fn().mockResolvedValue(false) })).resolves.toBe('denied')
  })
})
