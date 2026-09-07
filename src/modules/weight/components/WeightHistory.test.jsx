import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WeightHistory } from './WeightHistory.jsx'

describe('WeightHistory future records', () => {
  it('marks a future record while keeping it selectable for editing and deletion', () => {
    const html = renderToStaticMarkup(<WeightHistory
      measurements={[{ id: 'future-weight', type: 'weight', timestamp: '2099-01-02T12:00:00.000Z', value: 70, unit: 'kg', note: '' }]}
      language={'en'}
      onEdit={() => {}}
      t={(key) => key}
    />)

    expect(html).toContain('class="entry entry-link card future-record"')
    expect(html).toContain('futureMeasurementLabel')
    expect(html).not.toContain('disabled')
  })
})
