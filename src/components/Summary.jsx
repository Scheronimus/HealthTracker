function signed(value) { return `${value > 0 ? '+' : ''}${value.toFixed(1)} kg` }

export function Summary({ measurements, t }) {
  if (!measurements.length) return null
  const latest = measurements[0].value
  const recent = measurements.length > 1 ? latest - measurements[1].value : null
  const total = measurements.length > 1 ? latest - measurements.at(-1).value : null
  return <section className="summary" aria-label={t('allTime')}>
    <article><span>{t('latest')}</span><strong>{latest.toFixed(1)} kg</strong></article>
    <article><span>{t('recent')}</span><strong>{recent === null ? '—' : signed(recent)}</strong></article>
    <article><span>{t('change')}</span><strong>{total === null ? '—' : signed(total)}</strong></article>
    <article><span>{t('entries')}</span><strong>{measurements.length}</strong></article>
  </section>
}
