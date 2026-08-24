import { emptyProfile, SCHEMA_VERSION } from './schema.js'
const START = new Date('2025-08-23T07:15:00.000Z')
const IRREGULAR_INTERVALS = [3, 5, 7, 4, 6, 3, 7, 5, 4, 6]

export function createIrregularDemoStore() {
  const trackedDays = []
  for (let day = 0; day < 90; day += 1) trackedDays.push(day)

  let irregularDay = 120
  let intervalIndex = 0
  while (irregularDay < 240) {
    trackedDays.push(irregularDay)
    irregularDay += IRREGULAR_INTERVALS[intervalIndex % IRREGULAR_INTERVALS.length]
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
    const timestamp = new Date(START)
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

  return { schemaVersion: SCHEMA_VERSION, measurements, profile: emptyProfile() }
}

export function createBloodPressureDemoStore() {
  const trackedDays = createIrregularDemoStore().measurements.map(({ timestamp }) =>
    Math.round((Date.parse(timestamp) - START.getTime()) / 86400000),
  )
  const measurements = trackedDays.flatMap((day) => [1, 2].map((readingNumber, readingIndex) => {
    const timestamp = new Date(START)
    timestamp.setUTCDate(timestamp.getUTCDate() + day)
    timestamp.setUTCHours(readingNumber === 1 ? 7 : 18, readingNumber === 1 ? 15 : 45, 0, 0)
    const systolic = 132 - day * 0.012 + Math.sin(day * 0.23 + readingIndex) * 7
    const diastolic = 83 - day * 0.006 + Math.cos(day * 0.19 + readingIndex) * 4
    const pulse = 66 + Math.sin(day * 0.29 + readingIndex * 1.7) * 6
    return {
      id: `demo-bp-${String(day).padStart(3, '0')}-${readingNumber}`,
      type: 'bloodPressure',
      timestamp: timestamp.toISOString(),
      systolicMmHg: Math.round(systolic),
      diastolicMmHg: Math.round(diastolic),
      pulseBpm: Math.round(pulse),
    }
  }))

  return { schemaVersion: SCHEMA_VERSION, measurements, profile: emptyProfile() }
}

export function createCombinedDemoStore() {
  return {
    schemaVersion: SCHEMA_VERSION,
    measurements: [...createIrregularDemoStore().measurements, ...createBloodPressureDemoStore().measurements],
    profile: emptyProfile(),
  }
}
