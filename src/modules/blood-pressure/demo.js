import { DEMO_START, demoTrackedDays } from '../../data/demoTimeline.js'

export function createBloodPressureDemoMeasurements() {
  return demoTrackedDays().flatMap((day) => [1, 2].map((readingNumber, readingIndex) => {
    const timestamp = new Date(DEMO_START)
    timestamp.setUTCDate(timestamp.getUTCDate() + day)
    timestamp.setUTCHours(readingNumber === 1 ? 7 : 18, readingNumber === 1 ? 15 : 45, 0, 0)
    const systolic = 132 - day * 0.012 + Math.sin(day * 0.23 + readingIndex) * 7
    const diastolic = 83 - day * 0.006 + Math.cos(day * 0.19 + readingIndex) * 4
    const pulse = 66 + Math.sin(day * 0.29 + readingIndex * 1.7) * 6
    return { id: `demo-bp-${String(day).padStart(3, '0')}-${readingNumber}`, type: 'bloodPressure', timestamp: timestamp.toISOString(), systolicMmHg: Math.round(systolic), diastolicMmHg: Math.round(diastolic), pulseBpm: Math.round(pulse) }
  }))
}
