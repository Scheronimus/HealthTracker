import { averageChange, bloodPressureReadingsOnDate, weeklyAverages } from '../bloodPressure.js'
import { localDateValue } from '../../../utils/date.js'

function changeText(value) {
  const rounded = Math.round(value)
  if (rounded === 0) return '0'
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}`
}

export function BloodPressureOverview({ current, previous, onSlot, t }) {
  const average = weeklyAverages(current.measurements)
  const change = averageChange(current.measurements, previous?.measurements ?? [])
  const today = localDateValue()
  const todayReadings = bloodPressureReadingsOnDate(current.measurements, today)

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
      <div className={'bp-today-slots'}>{[0, 1].map((index) => {
        const item = todayReadings[index]
        const available = index <= todayReadings.length
        return <button key={index} type={'button'} className={item ? 'bp-today-reading recorded' : 'bp-today-reading optional'} disabled={!available} onClick={() => onSlot(item, { date: today, slot: index + 1 })}>
          <span>{t(index === 0 ? 'readingOne' : 'readingTwo')}</span>
          {item ? <><strong>{item.systolicMmHg} / {item.diastolicMmHg}</strong><small>{item.pulseBpm} bpm</small></> : <strong>{t('addOptional')}</strong>}
        </button>
      })}</div>
    </section>

    <section className={'bp-progress card'}>
      <div><span>{t('periodProgress')}</span><strong>{t('possibleReadingsLogged', { count: current.measurements.length, total: 14 })}</strong></div>
      <progress value={current.measurements.length} max={'14'}>{current.measurements.length}/14</progress>
    </section>
  </section>
}
