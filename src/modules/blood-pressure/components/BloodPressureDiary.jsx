import { BP_READING_SLOTS, bloodPressureReadingsOnDate, localTimeValue, weekDates } from '../bloodPressure.js'
import { formatDate, isFutureTimestamp, localDateValue } from '../../../utils/date.js'

export function BloodPressureDiary({ week, language, canGoNewer, canGoOlder, onNewer, onOlder, onSlot, t }) {
  const today = localDateValue()
  return <section className={'bp-diary'}>
    <div className={'bp-diary-heading'}>
      <button type={'button'} disabled={!canGoOlder} onClick={onOlder} aria-label={t('olderPeriod')}>‹</button>
      <div><h2>{t('diary')}</h2><p>{formatDate(`${week.start}T12:00:00`, language)} – {formatDate(`${week.end}T12:00:00`, language)}</p></div>
      <button type={'button'} disabled={!canGoNewer} onClick={onNewer} aria-label={t('newerPeriod')}>›</button>
    </div>
    <div className={'bp-diary-table-wrap card'}><table className={'bp-diary-table'}>
      <caption className={'visually-hidden'}>{t('diary')}</caption>
      <thead><tr><th scope={'col'}>{t('date')}</th>{BP_READING_SLOTS.map((slot) => <th key={slot} scope={'col'}>{t(slot === 1 ? 'readingOne' : 'readingTwo')}</th>)}</tr></thead>
      <tbody>{weekDates(week.start).map((date) => <tr className={date === today ? 'today' : ''} key={date}>
        <th scope={'row'}><time dateTime={date}><strong>{new Intl.DateTimeFormat(language, { weekday: 'short' }).format(new Date(`${date}T12:00:00`))}</strong><small>{new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))}</small></time></th>
        {BP_READING_SLOTS.map((slot) => {
          const readings = bloodPressureReadingsOnDate(week.measurements, date)
          const item = readings[slot - 1]
          const future = date > today
          const futureRecord = Boolean(item && isFutureTimestamp(item.timestamp))
          const available = slot <= readings.length + 1
          const slotLabel = t(slot === 1 ? 'readingOne' : 'readingTwo')
          const label = item ? `${slotLabel}, ${item.systolicMmHg}/${item.diastolicMmHg} mmHg, ${item.pulseBpm} bpm${futureRecord ? `, ${t('futureMeasurementLabel')}` : ''}` : `${slotLabel}, ${t(future ? 'upcoming' : 'addOptional')}`
          return <td key={slot}><button aria-label={label} type={'button'} className={item ? `bp-diary-reading recorded${futureRecord ? ' future-record' : ''}` : 'bp-diary-reading optional'} disabled={!item && (future || !available)} onClick={() => onSlot(item, { date, slot })}>
            {item ? <><strong>{item.systolicMmHg}/{item.diastolicMmHg}</strong><small>{localTimeValue(item.timestamp)} · {item.pulseBpm} bpm</small>{futureRecord && <span className={'future-record-label'}>{t('futureMeasurementLabel')}</span>}</> : <span>{t(future ? 'upcoming' : 'addOptional')}</span>}
          </button></td>
        })}
      </tr>)}</tbody>
    </table></div>
  </section>
}
