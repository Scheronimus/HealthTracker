import { BACKUP_KIND, createBloodPressureMeasurement, createWeightMeasurement, emptyProfile, SCHEMA_VERSION } from './schema.js'
import { migrateStore } from './migrations.js'
import { localDateValue, toDateTimestamp } from '../utils/date.js'
import { hasNearbyBloodPressureReading, isBloodPressureDayFull } from '../utils/bloodPressure.js'

export function createBackup(data, now = new Date()) {
  return { kind: BACKUP_KIND, formatVersion: 1, exportedAt: now.toISOString(), data }
}

export function parseBackup(text) {
  let parsed
  try { parsed = JSON.parse(text) } catch { throw new Error('invalidBackup') }
  if (!parsed || parsed.kind !== BACKUP_KIND || typeof parsed.exportedAt !== 'string' || Number.isNaN(Date.parse(parsed.exportedAt))) throw new Error('invalidBackup')
  try { return migrateStore(parsed.data) } catch { throw new Error('invalidBackup') }
}

export function mergeRestore(existing, imported) {
  const byId = new Map(existing.measurements.map((item) => [item.id, item]))
  const bloodPressureDates = new Map()
  existing.measurements.filter(({ type }) => type === 'bloodPressure').forEach((item) => {
    const date = new Date(item.timestamp)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    bloodPressureDates.set(key, (bloodPressureDates.get(key) ?? 0) + 1)
  })
  let added = 0
  let duplicates = 0
  for (const item of imported.measurements) {
    if (byId.has(item.id)) { duplicates += 1; continue }
    if (item.type === 'bloodPressure') {
      const date = new Date(item.timestamp)
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      if ((bloodPressureDates.get(key) ?? 0) >= 2) { duplicates += 1; continue }
      bloodPressureDates.set(key, (bloodPressureDates.get(key) ?? 0) + 1)
    }
    byId.set(item.id, item)
    added += 1
  }
  const localProfile = existing.profile ?? emptyProfile()
  const importedProfile = imported.profile ?? emptyProfile()
  const hasLocalProfile = JSON.stringify(localProfile) !== JSON.stringify(emptyProfile())
  return { data: { schemaVersion: SCHEMA_VERSION, measurements: [...byId.values()], profile: hasLocalProfile ? localProfile : importedProfile }, added, duplicates }
}

function csvCell(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function weightCsv(measurements) {
  const rows = [['id', 'timestamp', 'weight_kg', 'note']]
  measurements.filter(({ type }) => type === 'weight').forEach((item) => rows.push([item.id, item.timestamp, item.value, item.note]))
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}
function parseCsvRow(line) {
  const cells = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    if (character === '"') {
      if (quoted && line[index + 1] === '"') { cell += '"'; index += 1 }
      else quoted = !quoted
    } else if (character === ',' && !quoted) {
      cells.push(cell.trim())
      cell = ''
    } else cell += character
  }
  if (quoted) throw new Error('invalidCsv')
  cells.push(cell.trim())
  return cells
}

function parseImportedDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(value)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3])
  const date = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  const timestamp = toDateTimestamp(date)
  if (!timestamp) return null
  const parsed = new Date(timestamp)
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day ? timestamp : null
}

function importedDateValue(value) {
  const timestamp = parseImportedDate(value)
  return timestamp ? localDateValue(timestamp) : null
}

export function parseWeightImportCsv(text) {
  const measurements = []
  let skipped = 0
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (!line) continue
    const [dateCell, weightCell] = parseCsvRow(line)
    if (index === 0 && /date|datum|fecha/i.test(dateCell)) continue
    const timestamp = parseImportedDate(dateCell)
    if (!timestamp || weightCell === undefined) {
      const error = new Error('invalidCsv')
      error.line = index + 1
      throw error
    }
    if (!weightCell || /^(NN|N\/A|NA)$/i.test(weightCell)) { skipped += 1; continue }
    const value = Number(weightCell.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0 || value > 1000) {
      const error = new Error('invalidCsv')
      error.line = index + 1
      throw error
    }
    measurements.push(createWeightMeasurement({ value, timestamp }))
  }
  return { measurements, skipped }
}

export function parseBloodPressureImportCsv(text) {
  const measurements = []
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/)
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
    if (cells.length !== 5 || !timestamp || !values.every(Number.isInteger)
      || systolicMmHg < 50 || systolicMmHg > 300 || diastolicMmHg < 30 || diastolicMmHg > 200
      || systolicMmHg <= diastolicMmHg || pulseBpm < 30 || pulseBpm > 250) {
      const error = new Error('invalidCsv')
      error.line = index + 1
      throw error
    }
    measurements.push(createBloodPressureMeasurement({ timestamp, systolicMmHg, diastolicMmHg, pulseBpm }))
  }
  return { measurements, skipped: 0 }
}

export function parseHealthImportCsv(text) {
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/).find((line) => line.trim()) ?? ''
  const columns = parseCsvRow(firstLine).length
  if (columns === 5) return { ...parseBloodPressureImportCsv(text), type: 'bloodPressure' }
  return { ...parseWeightImportCsv(text), type: 'weight' }
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
  return { data: { ...existing, schemaVersion: SCHEMA_VERSION, measurements }, added, duplicates }
}

export function mergeBloodPressureImport(existing, importedMeasurements) {
  const measurements = [...existing.measurements]
  let added = 0
  let duplicates = 0
  for (const item of importedMeasurements.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))) {
    const date = localDateValue(item.timestamp)
    if (isBloodPressureDayFull(measurements, date) || hasNearbyBloodPressureReading(measurements, item.timestamp)) {
      duplicates += 1
      continue
    }
    measurements.push(item)
    added += 1
  }
  return { data: { ...existing, schemaVersion: SCHEMA_VERSION, measurements }, added, duplicates }
}
