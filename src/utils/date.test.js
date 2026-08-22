import { describe, expect, it } from 'vitest'
import { hasWeightOnDate, localDateValue, toDateTimestamp } from './date.js'

const measurement = { id: 'weight-001', type: 'weight', timestamp: toDateTimestamp('2026-08-22') }

describe('date-only weight entries', () => {
  it('stores a selected day at a stable daytime value', () => {
    expect(localDateValue(measurement.timestamp)).toBe('2026-08-22')
  })

  it('detects another weight on the same day and excludes the edited record', () => {
    expect(hasWeightOnDate([measurement], '2026-08-22')).toBe(true)
    expect(hasWeightOnDate([measurement], '2026-08-22', measurement.id)).toBe(false)
    expect(hasWeightOnDate([measurement], '2026-08-23')).toBe(false)
  })
})
