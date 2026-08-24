import { localDateValue } from './date.js'

export const BP_READING_SLOTS = [1, 2]
export const MIN_BP_SESSION_GAP_MINUTES = 120

export function parseLocalDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return null
  const value = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  return value.getFullYear() === Number(match[1]) && value.getMonth() === Number(match[2]) - 1 && value.getDate() === Number(match[3]) ? value : null
}

export function addLocalDays(date, count) {
  const value = parseLocalDate(date)
  if (!value) return null
  value.setDate(value.getDate() + count)
  return localDateValue(value)
}

export function weekStart(date) {
  const value = parseLocalDate(date)
  if (!value) return null
  value.setDate(value.getDate() - ((value.getDay() + 6) % 7))
  return localDateValue(value)
}

export function weekDates(start) { return Array.from({ length: 7 }, (_, index) => addLocalDays(start, index)) }

function localDayDifference(date, anchor) {
  const value = parseLocalDate(date)
  const origin = parseLocalDate(anchor)
  return value && origin ? Math.round((value - origin) / 86400000) : null
}

export function measurementPeriodStart(date, anchor) {
  const difference = localDayDifference(date, anchor)
  return difference === null ? null : addLocalDays(anchor, Math.floor(difference / 7) * 7)
}

export function timestampFromLocal(date, time) {
  if (!parseLocalDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return null
  const value = new Date(`${date}T${time}:00`)
  return Number.isNaN(value.getTime()) ? null : value.toISOString()
}

export function localTimeValue(timestamp = new Date().toISOString()) {
  const value = new Date(timestamp)
  if (Number.isNaN(value.getTime())) return ''
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
}

export function bloodPressureReadingsOnDate(measurements, date, excludedId = null) {
  return measurements
    .filter((item) => item.type === 'bloodPressure' && item.id !== excludedId && localDateValue(item.timestamp) === date)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
}

export function isBloodPressureDayFull(measurements, date, excludedId = null) {
  return bloodPressureReadingsOnDate(measurements, date, excludedId).length >= 2
}

export function hasNearbyBloodPressureReading(measurements, timestamp, excludedId = null, minimumMinutes = MIN_BP_SESSION_GAP_MINUTES) {
  const time = Date.parse(timestamp)
  if (Number.isNaN(time)) return false
  const date = localDateValue(timestamp)
  return measurements.some((item) => item.type === 'bloodPressure'
    && item.id !== excludedId
    && localDateValue(item.timestamp) === date
    && Math.abs(Date.parse(item.timestamp) - time) < minimumMinutes * 60000)
}

export function groupBloodPressurePeriods(measurements, today = localDateValue()) {
  const records = measurements.filter(({ type }) => type === 'bloodPressure')
  const anchor = records.length ? records.map((item) => localDateValue(item.timestamp)).sort()[0] : today
  const starts = new Set(records.map((item) => measurementPeriodStart(localDateValue(item.timestamp), anchor)))
  const currentStart = measurementPeriodStart(today, anchor)
  starts.delete(currentStart)
  const ordered = [currentStart, ...[...starts].sort().reverse()]
  return ordered.map((start) => ({ start, end: addLocalDays(start, 6), measurements: records.filter((item) => measurementPeriodStart(localDateValue(item.timestamp), anchor) === start).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)) }))
}

export const groupBloodPressureWeeks = groupBloodPressurePeriods

export function weeklyAverages(measurements) {
  if (!measurements.length) return null
  const sum = measurements.reduce((total, item) => ({ systolic: total.systolic + item.systolicMmHg, diastolic: total.diastolic + item.diastolicMmHg, pulse: total.pulse + item.pulseBpm }), { systolic: 0, diastolic: 0, pulse: 0 })
  return { systolic: sum.systolic / measurements.length, diastolic: sum.diastolic / measurements.length, pulse: sum.pulse / measurements.length, count: measurements.length }
}

export function averageChange(currentMeasurements, previousMeasurements) {
  const current = weeklyAverages(currentMeasurements)
  const previous = weeklyAverages(previousMeasurements)
  if (!current || !previous) return null
  return {
    systolic: current.systolic - previous.systolic,
    diastolic: current.diastolic - previous.diastolic,
    pulse: current.pulse - previous.pulse,
  }
}
