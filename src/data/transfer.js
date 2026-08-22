import { BACKUP_KIND, SCHEMA_VERSION, validateBackup } from './schema.js'

export function createBackup(data, now = new Date()) {
  return { kind: BACKUP_KIND, formatVersion: 1, exportedAt: now.toISOString(), data }
}

export function parseBackup(text) {
  let parsed
  try { parsed = JSON.parse(text) } catch { throw new Error('invalidBackup') }
  if (!validateBackup(parsed) || parsed.data.schemaVersion !== SCHEMA_VERSION) throw new Error('invalidBackup')
  return parsed.data
}

export function mergeRestore(existing, imported) {
  const byId = new Map(existing.measurements.map((item) => [item.id, item]))
  let added = 0
  let duplicates = 0
  for (const item of imported.measurements) {
    if (byId.has(item.id)) { duplicates += 1; continue }
    byId.set(item.id, item)
    added += 1
  }
  return { data: { schemaVersion: SCHEMA_VERSION, measurements: [...byId.values()] }, added, duplicates }
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
