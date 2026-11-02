import { formatDate, isFutureLocalDate, localDateValue } from '../../../utils/date.js'

export function WeightHistory({ measurements, language, onEdit, t, open = false, onOpenChange }) {
  return <details className="history" open={open} onToggle={(event) => { if (event.currentTarget.open !== open) onOpenChange?.(event.currentTarget.open) }}>
    <summary className="section-heading"><span>{t('history')}</span><span>{measurements.length}</span></summary>
    {!measurements.length && <div className="empty card"><span>↗</span><p>{t('noEntries')}</p></div>}
    <div className="entry-list">{measurements.map((item, index) => {
      const change = index < measurements.length - 1 ? item.value - measurements[index + 1].value : null
      const future = isFutureLocalDate(localDateValue(item.timestamp))
      return <button className={`entry entry-link${future ? ' future-record' : ''}`} type="button" key={item.id} onClick={() => onEdit(item)} aria-label={`${t('editAction')}: ${formatDate(item.timestamp, language)}, ${item.value.toFixed(1)} kg${future ? `, ${t('futureMeasurementLabel')}` : ''}`}>
        <div><time dateTime={item.timestamp}>{formatDate(item.timestamp, language)}</time>{future && <span className="future-record-label">{t('futureMeasurementLabel')}</span>}</div>
        <strong>{item.value.toFixed(1)} <small>kg</small>{change !== null && <em className={change <= 0 ? 'down' : 'up'}>{change > 0 ? '+' : ''}{change.toFixed(1)} kg</em>}</strong>
        <span className="entry-chevron" aria-hidden="true">›</span>
        {item.note && <p className="weight-history-note">{item.note}</p>}
      </button>
    })}</div>
  </details>
}
