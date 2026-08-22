import { writeFile } from 'node:fs/promises'
import { createIrregularDemoStore } from '../src/data/demo.js'
import { createBackup } from '../src/data/transfer.js'

const store = createIrregularDemoStore()
const backup = createBackup(store, new Date('2026-08-22T12:00:00.000Z'))
const output = new URL('../docs/dummy-weight-data-one-year-irregular.json', import.meta.url)
await writeFile(output, `${JSON.stringify(backup, null, 2)}\n`)
console.log(`Generated ${store.measurements.length} demo measurements: daily, 30-day gap, irregular 3-7 day entries, then daily.`)
