import { describe, expect, it } from 'vitest'
import { calculateBmi } from './bmi.js'

describe('BMI', () => {
  it('calculates BMI from kilograms and centimetres', () => {
    expect(calculateBmi(75, 180)).toBeCloseTo(23.15, 2)
  })

  it('returns null when required values are unavailable or invalid', () => {
    expect(calculateBmi(75, null)).toBeNull()
    expect(calculateBmi(0, 180)).toBeNull()
  })
})