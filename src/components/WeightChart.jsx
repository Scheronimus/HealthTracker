import { useId, useMemo, useState } from 'react'
import { chartGeometry, chartValueY, nearestPointIndex } from '../utils/chart.js'
import { bmiWeightBands } from '../utils/bmi.js'
import { formatDate } from '../utils/date.js'

const WIDTH = 800
const HEIGHT = 400
const PAD = { top: 18, right: 18, bottom: 42, left: 55 }

export function WeightChart({ measurements, language, span, onSpanChange, profile, t }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const gradientId = useId().replaceAll(':', '')
  const bmiBands = useMemo(() => profile.showBmiRange && (profile.age === null || profile.age >= 18) ? bmiWeightBands(profile.heightCm) : [], [profile.age, profile.heightCm, profile.showBmiRange])
  const geometry = useMemo(() => chartGeometry(measurements, WIDTH, HEIGHT), [measurements])
  const { points, ticks } = geometry
  const visibleBands = bmiBands.map((band) => {
    const lower = Math.max(band.minKg, geometry.min)
    const upper = Math.min(band.maxKg, geometry.max)
    if (upper <= lower) return null
    const top = chartValueY(upper, geometry, HEIGHT)
    const bottom = chartValueY(lower, geometry, HEIGHT)
    return { ...band, top, height: bottom - top }
  }).filter(Boolean)
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const area = points.length ? `0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}` : ''
  const first = points[0]
  const last = points.at(-1)
  const active = activeIndex === null ? null : points[activeIndex] ?? null

  function selectAtPointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const chartX = ((event.clientX - bounds.left) / bounds.width) * WIDTH
    setActiveIndex(nearestPointIndex(points, chartX))
  }

  function navigate(event) {
    let next = activeIndex ?? points.length - 1
    if (event.key === 'ArrowLeft') next -= 1
    else if (event.key === 'ArrowRight') next += 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = points.length - 1
    else return
    event.preventDefault()
    setActiveIndex(Math.max(0, Math.min(points.length - 1, next)))
  }

  const activeText = active ? `${formatDate(active.timestamp, language)}, ${active.value.toFixed(1)} kg` : t('chartDescription', { count: points.length })

  return <section className="weight-chart card" aria-labelledby="chart-title">
    <div className="chart-header">
      <div><h2 id="chart-title">{t('trend')}</h2><p>{t('trendHint')}</p></div>
      <div className="span-control" role="group" aria-label={t('timeSpan')}>
        {['threeMonths', 'oneYear', 'allTime'].map((option) => <button key={option} type="button" className={span === option ? 'active' : ''} aria-pressed={span === option} onClick={() => { onSpanChange(option); setActiveIndex(null) }}>{t(option)}</button>)}
      </div>
    </div>
    {!points.length ? <div className="chart-empty"><span>⌁</span><p>{t('noChartData')}</p></div> : <>
      <div className="chart-wrap">
        <svg className="chart-svg" viewBox={`0 0 ${WIDTH + PAD.left + PAD.right} ${HEIGHT + PAD.top + PAD.bottom}`} role="img" aria-label={t('chartDescription', { count: points.length })}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4bb69d" stopOpacity=".34" /><stop offset="1" stopColor="#4bb69d" stopOpacity=".02" /></linearGradient></defs>
          <g transform={`translate(${PAD.left} ${PAD.top})`}>
            {visibleBands.map((band) => <rect key={band.key} className={`bmi-zone ${band.key}`} x="0" y={band.top} width={WIDTH} height={band.height} />)}
            {ticks.map(({ value, y }) => <g key={value}><line className="grid-line" x1="0" x2={WIDTH} y1={y} y2={y} /><text className="axis-label y-label" x="-10" y={y + 4}>{value.toFixed(0)}</text></g>)}
            {points.length > 1 && <polygon points={area} fill={`url(#${gradientId})`} />}
            {points.length > 1 && <polyline className="trend-line" points={line} />}
            {active && <line className="chart-crosshair" x1={active.x} x2={active.x} y1="0" y2={HEIGHT} />}
            <text className="axis-label x-start" x="0" y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(first.timestamp))}</text>
            {last.id !== first.id && <text className="axis-label x-end" x={WIDTH} y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(last.timestamp))}</text>}
            <rect className="chart-navigation" x="0" y="0" width={WIDTH} height={HEIGHT} tabIndex="0" role="slider" aria-label={t('chartNavigation')} aria-valuemin="0" aria-valuemax={points.length - 1} aria-valuenow={activeIndex ?? points.length - 1} aria-valuetext={activeText} onFocus={() => setActiveIndex((current) => current ?? points.length - 1)} onKeyDown={navigate} onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); selectAtPointer(event) }} onPointerMove={selectAtPointer} />
          </g>
        </svg>
        {active && <div className="chart-tooltip"><strong>{active.value.toFixed(1)} kg</strong><span>{formatDate(active.timestamp, language)}</span>{active.note && <small>{active.note}</small>}</div>}
      </div>
      {bmiBands.length > 0 && <div className="bmi-zone-legend" aria-label={t('whoBmiZones')}>{bmiBands.map((band) => <div key={band.key}><i className={`bmi-swatch ${band.key}`} aria-hidden="true" /><span><b>{band.range}</b>{t(band.key)}</span></div>)}</div>}
      <p className="chart-caption">{t('visibleEntries', { count: points.length })}</p>
    </>}
  </section>
}
