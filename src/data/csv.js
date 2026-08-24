import { localDateValue, toDateTimestamp } from '../utils/date.js'

export function csvCell(value) {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function parseCsvRow(line) {
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

export function csvLines(text) { return text.replace(/^\uFEFF/, '').split(/\r?\n/) }

export function parseImportedDate(value) {
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

export function importedDateValue(value) {
  const timestamp = parseImportedDate(value)
  return timestamp ? localDateValue(timestamp) : null
}
