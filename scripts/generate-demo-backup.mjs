import { writeFile } from 'node:fs/promises'
import { createBackup } from '../src/data/transfer.js'

const start = new Date('2025-08-23T07:30:00.000Z')
const measurements = Array.from({ length: 53 }, (_, index) => {
  const timestamp = new Date(start)
  timestamp.setUTCDate(timestamp.getUTCDate() + index * 7)
  const trend = 88 - index * 0.15
  const variation = Math.sin(index * 0.72) * 0.65 + Math.cos(index * 0.23) * 0.25
  const notes = {
    0: 'Demo data: starting point',
    13: 'Three-month check-in',
    26: 'Half-year check-in',
    39: 'Nine-month check-in',
    52: 'One-year check-in',
  }
  return {
    id: `demo-weight-2026-${String(index + 1).padStart(3, '0')}`,
    type: 'weight',
    value: Number((trend + variation).toFixed(1)),
    unit: 'kg',
    timestamp: timestamp.toISOString(),
    note: notes[index] ?? '',
  }
})

const backup = createBackup({ schemaVersion: 1, measurements }, new Date('2026-08-22T12:00:00.000Z'))
const output = new URL('../docs/dummy-weight-data-one-year.json', import.meta.url)
await writeFile(output, `${JSON.stringify(backup, null, 2)}\n`)
console.log(`Generated ${measurements.length} weekly demo measurements from ${measurements[0].timestamp.slice(0, 10)} to ${measurements.at(-1).timestamp.slice(0, 10)}.`)
