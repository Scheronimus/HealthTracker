export function shiftDate(date, days) {
  const value = new Date(`${date}T12:00:00`)
  value.setDate(value.getDate() + days)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

export function milestones(goal) {
  const start = Math.round(Number(goal.start) * 100), target = Math.round(Number(goal.target) * 100)
  const step = Math.round(Number(goal.interval) * 100), direction = target < start ? -1 : 1
  if (!Number.isFinite(start) || !Number.isFinite(target) || start === target) return []
  const result = []
  if (step > 0) {
    // Align to interval boundaries after a full first step, rather than
    // propagating a recorded baseline's fractional offset to every milestone.
    const first = (direction < 0 ? Math.floor((start - step) / step) : Math.ceil((start + step) / step)) * step
    for (let value = first; direction * (target - value) > 0; value += direction * step) result.push(value / 100)
  }
  result.push(target / 100)
  return result
}

function dailyAverages(readings, from, to) {
  const sorted = readings.filter((item) => item.date <= to).sort((a, b) => a.date.localeCompare(b.date))
  if (!sorted.length) return []
  const beginning = sorted[0].date > shiftDate(from, -4) ? sorted[0].date : shiftDate(from, -4)
  let index = 0, latest = null
  const window = [], result = []
  for (let date = beginning; date <= to; date = shiftDate(date, 1)) {
    while (index < sorted.length && sorted[index].date <= date) latest = sorted[index++]
    if (latest) window.push({ date, weight: latest.weight, carried: latest.date !== date })
    if (window.length > 5) window.shift()
    if (date >= from) result.push({ date, value: window.length ? window.reduce((sum, item) => sum + item.weight, 0) / window.length : null, coverage: window.filter((item) => !item.carried).length, carried: window.filter((item) => item.carried).length, windowDays: window.length })
  }
  return result
}

export function averageAt(readings, date) {
  return dailyAverages(readings, date, date)[0] ?? { value: null, coverage: 0, carried: 0, windowDays: 0 }
}
export function startingReading(readings, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || shiftDate(date, 0) !== date) return null
  return readings.filter((item) => item.date <= date && Number.isFinite(item.weight) && item.weight > 0)
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
}

export function targetProgress(goal, readings, today) {
  const values = milestones(goal), direction = Number(goal.target) < Number(goal.start) ? -1 : 1
  const achieved = [...(goal.achievements ?? [])], locked = new Set(achieved.map((item) => item.value))
  const pending = values.filter((value) => !locked.has(value))
  const first = readings.filter((item) => item.date <= today).map((item) => item.date).sort()[0]
  const averages = first ? dailyAverages(readings, first > goal.startDate ? first : goal.startDate, today) : []
  const recent = []
  let index = 0
  const qualifies = (average, value) => average !== null && direction * (average - value) > 1e-9
  for (const average of averages) {
    recent.push(average.value)
    if (recent.length > 5) recent.shift()
    while (recent.length === 5 && index < pending.length && recent.every((value) => qualifies(value, pending[index]))) {
      achieved.push({ value: pending[index++], date: average.date })
    }
  }
  const current = averageAt(readings, today), next = pending[index] ?? null
  let streak = 0
  if (next !== null) for (let i = recent.length - 1; i >= 0 && qualifies(recent[i], next); i--) streak++
  const fraction = current.value === null ? 0 : Math.max(0, Math.min(1, (current.value - Number(goal.start)) / (Number(goal.target) - Number(goal.start))))
  return { ...current, next, streak, achieved, fraction }
}
export function scheduleState(goal, date, complete = false) {
  const isScheduled = (day) => goal.schedule === 'daily' || goal.days.includes(new Date(`${day}T12:00:00`).getDay())
  const due = date >= goal.startDate && isScheduled(date)
  let next = shiftDate(date, 1)
  for (let index = 0; index < 366 && (next < goal.startDate || !isScheduled(next)); index++) next = shiftDate(next, 1)
  return { due, complete: due && complete, next }
}

// Compare adjacent, non-overlapping five-day averages. This reports direction
// toward a user-selected target; it does not predict timing or judge health.
export function targetDirection(goal, readings, today) {
  const current = averageAt(readings, today).value
  const comparisonDate = shiftDate(today, -5)
  const previous = comparisonDate >= goal.startDate ? averageAt(readings, comparisonDate).value : null
  if (current === null) return { state: 'unknown', current, previous, change: null, comparisonDate }
  const direction = Number(goal.target) < Number(goal.start) ? -1 : 1
  const change = previous === null ? current - Number(goal.start) : current - previous
  const movement = direction * change
  const state = Math.abs(change) < 0.005 ? 'steady' : movement > 0 ? 'toward' : 'away'
  return { state: previous === null ? `baseline${state === 'toward' ? 'Toward' : state === 'away' ? 'Away' : 'Steady'}` : state, current, previous, change, comparisonDate }
}
