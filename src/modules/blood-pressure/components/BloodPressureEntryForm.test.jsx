import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { localDateValue } from '../../../utils/date.js'
import { BloodPressureEntryForm } from './BloodPressureEntryForm.jsx'

describe('BloodPressureEntryForm date boundary', () => {
  it('limits the date control to the current local date', () => {
    const html = renderToStaticMarkup(<BloodPressureEntryForm
      measurements={[]}
      onSave={() => {}}
      onDelete={() => {}}
      t={(key) => key}
    />)
    expect(html).toContain(`type="date" max="${localDateValue()}"`)
  })
})
