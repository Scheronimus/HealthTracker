import { formatDate } from '../../../utils/date.js'
import { summarizeWeights } from '../summary.js'
import { bmiStatus, calculateBmi, WHO_BMI_BANDS } from '../bmi.js'
import { WeightBmiInfo } from './WeightBmiInfo.jsx'

function signed(value) { return `${value > 0 ? '+' : ''}${value.toFixed(1)} kg` }

export function WeightSummary({ measurements, visibleMeasurements, span, language, profile, t }) {
  if (!measurements.length) return null
  const { current, rangeChange, comparisonTimestamp } = summarizeWeights(measurements, visibleMeasurements)
  const bmi = profile.showBmi ? calculateBmi(current, profile.heightCm) : null
  const status = bmiStatus(bmi, profile.age)
  const band = WHO_BMI_BANDS.find(({ key }) => key === status)
  const referenceTimestamp = comparisonTimestamp ?? visibleMeasurements.at(-1)?.timestamp
  return <section className={`summary${bmi !== null ? ' summary-with-bmi' : ''}`} aria-label={t('summary')}>
    <article>
      <strong>{rangeChange === null ? '—' : signed(rangeChange)}</strong>
      <span>{referenceTimestamp ? t('weightSince', { date: formatDate(referenceTimestamp, language) }) : t(`weightPeriod_${span}`)}</span>
    </article>
    {bmi !== null && <article className="bmi-summary"><strong className={`weight-bmi-value${band ? ` ${band.key}` : ''}`}>{bmi.toFixed(1)}</strong><div className="weight-bmi-label"><span>{t('weightBmi')}</span><WeightBmiInfo status={status} band={band} profile={profile} t={t} /></div></article>}
  </section>
}
