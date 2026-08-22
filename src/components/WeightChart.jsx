import { useId, useMemo, useState } from 'react'
import { chartGeometry, filterBySpan, shouldDisplayMarker } from '../utils/chart.js'
import { formatDateTime } from '../utils/date.js'

const WIDTH = 800
const HEIGHT = 300
const PAD = { top: 18, right: 18, bottom: 42, left: 55 }
const DENSE_POINT_COUNT = 60

export function WeightChart({ measurements, language, t }) {
  const [span, setSpan] = useState('threeMonths')
  const [active, setActive] = useState(null)
  const gradientId = useId().replaceAll(':', '')
  const visible = useMemo(() => filterBySpan(measurements, span), [measurements, span])
  const { points, ticks } = useMemo(() => chartGeometry(visible, WIDTH, HEIGHT), [visible])
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const area = points.length ? `0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}` : ''
  const first = points[0]
  const last = points.at(-1)
  const dense = points.length > DENSE_POINT_COUNT

  return <section className={`weight-chart card${dense ? ' dense-chart' : ''}`} aria-labelledby="chart-title">
    <div className="chart-header">
      <div><h2 id="chart-title">{t('trend')}</h2><p>{t('trendHint')}</p></div>
      <div className="span-control" role="group" aria-label={t('timeSpan')}>
        {['threeMonths', 'oneYear', 'allTime'].map((option) => <button key={option} type="button" className={span === option ? 'active' : ''} aria-pressed={span === option} onClick={() => { setSpan(option); setActive(null) }}>{t(option)}</button>)}
      </div>
    </div>
    {!points.length ? <div className="chart-empty"><span>⌁</span><p>{t('noChartData')}</p></div> : <>
      <div className="chart-wrap">
        <svg className="chart-svg" viewBox={`0 0 ${WIDTH + PAD.left + PAD.right} ${HEIGHT + PAD.top + PAD.bottom}`} role="img" aria-label={t('chartDescription', { count: points.length })}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4bb69d" stopOpacity=".34" /><stop offset="1" stopColor="#4bb69d" stopOpacity=".02" /></linearGradient></defs>
          <g transform={`translate(${PAD.left} ${PAD.top})`}>
            {ticks.map(({ value, y }) => <g key={value}><line className="grid-line" x1="0" x2={WIDTH} y1={y} y2={y} /><text className="axis-label y-label" x="-10" y={y + 4}>{value.toFixed(1)}</text></g>)}
            {points.length > 1 && <polygon points={area} fill={`url(#${gradientId})`} />}
            {points.length > 1 && <polyline className="trend-line" points={line} />}
            {points.map((point) => {
              const selected = active?.id === point.id
              const showMarker = selected || shouldDisplayMarker(point.index, points.length)
              return <g key={point.id} className="chart-point" tabIndex={showMarker ? 0 : -1} role="button" aria-label={`${formatDateTime(point.timestamp, language)}, ${point.value.toFixed(1)} kg`} onFocus={() => setActive(point)} onBlur={() => setActive(null)} onClick={() => setActive(selected ? null : point)}>
                <circle className="point-target" cx={point.x} cy={point.y} r={dense ? 8 : 16} />
                {showMarker && <circle className="point-dot" cx={point.x} cy={point.y} r={selected ? 5.5 : dense ? 2.25 : 4} />}
              </g>
            })}
            <text className="axis-label x-start" x="0" y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(first.timestamp))}</text>
            {last.id !== first.id && <text className="axis-label x-end" x={WIDTH} y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(last.timestamp))}</text>}
          </g>
        </svg>
        {active && <div className="chart-tooltip"><strong>{active.value.toFixed(1)} kg</strong><span>{formatDateTime(active.timestamp, language)}</span>{active.note && <small>{active.note}</small>}</div>}
      </div>
      <p className="chart-caption">{t('visibleEntries', { count: points.length })}</p>
    </>}
  </section>
}
