import { WeightChart } from './WeightChart.jsx'
import { WeightSummary } from './WeightSummary.jsx'
import { WeightHistory } from './WeightHistory.jsx'
import { filterBySpan, fiveMeasurementAverages } from '../chart.js'
import { summarizeWeights } from '../summary.js'
import '../weight.css'

export function WeightDashboard({ measurements, sources, language, profile, state, onStateChange, onProfileChange, onEdit, t }) {
  const chartSpan = state.chartSpan ?? 'threeMonths'
  const visibleMeasurements = filterBySpan(measurements, chartSpan)
  const averages = filterBySpan(fiveMeasurementAverages(measurements), chartSpan)
  const heroMeasurements = filterBySpan(measurements, 'threeMonths')
  const { current, rangeChange } = summarizeWeights(measurements, heroMeasurements)
  return <div className="weight-dashboard">
    {current !== null && <div className="weight-hero">
      <span>{t('currentWeight')}</span>
      <strong>{current.toFixed(1)} <small>kg</small></strong>
      <p>{rangeChange !== null && <><span className={rangeChange <= 0 ? 'down' : 'up'}><span aria-hidden="true">{rangeChange < 0 ? '↓' : rangeChange > 0 ? '↑' : '→'} </span>{rangeChange > 0 ? '+' : ''}{rangeChange.toFixed(1)} kg</span> · </>}{t('threeMonths')}</p>
    </div>}
    <WeightChart referenceLines={sources?.weight?.referenceLines ?? []} showFinalTarget={state.showFinalTarget ?? true} showMilestone={state.showMilestone ?? true} onFinalTargetChange={(showFinalTarget) => onStateChange({ ...state, showFinalTarget })} onMilestoneChange={(showMilestone) => onStateChange({ ...state, showMilestone })} averages={averages} showAverage={state.showAverage ?? false} onAverageChange={(showAverage) => onStateChange({ ...state, showAverage })} measurements={visibleMeasurements} language={language} span={chartSpan} onSpanChange={(next) => onStateChange({ ...state, chartSpan: next })} profile={profile} onBmiZonesChange={(showBmiRange) => onProfileChange({ ...profile, showBmiRange })} t={t} />
    <WeightSummary measurements={measurements} visibleMeasurements={visibleMeasurements} span={chartSpan} language={language} profile={profile} t={t} />
    <WeightHistory measurements={visibleMeasurements} language={language} onEdit={onEdit} t={t} />
  </div>
}
