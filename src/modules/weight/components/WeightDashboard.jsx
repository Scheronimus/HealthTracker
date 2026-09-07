import { WeightChart } from './WeightChart.jsx'
import { WeightSummary } from './WeightSummary.jsx'
import { WeightHistory } from './WeightHistory.jsx'
import { filterBySpan } from '../chart.js'

export function WeightDashboard({ measurements, language, profile, state, onStateChange, onProfileChange, onEdit, t }) {
  const chartSpan = state.chartSpan ?? 'threeMonths'
  const visibleMeasurements = filterBySpan(measurements, chartSpan)
  return <>
    <WeightChart measurements={visibleMeasurements} language={language} span={chartSpan} onSpanChange={(next) => onStateChange({ ...state, chartSpan: next })} profile={profile} onBmiZonesChange={(showBmiRange) => onProfileChange({ ...profile, showBmiRange })} t={t} />
    <WeightSummary measurements={measurements} visibleMeasurements={visibleMeasurements} span={chartSpan} language={language} profile={profile} t={t} />
    <WeightHistory measurements={visibleMeasurements} language={language} onEdit={onEdit} t={t} />
  </>
}
