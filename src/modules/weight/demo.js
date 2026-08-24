import { DEMO_START, demoTrackedDays } from '../../data/demoTimeline.js'

export function createWeightDemoMeasurements() {
  const notes = new Map([[0, 'Demo: daily tracking begins'], [89, 'Last daily entry before a break'], [120, 'Tracking resumed irregularly'], [240, 'Daily tracking restarted'], [364, 'One-year check-in']])
  return demoTrackedDays().map((day, index) => {
    const timestamp = new Date(DEMO_START)
    timestamp.setUTCDate(timestamp.getUTCDate() + day)
    const trend = 92 - day * 0.025
    const variation = Math.sin(day * 0.31) * 0.75 + Math.cos(day * 0.09) * 0.3
    return { id: `demo-irregular-weight-${String(index + 1).padStart(3, '0')}`, type: 'weight', value: Number((trend + variation).toFixed(1)), unit: 'kg', timestamp: timestamp.toISOString(), note: notes.get(day) ?? '' }
  })
}
