export function summarizeWeights(measurements, visibleMeasurements) {
  const current = measurements[0]?.value ?? null
  const rangeChange = visibleMeasurements.length > 1
    ? visibleMeasurements[0].value - visibleMeasurements.at(-1).value
    : null
  return { current, rangeChange }
}
