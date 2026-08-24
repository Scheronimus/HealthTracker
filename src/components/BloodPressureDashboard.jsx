import { BloodPressureWeek } from './BloodPressureWeek.jsx'
import { formatDate } from '../utils/date.js'

export function BloodPressureDashboard({ weeks, language, onSlot, onSelectWeek, t }) {
  const [current, ...history] = weeks
  return <div className={'bp-dashboard'}>
    <BloodPressureWeek week={current} language={language} onSlot={onSlot} t={t} detailed />
    <section className={'bp-history'}><div className={'section-heading'}><h2>{t('previousWeeks')}</h2><span>{history.length}</span></div>
      {!history.length && <div className={'empty card'}><p>{t('noPreviousWeeks')}</p></div>}
      <div className={'entry-list'}>{history.map((week) => <button key={week.start} type={'button'} className={'entry-link bp-week-link card'} onClick={() => onSelectWeek(week.start)}><span><strong>{formatDate(`${week.start}T12:00:00`, language)} – {formatDate(`${week.end}T12:00:00`, language)}</strong><small>{t('readingsCount', { count: week.measurements.length })}</small></span><b>{week.measurements.length}/14</b><i aria-hidden={'true'}>›</i></button>)}</div>
    </section>
  </div>
}
