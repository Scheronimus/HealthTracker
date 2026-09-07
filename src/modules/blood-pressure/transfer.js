import { csvLines, importedDateValue, parseCsvRow } from '../../data/csv.js'
import { isFutureTimestamp, localDateValue } from '../../utils/date.js'
import { hasNearbyBloodPressureReading, isBloodPressureDayFull } from './bloodPressure.js'
import { createBloodPressureMeasurement } from './model.js'

export function parseBloodPressureImportCsv(text, now = new Date()) {
  const measurements = []
  const lines = csvLines(text)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) continue
    const cells = parseCsvRow(line)
    if (index === 0 && /date|datum|fecha/i.test(cells[0])) continue
    const [dateCell, timeCell, systolicCell, diastolicCell, pulseCell] = cells
    const date = importedDateValue(dateCell)
    const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(timeCell ?? '')
    const values = [systolicCell, diastolicCell, pulseCell].map(Number)
    const validTime = timeMatch && Number(timeMatch[1]) < 24 && Number(timeMatch[2]) < 60 && Number(timeMatch[3] ?? 0) < 60
    const timestamp = date && validTime ? new Date(`${date}T${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3] ?? '00'}`).toISOString() : null
    const [systolicMmHg, diastolicMmHg, pulseBpm] = values
    if (cells.length !== 5 || !timestamp || isFutureTimestamp(timestamp, now) || !values.every(Number.isInteger)
      || systolicMmHg < 50 || systolicMmHg > 300 || diastolicMmHg < 30 || diastolicMmHg > 200
      || systolicMmHg <= diastolicMmHg || pulseBpm < 30 || pulseBpm > 250) {
      const error = new Error('invalidCsv'); error.line = index + 1; throw error
    }
    measurements.push(createBloodPressureMeasurement({ timestamp, systolicMmHg, diastolicMmHg, pulseBpm }))
  }
  return { measurements, skipped: 0 }
}

export function mergeBloodPressureImport(existing, importedMeasurements) {
  const measurements = [...existing.measurements]
  let added = 0
  let duplicates = 0
  for (const item of [...importedMeasurements].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))) {
    const date = localDateValue(item.timestamp)
    if (isBloodPressureDayFull(measurements, date) || hasNearbyBloodPressureReading(measurements, item.timestamp)) { duplicates += 1; continue }
    measurements.push(item)
    added += 1
  }
  return { measurements, added, duplicates }
}

export function canRestoreBloodPressure(measurements, item) {
  return !isBloodPressureDayFull(measurements, localDateValue(item.timestamp))
}
