import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WeightDashboard } from './WeightDashboard.jsx'

function monthsAgo(count) {
  const date = new Date()
  date.setMonth(date.getMonth() - count)
  return date.toISOString()
}

const measurements = [
  { id: 'recent-weight', type: 'weight', value: 79, unit: 'kg', timestamp: monthsAgo(1), note: 'recent note' },
  { id: 'previous-visible-weight', type: 'weight', value: 80, unit: 'kg', timestamp: monthsAgo(2), note: 'previous visible note' },
  { id: 'old-weight', type: 'weight', value: 82, unit: 'kg', timestamp: monthsAgo(5), note: 'old note' },
]

const props = {
  measurements,
  language: 'en',
  profile: { age: null, heightCm: null, showBmi: false, showBmiRange: false },
  onStateChange: () => {},
  onProfileChange: () => {},
  onEdit: () => {},
  t: (key, values = {}) => values.count === undefined ? key : `${key}:${values.count}`,
}

describe('WeightDashboard range filtering', () => {
  it('shows only three-month measurements in both the graph and raw history', () => {
    const html = renderToStaticMarkup(<WeightDashboard {...props} state={{ chartSpan: 'threeMonths' }} />)
    expect(html).toContain('chartDescription:2')
    expect(html).toContain('recent note')
    expect(html).toContain('previous visible note')
    expect(html).toContain('-1.0')
    expect(html).not.toContain('old note')
  })

  it('shows every measurement in graph and raw history for all time', () => {
    const html = renderToStaticMarkup(<WeightDashboard {...props} state={{ chartSpan: 'allTime' }} />)
    expect(html).toContain('chartDescription:3')
    expect(html).toContain('recent note')
    expect(html).toContain('old note')
  })

  it('shows matching empty graph and history states when the range has no measurements', () => {
    const html = renderToStaticMarkup(<WeightDashboard {...props} measurements={[measurements[2]]} state={{ chartSpan: 'threeMonths' }} />)
    expect(html).toContain('noChartData')
    expect(html).toContain('noEntries')
    expect(html).not.toContain('old note')
  })
})
