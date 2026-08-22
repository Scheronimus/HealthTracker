import { describe, expect, it } from 'vitest'
import { summarizeWeights } from './summary.js'

const measurements = [
  { value: 75, timestamp: '2026-08-01T08:00:00.000Z' },
  { value: 77, timestamp: '2026-02-01T08:00:00.000Z' },
  { value: 80, timestamp: '2025-01-01T08:00:00.000Z' },
]

describe('weight summaries', () => {
  it('keeps current weight global and calculates change from the visible range', () => {
    expect(summarizeWeights(measurements, measurements.slice(0, 2))).toEqual({ current: 75, rangeChange: -2, comparisonTimestamp: '2026-02-01T08:00:00.000Z' })
    expect(summarizeWeights(measurements, measurements)).toEqual({ current: 75, rangeChange: -5, comparisonTimestamp: '2025-01-01T08:00:00.000Z' })
  })

  it('has no range change with fewer than two visible entries', () => {
    expect(summarizeWeights(measurements, measurements.slice(0, 1))).toMatchObject({ rangeChange: null, comparisonTimestamp: null })
  })
})
