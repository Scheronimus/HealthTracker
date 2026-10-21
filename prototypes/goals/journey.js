// Prototype-only calculations. Complete five-day windows are a conservative
// demonstration policy, not a decision about production missing-day rules.
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

export function averageAt(readings, date) {
  const window = Array.from({ length: 5 }, (_, index) => shiftDate(date, -index))
  const values = window.map((day) => readings.find((item) => item.date === day)?.weight).filter(Number.isFinite)
  return { value: values.length === 5 ? values.reduce((sum, value) => sum + value, 0) / 5 : null, coverage: values.length }
}

export function startingReading(readings, date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || shiftDate(date, 0) !== date) return null
  return readings.filter((item) => item.date <= date && Number.isFinite(item.weight) && item.weight > 0)
    .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
}

export function targetProgress(goal, readings, today) {
  const values = milestones(goal), direction = Number(goal.target) < Number(goal.start) ? -1 : 1
  const achieved = [...(goal.achievements ?? [])]
  const streaks = new Map(values.map((value) => [value, 0]))
  const dates = readings.filter((item) => item.date <= today && item.date >= goal.startDate).map((item) => item.date).sort()
  let previous = null
  for (const date of dates) {
    const average = averageAt(readings, date).value
    if (previous && shiftDate(previous, 1) !== date) for (const value of values) streaks.set(value, 0)
    for (const value of values) {
      const count = average !== null && direction * (average - value) > 1e-9 ? streaks.get(value) + 1 : 0
      streaks.set(value, count)
      if (count >= 5 && !achieved.some((item) => item.value === value)) achieved.push({ value, date })
    }
    previous = date
  }
  const current = averageAt(readings, today), next = values.find((value) => !achieved.some((item) => item.value === value)) ?? null
  const streak = next === null || previous !== today ? 0 : Math.min(5, streaks.get(next))
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

export function validateDraft(draft) {
  const errors = {}
  const positive = (value) => value !== '' && Number.isFinite(Number(value)) && Number(value) > 0 && Number(value) <= 1000
  if (draft.kind === 'weight') {
    if (!positive(draft.start)) errors.start = 'weightError'
    if (!positive(draft.target)) errors.target = 'weightError'
    else if (Number(draft.target) === Number(draft.start)) errors.target = 'targetError'
    if (draft.interval !== '' && !positive(draft.interval)) errors.interval = 'weightError'
  }
  if (draft.kind === 'maintenance') {
    if (!positive(draft.reference)) errors.reference = 'weightError'
    for (const key of ['upper', 'lower']) if (draft[key] !== '' && (!Number.isFinite(Number(draft[key])) || Number(draft[key]) < 0 || Number(draft[key]) > 1000)) errors[key] = 'boundError'
    if (draft.upper === '' && draft.lower === '') errors.upper = 'boundsError'
  }
  if (['measurement', 'activity'].includes(draft.kind) && draft.schedule === 'weekdays' && !draft.days.length) errors.days = 'daysError'
  return errors
}
