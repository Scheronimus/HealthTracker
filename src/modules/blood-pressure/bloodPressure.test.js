import { describe, expect, it } from 'vitest'
import { addLocalDays, averageChange, bloodPressureReadingsOnDate, groupBloodPressurePeriods, hasNearbyBloodPressureReading, isBloodPressureDayFull, localTimeValue, measurementPeriodStart, timestampFromLocal, weekDates, weekStart, weeklyAverages } from './bloodPressure.js'
import { createBloodPressureMeasurement, emptyStore, validateMeasurement, validateStore } from '../../data/schema.js'

const reading = (date, number = 1, systolic = 130, diastolic = 80, pulse = 60, id = `${date}-${number}`) => ({ id: id.padEnd(8, 'x'), type: 'bloodPressure', timestamp: timestampFromLocal(date, number === 1 ? '08:00' : '20:00'), systolicMmHg: systolic, diastolicMmHg: diastolic, pulseBpm: pulse })

describe('blood-pressure records', () => {
  it('validates the discriminated record and numeric constraints', () => {
    const item = createBloodPressureMeasurement({ timestamp: '2026-08-24T08:00:00.000Z', systolicMmHg: 120, diastolicMmHg: 80, pulseBpm: 60 })
    expect(validateMeasurement(item)).toBe(true)
    expect(validateMeasurement({ ...item, systolicMmHg: 49 })).toBe(false)
    expect(validateMeasurement({ ...item, diastolicMmHg: 120 })).toBe(false)
    expect(validateMeasurement({ ...item, pulseBpm: 251 })).toBe(false)
    const weight = { id: 'weight-123', type: 'weight', value: 70, unit: 'kg', timestamp: item.timestamp, note: '' }
    expect(validateStore({ ...emptyStore(), measurements: [weight, item] })).toBe(true)
    expect(validateStore({ ...emptyStore(), measurements: [item, { ...weight, id: item.id }] })).toBe(false)
    const second = { ...item, id: 'pressure-other', timestamp: '2026-08-24T20:00:00.000Z' }
    expect(validateStore({ ...emptyStore(), measurements: [item, second] })).toBe(true)
    expect(validateStore({ ...emptyStore(), measurements: [item, second, { ...item, id: 'pressure-third', timestamp: '2026-08-24T19:00:00.000Z' }] })).toBe(false)
  })
  it('round-trips local date/time values', () => {
    const timestamp = timestampFromLocal('2026-08-24', '07:35')
    expect(localTimeValue(timestamp)).toBe('07:35')
    expect(timestampFromLocal('bad', '07:35')).toBe(null)
  })
  it('keeps local calendar arithmetic safe across boundaries', () => {
    expect(weekStart('2026-08-30')).toBe('2026-08-24')
    expect(weekStart('2026-08-31')).toBe('2026-08-31')
    expect(weekDates('2025-12-29')).toEqual(['2025-12-29', '2025-12-30', '2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04'])
    expect(addLocalDays('2026-03-28', 2)).toBe('2026-03-30')
  })
  it('anchors consecutive seven-day periods to the first reading instead of Monday', () => {
    const records = [reading('2026-08-26'), reading('2026-09-01', 2), reading('2026-09-02')]
    expect(measurementPeriodStart('2026-09-01', '2026-08-26')).toBe('2026-08-26')
    expect(measurementPeriodStart('2026-09-02', '2026-08-26')).toBe('2026-09-02')
    const periods = groupBloodPressurePeriods(records, '2026-09-03')
    expect(periods[0]).toMatchObject({ start: '2026-09-02', end: '2026-09-08' })
    expect(periods[0].measurements).toHaveLength(1)
    expect(periods[1].measurements).toHaveLength(2)
  })
  it('allows at most two readings per date while excluding edits', () => {
    const first = reading('2026-08-24')
    const second = reading('2026-08-24', 2)
    expect(isBloodPressureDayFull([first], '2026-08-24')).toBe(false)
    expect(isBloodPressureDayFull([first, second], '2026-08-24')).toBe(true)
    expect(isBloodPressureDayFull([first, second], '2026-08-24', first.id)).toBe(false)
    expect(bloodPressureReadingsOnDate([second, first], '2026-08-24')).toEqual([first, second])
  })
  it('keeps nearby readings in the same measurement session', () => {
    const first = reading('2026-08-24')
    expect(hasNearbyBloodPressureReading([first], timestampFromLocal('2026-08-24', '08:01'))).toBe(true)
    expect(hasNearbyBloodPressureReading([first], timestampFromLocal('2026-08-24', '09:59'))).toBe(true)
    expect(hasNearbyBloodPressureReading([first], timestampFromLocal('2026-08-24', '10:00'))).toBe(false)
    expect(hasNearbyBloodPressureReading([first], timestampFromLocal('2026-08-25', '08:01'))).toBe(false)
    expect(hasNearbyBloodPressureReading([first], timestampFromLocal('2026-08-24', '08:01'), first.id)).toBe(false)
  })
  it('averages whatever readings are available', () => {
    const items = [reading('2026-08-24', 1, 140, 90, 70), reading('2026-08-24', 2, 130, 80, 60)]
    expect(weeklyAverages(items)).toEqual({ systolic: 135, diastolic: 85, pulse: 65, count: 2 })
  })
  it('compares the available averages of consecutive periods', () => {
    const current = [reading('2026-08-24', 1, 128, 78, 62), reading('2026-08-24', 2, 132, 82, 66)]
    const previous = [reading('2026-08-17', 1, 136, 86, 68)]
    expect(averageChange(current, previous)).toEqual({ systolic: -6, diastolic: -6, pulse: -4 })
    expect(averageChange(current, [])).toBe(null)
    expect(averageChange([], previous)).toBe(null)
  })
})
