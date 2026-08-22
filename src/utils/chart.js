export const CHART_SPANS = Object.freeze({ threeMonths: 3, oneYear: 12, allTime: null })

export function filterBySpan(measurements, span, now = new Date()) {
  const months = CHART_SPANS[span]
  if (months === null) return [...measurements]
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - months)
  return measurements.filter(({ timestamp }) => Date.parse(timestamp) >= cutoff.getTime())
}

export function niceIntegerStep(range, targetIntervals = 3) {
  if (!Number.isFinite(range) || range <= targetIntervals) return 1
  const roughStep = range / targetIntervals
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / magnitude
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return Math.max(1, multiplier * magnitude)
}

export function chartGeometry(measurements, width = 800, height = 300, referenceRange = null) {
  const sorted = [...measurements].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  if (!sorted.length) return { points: [], ticks: [], min: 0, max: 0, plotInset: 0, plotHeight: height }
  const values = sorted.map(({ value }) => value)
  const scaleValues = referenceRange ? [...values, referenceRange.min, referenceRange.max] : values
  const rawMin = Math.min(...scaleValues)
  const rawMax = Math.max(...scaleValues)
  const step = niceIntegerStep(rawMax - rawMin)
  let min = Math.floor(rawMin / step) * step
  let max = Math.ceil(rawMax / step) * step
  if (min === max) { min -= step; max += step }
  const start = Date.parse(sorted[0].timestamp)
  const end = Date.parse(sorted.at(-1).timestamp)
  const timeRange = end - start || 1
  const valueRange = max - min
  const plotInset = Math.min(14, height * 0.05)
  const plotHeight = height - plotInset * 2
  const points = sorted.map((item, index) => ({
    ...item,
    x: sorted.length === 1 ? width / 2 : ((Date.parse(item.timestamp) - start) / timeRange) * width,
    y: height - plotInset - ((item.value - min) / valueRange) * plotHeight,
    index,
  }))
  const ticks = []
  for (let value = min; value <= max; value += step) {
    ticks.push({ value, y: height - plotInset - ((value - min) / valueRange) * plotHeight })
  }
  return { points, ticks, min, max, plotInset, plotHeight }
}

export function chartValueY(value, geometry, height = 300) {
  return height - geometry.plotInset - ((value - geometry.min) / (geometry.max - geometry.min)) * geometry.plotHeight
}
export function nearestPointIndex(points, targetX) {
  if (!points.length) return -1
  let low = 0
  let high = points.length - 1
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (points[middle].x < targetX) low = middle + 1
    else high = middle
  }
  if (low === 0) return 0
  const previous = low - 1
  return Math.abs(points[low].x - targetX) < Math.abs(points[previous].x - targetX) ? low : previous
}