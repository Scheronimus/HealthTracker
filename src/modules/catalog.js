import { validateWeightMeasurement } from './weight/model.js'
import { mergeWeightImport, parseWeightImportCsv, weightCsv } from './weight/transfer.js'
import { validateBloodPressureCollection, validateBloodPressureMeasurement } from './blood-pressure/model.js'
import { canRestoreBloodPressure, mergeBloodPressureImport, parseBloodPressureImportCsv } from './blood-pressure/transfer.js'

export const MODULE_CATALOG = Object.freeze([
  Object.freeze({
    id: 'weight', labelKey: 'weightArea', measurementType: 'weight', validateMeasurement: validateWeightMeasurement,
    csv: Object.freeze({ matches: (columns) => columns === 2, parse: parseWeightImportCsv, merge: mergeWeightImport, export: weightCsv, labels: { confirm: 'csvImportConfirm', done: 'csvImportDone', export: 'csv' } }),
  }),
  Object.freeze({
    id: 'bloodPressure', labelKey: 'bloodPressureArea', measurementType: 'bloodPressure', validateMeasurement: validateBloodPressureMeasurement, validateCollection: validateBloodPressureCollection,
    csv: Object.freeze({ matches: (columns) => columns === 5, parse: parseBloodPressureImportCsv, merge: mergeBloodPressureImport, labels: { confirm: 'bpCsvImportConfirm', done: 'bpCsvImportDone' } }),
    canRestore: canRestoreBloodPressure,
  }),
])

export const DEFAULT_MODULES = Object.freeze(MODULE_CATALOG.map(({ id }) => id))
export const MODULE_DATA_BY_TYPE = Object.freeze(Object.fromEntries(MODULE_CATALOG.map((module) => [module.measurementType, module])))
