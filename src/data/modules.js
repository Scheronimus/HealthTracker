import { MODULE_CATALOG } from '../modules/catalog.js'
import { localDateValue } from '../utils/date.js'

export function recordsForModule(store, module) {
  const records = store[module.recordCollection]
  return module.measurementType ? records.filter((item) => item.type === module.measurementType).sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)) : records
}

function measurementSources(store, now) {
  return Object.fromEntries(MODULE_CATALOG.filter((module) => module.measurementType).map((module) => [module.id, {
    id: module.id, labelKey: module.labelKey, maxDailyEntries: module.maxDailyEntries,
    observations: recordsForModule(store, module).filter((item) => !module.isFutureMeasurement?.(item, now)).map((item) => ({ id: item.id, date: localDateValue(item.timestamp), timestamp: item.timestamp, value: item.value ?? null })),
  }]))
}

export function moduleSources(store, now = new Date()) {
  const sources = measurementSources(store, now)
  for (const module of MODULE_CATALOG) {
    for (const line of module.referenceLines?.(recordsForModule(store, module), sources, now) ?? []) {
      if (sources[line.moduleId]) (sources[line.moduleId].referenceLines ??= []).push(line)
    }
  }
  return sources
}

export function reconcileStore(store, now = new Date()) {
  const sources = measurementSources(store, now)
  return MODULE_CATALOG.reduce((current, module) => {
    if (!module.reconcileRecords) return current
    const records = current[module.recordCollection]
    const next = module.reconcileRecords(records, sources, now)
    return next === records ? current : { ...current, [module.recordCollection]: next }
  }, store)
}

export function replaceModuleRecords(store, module, records) {
  const others = module.measurementType ? store[module.recordCollection].filter((item) => item.type !== module.measurementType) : []
  return { ...store, [module.recordCollection]: [...others, ...records] }
}

export function saveModuleRecord(store, module, item, additionalRecords = []) {
  const current = recordsForModule(store, module)
  const next = current.some((record) => record.id === item.id) ? current.map((record) => record.id === item.id ? item : record) : [...current, item]
  for (const record of additionalRecords) if (!next.some((existing) => existing.id === record.id)) next.push(record)
  if (module.validateRecord && (!next.every(module.validateRecord) || !module.validateCollection(next))) throw new Error('invalidData')
  return replaceModuleRecords(store, module, next)
}
