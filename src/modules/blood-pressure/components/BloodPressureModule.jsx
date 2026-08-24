import { BloodPressureDashboard } from './BloodPressureDashboard.jsx'
import { groupBloodPressurePeriods } from '../bloodPressure.js'

export function BloodPressureModule({ measurements, language, state, onStateChange, onEdit, t }) {
  const weeks = groupBloodPressurePeriods(measurements)
  const selectedWeek = state.selectedWeek ?? null
  const view = state.view ?? 'overview'
  return <BloodPressureDashboard
    weeks={weeks}
    measurements={measurements}
    selectedWeek={selectedWeek}
    view={view}
    language={language}
    onSlot={onEdit}
    onSelectWeek={(next) => onStateChange({ ...state, selectedWeek: next })}
    onView={(next) => onStateChange({ ...state, view: next })}
    t={t}
  />
}
