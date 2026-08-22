import { describe, expect, it } from 'vitest'
import { chartGeometry, filterBySpan, nearestPointIndex } from './chart.js'

const entry = (id, timestamp, value) => ({ id, timestamp, value })

describe('weight chart', () => {
  const data = [
    entry('old', '2024-01-01T08:00:00.000Z', 80),
    entry('year', '2025-10-01T08:00:00.000Z', 76),
    entry('recent', '2026-07-01T08:00:00.000Z', 74),
  ]
  const now = new Date('2026-08-22T12:00:00.000Z')

  it('filters three-month and one-year spans', () => {
    expect(filterBySpan(data, 'threeMonths', now).map(({ id }) => id)).toEqual(['recent'])
    expect(filterBySpan(data, 'oneYear', now).map(({ id }) => id)).toEqual(['year', 'recent'])
    expect(filterBySpan(data, 'allTime', now)).toHaveLength(3)
  })

  it('finds the nearest measurement for crosshair navigation', () => {
    const points = [{ x: 0 }, { x: 40 }, { x: 100 }]
    expect(nearestPointIndex(points, -10)).toBe(0)
    expect(nearestPointIndex(points, 31)).toBe(1)
    expect(nearestPointIndex(points, 88)).toBe(2)
    expect(nearestPointIndex([], 20)).toBe(-1)
  })
  it('plots chronologically and handles a single point', () => {
    const geometry = chartGeometry([data[2], data[1]])
    expect(geometry.points.map(({ id }) => id)).toEqual(['year', 'recent'])
    expect(chartGeometry([data[0]]).points[0].x).toBe(400)
  })


  it('uses adaptive whole-number weight ticks', () => {
    const ticksFor = (values) => chartGeometry(values.map((value, index) => (
      entry(String(index), '2026-08-' + String(index + 1).padStart(2, '0') + 'T08:00:00.000Z', value)
    ))).ticks.map(({ value }) => value)

    expect(ticksFor([70, 90])).toEqual([70, 80, 90])
    expect(ticksFor([90, 92])).toEqual([90, 91, 92])
    expect(ticksFor([85, 95])).toEqual([85, 90, 95])
    expect(ticksFor([89.5, 91.2]).every(Number.isInteger)).toBe(true)
  })
})
