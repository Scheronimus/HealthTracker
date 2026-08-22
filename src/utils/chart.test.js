import { describe, expect, it } from 'vitest'
import { chartGeometry, filterBySpan } from './chart.js'

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

  it('plots chronologically and handles a single point', () => {
    const geometry = chartGeometry([data[2], data[1]])
    expect(geometry.points.map(({ id }) => id)).toEqual(['year', 'recent'])
    expect(chartGeometry([data[0]]).points[0].x).toBe(400)
  })
})
