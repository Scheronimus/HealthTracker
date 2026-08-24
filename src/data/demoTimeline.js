export const DEMO_START = new Date('2025-08-23T07:15:00.000Z')
const IRREGULAR_INTERVALS = [3, 5, 7, 4, 6, 3, 7, 5, 4, 6]

export function demoTrackedDays() {
  const trackedDays = []
  for (let day = 0; day < 90; day += 1) trackedDays.push(day)
  let irregularDay = 120
  let intervalIndex = 0
  while (irregularDay < 240) {
    trackedDays.push(irregularDay)
    irregularDay += IRREGULAR_INTERVALS[intervalIndex % IRREGULAR_INTERVALS.length]
    intervalIndex += 1
  }
  for (let day = 240; day <= 364; day += 1) trackedDays.push(day)
  return trackedDays
}
