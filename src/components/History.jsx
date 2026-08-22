import { formatDateTime } from '../utils/date.js'

export function History({ measurements, language, onEdit, t }) {
  return <section className="history">
    <div className="section-heading"><h2>{t('history')}</h2><span>{measurements.length}</span></div>
    {!measurements.length && <div className="empty card"><span>↗</span><p>{t('noEntries')}</p></div>}
    <div className="entry-list">{measurements.map((item, index) => {
      const change = index < measurements.length - 1 ? item.value - measurements[index + 1].value : null
      return <button className="entry entry-link card" type="button" key={item.id} onClick={() => onEdit(item)} aria-label={`${t('editAction')}: ${formatDateTime(item.timestamp, language)}, ${item.value.toFixed(1)} kg`}>
        <div><time dateTime={item.timestamp}>{formatDateTime(item.timestamp, language)}</time>{item.note && <p>{item.note}</p>}</div>
        <strong>{item.value.toFixed(1)} <small>kg</small>{change !== null && <em className={change <= 0 ? 'down' : 'up'}>{change > 0 ? '+' : ''}{change.toFixed(1)}</em>}</strong>
        <span className="entry-chevron" aria-hidden="true">›</span>
      </button>
    })}</div>
  </section>
}
