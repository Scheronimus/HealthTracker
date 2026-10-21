import test from 'node:test'
import assert from 'node:assert/strict'
import { averageAt, milestones, scheduleState, shiftDate, startingReading, targetDirection, targetProgress, validateDraft } from './journey.js'
import { createGoalDemo } from './demo.js'

const goal = { start: '92', target: '90.3', interval: '0.5', startDate: '2026-10-01', achievements: [] }
const series = Array.from({ length: 9 }, (_, i) => ({ date: shiftDate('2026-10-01', i), weight: 91.4 }))
test('milestones include exact partial target, gain direction and optional interval', () => {
  assert.deepEqual(milestones(goal), [91.5, 91, 90.5, 90.3])
  assert.deepEqual(milestones({ start: 75, target: 77.2, interval: 1 }), [76, 77, 77.2])
  assert.deepEqual(milestones({ ...goal, interval: '' }), [90.3])
})
test('fractional baselines do not carry offsets into interval-aligned milestones', () => {
  assert.deepEqual(milestones({ start: '92.04', target: '84', interval: '1' }), [91, 90, 89, 88, 87, 86, 85, 84])
  assert.deepEqual(milestones({ start: '92.04', target: '90', interval: '0.5' }), [91.5, 91, 90.5, 90])
  assert.deepEqual(milestones({ start: '92.04', target: '84.2', interval: '1' }), [91, 90, 89, 88, 87, 86, 85, 84.2])
  assert.deepEqual(milestones({ start: '75.04', target: '78.2', interval: '1' }), [77, 78, 78.2])
})
test('five full rolling averages confirm on ninth date, strictly below boundary', () => {
  assert.equal(targetProgress(goal, series.slice(0, 8), '2026-10-08').streak, 4)
  const result = targetProgress(goal, series, '2026-10-09')
  assert.deepEqual(result.achieved, [{ value: 91.5, date: '2026-10-09' }])
  assert.equal(targetProgress(goal, series.map((r) => ({ ...r, weight: 91.5 })), '2026-10-09').achieved.length, 0)
})
test('confirmed achievement survives rebound while incomplete windows never confirm', () => {
  const result = targetProgress(goal, series, '2026-10-09')
  const rebound = [...series, ...Array.from({ length: 5 }, (_, i) => ({ date: shiftDate('2026-10-10', i), weight: 93 }))]
  assert.equal(targetProgress({ ...goal, achievements: result.achieved }, rebound, '2026-10-14').achieved.length, 1)
  const missing = series.filter((r) => r.date !== '2026-10-06')
  assert.equal(averageAt(missing, '2026-10-09').value, null)
  assert.equal(targetProgress(goal, missing, '2026-10-09').achieved.length, 0)
})
test('dated schedule respects weekdays and next occurrence after completion', () => {
  const activity = { schedule: 'weekdays', days: [1, 3, 5], startDate: '2026-10-01' }
  assert.deepEqual(scheduleState(activity, '2026-10-14', true), { due: true, complete: true, next: '2026-10-16' })
  assert.equal(scheduleState(activity, '2026-10-15').due, false)
})
test('validation identifies fields and distinguishes disabled/zero bounds', () => {
  assert.deepEqual(validateDraft({ kind: 'maintenance', reference: '80', upper: '0', lower: '' }), {})
  assert.equal(validateDraft({ kind: 'maintenance', reference: '80', upper: '', lower: '' }).upper, 'boundsError')
  assert.deepEqual(validateDraft({ kind: 'activity', schedule: 'weekdays', days: [] }), { days: 'daysError' })
  assert.equal(validateDraft({ ...goal, kind: 'weight', target: '92' }).target, 'targetError')
})
test('local date arithmetic spans DST and month/year boundaries', () => {
  assert.equal(shiftDate('2026-10-25', 1), '2026-10-26')
  assert.equal(shiftDate('2026-12-31', 1), '2027-01-01')
})
test('target direction compares separate windows and distinguishes rebound from overall progress', () => {
  const history = [...Array.from({ length: 5 }, (_, i) => ({ date: shiftDate('2026-10-01', i), weight: 91 })), ...Array.from({ length: 5 }, (_, i) => ({ date: shiftDate('2026-10-06', i), weight: 91.2 }))]
  const result = targetDirection(goal, history, '2026-10-10')
  assert.equal(result.state, 'away')
  assert.ok(result.current < Number(goal.start))
  assert.equal(result.previous, 91)
  assert.equal(targetDirection(goal, history.slice(0, 5), '2026-10-05').state, 'baselineToward')
  assert.equal(targetDirection(goal, history, '2026-10-11').state, 'unknown')
})
test('direction handles weight gain, unchanged averages and pre-goal history', () => {
  const gain = { start: '75', target: '80', startDate: '2026-10-01' }
  const history = Array.from({ length: 10 }, (_, i) => ({ date: shiftDate('2026-10-01', i), weight: i < 5 ? 76 : 77 }))
  assert.equal(targetDirection(gain, history, '2026-10-10').state, 'toward')
  assert.equal(targetDirection(gain, history.map((r) => ({ ...r, weight: 76 })), '2026-10-10').state, 'steady')
  assert.equal(targetDirection({ ...gain, startDate: '2026-10-10' }, history, '2026-10-10').state, 'baselineToward')
})
test('visual demo has coherent progress and honours singleton limits', () => {
  const demo = createGoalDemo('2026-10-14')
  assert.equal(demo.readings.length, 30)
  assert.equal(new Set(demo.readings.map((r) => r.date)).size, 30)
  assert.equal(demo.readings.at(-1).date, '2026-10-14')
  assert.equal(demo.goals.filter((g) => g.kind === 'weight').length, 1)
  assert.equal(demo.goals.filter((g) => g.kind === 'measurement').length, 1)
  assert.equal(demo.goals.filter((g) => g.kind === 'activity').length, 2)
  const target = demo.goals[0]
  assert.equal(targetDirection(target, demo.readings, '2026-10-14').state, 'toward')
  assert.ok(target.achievements.length > 0)
  assert.ok(targetProgress(target, demo.readings, '2026-10-14').next > Number(target.target))
})
test('only consecutive successful averages count: one, four, reset, then five confirms', () => {
  assert.equal(targetProgress(goal, series.slice(0, 5), '2026-10-05').streak, 1)
  assert.equal(targetProgress(goal, series.slice(0, 8), '2026-10-08').streak, 4)
  const reset = [...series.slice(0, 8), { date: '2026-10-09', weight: 94 }]
  const failed = targetProgress(goal, reset, '2026-10-09')
  assert.equal(failed.streak, 0)
  assert.equal(failed.achieved.length, 0)
  const recovery = [...reset, ...Array.from({ length: 9 }, (_, i) => ({ date: shiftDate('2026-10-10', i), weight: 91.4 }))]
  assert.deepEqual(targetProgress(goal, recovery, '2026-10-18').achieved, [{ value: 91.5, date: '2026-10-18' }])
})
test('overall progress measures the full start-to-target distance rather than a milestone', () => {
  const halfway = series.map((r) => ({ ...r, weight: 88 }))
  assert.equal(targetProgress({ ...goal, target: '84' }, halfway, '2026-10-09').fraction, 0.5)
  const away = halfway.map((r) => ({ ...r, weight: 94 }))
  assert.equal(targetProgress({ ...goal, target: '84' }, away, '2026-10-09').fraction, 0)
  const beyond = halfway.map((r) => ({ ...r, weight: 83 }))
  assert.equal(targetProgress({ ...goal, target: '84' }, beyond, '2026-10-09').fraction, 1)
})
test('date-selected baseline uses exact or latest earlier entry, never a later weight', () => {
  const history = [{ date: '2026-10-10', weight: 90 }, { date: '2026-10-01', weight: 92 }, { date: '2026-10-05', weight: 91 }]
  assert.deepEqual(startingReading(history, '2026-10-05'), { date: '2026-10-05', weight: 91 })
  assert.deepEqual(startingReading(history, '2026-10-07'), { date: '2026-10-05', weight: 91 })
  assert.equal(startingReading(history, '2026-09-30'), null)
  assert.equal(startingReading(history, '2026-02-30'), null)
  assert.equal(startingReading([], '2026-10-05'), null)
})
