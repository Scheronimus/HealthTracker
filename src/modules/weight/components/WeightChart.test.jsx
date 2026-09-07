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
