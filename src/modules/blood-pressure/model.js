import { createId } from '../../utils/id.js'

export function createBloodPressureMeasurement({ timestamp, systolicMmHg, diastolicMmHg, pulseBpm }) {
  return { id: createId(), type: 'bloodPressure', timestamp, systolicMmHg: Number(systolicMmHg), diastolicMmHg: Number(diastolicMmHg), pulseBpm: Number(pulseBpm) }
}

export function validateBloodPressureMeasurement(item) {
  return item.type === 'bloodPressure'
    && Number.isInteger(item.systolicMmHg) && item.systolicMmHg >= 50 && item.systolicMmHg <= 300
    && Number.isInteger(item.diastolicMmHg) && item.diastolicMmHg >= 30 && item.diastolicMmHg <= 200
    && item.systolicMmHg > item.diastolicMmHg
    && Number.isInteger(item.pulseBpm) && item.pulseBpm >= 30 && item.pulseBpm <= 250
}

export function validateBloodPressureCollection(measurements) {
  const readingsPerDay = new Map()
  for (const item of measurements) {
    const date = new Date(item.timestamp)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    readingsPerDay.set(key, (readingsPerDay.get(key) ?? 0) + 1)
    if (readingsPerDay.get(key) > 2) return false
  }
  return true
}
