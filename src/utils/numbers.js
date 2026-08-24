export function niceIntegerStep(range, targetIntervals = 3) {
  if (!Number.isFinite(range) || range <= targetIntervals) return 1
  const roughStep = range / targetIntervals
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / magnitude
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return Math.max(1, multiplier * magnitude)
}
