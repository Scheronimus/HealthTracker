export function summarizeWeights(measurements, visibleMeasurements) {
  const current = measurements[0]?.value ?? null
  const comparison = visibleMeasurements.length > 1 ? visibleMeasurements.at(-1) : null
  const rangeChange = comparison ? visibleMeasurements[0].value - comparison.value : null
  return { current, rangeChange, comparisonTimestamp: comparison?.timestamp ?? null }
}
