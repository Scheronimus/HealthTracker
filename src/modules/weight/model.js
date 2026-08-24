import { createId } from '../../utils/id.js'

export function createWeightMeasurement({ value, timestamp, note = '' }) {
  return { id: createId(), type: 'weight', value: Number(value), unit: 'kg', timestamp, note: note.trim() }
}

export function validateWeightMeasurement(item) {
  return item.type === 'weight' && item.unit === 'kg'
    && Number.isFinite(item.value) && item.value > 0 && item.value <= 1000
    && typeof item.note === 'string' && item.note.length <= 1000
}
