import { useId, useMemo, useState } from 'react'
import { chartGeometry, chartValueY, nearestPointIndex } from '../chart.js'
import { bmiWeightBands } from '../bmi.js'
import { formatDate } from '../../../utils/date.js'

const WIDTH = 800
const HEIGHT = 400
const PAD = { top: 18, right: 18, bottom: 52, left: 76 }

export function WeightChart({ averages = [], showAverage = false, onAverageChange, measurements, language, span, onSpanChange, profile, onBmiZonesChange, t }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const gradientId = useId().replaceAll(':', '')
  const bmiBands = useMemo(() => profile.showBmiRange && (profile.age === null || profile.age >= 18) ? bmiWeightBands(profile.heightCm) : [], [profile.age, profile.heightCm, profile.showBmiRange])
  const geometry = useMemo(() => chartGeometry(measurements, WIDTH, HEIGHT, showAverage ? averages.map(({ value }) => value) : []), [measurements, averages, showAverage])
  const { points, ticks } = geometry
  const visibleBands = bmiBands.map((band) => {
    const lower = Math.max(band.minKg, geometry.min)
    const upper = Math.min(band.maxKg, geometry.max)
    if (upper <= lower) return null
    const top = chartValueY(upper, geometry, HEIGHT)
    const bottom = chartValueY(lower, geometry, HEIGHT)
    return { ...band, top, height: bottom - top }
  }).filter(Boolean)
  const averagesById = new Map(averages.map((item) => [item.id, item.value]))
  const averagePoints = showAverage ? points.filter(({ id }) => averagesById.has(id)).map((point) => ({
    ...point, y: chartValueY(averagesById.get(point.id), geometry, HEIGHT),
  })) : []
  const averageLine = averagePoints.map(({ x, y }) => `${x},${y}`).join(' ')
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const displayedPoints = showAverage ? averagePoints : points
  const displayedLine = showAverage ? averageLine : line
  const area = displayedPoints.length ? `${displayedPoints[0].x},${HEIGHT} ${displayedLine} ${displayedPoints.at(-1).x},${HEIGHT}` : ''
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

  const activeAverage = active && showAverage ? averagesById.get(active.id) : undefined
  const averageText = activeAverage === undefined ? '' : `, ${t('weightAverage')}: ${activeAverage.toFixed(2)} kg`
  const activeText = active ? `${formatDate(active.timestamp, language)}, ${active.value.toFixed(1)} kg${averageText}` : t('chartDescription', { count: points.length })

  return <section className={`weight-chart${visibleBands.length ? ' bmi-zones-visible' : ''}`} aria-labelledby="chart-title">
    <div className="chart-header">
      <div className="chart-title-group"><h2 id="chart-title">{t('trend')}</h2></div>
    </div>
    <div className="weight-chart-options">
      {profile.showBmi && (profile.age === null || profile.age >= 18) && <button className="chart-bmi-toggle" type="button" role="switch" aria-checked={profile.showBmiRange} onClick={() => onBmiZonesChange(!profile.showBmiRange)}><i aria-hidden="true" />{t('bmiZonesToggle')}</button>}
      <button className="chart-bmi-toggle" type="button" role="switch" aria-checked={showAverage} aria-describedby={showAverage && !averagePoints.length ? 'weight-average-unavailable' : undefined} onClick={() => onAverageChange?.(!showAverage)}><i aria-hidden="true" />{t('weightAverageToggle')}</button>
    </div>
    {showAverage && !averagePoints.length && <p id="weight-average-unavailable" className="chart-caption">{t('weightAverageUnavailable')}</p>}
    <div className="span-control weight-chart-span" role="group" aria-label={t('timeSpan')}>
      {['threeMonths', 'oneYear', 'allTime'].map((option) => <button key={option} type="button" className={span === option ? 'active' : ''} aria-pressed={span === option} onClick={() => { onSpanChange(option); setActiveIndex(null) }}>{t(option)}</button>)}
    </div>
    {!points.length ? <div className="chart-empty"><span>⌁</span><p>{t('noChartData')}</p></div> : <>
      <div className="chart-wrap">
        <svg className="chart-svg" viewBox={`0 0 ${WIDTH + PAD.left + PAD.right} ${HEIGHT + PAD.top + PAD.bottom}`} role="group" aria-label={t('chartDescription', { count: points.length })}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop className="trend-area-start" offset="0" /><stop className="trend-area-end" offset="1" /></linearGradient></defs>
          <g transform={`translate(${PAD.left} ${PAD.top})`}>
            {visibleBands.map((band) => <rect key={band.key} className={`bmi-zone ${band.key}`} x="0" y={band.top} width={WIDTH} height={band.height} />)}
            {displayedPoints.length > 1 && <polygon className="trend-area" points={area} fill={`url(#${gradientId})`} />}
            {ticks.map(({ value, y }) => <g key={value}><line className="grid-line" x1="0" x2={WIDTH} y1={y} y2={y} /><text className="axis-label y-label" x="-10" y={y + 4}>{value.toFixed(0)}</text></g>)}
            {!showAverage && points.length > 1 && <polyline className="trend-line" points={line} />}
            {averagePoints.length > 1 && <polyline className="weight-average-line" points={averageLine} />}
            {averagePoints.length === 1 && <circle className="weight-average-point" cx={averagePoints[0].x} cy={averagePoints[0].y} r="5" />}
            {active && <line className="chart-crosshair" x1={active.x} x2={active.x} y1="0" y2={HEIGHT} />}
            {((active && !showAverage) || (!showAverage && points.length === 1)) && <circle className="weight-selected-point" cx={(active ?? first).x} cy={(active ?? first).y} r="5" />}
            <text className="axis-label x-start" x="0" y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(first.timestamp))}</text>
            {last.id !== first.id && <text className="axis-label x-end" x={WIDTH} y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(last.timestamp))}</text>}
            <rect className="chart-navigation" x="0" y="0" width={WIDTH} height={HEIGHT} tabIndex="0" role="slider" aria-label={t('chartNavigation')} aria-valuemin="0" aria-valuemax={points.length - 1} aria-valuenow={activeIndex ?? points.length - 1} aria-valuetext={activeText} onFocus={() => setActiveIndex((current) => current ?? points.length - 1)} onKeyDown={navigate} onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); selectAtPointer(event) }} onPointerMove={selectAtPointer} />
          </g>
        </svg>
      </div>
      <div className="weight-tooltip-slot" aria-live="polite">{active && <div className="chart-tooltip"><strong>{active.value.toFixed(1)} kg</strong><span>{formatDate(active.timestamp, language)}</span>{activeAverage !== undefined && <small>{t('weightAverage')}: {activeAverage.toFixed(2)} kg</small>}{active.note && <small>{active.note}</small>}</div>}</div>
      {bmiBands.length > 0 && <div className="bmi-zone-legend" aria-label={t('whoBmiZones')}>{bmiBands.map((band) => <div key={band.key}><i className={`bmi-swatch ${band.key}`} aria-hidden="true" /><span><b>{band.range}</b>{t(band.key)}</span></div>)}</div>}
      <p className="chart-caption">{t('visibleEntries', { count: points.length })}</p>
    </>}
  </section>
}
