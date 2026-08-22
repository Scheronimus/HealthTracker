import { formatDateTime } from '../utils/date.js'

export function History({ measurements, language, onEdit, onDelete, t }) {
  return <section className="history">
    <div className="section-heading"><h2>{t('history')}</h2><span>{measurements.length}</span></div>
    {!measurements.length && <div className="empty card"><span>↗</span><p>{t('noEntries')}</p></div>}
    <div className="entry-list">{measurements.map((item, index) => <article className="entry card" key={item.id}>
      <div><time dateTime={item.timestamp}>{formatDateTime(item.timestamp, language)}</time>{item.note && <p>{item.note}</p>}</div>
      <strong>{item.value.toFixed(1)} <small>kg</small>{index < measurements.length - 1 && <em className={item.value - measurements[index + 1].value <= 0 ? 'down' : 'up'}>{item.value - measurements[index + 1].value > 0 ? '+' : ''}{(item.value - measurements[index + 1].value).toFixed(1)}</em>}</strong>
      <div className="entry-actions"><button onClick={() => onEdit(item)}>{t('editAction')}</button><button className="danger" onClick={() => onDelete(item.id)}>{t('delete')}</button></div>
    </article>)}</div>
  </section>
}
