import { describe, expect, it } from 'vitest'
import { timestampFromLocal } from './bloodPressure.js'
import { bloodPressureTrendData, trendAxisDates } from './bloodPressureTrends.js'

const reading = (date, readingNumber, systolic, diastolic, pulse = 60) => ({ id: `${date}-${readingNumber}`.padEnd(8, 'x'), type: 'bloodPressure', timestamp: timestampFromLocal(date, readingNumber === 1 ? '08:00' : '20:00'), systolicMmHg: systolic, diastolicMmHg: diastolic, pulseBpm: pulse })

describe('blood-pressure trends', () => {
  const measurements = [
    reading('2026-08-01', 1, 140, 90),
    reading('2026-08-23', 1, 130, 80, 64),
    reading('2026-08-23', 2, 134, 84, 68),
    reading('2026-08-24', 1, 128, 78, 62),
  ]

  it('filters an inclusive range and produces daily averages for short ranges', () => {
    const data = bloodPressureTrendData(measurements, 'sevenDays', 'averages', '2026-08-24')
    expect(data.start).toBe('2026-08-18')
    expect(data.readings).toHaveLength(3)
    expect(data.points).toHaveLength(2)
    expect(data.points[0]).toMatchObject({ startDate: '2026-08-23', systolicMmHg: 132, diastolicMmHg: 82, pulseBpm: 66, count: 2, granularity: 'daily' })
    expect(data.change).toEqual({ systolic: -4, diastolic: -4 })
  })

  it('uses weekly buckets for longer ranges', () => {
    const data = bloodPressureTrendData(measurements, 'threeMonths', 'averages', '2026-08-24')
    expect(data.granularity).toBe('weekly')
    expect(data.points).toHaveLength(2)
    expect(data.average).toMatchObject({ count: 4 })
  })

  it('keeps raw readings separate in individual mode', () => {
    const data = bloodPressureTrendData(measurements, 'thirtyDays', 'individual', '2026-08-24')
    expect(data.points.map(({ readingNumber }) => readingNumber)).toEqual([1, 1, 2, 1])
    expect(data.points.every(({ count }) => count === undefined)).toBe(true)
    expect(data.change).toEqual({ systolic: -12, diastolic: -12 })
  })

  it('handles empty and single-point ranges without inventing change', () => {
    expect(bloodPressureTrendData([], 'sevenDays', 'averages', '2026-08-24')).toMatchObject({ points: [], average: null, change: null })
    expect(bloodPressureTrendData([measurements.at(-1)], 'sevenDays', 'averages', '2026-08-24').change).toBe(null)
  })

  it('creates a bounded set of inclusive axis dates', () => {
    expect(trendAxisDates('2026-08-18', '2026-08-24', 4)).toEqual(['2026-08-18', '2026-08-20', '2026-08-22', '2026-08-24'])
  })
})
