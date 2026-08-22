import { formatDate } from '../utils/date.js'
import { summarizeWeights } from '../utils/summary.js'
import { calculateBmi } from '../utils/bmi.js'

function signed(value) { return `${value > 0 ? '+' : ''}${value.toFixed(1)} kg` }

export function Summary({ measurements, visibleMeasurements, span, language, profile, t }) {
  if (!measurements.length) return null
  const { current, rangeChange, comparisonTimestamp } = summarizeWeights(measurements, visibleMeasurements)
  const bmi = profile.showBmi ? calculateBmi(current, profile.heightCm) : null
  return <section className={`summary${bmi !== null ? ' summary-with-bmi' : ''}`} aria-label={t('summary')}>
    <article><span>{t('currentWeight')}</span><strong>{current.toFixed(1)} kg</strong></article>
    <article>
      <span>{t('rangeChange', { span: t(span) })}{comparisonTimestamp && <small> ({formatDate(comparisonTimestamp, language)})</small>}</span>
      <strong>{rangeChange === null ? '—' : signed(rangeChange)}</strong>
    </article>
    {bmi !== null && <article><span>{t('currentBmi')}</span><strong>{bmi.toFixed(1)}</strong><small className="summary-note">{t('bmiBasedOn', { height: profile.heightCm })}</small></article>}
  </section>
}
