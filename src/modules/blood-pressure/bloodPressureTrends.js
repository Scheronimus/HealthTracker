import { addLocalDays, measurementPeriodStart, timestampFromLocal, weeklyAverages } from './bloodPressure.js'
import { localDateValue } from '../../utils/date.js'

export const BP_TREND_RANGES = {
  sevenDays: 7,
  thirtyDays: 30,
  threeMonths: 90,
  oneYear: 365,
}

function averageGroup(items, date, endDate, granularity) {
  const average = weeklyAverages(items)
  return {
    id: `${granularity}-${date}`,
    type: 'bloodPressureTrend',
    timestamp: timestampFromLocal(date, '12:00'),
    systolicMmHg: average.systolic,
    diastolicMmHg: average.diastolic,
    pulseBpm: average.pulse,
    count: average.count,
    startDate: date,
    endDate,
    granularity,
  }
}

function aggregateReadings(readings, start, granularity) {
  const groups = new Map()
  for (const item of readings) {
    const date = localDateValue(item.timestamp)
    const key = granularity === 'daily' ? date : measurementPeriodStart(date, start)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(item)
  }
  return [...groups.values()].map((items) => {
    const dates = items.map((item) => localDateValue(item.timestamp)).sort()
    return averageGroup(items, dates[0], dates.at(-1), granularity)
  })
}

export function bloodPressureTrendData(measurements, range = 'thirtyDays', mode = 'averages', today = localDateValue()) {
  const days = BP_TREND_RANGES[range] ?? BP_TREND_RANGES.thirtyDays
  const start = addLocalDays(today, -(days - 1))
  const sortedReadings = measurements
    .filter((item) => item.type === 'bloodPressure' && localDateValue(item.timestamp) >= start && localDateValue(item.timestamp) <= today)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  const dailyCounts = new Map()
  const readings = sortedReadings.map((item) => {
    const date = localDateValue(item.timestamp)
    const readingNumber = (dailyCounts.get(date) ?? 0) + 1
    dailyCounts.set(date, readingNumber)
    return { ...item, readingNumber }
  })
  const granularity = days <= 30 ? 'daily' : 'weekly'
  const averagedPoints = aggregateReadings(readings, start, granularity)
  const points = mode === 'individual' ? readings : averagedPoints
  const average = weeklyAverages(readings)
  const change = averagedPoints.length > 1 ? {
    systolic: averagedPoints.at(-1).systolicMmHg - averagedPoints[0].systolicMmHg,
    diastolic: averagedPoints.at(-1).diastolicMmHg - averagedPoints[0].diastolicMmHg,
  } : null
  return { range, mode, days, start, end: today, readings, points, granularity, average, change }
}

export function trendAxisDates(start, end, maximum = 6) {
  const totalDays = Math.round((Date.parse(`${end}T12:00:00`) - Date.parse(`${start}T12:00:00`)) / 86400000)
  const count = Math.min(maximum, totalDays + 1)
  if (count <= 1) return [start]
  return Array.from({ length: count }, (_, index) => addLocalDays(start, Math.round((totalDays * index) / (count - 1))))
}
