import { BACKUP_KIND, createWeightMeasurement, emptyProfile, SCHEMA_VERSION } from './schema.js'
import { migrateStore } from './migrations.js'
import { localDateValue, toDateTimestamp } from '../utils/date.js'

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
  const bloodPressureSlots = new Set(existing.measurements.filter(({ type }) => type === 'bloodPressure').map((item) => {
    const date = new Date(item.timestamp)
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${item.period}`
  }))
  let added = 0
  let duplicates = 0
  for (const item of imported.measurements) {
    if (byId.has(item.id)) { duplicates += 1; continue }
    if (item.type === 'bloodPressure') {
      const date = new Date(item.timestamp)
      const slot = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${item.period}`
      if (bloodPressureSlots.has(slot)) { duplicates += 1; continue }
      bloodPressureSlots.add(slot)
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
