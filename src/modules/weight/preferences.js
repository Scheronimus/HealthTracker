const KEY = 'health-tracker-weight-graph'
const defaults = { chartSpan: 'threeMonths', showAverage: false, showFinalTarget: true, showMilestone: true }

export function graphPreferences(value) {
  const result = { ...defaults }
  if (value && typeof value === 'object') {
    if (['threeMonths', 'oneYear', 'allTime'].includes(value.chartSpan)) result.chartSpan = value.chartSpan
    for (const key of ['showAverage', 'showFinalTarget', 'showMilestone']) {
      if (typeof value[key] === 'boolean') result[key] = value[key]
    }
  }
  return result
}

export function loadGraphPreferences(storage) {
  try { return graphPreferences(JSON.parse((storage ?? localStorage).getItem(KEY))) }
  catch { return graphPreferences(null) }
}

export function saveGraphPreferences(value, storage) {
  try { (storage ?? localStorage).setItem(KEY, JSON.stringify(graphPreferences(value))) }
  catch { /* Display preferences must not prevent using the dashboard. */ }
}
