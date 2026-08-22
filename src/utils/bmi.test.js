import { describe, expect, it } from 'vitest'
import { bmiStatus, calculateBmi, healthyWeightRange } from './bmi.js'

describe('BMI', () => {
  it('calculates BMI from kilograms and centimetres', () => {
    expect(calculateBmi(75, 180)).toBeCloseTo(23.15, 2)
  })

  it('returns null when required values are unavailable or invalid', () => {
    expect(calculateBmi(75, null)).toBeNull()
    expect(calculateBmi(0, 180)).toBeNull()
  })

  it('classifies adult BMI using WHO thresholds', () => {
    expect([18.4, 18.5, 25, 30, 35, 40].map((value) => bmiStatus(value))).toEqual([
      'bmiBelow', 'bmiWithin', 'bmiAbove', 'bmiClass1', 'bmiClass2', 'bmiClass3',
    ])
    expect(bmiStatus(22, 17)).toBe('adultRangeUnavailable')
  })

  it('converts the WHO reference BMI into a weight range', () => {
    expect(healthyWeightRange(180).min).toBeCloseTo(59.94)
    expect(healthyWeightRange(180).max).toBe(81)
  })
})