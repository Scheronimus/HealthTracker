import { describe, expect, it } from 'vitest'
import { emptyProfile } from './schema.js'
import { createBackup, mergeBloodPressureImport, mergeRestore, mergeWeightImport, parseBackup, parseBloodPressureImportCsv, parseHealthImportCsv, parseWeightImportCsv, weightCsv } from './transfer.js'

const item = { id: 'record-123456', type: 'weight', value: 70.5, unit: 'kg', timestamp: '2026-08-22T08:00:00.000Z', note: 'a, "note"' }
const store = { schemaVersion: 6, measurements: [item], profile: emptyProfile() }

describe('backup and export', () => {
  it('round-trips a versioned backup', () => expect(parseBackup(JSON.stringify(createBackup(store)))).toEqual(store))
  it('never overwrites matching IDs during merge', () => {
    const changed = { ...item, value: 99 }
    const result = mergeRestore(store, { schemaVersion: 1, measurements: [changed] })
    expect(result).toMatchObject({ added: 0, duplicates: 1 })
    expect(result.data.measurements[0].value).toBe(70.5)
  })
  it('imports a profile only when the local profile is empty', () => {
    const imported = { ...store, profile: { name: 'Alex', age: 35, heightCm: 180, showBmi: true, showBmiRange: true, modules: ['bloodPressure'] } }
    expect(mergeRestore(store, imported).data.profile.name).toBe('Alex')
    const local = { ...store, profile: { name: 'Local', age: null, heightCm: null, showBmi: false, showBmiRange: false, modules: ['weight'] } }
    expect(mergeRestore(local, imported).data.profile.name).toBe('Local')
  })
  it('escapes CSV values', () => expect(weightCsv([item])).toContain('"a, ""note"""'))
  it('keeps mixed JSON records and excludes blood pressure from weight CSV', () => {
    const bp = { id: 'pressure-123', type: 'bloodPressure', timestamp: '2026-08-22T18:00:00.000Z', systolicMmHg: 125, diastolicMmHg: 80, pulseBpm: 62 }
    const mixed = { ...store, measurements: [item, bp] }
    expect(parseBackup(JSON.stringify(createBackup(mixed)))).toEqual(mixed)
    expect(weightCsv(mixed.measurements)).not.toContain('pressure-123')
  })
  it('does not merge a third blood-pressure record for an occupied local day', () => {
    const first = { id: 'pressure-123', type: 'bloodPressure', timestamp: '2026-08-22T08:00:00.000Z', systolicMmHg: 125, diastolicMmHg: 80, pulseBpm: 62 }
    const second = { ...first, id: 'pressure-456', timestamp: '2026-08-22T18:00:00.000Z' }
    const third = { ...first, id: 'pressure-789', timestamp: '2026-08-22T21:00:00.000Z', systolicMmHg: 130 }
    const result = mergeRestore({ ...store, measurements: [item, first, second] }, { ...store, measurements: [third] })
    expect(result).toMatchObject({ added: 0, duplicates: 1 })
  })
  it('skips future restore records while preserving existing and current-date data', () => {
    const now = new Date('2026-08-22T10:00:00')
    const todayWeight = { ...item, id: 'today-weight', timestamp: new Date('2026-08-22T12:00:00').toISOString() }
    const futureWeight = { ...item, id: 'future-weight', timestamp: new Date('2026-08-23T12:00:00').toISOString() }
    const futurePressure = { id: 'future-pressure', type: 'bloodPressure', timestamp: new Date(now.getTime() + 1).toISOString(), systolicMmHg: 125, diastolicMmHg: 80, pulseBpm: 62 }
    const result = mergeRestore(store, { ...store, measurements: [todayWeight, futureWeight, futurePressure] }, now)
    expect(result).toMatchObject({ added: 1, duplicates: 0, future: 2 })
    expect(result.data.measurements).toEqual(expect.arrayContaining([item, todayWeight]))
  })
  it('rejects malformed backup data', () => expect(() => parseBackup('{"nope":true}')).toThrow('invalidBackup'))
  it('imports DD/MM/YY weights with decimal commas and skips NN', () => {
    const csv = '31/03/26,"99,7"\n01/04/26,NN\n02/04/26,99\n03/04/26,"98,3"'
    const result = parseWeightImportCsv(csv)
    expect(result.skipped).toBe(1)
    expect(result.measurements.map(({ value }) => value)).toEqual([99.7, 99, 98.3])
    expect(result.measurements.map(({ timestamp }) => timestamp.slice(0, 10))).toEqual(['2026-03-31', '2026-04-02', '2026-04-03'])
  })

  it('rejects invalid CSV rows with a line number', () => {
    try { parseWeightImportCsv('31/02/26,99') } catch (error) { expect(error).toMatchObject({ message: 'invalidCsv', line: 1 }); return }
    throw new Error('Expected invalid CSV to fail')
  })
  it('rejects future weight CSV dates with a line number', () => {
    expect(() => parseWeightImportCsv('23/08/26,99', new Date('2026-08-22T10:00:00.000Z'))).toThrow('invalidCsv')
    try { parseWeightImportCsv('22/08/26,99\n23/08/26,98', new Date('2026-08-22T10:00:00.000Z')) } catch (error) { expect(error.line).toBe(2); return }
    throw new Error('Expected future Weight CSV to fail')
  })

  it('does not overwrite or duplicate an existing weight date during CSV merge', () => {
    const imported = parseWeightImportCsv('22/08/26,99\n23/08/26,70').measurements
    const result = mergeWeightImport(store, imported)
    expect(result).toMatchObject({ added: 1, duplicates: 1 })
    expect(result.data.measurements.find(({ id }) => id === item.id).value).toBe(70.5)
  })
  it('imports headerless blood-pressure CSV with date, time, pressure, and pulse', () => {
    const csv = '02/03/26,17:45:00,145,80,85\n03/03/26,16:49:00,152,89,78\n04/03/26,19:32:00,144,88,86'
    const parsed = parseBloodPressureImportCsv(csv)
    expect(parsed.measurements).toHaveLength(3)
    expect(parsed.measurements[0]).toMatchObject({ type: 'bloodPressure', systolicMmHg: 145, diastolicMmHg: 80, pulseBpm: 85 })
    expect(new Date(parsed.measurements[0].timestamp).getHours()).toBe(17)
    expect(parseHealthImportCsv(csv).type).toBe('bloodPressure')
  })
  it('rejects invalid blood-pressure CSV with a line number', () => {
    try { parseBloodPressureImportCsv('02/03/26,25:00:00,145,80,85') } catch (error) { expect(error).toMatchObject({ message: 'invalidCsv', line: 1 }); return }
    throw new Error('Expected invalid CSV to fail')
  })
  it('rejects later-today and later-date blood-pressure CSV timestamps', () => {
    const now = new Date('2026-03-02T17:45:00')
    expect(() => parseBloodPressureImportCsv('02/03/26,17:45:01,145,80,85', now)).toThrow('invalidCsv')
    expect(() => parseBloodPressureImportCsv('03/03/26,08:00:00,145,80,85', now)).toThrow('invalidCsv')
    expect(parseBloodPressureImportCsv('02/03/26,17:45:00,145,80,85', now).measurements).toHaveLength(1)
  })
  it('merges at most two blood-pressure readings per date at least two hours apart', () => {
    const parsed = parseBloodPressureImportCsv('02/03/26,08:00:00,145,80,85\n02/03/26,08:30:00,142,78,82\n02/03/26,18:00:00,138,76,75\n02/03/26,21:00:00,136,75,72')
    const result = mergeBloodPressureImport(store, parsed.measurements)
    expect(result).toMatchObject({ added: 2, duplicates: 2 })
  })
})
