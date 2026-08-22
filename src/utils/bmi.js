export const WHO_BMI = Object.freeze({ healthyMin: 18.5, healthyMax: 25 })

export function calculateBmi(weightKg, heightCm) {
  if (!Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(heightCm) || heightCm <= 0) return null
  return weightKg / ((heightCm / 100) ** 2)
}

export function bmiStatus(bmi, age = null) {
  if (!Number.isFinite(bmi) || bmi <= 0) return null
  if (age !== null && age < 18) return 'adultRangeUnavailable'
  if (bmi < 18.5) return 'bmiBelow'
  if (bmi < 25) return 'bmiWithin'
  if (bmi < 30) return 'bmiAbove'
  if (bmi < 35) return 'bmiClass1'
  if (bmi < 40) return 'bmiClass2'
  return 'bmiClass3'
}

export function healthyWeightRange(heightCm) {
  if (!Number.isFinite(heightCm) || heightCm <= 0) return null
  const squaredHeight = (heightCm / 100) ** 2
  return { min: WHO_BMI.healthyMin * squaredHeight, max: WHO_BMI.healthyMax * squaredHeight }
}