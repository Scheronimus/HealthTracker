import { BACKUP_KIND, emptyProfile, SCHEMA_VERSION } from './schema.js'
import { migrateStore } from './migrations.js'
import { parseCsvRow } from './csv.js'
import { MODULE_CATALOG, MODULE_DATA_BY_TYPE } from '../modules/catalog.js'
import { mergeWeightImport as mergeWeightRecords, parseWeightImportCsv, weightCsv } from '../modules/weight/transfer.js'
import { mergeBloodPressureImport as mergeBloodPressureRecords, parseBloodPressureImportCsv } from '../modules/blood-pressure/transfer.js'
export { parseWeightImportCsv, weightCsv, parseBloodPressureImportCsv }

export function createBackup(data, now = new Date()) {
  return { kind: BACKUP_KIND, formatVersion: 1, exportedAt: now.toISOString(), data }
}

export function parseBackup(text) {
  let parsed
  try { parsed = JSON.parse(text) } catch { throw new Error('invalidBackup') }
  if (!parsed || parsed.kind !== BACKUP_KIND || typeof parsed.exportedAt !== 'string' || Number.isNaN(Date.parse(parsed.exportedAt))) throw new Error('invalidBackup')
  try { return migrateStore(parsed.data) } catch { throw new Error('invalidBackup') }
}

export function mergeRestore(existing, imported, now = new Date()) {
  existing = migrateStore(existing)
  imported = migrateStore(imported)
  const byId = new Map(existing.measurements.map((item) => [item.id, item]))
  const allIds = new Set([...new Set(MODULE_CATALOG.map((module) => module.recordCollection))].flatMap((key) => existing[key]).map((item) => item.id))
  let added = 0
  let duplicates = 0
  let future = 0
  for (const item of imported.measurements) {
    const module = MODULE_DATA_BY_TYPE[item.type]
    if (module?.isFutureMeasurement?.(item, now)) { future += 1; continue }
    if (allIds.has(item.id) || (module?.canRestore && !module.canRestore([...byId.values()], item))) { duplicates += 1; continue }
    byId.set(item.id, item)
    allIds.add(item.id)
    added += 1
  }
  const localProfile = existing.profile ?? emptyProfile()
  const importedProfile = imported.profile ?? emptyProfile()
  const hasLocalProfile = JSON.stringify(localProfile) !== JSON.stringify(emptyProfile())
  const collections = {}
  for (const module of MODULE_CATALOG.filter((item) => !item.measurementType)) {
    const records = [...existing[module.recordCollection]]
    for (const item of imported[module.recordCollection]) {
      if (module.isFutureMeasurement?.(item, now)) { future += 1; continue }
      if (allIds.has(item.id) || !module.canRestore(records, item)) { duplicates += 1; continue }
      records.push(item); allIds.add(item.id); added += 1
    }
    collections[module.recordCollection] = records
  }
  return { data: { schemaVersion: SCHEMA_VERSION, measurements: [...byId.values()], ...collections, profile: hasLocalProfile ? localProfile : importedProfile }, added, duplicates, future }
}

export function parseHealthImportCsv(text) {
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/).find((line) => line.trim()) ?? ''
  const columns = parseCsvRow(firstLine).length
  const module = MODULE_CATALOG.find((item) => item.csv?.matches(columns))
  if (!module) throw new Error('invalidCsv')
  return { ...module.csv.parse(text), type: module.measurementType, labels: module.csv.labels }
}

export function mergeHealthImport(existing, parsed) {
  const result = MODULE_DATA_BY_TYPE[parsed.type].csv.merge(existing, parsed.measurements)
  return { ...result, data: { ...existing, schemaVersion: SCHEMA_VERSION, measurements: result.measurements } }
}

export function mergeWeightImport(existing, measurements) { return finalizeMerge(existing, mergeWeightRecords(existing, measurements)) }
export function mergeBloodPressureImport(existing, measurements) { return finalizeMerge(existing, mergeBloodPressureRecords(existing, measurements)) }

function finalizeMerge(existing, result) {
  return { ...result, data: { ...existing, schemaVersion: SCHEMA_VERSION, measurements: result.measurements } }
}
