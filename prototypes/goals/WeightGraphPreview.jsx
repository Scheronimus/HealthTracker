import { useState } from 'react'
import { WeightChart } from '../../src/modules/weight/components/WeightChart.jsx'
import { filterBySpan, fiveMeasurementAverages } from '../../src/modules/weight/chart.js'
import { translate } from '../../src/i18n.js'
import { toDateTimestamp } from '../../src/utils/date.js'

export function WeightGraphPreview({ readings, language, today }) {
  const [span, setSpan] = useState('threeMonths')
  const [showAverage, setShowAverage] = useState(false)
  const measurements = readings.map((reading) => ({ id: `demo-weight-${reading.date}`, type: 'weight', timestamp: toDateTimestamp(reading.date), value: reading.weight, note: '' }))
  const now = new Date(`${today}T12:00:00`)
  return <div className="demo-weight-graph"><WeightChart measurements={filterBySpan(measurements, span, now)} averages={filterBySpan(fiveMeasurementAverages(measurements), span, now)} showAverage={showAverage} onAverageChange={setShowAverage} language={language} span={span} onSpanChange={setSpan} profile={{ age: null, heightCm: null, showBmi: false, showBmiRange: false }} t={(key, values) => translate(language, key, values)} /></div>
}
