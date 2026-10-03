import { describe, expect, it } from 'vitest'
import { chartGeometry, filterBySpan, fiveMeasurementAverages, nearestPointIndex } from './chart.js'

const entry = (id, timestamp, value) => ({ id, timestamp, value })

describe('five-measurement averages', () => {
  const data = [82.3, 81.9, 81.9, 82.2, 82, 81.9, 81.7, 82.4, 81.8].map((value, index) =>
    entry(String(index), `2026-01-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`, value))

  it('matches the agreed sample without rounding calculation precision', () => {
    const averages = fiveMeasurementAverages([...data].reverse())
    expect(averages.map(({ id }) => id)).toEqual(['4', '5', '6', '7', '8'])
    averages.forEach(({ value }, index) => expect(value).toBeCloseTo([82.06, 81.98, 81.94, 82.04, 81.96][index], 10))
    expect(data[0].value).toBe(82.3)
  })

  it('requires a complete window and supports empty data', () => {
    expect(fiveMeasurementAverages([])).toEqual([])
    expect(fiveMeasurementAverages(data.slice(0, 4))).toEqual([])
    expect(fiveMeasurementAverages(data.slice(0, 5))).toHaveLength(1)
  })

  it('uses earlier history outside the visible range and does not fabricate gap records', () => {
    const sparse = data.slice(0, 5).map((item, index) => ({ ...item, timestamp: `2026-0${index + 1}-01T12:00:00.000Z` }))
    const averages = fiveMeasurementAverages(sparse)
    expect(averages).toHaveLength(1)
    expect(averages[0].timestamp).toBe(sparse[4].timestamp)
    expect(filterBySpan(averages, 'threeMonths', new Date('2026-06-01T12:00:00Z'))[0].value).toBeCloseTo(82.06)
  })

  it('keeps averages from preceding history within the plotted scale', () => {
    const geometry = chartGeometry([data.at(-1)], 800, 300, [90])
    expect(geometry.max).toBeGreaterThanOrEqual(90)
    expect(geometry.min).toBeLessThanOrEqual(81.8)
  })
})

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
