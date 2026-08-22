export const CHART_SPANS = Object.freeze({ threeMonths: 3, oneYear: 12, allTime: null })

export function filterBySpan(measurements, span, now = new Date()) {
  const months = CHART_SPANS[span]
  if (months === null) return [...measurements]
  const cutoff = new Date(now)
  cutoff.setMonth(cutoff.getMonth() - months)
  return measurements.filter(({ timestamp }) => Date.parse(timestamp) >= cutoff.getTime())
}

export function chartGeometry(measurements, width = 800, height = 300) {
  const sorted = [...measurements].sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
  if (!sorted.length) return { points: [], ticks: [], min: 0, max: 0 }
  const values = sorted.map(({ value }) => value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const padding = Math.max((rawMax - rawMin) * 0.15, 1)
  const min = Math.floor((rawMin - padding) * 2) / 2
  const max = Math.ceil((rawMax + padding) * 2) / 2
  const start = Date.parse(sorted[0].timestamp)
  const end = Date.parse(sorted.at(-1).timestamp)
  const timeRange = end - start || 1
  const valueRange = max - min || 1
  const points = sorted.map((item, index) => ({
    ...item,
    x: sorted.length === 1 ? width / 2 : ((Date.parse(item.timestamp) - start) / timeRange) * width,
    y: height - ((item.value - min) / valueRange) * height,
    index,
  }))
  const ticks = Array.from({ length: 4 }, (_, index) => {
    const value = min + ((max - min) * index) / 3
    return { value, y: height - (index * height) / 3 }
  })
  return { points, ticks, min, max }
}
