import { useEffect, useState } from 'react'
import { createWeightMeasurement } from '../model.js'
import { hasWeightOnDate, isFutureLocalDate, localDateValue, toDateTimestamp } from '../../../utils/date.js'

export function WeightEntryForm({ editing, measurements, onSave, onDelete, t }) {
  const [date, setDate] = useState(localDateValue(editing?.timestamp))
  const [weight, setWeight] = useState(editing?.value ?? '')
  const [note, setNote] = useState(editing?.note ?? '')
  const [error, setError] = useState('')
  const latestWeight = editing ? null : [...measurements].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0]?.value
  const latestWeightHint = Number.isFinite(latestWeight) ? Number(latestWeight).toFixed(1) : undefined
  useEffect(() => document.querySelector('#weight')?.focus(), [])

  function submit(event) {
    event.preventDefault()
    const value = Number(weight)
    const timestamp = toDateTimestamp(date)
    if (isFutureLocalDate(date)) { setError(t('futureMeasurement')); return }
    if (!timestamp || !Number.isFinite(value) || value <= 0 || value > 1000) { setError(t('required')); return }
    if (hasWeightOnDate(measurements, date, editing?.id)) { setError(t('oneWeightPerDay')); return }
    const next = createWeightMeasurement({ value, timestamp, note })
    onSave(editing ? { ...next, id: editing.id } : next)
  }

  return <form id="entry-form" className="entry-form card" onSubmit={submit}>
    <label>{t('date')}<input type="date" max={localDateValue()} value={date} onChange={(event) => { setDate(event.target.value); setError('') }} required /></label>
    <label>{t('weight')}<span className="weight-input"><input id="weight" type="number" inputMode="decimal" min="0.1" max="1000" step="0.1" value={weight} placeholder={latestWeightHint} aria-describedby={latestWeightHint ? 'latest-weight-hint' : undefined} onChange={(event) => setWeight(event.target.value)} required /><span>kg</span></span>{latestWeightHint && <small id="latest-weight-hint" className="visually-hidden">{t('latestWeightHint', { weight: latestWeightHint })}</small>}</label>
    <label>{t('note')}<textarea value={note} maxLength="1000" rows="5" onChange={(event) => setNote(event.target.value)} /></label>
    {error && <p className="error" role="alert">{error}</p>}
    {editing && <button className="delete-entry-button" type="button" onClick={() => onDelete(editing.id)}>{t('delete')}</button>}
  </form>
}
