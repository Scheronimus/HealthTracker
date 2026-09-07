import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { timestampFromLocal } from '../bloodPressure.js'
import { BloodPressureDiary } from './BloodPressureDiary.jsx'

describe('BloodPressureDiary future records', () => {
  it('keeps a recorded future reading enabled so it can be opened and deleted', () => {
    const item = {
      id: 'future-pressure',
      type: 'bloodPressure',
      timestamp: timestampFromLocal('2099-01-02', '10:00'),
      systolicMmHg: 125,
      diastolicMmHg: 80,
      pulseBpm: 62,
    }
    const html = renderToStaticMarkup(<BloodPressureDiary
      week={{ start: '2099-01-01', end: '2099-01-07', measurements: [item] }}
      language={'en'}
      canGoNewer={false}
      canGoOlder={false}
      onNewer={() => {}}
      onOlder={() => {}}
      onSlot={() => {}}
      t={(key) => key}
    />)

    expect(html).toMatch(/class="bp-diary-reading recorded future-record"(?![^>]*disabled)/)
    expect(html).toContain('futureMeasurementLabel')
  })
})
