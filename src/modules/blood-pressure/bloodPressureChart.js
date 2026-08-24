import { localDateValue } from '../../utils/date.js'
import { parseLocalDate } from './bloodPressure.js'
import { niceIntegerStep } from '../../utils/numbers.js'

export function bloodPressureChartGeometry(measurements, start, end, width = 800, height = 300) {
  const sorted = [...measurements].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  const values = sorted.flatMap((item) => [item.systolicMmHg, item.diastolicMmHg])
  if (!values.length) return { points: [], ticks: [], min: 0, max: 0 }
  const step = niceIntegerStep(Math.max(...values) - Math.min(...values), 4)
  let min = Math.floor(Math.min(...values) / step) * step
  let max = Math.ceil(Math.max(...values) / step) * step
  if (min === max) { min -= step; max += step }
  const range = max - min
  const startDate = parseLocalDate(start)
  const endDate = parseLocalDate(end)
  const days = Math.max(1, Math.round((endDate - startDate) / 86400000) + 1)
  const points = sorted.map((item, index) => {
    const date = parseLocalDate(localDateValue(item.timestamp))
    const day = Math.round((date - startDate) / 86400000)
    const offset = item.readingNumber === 1 ? .2 : item.readingNumber === 2 ? .8 : .5
    const x = ((day + offset) / days) * width
    return { ...item, index, x, systolicY: height - ((item.systolicMmHg - min) / range) * height, diastolicY: height - ((item.diastolicMmHg - min) / range) * height, marker: item.readingNumber === 2 ? 'square' : 'circle' }
  })
  const ticks = []
  for (let value = min; value <= max; value += step) ticks.push({ value, y: height - ((value - min) / range) * height })
  return { points, ticks, min, max }
}

export function nearestBloodPressurePoint(points, targetX) {
  if (!points.length) return -1
  return points.reduce((best, point, index) => Math.abs(point.x - targetX) < Math.abs(points[best].x - targetX) ? index : best, 0)
}
