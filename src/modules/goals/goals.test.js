import { describe, expect, it } from 'vitest'
import { averageAt, milestones, shiftDate, targetDirection, targetProgress } from './calculations.js'
import { createGoal, goalWeights, measurementGoalStatus, reconcileGoals, validateGoal, validateGoalCollection } from './model.js'
import { emptyStore, validateStore } from '../../data/schema.js'
import { migrateStore } from '../../data/migrations.js'
import { createBackup, mergeRestore, parseBackup } from '../../data/transfer.js'
import { moduleSources, reconcileStore, saveModuleRecord } from '../../data/modules.js'
import { MODULE_CATALOG } from '../catalog.js'

const now = new Date('2026-10-07T18:00:00')
const weight = (date, value, id = `weight-${date}`) => ({ id, type: 'weight', value, unit: 'kg', timestamp: new Date(`${date}T12:00:00`).toISOString(), note: '' })
const storeWith = (measurements) => ({ ...emptyStore(), measurements })
const data = storeWith([weight('2026-10-01', 90.1), weight('2026-10-02', 89.9), weight('2026-10-07', 89.2)])
const sources = moduleSources(data, now)
const target = () => createGoal({ kind: 'weight', name: '', note: '', startDate: '2026-10-01', target: '89', interval: '0.1' }, sources, null, now)
const reminder = (patch = {}) => createGoal({ kind: 'measurement', name: '', note: '', startDate: '2026-10-01', module: 'weight', entries: 1, schedule: 'daily', days: [], ...patch }, sources, null, now)

