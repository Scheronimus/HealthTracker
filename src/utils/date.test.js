import { describe, expect, it } from 'vitest'
import { hasWeightOnDate, isFutureLocalDate, isFutureTimestamp, localDateValue, toDateTimestamp } from './date.js'

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

describe('future measurement boundaries', () => {
  const now = new Date('2026-08-22T10:30:00.000Z')

  it('compares date-only values with the current local calendar date', () => {
    const today = localDateValue(now)
    expect(isFutureLocalDate(today, now)).toBe(false)
    expect(isFutureLocalDate(localDateValue(new Date(now.getTime() - 86400000)), now)).toBe(false)
    expect(isFutureLocalDate(localDateValue(new Date(now.getTime() + 86400000)), now)).toBe(true)
  })

  it('allows the current instant and rejects a later exact timestamp', () => {
    expect(isFutureTimestamp(now.toISOString(), now)).toBe(false)
    expect(isFutureTimestamp(new Date(now.getTime() + 1).toISOString(), now)).toBe(true)
  })
})
