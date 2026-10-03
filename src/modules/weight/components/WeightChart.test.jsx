import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WeightChart } from './WeightChart.jsx'

describe('WeightChart BMI layers', () => {
  it('renders a subtle trend-area shadow above BMI zones and below the trend line', () => {
    const html = renderToStaticMarkup(<WeightChart
      measurements={[
        { id: 'one', timestamp: '2026-01-01T12:00:00.000Z', value: 70, note: '' },
        { id: 'two', timestamp: '2026-02-01T12:00:00.000Z', value: 90, note: '' },
      ]}
      language={'en'}
      span={'allTime'}
      onSpanChange={() => {}}
      profile={{ age: 30, heightCm: 180, showBmi: true, showBmiRange: true }}
      onBmiZonesChange={() => {}}
      t={(key) => key}
    />)

    const area = html.indexOf('<polygon')
    const zones = html.indexOf('class="bmi-zone')
    const line = html.indexOf('class="trend-line"')
    expect(area).toBeGreaterThan(-1)
    expect(area).toBeGreaterThan(zones)
    expect(line).toBeGreaterThan(area)
    expect(html).toContain('weight-chart card bmi-zones-visible')
  })
})

describe('WeightChart average mode', () => {
  const measurements = [80, 81, 82, 83, 84, 85].map((value, index) => ({
    id: String(index), timestamp: `2026-01-0${index + 1}T12:00:00Z`, value, note: '',
  }))
  const props = {
    measurements, averages: [{ id: '4', value: 82 }, { id: '5', value: 83 }],
    language: 'en', span: 'allTime', onSpanChange: () => {}, onAverageChange: () => {},
    profile: {}, t: (key) => key,
  }

  it('switches between recorded and average lines without superimposing them', () => {
    const off = renderToStaticMarkup(<WeightChart {...props} />)
    expect(off).not.toContain('class="weight-average-line"')
    expect(off).toContain('class="trend-line"')
    const on = renderToStaticMarkup(<WeightChart {...props} showAverage />)
    expect(on).not.toContain('class="trend-line"')
    expect(on).toContain('class="weight-average-line"')
    expect(on).toContain('aria-checked="true"')
    expect(on).not.toContain('weightAverageUnavailable')
  })

  it('renders one average as a point and explains unavailable averages', () => {
    const single = renderToStaticMarkup(<WeightChart {...props} averages={props.averages.slice(0, 1)} showAverage />)
    expect(single).toContain('class="weight-average-point"')
    expect(single).not.toContain('class="weight-average-line"')
    const missing = renderToStaticMarkup(<WeightChart {...props} averages={[]} showAverage />)
    expect(missing).toContain('weightAverageUnavailable')
    expect(missing).not.toContain('<polygon')
    expect(missing).not.toContain('class="trend-line"')
    expect(single).not.toContain('<polygon')
  })
})
