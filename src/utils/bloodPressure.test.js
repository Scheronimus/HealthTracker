import { describe, expect, it } from 'vitest'
import { addLocalDays, defaultBloodPressurePeriod, groupBloodPressureWeeks, hasBloodPressureSlot, isWeeklyAverageAboveReference, localTimeValue, timestampFromLocal, weekDates, weekStart, weeklyAverages } from './bloodPressure.js'
import { createBloodPressureMeasurement, emptyStore, validateMeasurement, validateStore } from '../data/schema.js'

const reading = (date, period, systolic = 130, diastolic = 80, pulse = 60, id = `${date}-${period}`) => ({ id: id.padEnd(8, 'x'), type: 'bloodPressure', timestamp: timestampFromLocal(date, period === 'morning' ? '08:00' : '20:00'), period, systolicMmHg: systolic, diastolicMmHg: diastolic, pulseBpm: pulse })

describe('blood-pressure records', () => {
  it('validates the discriminated record and numeric constraints', () => {
    const item = createBloodPressureMeasurement({ timestamp: '2026-08-24T08:00:00.000Z', period: 'morning', systolicMmHg: 120, diastolicMmHg: 80, pulseBpm: 60 })
    expect(validateMeasurement(item)).toBe(true)
    expect(validateMeasurement({ ...item, systolicMmHg: 49 })).toBe(false)
    expect(validateMeasurement({ ...item, diastolicMmHg: 120 })).toBe(false)
    expect(validateMeasurement({ ...item, pulseBpm: 251 })).toBe(false)
    const weight = { id: 'weight-123', type: 'weight', value: 70, unit: 'kg', timestamp: item.timestamp, note: '' }
    expect(validateStore({ ...emptyStore(), measurements: [weight, item] })).toBe(true)
    expect(validateStore({ ...emptyStore(), measurements: [item, { ...weight, id: item.id }] })).toBe(false)
    expect(validateStore({ ...emptyStore(), measurements: [item, { ...item, id: 'pressure-other' }] })).toBe(false)
  })
  it('round-trips local date/time values', () => {
    const timestamp = timestampFromLocal('2026-08-24', '07:35')
    expect(localTimeValue(timestamp)).toBe('07:35')
    expect(timestampFromLocal('bad', '07:35')).toBe(null)
  })
  it('groups Monday through Sunday across month and year boundaries', () => {
    expect(weekStart('2026-08-30')).toBe('2026-08-24')
    expect(weekStart('2026-08-31')).toBe('2026-08-31')
    expect(weekDates('2025-12-29')).toEqual(['2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04'])
    expect(addLocalDays('2026-03-28', 2)).toBe('2026-03-30')
    const weeks = groupBloodPressureWeeks([reading('2025-12-31', 'morning')], '2026-01-01')
    expect(weeks[0].measurements).toHaveLength(1)
  })
  it('enforces one morning and evening slot while excluding edits', () => {
    const morning = reading('2026-08-24', 'morning')
    expect(hasBloodPressureSlot([morning], '2026-08-24', 'morning')).toBe(true)
    expect(hasBloodPressureSlot([morning], '2026-08-24', 'evening')).toBe(false)
    expect(hasBloodPressureSlot([morning], '2026-08-24', 'morning', morning.id)).toBe(false)
  })
  it('chooses the only missing today slot before the time default', () => {
    const now = new Date(2026, 7, 24, 8)
    expect(defaultBloodPressurePeriod([reading('2026-08-24', 'morning')], now)).toBe('evening')
    expect(defaultBloodPressurePeriod([], new Date(2026, 7, 24, 13))).toBe('evening')
  })
  it('averages readings directly and applies a strict weekly threshold', () => {
    const items = [reading('2026-08-24', 'morning', 140, 90, 70), reading('2026-08-24', 'evening', 130, 80, 60)]
    expect(weeklyAverages(items)).toMatchObject({ systolic: 135, diastolic: 85, pulse: 65, count: 2, complete: false })
    expect(isWeeklyAverageAboveReference(weeklyAverages(items))).toBe(false)
    expect(isWeeklyAverageAboveReference(weeklyAverages([reading('2026-08-24', 'morning', 136, 80)]))).toBe(true)
    const outlierDiluted = [reading('2026-08-24', 'morning', 200, 100), ...Array.from({ length: 13 }, (_, index) => reading(addLocalDays('2026-08-24', Math.floor((index + 1) / 2)), index % 2 ? 'morning' : 'evening', 120, 70, 60, `safe-${index}`))]
    expect(isWeeklyAverageAboveReference(weeklyAverages(outlierDiluted))).toBe(false)
    expect(weeklyAverages(outlierDiluted).complete).toBe(true)
  })
})
