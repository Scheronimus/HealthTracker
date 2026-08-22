import { writeFile } from 'node:fs/promises'
import { createBackup } from '../src/data/transfer.js'

const start = new Date('2025-08-23T07:15:00.000Z')
const trackedDays = []

for (let day = 0; day < 90; day += 1) trackedDays.push(day)

const irregularIntervals = [3, 5, 7, 4, 6, 3, 7, 5, 4, 6]
let irregularDay = 120
let intervalIndex = 0
while (irregularDay < 240) {
  trackedDays.push(irregularDay)
  irregularDay += irregularIntervals[intervalIndex % irregularIntervals.length]
  intervalIndex += 1
}

for (let day = 240; day <= 364; day += 1) trackedDays.push(day)

const notes = new Map([
  [0, 'Demo: daily tracking begins'],
  [89, 'Last daily entry before a break'],
  [120, 'Tracking resumed irregularly'],
  [240, 'Daily tracking restarted'],
  [364, 'One-year check-in'],
])

const measurements = trackedDays.map((day, index) => {
  const timestamp = new Date(start)
  timestamp.setUTCDate(timestamp.getUTCDate() + day)
  const trend = 92 - day * 0.025
  const variation = Math.sin(day * 0.31) * 0.75 + Math.cos(day * 0.09) * 0.3
  return {
    id: `demo-irregular-weight-${String(index + 1).padStart(3, '0')}`,
    type: 'weight',
    value: Number((trend + variation).toFixed(1)),
    unit: 'kg',
    timestamp: timestamp.toISOString(),
    note: notes.get(day) ?? '',
  }
})

const backup = createBackup({ schemaVersion: 1, measurements }, new Date('2026-08-22T12:00:00.000Z'))
const output = new URL('../docs/dummy-weight-data-one-year-irregular.json', import.meta.url)
await writeFile(output, `${JSON.stringify(backup, null, 2)}\n`)
console.log(`Generated ${measurements.length} demo measurements: daily, 30-day gap, irregular 3-7 day entries, then daily.`)
