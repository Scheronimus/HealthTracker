import { WeightEntryForm } from './components/WeightEntryForm.jsx'
import { WeightDashboard } from './components/WeightDashboard.jsx'
import { WeightProfileSettings } from './components/WeightProfileSettings.jsx'

export const weightModule = Object.freeze({
  id: 'weight',
  Dashboard: WeightDashboard,
  EntryForm: WeightEntryForm,
  ProfileSettings: WeightProfileSettings,
  initialState: Object.freeze({ chartSpan: 'threeMonths', showAverage: false }),
  labels: Object.freeze({ add: 'add', edit: 'edit', deleteConfirm: 'deleteConfirm' }),
})
