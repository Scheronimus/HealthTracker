export const WHO_BMI = Object.freeze({ healthyMin: 18.5, healthyMax: 25 })

export const WHO_BMI_BANDS = Object.freeze([
  { key: 'bmiBelow', range: '<18.5', min: 0, max: 18.5 },
  { key: 'bmiWithin', range: '18.5–24.9', min: 18.5, max: 25 },
  { key: 'bmiAbove', range: '25.0–29.9', min: 25, max: 30 },
  { key: 'bmiClass1', range: '30.0–34.9', min: 30, max: 35 },
  { key: 'bmiClass2', range: '35.0–39.9', min: 35, max: 40 },
  { key: 'bmiClass3', range: '40+', min: 40, max: Infinity },
])
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
export function bmiWeightBands(heightCm) {
  if (!Number.isFinite(heightCm) || heightCm <= 0) return []
  const squaredHeight = (heightCm / 100) ** 2
  return WHO_BMI_BANDS.map((band) => ({
    ...band,
    minKg: band.min * squaredHeight,
    maxKg: band.max === Infinity ? Infinity : band.max * squaredHeight,
  }))
}
