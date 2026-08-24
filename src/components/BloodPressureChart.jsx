import { useMemo, useState } from 'react'
import { bloodPressureChartGeometry, nearestBloodPressurePoint } from '../utils/bloodPressureChart.js'
import { formatDate } from '../utils/date.js'
import { localTimeValue, weekDates } from '../utils/bloodPressure.js'

const WIDTH = 800
const HEIGHT = 300

export function BloodPressureChart({ measurements, start, language, t }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const geometry = useMemo(() => bloodPressureChartGeometry(measurements, start, WIDTH, HEIGHT), [measurements, start])
  const active = activeIndex === null ? null : geometry.points[activeIndex]
  const systolicLine = geometry.points.map(({ x, systolicY }) => `${x},${systolicY}`).join(' ')
  const diastolicLine = geometry.points.map(({ x, diastolicY }) => `${x},${diastolicY}`).join(' ')
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
  const activeText = active ? `${formatDate(active.timestamp, language)}, ${t(active.period)}, ${active.systolicMmHg}/${active.diastolicMmHg} mmHg, ${active.pulseBpm} bpm` : t('bpChartDescription', { count: geometry.points.length })
  if (!geometry.points.length) return <section className={'weight-chart card'}><h2>{t('weekChart')}</h2><div className={'chart-empty'}><p>{t('noBpWeekData')}</p></div></section>
  return <section className={'weight-chart bp-chart card'}>
    <div className={'chart-header'}><div><h2>{t('weekChart')}</h2><p>{t('bpChartHint')}</p></div><div className={'bp-legend'}><span><i className={'sys'} />{t('systolic')}</span><span><i className={'dia'} />{t('diastolic')}</span><span>● {t('morning')}</span><span>■ {t('evening')}</span></div></div>
    <div className={'chart-wrap'}><svg className={'chart-svg'} viewBox={'0 0 870 360'} role={'img'} aria-label={t('bpChartDescription', { count: geometry.points.length })}><g transform={'translate(52 18)'}>
      {geometry.ticks.map(({ value, y }) => <g key={value}><line className={'grid-line'} x1={'0'} x2={WIDTH} y1={y} y2={y} /><text className={'axis-label y-label'} x={'-9'} y={y + 4}>{value}</text></g>)}
      {weekDates(start).map((date, index) => <text key={date} className={'axis-label bp-day-label'} x={(index + .5) / 7 * WIDTH} y={HEIGHT + 28}>{new Intl.DateTimeFormat(language, { weekday: 'short' }).format(new Date(`${date}T12:00:00`))}</text>)}
      {geometry.points.length > 1 && <><polyline className={'bp-line systolic-line'} points={systolicLine} /><polyline className={'bp-line diastolic-line'} points={diastolicLine} /></>}
      {geometry.points.map((point) => <BpMarkers key={point.id} point={point} />)}
      {active && <line className={'chart-crosshair'} x1={active.x} x2={active.x} y1={'0'} y2={HEIGHT} />}
      <rect className={'chart-navigation'} x={'0'} y={'0'} width={WIDTH} height={HEIGHT} tabIndex={'0'} role={'slider'} aria-label={t('bpChartNavigation')} aria-valuemin={'0'} aria-valuemax={geometry.points.length - 1} aria-valuenow={activeIndex ?? geometry.points.length - 1} aria-valuetext={activeText} onFocus={() => setActiveIndex((value) => value ?? geometry.points.length - 1)} onKeyDown={navigate} onPointerDown={select} onPointerMove={select} />
    </g></svg>
    {active && <div className={'chart-tooltip'}><strong>{active.systolicMmHg}/{active.diastolicMmHg} mmHg</strong><span>{formatDate(active.timestamp, language)} · {localTimeValue(active.timestamp)} · {t(active.period)}</span><small>{active.pulseBpm} bpm</small></div>}</div>
  </section>
}

function BpMarkers({ point }) {
  if (point.marker === 'circle') return <><circle className={'bp-marker systolic-marker'} cx={point.x} cy={point.systolicY} r={'6'} /><circle className={'bp-marker diastolic-marker'} cx={point.x} cy={point.diastolicY} r={'6'} /></>
  return <><rect className={'bp-marker systolic-marker'} x={point.x - 6} y={point.systolicY - 6} width={'12'} height={'12'} /><rect className={'bp-marker diastolic-marker'} x={point.x - 6} y={point.diastolicY - 6} width={'12'} height={'12'} /></>
}
