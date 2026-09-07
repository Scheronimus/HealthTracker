import { csvCell, csvLines, parseCsvRow, parseImportedDate } from '../../data/csv.js'
import { isFutureLocalDate, localDateValue } from '../../utils/date.js'
import { createWeightMeasurement } from './model.js'

export function weightCsv(measurements) {
  const rows = [['id', 'timestamp', 'weight_kg', 'note']]
  measurements.filter(({ type }) => type === 'weight').forEach((item) => rows.push([item.id, item.timestamp, item.value, item.note]))
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}

export function parseWeightImportCsv(text, now = new Date()) {
  const measurements = []
  let skipped = 0
  const lines = csvLines(text)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) continue
    const [dateCell, weightCell] = parseCsvRow(line)
    if (index === 0 && /date|datum|fecha/i.test(dateCell)) continue
    const timestamp = parseImportedDate(dateCell)
    if (!timestamp || isFutureLocalDate(localDateValue(timestamp), now) || weightCell === undefined) { const error = new Error('invalidCsv'); error.line = index + 1; throw error }
    if (!weightCell || /^(NN|N\/A|NA)$/i.test(weightCell)) { skipped += 1; continue }
    const value = Number(weightCell.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0 || value > 1000) { const error = new Error('invalidCsv'); error.line = index + 1; throw error }
    measurements.push(createWeightMeasurement({ value, timestamp }))
  }
  return { measurements, skipped }
}

export function mergeWeightImport(existing, importedMeasurements) {
  const measurements = [...existing.measurements]
  const dates = new Set(measurements.filter(({ type }) => type === 'weight').map(({ timestamp }) => localDateValue(timestamp)))
  let added = 0
  let duplicates = 0
  for (const item of importedMeasurements) {
    const date = localDateValue(item.timestamp)
    if (dates.has(date)) { duplicates += 1; continue }
    dates.add(date)
    measurements.push(item)
    added += 1
  }
  return { measurements, added, duplicates }
}
