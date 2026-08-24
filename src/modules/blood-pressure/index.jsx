import { BloodPressureEntryForm } from './components/BloodPressureEntryForm.jsx'
import { BloodPressureModule } from './components/BloodPressureModule.jsx'
import { localDateValue } from '../../utils/date.js'
import { measurementPeriodStart } from './bloodPressure.js'

function afterSave({ item, measurements, state }) {
  if (!state.selectedWeek) return state
  const nextMeasurements = [...measurements.filter((entry) => entry.id !== item.id), item]
  const anchor = nextMeasurements.map((entry) => localDateValue(entry.timestamp)).sort()[0]
  return { ...state, selectedWeek: measurementPeriodStart(localDateValue(item.timestamp), anchor) }
}

export const bloodPressureModule = Object.freeze({
  id: 'bloodPressure',
  Dashboard: BloodPressureModule,
  EntryForm: BloodPressureEntryForm,
  initialState: Object.freeze({ selectedWeek: null, view: 'overview' }),
  labels: Object.freeze({ add: 'addBloodPressure', edit: 'editBloodPressure', deleteConfirm: 'deleteBloodPressureConfirm' }),
  afterSave,
})
