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
    expect(html).toContain('weight-chart bmi-zones-visible')
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

  it('shows a single recorded measurement without adding permanent markers to a multi-reading line', () => {
    const single = renderToStaticMarkup(<WeightChart {...props} measurements={measurements.slice(0, 1)} />)
    expect(single).toContain('class="weight-selected-point"')
    const multiple = renderToStaticMarkup(<WeightChart {...props} />)
    expect(multiple).not.toContain('class="weight-selected-point"')
  })

  it('shows references by default, expands the range and hides them independently', () => {
    const referenceLines = [{ kind: 'target', value: 60 }, { kind: 'milestone', value: 75 }]
    const on = renderToStaticMarkup(<WeightChart {...props} referenceLines={referenceLines} />)
    expect(on).toContain('class="weight-reference-line target"')
    expect(on).toContain('aria-label="weightFinalTarget: 60 kg"')
    expect(on).toContain('class="weight-reference-line milestone"')
    expect(on).toContain('>60</text>')
    const milestoneOnly = renderToStaticMarkup(<WeightChart {...props} referenceLines={referenceLines} showFinalTarget={false} />)
    expect(milestoneOnly).not.toContain('class="weight-reference-line target"')
    expect(milestoneOnly).toContain('class="weight-reference-line milestone"')
    const targetOnly = renderToStaticMarkup(<WeightChart {...props} referenceLines={referenceLines} showMilestone={false} />)
    expect(targetOnly).toContain('class="weight-reference-line target"')
    expect(targetOnly).not.toContain('class="weight-reference-line milestone"')
    const off = renderToStaticMarkup(<WeightChart {...props} referenceLines={referenceLines} showFinalTarget={false} showMilestone={false} />)
    expect(off).not.toContain('weight-reference-line')
    expect(off).toContain('weightFinalTarget')
    expect(off).not.toContain('>60</text>')
    expect(renderToStaticMarkup(<WeightChart {...props} />)).not.toContain('weightFinalTarget')
    const same = [{ kind: 'target', value: 60 }, { kind: 'milestone', value: 60 }]
    const combined = renderToStaticMarkup(<WeightChart {...props} referenceLines={same} />)
    expect(combined.match(/class="weight-reference-line /g)).toHaveLength(1)
    expect(combined).toContain('weightFinalTarget / weightNextMilestone: 60 kg')
    expect(renderToStaticMarkup(<WeightChart {...props} referenceLines={same} showFinalTarget={false} />)).toContain('class="weight-reference-line milestone"')
  })

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