describe('production Goals calculations', () => {
  it('contributes independently selectable final and next reference lines', () => {
    const referenceStore = { ...data, goals: [{ ...target(), start: 92, target: 84, interval: 1 }] }
    const firstDay = new Date('2026-10-01T18:00:00')
    const lines = moduleSources(referenceStore, firstDay).weight.referenceLines
    expect(lines).toEqual([{ moduleId: 'weight', kind: 'target', value: 84 }, { moduleId: 'weight', kind: 'milestone', value: 91 }])
    expect(moduleSources({ ...referenceStore, goals: [{ ...referenceStore.goals[0], interval: null }] }, now).weight.referenceLines).toEqual([lines[0], { moduleId: 'weight', kind: 'milestone', value: 84 }])
    expect(moduleSources({ ...referenceStore, goals: [] }, now).weight.referenceLines).toBeUndefined()
    const finished = { ...referenceStore.goals[0], achievements: [{ value: 91, date: '2026-10-07' }] }
    expect(moduleSources({ ...referenceStore, goals: [finished] }, firstDay).weight.referenceLines[1].value).toBe(90)
  })
  it('confirms the user’s day 1/day 2/day 7 example using carried daily weights and five averages', () => {
    const weights = goalWeights(sources), original = structuredClone(weights)
    const result = targetProgress(target(), weights, '2026-10-07')
    expect(result.achieved.find((item) => item.value === 90)).toEqual({ value: 90, date: '2026-10-07' })
    expect(averageAt(weights, '2026-10-07')).toMatchObject({ value: 89.76, carried: 4, coverage: 1 })
    expect(weights).toEqual(original)
    expect(weights).toHaveLength(3)
  })
  it('counts only day 7 as below 90 when no day 2 entry exists', () => {
    const weights = goalWeights(moduleSources(storeWith([weight('2026-10-01', 90.1), weight('2026-10-07', 89.2)]), now))
    const result = targetProgress(target(), weights, '2026-10-07')
    expect(result.achieved).toEqual([])
    expect(result.next).toBe(90)
    expect(result.streak).toBe(1)
  })
  it('starts confirmation at goal start and never backfills before the first reading', () => {
    expect(averageAt(goalWeights(sources), '2026-09-30').value).toBeNull()
    const goal = { ...target(), startDate: '2026-10-07' }
    expect(targetProgress(goal, goalWeights(sources), '2026-10-07').streak).toBe(1)
    expect(targetProgress(goal, goalWeights(sources), '2026-10-07').achieved).toEqual([])
  })
  it('resets four successful averages after a miss and retains locked achievements after corrections', () => {
    const goal = { ...target(), start: 92, target: 90, interval: 0.5 }
    const series = Array.from({ length: 8 }, (_, index) => ({ date: shiftDate('2026-10-01', index), weight: 91.4 }))
    expect(targetProgress(goal, series, '2026-10-04').streak).toBe(4)
    expect(targetProgress(goal, [...series.slice(0, 4), { date: '2026-10-05', weight: 100 }], '2026-10-05').streak).toBe(0)
    const confirmed = targetProgress(goal, series, '2026-10-08').achieved
    expect(targetProgress({ ...goal, achievements: confirmed }, [], '2026-10-09').achieved).toEqual(confirmed)
  })
  it('aligns milestones without changing the exact target or overall baseline', () => {
    expect(milestones({ start: 92.04, target: 88.2, interval: 1 })).toEqual([91, 90, 89, 88.2])
    expect(milestones({ start: 92.04, target: 90, interval: 0.5 })).toEqual([91.5, 91, 90.5, 90])
    expect(milestones({ start: 75, target: 77.2, interval: 1 })).toEqual([76, 77, 77.2])
    expect(milestones({ start: 92, target: 84, interval: null })).toEqual([84])
  })
  it('derives exact or earlier baselines and keeps a saved baseline when its source is deleted', () => {
    const goal = createGoal({ kind: 'weight', name: '', note: '', startDate: '2026-10-05', target: 85, interval: 1 }, sources, null, now)
    expect(goal).toMatchObject({ start: 89.9, startReadingDate: '2026-10-02' })
    expect(createGoal({ ...goal, name: 'Changed title' }, {}, goal, now)).toMatchObject({ start: 89.9, name: 'Changed title' })
    expect(() => createGoal({ ...goal, startDate: '2026-09-01' }, sources, null, now)).toThrow('goal_baselineMissing')
  })
  it('derives direction from averages and uses local dates over DST/year boundaries', () => {
    expect(targetDirection(target(), goalWeights(sources), '2026-10-07').state).toBe('toward')
    expect(shiftDate('2026-10-25', 1)).toBe('2026-10-26')
    expect(shiftDate('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('Goals validation, persistence and restore', () => {
  it('enforces singleton types, validates configuration and avoids measurement disguises', () => {
    expect(validateGoal(target())).toBe(true)
    expect(validateGoal({ ...target(), kind: 'activity' })).toBe(false)
    expect(validateGoal({ ...target(), interval: -1 })).toBe(false)
    expect(validateGoalCollection([target(), reminder()])).toBe(true)
    expect(validateGoalCollection([target(), { ...target(), id: 'other-target' }])).toBe(false)
    expect(validateGoal({ ...target(), achievements: [{ value: 500, date: '2026-10-07' }] })).toBe(false)
  })
  it('never treats carried days as recorded measurements for reminders', () => {
    expect(measurementGoalStatus(reminder(), sources, '2026-10-03')).toMatchObject({ state: 'due', count: 0 })
    expect(measurementGoalStatus(reminder(), sources, '2026-10-07').state).toBe('done')
    const weekly = reminder({ schedule: 'weekdays', days: [1, 3, 5] })
    expect(measurementGoalStatus(weekly, sources, '2026-10-08').state).toBe('idle')
    const pressure = reminder({ module: 'bloodPressure', entries: 2 })
    expect(measurementGoalStatus(pressure, { bloodPressure: { observations: [{ date: '2026-10-07' }] } }, '2026-10-07')).toMatchObject({ state: 'due', count: 1 })
  })
  it('migrates schema six preserving measurements, profile values and ordered visibility', () => {
    const legacy = { schemaVersion: 6, measurements: data.measurements, profile: { ...emptyStore().profile, name: 'Alex', modules: ['bloodPressure', 'weight'] } }
    const migrated = migrateStore(legacy)
    expect(migrated).toMatchObject({ schemaVersion: 7, goals: [], measurements: legacy.measurements, profile: { ...legacy.profile, modules: ['bloodPressure', 'weight', 'goals'] } })
    expect(legacy.schemaVersion).toBe(6)
    expect(() => migrateStore({ ...legacy, profile: { ...legacy.profile, modules: [] } })).toThrow('invalidData')
  })
  it('round-trips ordered goals and locks achievements before backup', () => {
    const store = reconcileStore({ ...data, goals: [target(), reminder()] }, now)
    expect(store.goals[0].achievements).toContainEqual({ value: 90, date: '2026-10-07' })
    expect(validateStore(store)).toBe(true)
    expect(parseBackup(JSON.stringify(createBackup(store, now)))).toEqual(store)
    expect(reconcileGoals(store.goals, {}, now)).toBe(store.goals)
  })
  it('preserves local goal IDs/configuration/order and skips conflicting imported goal kinds', () => {
    const goal = target(), local = { ...data, goals: [goal] }
    const imported = { ...data, goals: [{ ...goal, target: 88, name: 'Do not overwrite' }, reminder()] }
    const result = mergeRestore(local, imported, now)
    expect(result.data.goals[0]).toEqual(goal)
    expect(result.data.goals.map((g) => g.kind)).toEqual(['weight', 'measurement'])
    expect(result.added).toBe(1)
    const sameKind = mergeRestore(local, { ...data, goals: [{ ...goal, id: 'another-goal' }] }, now)
    expect(sameKind.data.goals).toEqual([goal])
  })
  it('rejects malformed records and cross-collection IDs before merge', () => {
    const malformed = { ...data, goals: [{ ...target(), id: data.measurements[0].id }] }
    expect(validateStore(malformed)).toBe(false)
    expect(() => parseBackup(JSON.stringify(createBackup(malformed)))).toThrow('invalidBackup')
    expect(() => mergeRestore(data, malformed, now)).toThrow()
  })
  it('revises target settings without relabelling prior achievements and checks generic singleton saves', () => {
    const old = { ...target(), achievements: [{ value: 90, date: '2026-10-07' }] }
    const changed = createGoal({ ...old, target: 88 }, sources, old, now)
    expect(changed.achievements).toEqual([])
    expect(changed.previousAchievements).toEqual(old.achievements)
    const module = MODULE_CATALOG.find((item) => item.id === 'goals')
    expect(() => saveModuleRecord({ ...data, goals: [old] }, module, { ...changed, id: 'another-target' })).toThrow('invalidData')
  })
})
