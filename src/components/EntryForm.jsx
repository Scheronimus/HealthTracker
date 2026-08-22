import { useEffect, useState } from 'react'
import { createWeightMeasurement } from '../data/schema.js'
import { localFormValues, toIsoTimestamp } from '../utils/date.js'

export function EntryForm({ editing, onSave, t }) {
  const initial = localFormValues(editing?.timestamp)
  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [weight, setWeight] = useState(editing?.value ?? '')
  const [note, setNote] = useState(editing?.note ?? '')
  const [error, setError] = useState('')
  useEffect(() => document.querySelector('#weight')?.focus(), [])

  function submit(event) {
    event.preventDefault()
    const value = Number(weight)
    const timestamp = toIsoTimestamp(date, time)
    if (!timestamp || !Number.isFinite(value) || value <= 0 || value > 1000) { setError(t('required')); return }
    const next = createWeightMeasurement({ value, timestamp, note })
    onSave(editing ? { ...next, id: editing.id } : next)
  }

  return <form id="entry-form" className="entry-form card" onSubmit={submit}>
    <div className="form-grid">
      <label>{t('date')}<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <label>{t('time')}<input type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></label>
    </div>
    <label>{t('weight')}<span className="weight-input"><input id="weight" type="number" inputMode="decimal" min="0.1" max="1000" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} required /><span>kg</span></span></label>
    <label>{t('note')}<textarea value={note} maxLength="1000" rows="5" onChange={(event) => setNote(event.target.value)} /></label>
    {error && <p className="error" role="alert">{error}</p>}
  </form>
}
