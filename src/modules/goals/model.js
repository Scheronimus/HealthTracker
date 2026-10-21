import { createId } from '../../utils/id.js'
import { localDateValue } from '../../utils/date.js'
import { milestones, shiftDate, startingReading, targetProgress } from './calculations.js'

export const validGoalDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && shiftDate(value, 0) === value
const validWeight = (value) => Number.isFinite(value) && value > 0 && value <= 1000
const validAchievement = (item) => item && validWeight(item.value) && validGoalDate(item.date)

export function validateGoal(goal) {
  if (!goal || typeof goal !== 'object' || Array.isArray(goal) || typeof goal.id !== 'string' || goal.id.length < 8) return false
  if (typeof goal.name !== 'string' || goal.name.length > 100 || typeof goal.note !== 'string' || goal.note.length > 1000 || !validGoalDate(goal.startDate)) return false
  if (goal.kind === 'measurement') return ['weight', 'bloodPressure'].includes(goal.module)
    && Number.isInteger(goal.entries) && goal.entries >= 1 && goal.entries <= (goal.module === 'weight' ? 1 : 2)
    && ['daily', 'weekdays'].includes(goal.schedule) && Array.isArray(goal.days)
    && goal.days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    && new Set(goal.days).size === goal.days.length && (goal.schedule === 'daily' || goal.days.length > 0)
  if (goal.kind !== 'weight' || !validWeight(goal.start) || !validWeight(goal.target) || goal.target === goal.start) return false
  if (!validGoalDate(goal.startReadingDate) || goal.startReadingDate > goal.startDate) return false
  if (goal.interval !== null && (!validWeight(goal.interval) || Math.abs(goal.interval * 100 - Math.round(goal.interval * 100)) > 1e-7)) return false
  const allowed = new Set(milestones(goal))
  return ['achievements', 'previousAchievements'].every((key) => Array.isArray(goal[key]) && goal[key].every(validAchievement))
    && new Set(goal.achievements.map((item) => item.value)).size === goal.achievements.length
    && goal.achievements.every((item) => item.date >= goal.startDate && allowed.has(item.value))
}

export function validateGoalCollection(goals) {
  return new Set(goals.map((goal) => goal.kind)).size === goals.length
    && new Set(goals.map((goal) => goal.id)).size === goals.length
}

export function goalWeights(sources) {
  const dates = new Map()
  for (const item of [...(sources.weight?.observations ?? [])].sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))) if (Number.isFinite(item.value)) dates.set(item.date, { ...item, weight: item.value })
  return [...dates.values()]
}

export function createGoal(draft, sources, existing = null, now = new Date()) {
  const today = localDateValue(now)
  const goal = { id: existing?.id ?? createId(), kind: draft.kind, name: draft.name.trim(), note: draft.note.trim(), startDate: draft.startDate }
  if (draft.kind === 'measurement') Object.assign(goal, { module: draft.module, entries: Number(draft.entries), schedule: draft.schedule, days: [...draft.days].sort() })
  else {
    const source = startingReading(goalWeights(sources), draft.startDate) ?? (existing?.startDate === draft.startDate ? { weight: existing.start, date: existing.startReadingDate } : null)
    if (!source) throw new Error('goal_baselineMissing')
    Object.assign(goal, { start: source.weight, startReadingDate: source.date, target: Number(draft.target), interval: draft.interval === '' || draft.interval === null ? null : Number(draft.interval), achievements: existing?.achievements ?? [], previousAchievements: existing?.previousAchievements ?? [] })
    const changed = existing && ['startDate', 'start', 'target', 'interval'].some((key) => existing[key] !== goal[key])
    if (changed) { goal.previousAchievements = [...goal.previousAchievements, ...goal.achievements]; goal.achievements = [] }
  }
  if (!validateGoal(goal) || goal.startDate > today) throw new Error('goal_invalid')
  return goal
}

export function reconcileGoals(goals, sources, now = new Date()) {
  const today = localDateValue(now), weights = goalWeights(sources)
  let changed = false
  const next = goals.map((goal) => {
    if (goal.kind !== 'weight') return goal
    const achieved = targetProgress(goal, weights, today).achieved
    if (achieved.length === goal.achievements.length) return goal
    changed = true
    return { ...goal, achievements: achieved }
  })
  return changed ? next : goals
}

export function goalReferenceLines(goals, sources, now = new Date()) {
  const goal = goals.find((item) => item.kind === 'weight')
  if (!goal) return []
  const { next } = targetProgress(goal, goalWeights(sources), localDateValue(now))
  return [{ moduleId: 'weight', kind: 'target', value: goal.target },
    ...(next === null ? [] : [{ moduleId: 'weight', kind: 'milestone', value: next }])]
}

export function measurementGoalStatus(goal, sources, today) {
  const count = (sources[goal.module]?.observations ?? []).filter((item) => item.date === today).length
  const due = today >= goal.startDate && (goal.schedule === 'daily' || goal.days.includes(new Date(`${today}T12:00:00`).getDay()))
  let next = shiftDate(today, 1)
  while (next < goal.startDate || (goal.schedule === 'weekdays' && !goal.days.includes(new Date(`${next}T12:00:00`).getDay()))) next = shiftDate(next, 1)
  return { count, due, state: !due ? 'idle' : count >= goal.entries ? 'done' : 'due', next }
}
