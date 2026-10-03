import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WeightDashboard } from './WeightDashboard.jsx'
import { formatDate } from '../../../utils/date.js'

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
  t: (key, values = {}) => values.date ? `${key}:${values.date}` : values.count === undefined ? key : `${key}:${values.count}`,
}

describe('WeightDashboard range filtering', () => {
  it('keeps the hero on three months while insights follow the chart span without duplicating current weight', () => {
    const views = ['threeMonths', 'oneYear', 'allTime'].map((chartSpan) => renderToStaticMarkup(<WeightDashboard {...props} state={{ chartSpan }} />))
    const hero = (html) => html.match(/<div class="weight-hero">(.*?)<\/div>/s)[1]
    expect(hero(views[0])).toBe(hero(views[1]))
    expect(hero(views[0])).toBe(hero(views[2]))
    expect(hero(views[0])).toContain('-1.0 kg')
    expect(hero(views[0])).toContain('threeMonths')
    views.forEach((html, index) => {
      const summary = html.match(/<section class="summary".*?<\/section>/s)[0]
      expect(summary).not.toContain('currentWeight')
      expect(summary).toContain(index === 0 ? '-1.0 kg' : '-3.0 kg')
      expect(summary).toContain(`weightSince:${formatDate(measurements[index === 0 ? 1 : 2].timestamp, 'en')}`)
      expect(summary).not.toContain('weightEvolution')
    })
  })

  it('does not invent a three-month hero change when only older measurements exist', () => {
    const html = renderToStaticMarkup(<WeightDashboard {...props} measurements={[measurements[2], { ...measurements[2], id: 'older', value: 85, timestamp: monthsAgo(8) }]} state={{ chartSpan: 'allTime' }} />)
    const hero = html.match(/<div class="weight-hero">(.*?)<\/div>/s)[1]
    expect(hero).toContain('82.0')
    expect(hero).toContain('threeMonths')
    expect(hero).not.toContain('-3.0')
    expect(html).toContain('-3.0 kg')
  })

  it('keeps the newest weight in the hero even when the selected range is empty', () => {
    const html = renderToStaticMarkup(<WeightDashboard {...props} measurements={[measurements[2]]} state={{ chartSpan: 'threeMonths' }} />)
    expect(html).toContain('class="weight-hero"')
    expect(html).toContain('82.0 <small>kg</small>')
    expect(html).toContain('noChartData')
    expect(html).not.toContain('↓')
  })

  it('keeps BMI context in a collapsed info popover and colors the number using its chart band', () => {
    const html = renderToStaticMarkup(<WeightDashboard {...props} profile={{ ...props.profile, heightCm: 180, age: 70, showBmi: true }} state={{ chartSpan: 'allTime' }} />)
    expect(html).toContain('24.4')
    expect(html).toContain('bmiWithin')
    expect(html).toContain('<strong class="weight-bmi-value bmiWithin">24.4</strong>')
    expect(html).toContain('<details class="weight-bmi-info">')
    expect(html).toContain('aria-label="bmiDetails"')
    expect(html).toContain('role="region"')
    expect(html).not.toContain('<details class="weight-bmi-info" open')
    expect(html).toContain('bmiBasedOn')
    expect(html).toContain('bmiOlderCaution')
    expect(html).toContain('bmiDisclaimer')
    expect(html.indexOf('bmiDisclaimer')).toBeLessThan(html.indexOf('</details>'))
    const zones = renderToStaticMarkup(<WeightDashboard {...props} profile={{ ...props.profile, heightCm: 180, age: 70, showBmi: true, showBmiRange: true }} state={{ chartSpan: 'allTime' }} />)
    expect(zones).toContain('<strong class="weight-bmi-value bmiWithin">24.4</strong>')
  })

  it('keeps under-18 BMI neutral and retains the explanation without an adult range', () => {
    const html = renderToStaticMarkup(<WeightDashboard {...props} profile={{ ...props.profile, heightCm: 180, age: 17, showBmi: true }} state={{ chartSpan: 'allTime' }} />)
    expect(html).toContain('<strong class="weight-bmi-value">24.4</strong>')
    expect(html).toContain('adultRangeUnavailable')
    expect(html).not.toContain('whoReferenceRange')
  })

  it('includes earlier off-screen readings in the average view without adding them to history', () => {
    const data = [90, 88, 86, 84, 82, 80].map((value, index) => ({
      id: String(index), type: 'weight', value, unit: 'kg', timestamp: monthsAgo(6 - index), note: `note-${index}`,
    }))
    const html = renderToStaticMarkup(<WeightDashboard {...props} measurements={data} state={{ chartSpan: 'threeMonths', showAverage: true }} />)
    expect(html).toContain('class="weight-average-line"')
    expect(html).not.toContain('weightAverageUnavailable')
    expect(html).not.toContain('note-0')
    expect(html).toContain('note-5')
    const off = renderToStaticMarkup(<WeightDashboard {...props} measurements={data} state={{ chartSpan: 'threeMonths' }} />)
    expect(off).not.toContain('class="weight-average-line"')
  })

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
