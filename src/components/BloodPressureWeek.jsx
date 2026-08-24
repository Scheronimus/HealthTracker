import { BloodPressureChart } from './BloodPressureChart.jsx'
import { formatDate, localDateValue } from '../utils/date.js'
import { BP_PERIODS, isWeeklyAverageAboveReference, localTimeValue, weekDates, weeklyAverages } from '../utils/bloodPressure.js'

export function BloodPressureWeek({ week, language, onSlot, t, detailed = false }) {
  const average = weeklyAverages(week.measurements)
  const above = isWeeklyAverageAboveReference(average)
  const days = new Set(week.measurements.map((item) => localDateValue(item.timestamp))).size
  const today = localDateValue()
  return <section className={'bp-week'}>
    <div className={'bp-week-heading'}><div><h2>{formatDate(`${week.start}T12:00:00`, language)} – {formatDate(`${week.end}T12:00:00`, language)}</h2><p>{average ? t('averageAvailable') : t('addFirstReading')}</p></div><strong>{t('coverage', { count: week.measurements.length, days })}</strong></div>
    <div className={'bp-averages'}>
      <article><span>{t('systolic')}</span><strong>{average ? average.systolic.toFixed(1) : '—'}</strong><small>mmHg</small></article>
      <article><span>{t('diastolic')}</span><strong>{average ? average.diastolic.toFixed(1) : '—'}</strong><small>mmHg</small></article>
      <article><span>{t('pulse')}</span><strong>{average ? average.pulse.toFixed(1) : '—'}</strong><small>bpm</small></article>
    </div>
    <div className={'bp-reference'}><strong>{average ? t(above ? 'bpAboveReference' : 'bpNotAboveReference') : t('bpNoAverage')}</strong><p>{t('bpReferenceDisclaimer')}</p></div>
    {detailed && <BloodPressureChart measurements={week.measurements} start={week.start} language={language} t={t} />}
    <div className={'bp-slots'}>{weekDates(week.start).map((date) => <div className={'bp-day card'} key={date}><time dateTime={date}>{new Intl.DateTimeFormat(language, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))}</time><div>{BP_PERIODS.map((period) => {
      const item = week.measurements.find((entry) => entry.period === period && localDateValue(entry.timestamp) === date)
      const future = date > today
      return <button key={period} type={'button'} className={item ? 'bp-slot recorded' : 'bp-slot optional'} disabled={future} onClick={() => onSlot(item, { date, period })}><span>{t(period)}</span>{item ? <strong>{item.systolicMmHg}/{item.diastolicMmHg}<small>{localTimeValue(item.timestamp)} · {item.pulseBpm} bpm</small></strong> : <em>{t(future ? 'upcoming' : 'addOptional')}</em>}</button>
    })}</div></div>)}</div>
  </section>
}
