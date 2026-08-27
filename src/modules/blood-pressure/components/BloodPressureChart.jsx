import { useMemo, useState } from 'react'
import { bloodPressureChartGeometry, nearestBloodPressurePoint } from '../bloodPressureChart.js'
import { BP_TREND_RANGES, bloodPressureTrendData, trendAxisDates } from '../bloodPressureTrends.js'
import { formatDate } from '../../../utils/date.js'
import { parseLocalDate } from '../bloodPressure.js'

const WIDTH = 800
const HEIGHT = 300

function signed(value) {
  const rounded = Math.round(value)
  if (rounded === 0) return '0'
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}`
}

export function BloodPressureChart({ measurements, language, t }) {
  const [range, setRange] = useState('thirtyDays')
  const [mode, setMode] = useState('averages')
  const [activeIndex, setActiveIndex] = useState(null)
  const data = useMemo(() => bloodPressureTrendData(measurements, range, mode), [measurements, range, mode])
  const geometry = useMemo(() => bloodPressureChartGeometry(data.points, data.start, data.end, WIDTH, HEIGHT), [data])
  const active = activeIndex === null ? null : geometry.points[activeIndex]
  const systolicLine = geometry.points.map(({ x, systolicY }) => `${x},${systolicY}`).join(' ')
  const diastolicLine = geometry.points.map(({ x, diastolicY }) => `${x},${diastolicY}`).join(' ')
  const axisDates = trendAxisDates(data.start, data.end)

  function select(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    setActiveIndex(nearestBloodPressurePoint(geometry.points, ((event.clientX - bounds.left) / bounds.width) * WIDTH))
  }
  function navigate(event) {
    let next = activeIndex ?? geometry.points.length - 1
    if (event.key === 'ArrowLeft') next -= 1
    else if (event.key === 'ArrowRight') next += 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = geometry.points.length - 1
    else return
    event.preventDefault()
    setActiveIndex(Math.max(0, Math.min(geometry.points.length - 1, next)))
  }
  function axisX(date) {
    const day = Math.round((parseLocalDate(date) - parseLocalDate(data.start)) / 86400000)
    return ((day + .5) / data.days) * WIDTH
  }
  function selectMode(next) {
    if (next === 'individual' && data.days > 30) setRange('thirtyDays')
    setMode(next)
    setActiveIndex(null)
  }

  const average = data.average
  const activePressure = active ? `${Math.round(active.systolicMmHg)}/${Math.round(active.diastolicMmHg)} mmHg` : ''
  const activeContext = active?.count
    ? t(active.granularity === 'weekly' ? 'weeklyAveragePoint' : 'dailyAveragePoint', { count: active.count })
    : active ? `${t(active.readingNumber === 1 ? 'readingOne' : 'readingTwo')} · ${Math.round(active.pulseBpm)} bpm` : ''
  const activeText = active ? `${formatDate(active.timestamp, language)}, ${activePressure}, ${activeContext}` : t('bpChartDescription', { count: geometry.points.length })

  return <section className={'bp-trends'}>
    <div className={'bp-trend-range'} aria-label={t('trendRange')}>{Object.keys(BP_TREND_RANGES).map((item) => {
      const unavailable = mode === 'individual' && BP_TREND_RANGES[item] > 30
      return <button key={item} type={'button'} className={range === item ? 'active' : ''} aria-pressed={range === item} disabled={unavailable} title={unavailable ? t('individualRangeHint') : undefined} onClick={() => { setRange(item); setActiveIndex(null) }}>{t(item)}</button>
    })}</div>
    <div className={'bp-trend-summary'}>
      <article className={'card'}><span>{t('selectedRangeAverage')}</span><strong>{average ? `${Math.round(average.systolic)} / ${Math.round(average.diastolic)}` : '— / —'}</strong><small>mmHg{average ? ` · ${average.count} ${t('readingsLabel')}` : ''}</small></article>
      <article className={'card'}><span>{t('bpRangeChange')}</span><strong>{data.change ? `${signed(data.change.systolic)} / ${signed(data.change.diastolic)}` : '— / —'}</strong><small>{data.change ? 'mmHg' : t('noRangeChange')}</small></article>
    </div>
    <div className={'bp-trend-toolbar'}>
      <div><h2>{t('bloodPressureTrend')}</h2><p>{t(data.granularity === 'weekly' ? 'weeklyTrendHint' : 'dailyTrendHint')}</p></div>
      <div className={'bp-trend-mode'} aria-label={t('trendDisplay')}>
        {['averages', 'individual'].map((item) => <button key={item} type={'button'} className={mode === item ? 'active' : ''} aria-pressed={mode === item} onClick={() => selectMode(item)}>{t(item === 'averages' ? 'averages' : 'individualReadings')}</button>)}
      </div>
    </div>
    {mode === 'individual' && <p className={'bp-individual-hint'}>{t('individualRangeHint')}</p>}
    <section className={'weight-chart bp-chart card'}>
      <div className={'bp-legend'}><span><i className={'sys'} />{t('systolic')}</span><span><i className={'dia'} />{t('diastolic')}</span>{mode === 'individual' && <><span>● {t('readingOne')}</span><span>■ {t('readingTwo')}</span></>}</div>
      {!geometry.points.length ? <div className={'chart-empty'}><p>{t('noTrendData')}</p></div> : <div className={'chart-wrap'}><svg className={'chart-svg'} viewBox={'0 0 870 360'} aria-hidden={'true'}><g transform={'translate(52 18)'}>
        {geometry.ticks.map(({ value, y }) => <g key={value}><line className={'grid-line'} x1={'0'} x2={WIDTH} y1={y} y2={y} /><text className={'axis-label y-label'} x={'-9'} y={y + 4}>{value}</text></g>)}
        {axisDates.map((date) => <text key={date} className={'axis-label bp-day-label'} x={axisX(date)} y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))}</text>)}
        {mode === 'averages' && geometry.points.length > 1 && <><polyline className={'bp-line systolic-line'} points={systolicLine} /><polyline className={'bp-line diastolic-line'} points={diastolicLine} /></>}
        {mode === 'individual' && geometry.points.map((point) => <BpMarkers key={point.id} point={point} dense={geometry.points.length > 30} />)}
        {active && <line className={'chart-crosshair'} x1={active.x} x2={active.x} y1={'0'} y2={HEIGHT} />}
      </g></svg>
      <div className={'bp-chart-navigation'} role={'slider'} tabIndex={'0'} aria-label={t('bpChartNavigation')} aria-valuemin={'0'} aria-valuemax={geometry.points.length - 1} aria-valuenow={activeIndex ?? geometry.points.length - 1} aria-valuetext={activeText} onFocus={() => setActiveIndex((value) => value ?? geometry.points.length - 1)} onKeyDown={navigate} onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); select(event) }} onPointerMove={select} /></div>}
      {active && <div className={'chart-tooltip'}><strong>{activePressure}</strong><span>{formatDate(active.timestamp, language)}</span><small>{activeContext}</small></div>}
    </section>
  </section>
}

function BpMarkers({ point, dense }) {
  const size = dense ? 3 : 6
  const className = `bp-marker${dense ? ' dense' : ''}`
  if (point.marker === 'circle') return <><circle className={`${className} systolic-marker`} cx={point.x} cy={point.systolicY} r={size} /><circle className={`${className} diastolic-marker`} cx={point.x} cy={point.diastolicY} r={size} /></>
  return <><rect className={`${className} systolic-marker`} x={point.x - size} y={point.systolicY - size} width={size * 2} height={size * 2} /><rect className={`${className} diastolic-marker`} x={point.x - size} y={point.diastolicY - size} width={size * 2} height={size * 2} /></>
}
