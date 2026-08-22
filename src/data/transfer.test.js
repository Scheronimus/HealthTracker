import { describe, expect, it } from 'vitest'
import { emptyProfile } from './schema.js'
import { createBackup, mergeRestore, mergeWeightImport, parseBackup, parseWeightImportCsv, weightCsv } from './transfer.js'

const item = { id: 'record-123456', type: 'weight', value: 70.5, unit: 'kg', timestamp: '2026-08-22T08:00:00.000Z', note: 'a, "note"' }
const store = { schemaVersion: 3, measurements: [item], profile: emptyProfile() }

describe('backup and export', () => {
  it('round-trips a versioned backup', () => expect(parseBackup(JSON.stringify(createBackup(store)))).toEqual(store))
  it('never overwrites matching IDs during merge', () => {
    const changed = { ...item, value: 99 }
    const result = mergeRestore(store, { schemaVersion: 1, measurements: [changed] })
    expect(result).toMatchObject({ added: 0, duplicates: 1 })
    expect(result.data.measurements[0].value).toBe(70.5)
  })
  it('imports a profile only when the local profile is empty', () => {
    const imported = { ...store, profile: { name: 'Alex', age: 35, heightCm: 180, showBmi: true, showBmiRange: true } }
    expect(mergeRestore(store, imported).data.profile.name).toBe('Alex')
    const local = { ...store, profile: { name: 'Local', age: null, heightCm: null, showBmi: false, showBmiRange: false } }
    expect(mergeRestore(local, imported).data.profile.name).toBe('Local')
  })
  it('escapes CSV values', () => expect(weightCsv([item])).toContain('"a, ""note"""'))
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

  it('does not overwrite or duplicate an existing weight date during CSV merge', () => {
    const imported = parseWeightImportCsv('22/08/26,99\n23/08/26,70').measurements
    const result = mergeWeightImport(store, imported)
    expect(result).toMatchObject({ added: 1, duplicates: 1 })
    expect(result.data.measurements.find(({ id }) => id === item.id).value).toBe(70.5)
  })
})
