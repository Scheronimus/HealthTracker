import { validateWeightMeasurement } from './weight/model.js'
import { mergeWeightImport, parseWeightImportCsv, weightCsv } from './weight/transfer.js'
import { validateBloodPressureCollection, validateBloodPressureMeasurement } from './blood-pressure/model.js'
import { canRestoreBloodPressure, mergeBloodPressureImport, parseBloodPressureImportCsv } from './blood-pressure/transfer.js'
import { isFutureLocalDate, isFutureTimestamp, localDateValue } from '../utils/date.js'
import { goalReferenceLines, reconcileGoals, validateGoal, validateGoalCollection } from './goals/model.js'
import { goalTranslations } from './goals/translations.js'
import { weightTranslations } from './weight/translations.js'

export const MODULE_CATALOG = Object.freeze([
  Object.freeze({
    id: 'weight', labelKey: 'weightArea', translations: weightTranslations, recordCollection: 'measurements', maxDailyEntries: 1, measurementType: 'weight', validateMeasurement: validateWeightMeasurement,
    isFutureMeasurement: (item, now) => isFutureLocalDate(localDateValue(item.timestamp), now),
    csv: Object.freeze({ matches: (columns) => columns === 2, parse: parseWeightImportCsv, merge: mergeWeightImport, export: weightCsv, labels: { confirm: 'csvImportConfirm', done: 'csvImportDone', export: 'csv' } }),
  }),
  Object.freeze({
    id: 'bloodPressure', labelKey: 'bloodPressureArea', recordCollection: 'measurements', maxDailyEntries: 2, measurementType: 'bloodPressure', validateMeasurement: validateBloodPressureMeasurement, validateCollection: validateBloodPressureCollection,
    isFutureMeasurement: (item, now) => isFutureTimestamp(item.timestamp, now),
    csv: Object.freeze({ matches: (columns) => columns === 5, parse: parseBloodPressureImportCsv, merge: mergeBloodPressureImport, labels: { confirm: 'bpCsvImportConfirm', done: 'bpCsvImportDone' } }),
    canRestore: canRestoreBloodPressure,
  }),
  Object.freeze({
    id: 'goals', labelKey: 'goal_area', recordCollection: 'goals', translations: goalTranslations,
    validateRecord: validateGoal, validateCollection: validateGoalCollection, reconcileRecords: reconcileGoals,
    referenceLines: goalReferenceLines,
    canRestore: (existing, item) => !existing.some((goal) => goal.kind === item.kind),
    isFutureMeasurement: (item, now) => item.startDate > localDateValue(now),
  }),
])

export const DEFAULT_MODULES = Object.freeze(MODULE_CATALOG.map(({ id }) => id))
export const MODULE_DATA_BY_TYPE = Object.freeze(Object.fromEntries(MODULE_CATALOG.filter((module) => module.measurementType).map((module) => [module.measurementType, module])))
