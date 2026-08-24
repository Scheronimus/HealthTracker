import { averageChange, isWeeklyAverageAboveReference, weeklyAverages } from '../utils/bloodPressure.js'
import { localDateValue } from '../utils/date.js'

function changeText(value) {
  const rounded = Math.round(value)
  if (rounded === 0) return '0'
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}`
}

export function BloodPressureOverview({ current, previous, onSlot, onShowDiary, onShowTrends, t }) {
  const average = weeklyAverages(current.measurements)
  const change = averageChange(current.measurements, previous?.measurements ?? [])
  const today = localDateValue()
  const todayReadings = current.measurements.filter((item) => localDateValue(item.timestamp) === today)

  return <section className={'bp-overview'}>
    <article className={'bp-overview-hero card'}>
      <span>{t('currentPeriodAverage')}</span>
      <div className={'bp-primary-reading'}><strong>{average ? `${Math.round(average.systolic)} / ${Math.round(average.diastolic)}` : '— / —'}</strong><small>mmHg</small></div>
      <p>{average ? t('averageReadingCount', { count: average.count, pulse: Math.round(average.pulse) }) : t('bpNoAverage')}</p>
      {change
        ? <div className={'bp-change'}><strong>{changeText(change.systolic)} / {changeText(change.diastolic)} mmHg</strong><span>{t('comparedPreviousPeriod')}</span></div>
        : <p className={'bp-no-comparison'}>{t('noPreviousComparison')}</p>}
    </article>

    <section className={'bp-today card'}>
      <div className={'section-heading'}><h2>{t('today')}</h2><span>{todayReadings.length}/2</span></div>
      <div className={'bp-today-slots'}>{['morning', 'evening'].map((period) => {
        const item = todayReadings.find((reading) => reading.period === period)
        return <button key={period} type={'button'} className={item ? 'bp-today-reading recorded' : 'bp-today-reading optional'} onClick={() => onSlot(item, { date: today, period })}>
          <span>{t(period)}</span>
          {item ? <><strong>{item.systolicMmHg} / {item.diastolicMmHg}</strong><small>{item.pulseBpm} bpm</small></> : <strong>{t('addOptional')}</strong>}
        </button>
      })}</div>
    </section>

    <section className={'bp-progress card'}>
      <div><span>{t('periodProgress')}</span><strong>{t('possibleReadingsLogged', { count: current.measurements.length, total: 14 })}</strong></div>
      <progress value={current.measurements.length} max={'14'}>{current.measurements.length}/14</progress>
      <button type={'button'} onClick={onShowDiary}>{t('openDiary')}</button>
    </section>

    <aside className={'bp-reference compact'}>
      <strong>{average ? t(isWeeklyAverageAboveReference(average) ? 'bpAboveReference' : 'bpNotAboveReference') : t('bpNoAverage')}</strong>
      <p>{t('bpReferenceDisclaimer')}</p>
    </aside>

    <button className={'bp-trends-link card'} type={'button'} onClick={onShowTrends}><span><strong>{t('trends')}</strong><small>{t('trendsPreviewHint')}</small></span><i aria-hidden={'true'}>›</i></button>
  </section>
}
