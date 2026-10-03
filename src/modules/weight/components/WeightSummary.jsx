import { formatDate } from '../../../utils/date.js'
import { summarizeWeights } from '../summary.js'
import { bmiStatus, calculateBmi } from '../bmi.js'

function signed(value) { return `${value > 0 ? '+' : ''}${value.toFixed(1)} kg` }

export function WeightSummary({ measurements, visibleMeasurements, span, language, profile, t }) {
  if (!measurements.length) return null
  const { current, rangeChange, comparisonTimestamp } = summarizeWeights(measurements, visibleMeasurements)
  const bmi = profile.showBmi ? calculateBmi(current, profile.heightCm) : null
  const status = bmiStatus(bmi, profile.age)
  return <section className={`summary${bmi !== null ? ' summary-with-bmi' : ''}`} aria-label={t('summary')}>
    <article><strong>{current.toFixed(1)} kg</strong><span>{t('currentWeight')}</span></article>
    <article>
      <strong>{rangeChange === null ? '—' : signed(rangeChange)}</strong>
      <span>{t('rangeChange', { span: t(span) })}{comparisonTimestamp && <small> ({formatDate(comparisonTimestamp, language)})</small>}</span>
    </article>
    {bmi !== null && <article className="bmi-summary"><strong>{bmi.toFixed(1)}</strong><span>{t('currentBmi')}</span><div className={`bmi-status ${status}`}>{t(status)}</div><details className="weight-bmi-details"><summary>{t('bmiDetails')}</summary><small className="summary-note">{t('bmiBasedOn', { height: profile.heightCm })}</small>{profile.age !== null && profile.age >= 65 && <small className="bmi-caution">{t('bmiOlderCaution')}</small>}</details><small className="bmi-disclaimer">{t('bmiDisclaimer')}</small></article>}
  </section>
}
