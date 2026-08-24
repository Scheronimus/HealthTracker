import { describe, expect, it } from 'vitest'
import { bloodPressureChartGeometry, nearestBloodPressurePoint } from './bloodPressureChart.js'
import { timestampFromLocal } from './bloodPressure.js'

const item = (id, date, readingNumber, systolic, diastolic) => ({ id, type: 'bloodPressure', timestamp: timestampFromLocal(date, readingNumber === 1 ? '08:00' : '20:00'), readingNumber, systolicMmHg: systolic, diastolicMmHg: diastolic, pulseBpm: 60 })
describe('blood-pressure chart', () => {
  it('sorts readings, fixes the x domain to the selected week, and exposes marker metadata', () => {
    const geometry = bloodPressureChartGeometry([item('b', '2026-08-30', 2, 130, 80), item('a', '2026-08-24', 1, 120, 70)], '2026-08-24', '2026-08-30', 700, 300)
    expect(geometry.points.map(({ id }) => id)).toEqual(['a', 'b'])
    expect(geometry.points[0]).toMatchObject({ marker: 'circle' })
    expect(geometry.points[1]).toMatchObject({ marker: 'square' })
    expect(geometry.points[0].x).toBeLessThan(70)
    expect(geometry.points[1].x).toBeGreaterThan(600)
    expect(geometry.points[0].systolicY).toBeLessThan(geometry.points[0].diastolicY)
  })
  it('scales points across longer selected ranges', () => {
    const geometry = bloodPressureChartGeometry([item('a', '2026-08-01', 1, 120, 70), item('b', '2026-08-30', 2, 130, 80)], '2026-08-01', '2026-08-30', 600, 300)
    expect(geometry.points[0].x).toBeLessThan(10)
    expect(geometry.points[1].x).toBeGreaterThan(590)
  })
  it('selects the nearest reading', () => expect(nearestBloodPressurePoint([{ x: 10 }, { x: 90 }], 70)).toBe(1))
})
