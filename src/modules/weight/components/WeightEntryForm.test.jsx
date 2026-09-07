import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WeightEntryForm } from './WeightEntryForm.jsx'
import { localDateValue } from '../../../utils/date.js'

const older = { id: 'weight-older', type: 'weight', value: 81.2, unit: 'kg', timestamp: '2026-01-01T12:00:00.000Z', note: '' }
const latest = { id: 'weight-latest', type: 'weight', value: 79.6, unit: 'kg', timestamp: '2026-02-01T12:00:00.000Z', note: '' }
const props = { measurements: [older, latest], onSave: () => {}, onDelete: () => {}, t: (key, values = {}) => values.weight ? `${key}:${values.weight}` : key }

describe('WeightEntryForm latest-weight hint', () => {
  it('uses the newest weight as a placeholder while leaving a new field empty', () => {
    const html = renderToStaticMarkup(<WeightEntryForm {...props} />)
    expect(html).toContain('placeholder="79.6"')
    expect(html).toContain(`max="${localDateValue()}"`)
    expect(html).toContain('latestWeightHint:79.6')
    expect(html).not.toContain('value="79.6"')
  })

  it('uses the stored value rather than a placeholder while editing', () => {
    const html = renderToStaticMarkup(<WeightEntryForm {...props} editing={older} />)
    expect(html).toContain('value="81.2"')
    expect(html).not.toContain('placeholder=')
    expect(html).not.toContain('latestWeightHint')
  })

  it('shows no placeholder when there are no previous weights', () => {
    const html = renderToStaticMarkup(<WeightEntryForm {...props} measurements={[]} />)
    expect(html).not.toContain('placeholder=')
    expect(html).not.toContain('latestWeightHint')
  })
})
