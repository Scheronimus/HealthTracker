import { summarizeWeights } from '../utils/summary.js'

function signed(value) { return `${value > 0 ? '+' : ''}${value.toFixed(1)} kg` }

export function Summary({ measurements, visibleMeasurements, span, t }) {
  if (!measurements.length) return null
  const { current, rangeChange, entries } = summarizeWeights(measurements, visibleMeasurements)
  return <section className="summary" aria-label={t('summary')}>
    <article><span>{t('currentWeight')}</span><strong>{current.toFixed(1)} kg</strong></article>
    <article><span>{t('rangeChange', { span: t(span) })}</span><strong>{rangeChange === null ? '—' : signed(rangeChange)}</strong></article>
    <article><span>{t('entries')}</span><strong>{entries}</strong></article>
  </section>
}
