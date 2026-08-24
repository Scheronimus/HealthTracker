import { useEffect, useState } from 'react'
import { createBloodPressureMeasurement } from '../data/schema.js'
import { localDateValue } from '../utils/date.js'
import { defaultBloodPressurePeriod, hasBloodPressureSlot, localTimeValue, timestampFromLocal } from '../utils/bloodPressure.js'

export function BloodPressureEntryForm({ editing, preset, measurements, onSave, onDelete, t }) {
  const now = new Date()
  const [date, setDate] = useState(preset?.date ?? localDateValue(editing?.timestamp ?? now))
  const [time, setTime] = useState(localTimeValue(editing?.timestamp ?? now))
  const [period, setPeriod] = useState(preset?.period ?? editing?.period ?? defaultBloodPressurePeriod(measurements, now))
  const [systolic, setSystolic] = useState(editing?.systolicMmHg ?? '')
  const [diastolic, setDiastolic] = useState(editing?.diastolicMmHg ?? '')
  const [pulse, setPulse] = useState(editing?.pulseBpm ?? '')
  const [error, setError] = useState('')
  useEffect(() => document.querySelector('#systolic')?.focus(), [])

  function submit(event) {
    event.preventDefault()
    const timestamp = timestampFromLocal(date, time)
    const values = { systolicMmHg: Number(systolic), diastolicMmHg: Number(diastolic), pulseBpm: Number(pulse) }
    const invalid = !timestamp || !['morning', 'evening'].includes(period)
      || !Number.isInteger(values.systolicMmHg) || values.systolicMmHg < 50 || values.systolicMmHg > 300
      || !Number.isInteger(values.diastolicMmHg) || values.diastolicMmHg < 30 || values.diastolicMmHg > 200
      || !Number.isInteger(values.pulseBpm) || values.pulseBpm < 30 || values.pulseBpm > 250
    if (invalid) { setError(t('bpInvalid')); return }
    if (values.systolicMmHg <= values.diastolicMmHg) { setError(t('bpOrderInvalid')); return }
    if (hasBloodPressureSlot(measurements, date, period, editing?.id)) { setError(t('bpDuplicate')); return }
    const next = createBloodPressureMeasurement({ timestamp, period, ...values })
    onSave(editing ? { ...next, id: editing.id } : next)
  }

  const dateField = <label>{t('date')}<input type={'date'} value={date} onChange={(event) => { setDate(event.target.value); setError('') }} required /></label>
  const timeField = <label>{t('time')}<input type={'time'} value={time} onChange={(event) => setTime(event.target.value)} required /></label>
  const periodField = <label>{t('period')}<select value={period} onChange={(event) => { setPeriod(event.target.value); setError('') }} required><option value={'morning'}>{t('morning')}</option><option value={'evening'}>{t('evening')}</option></select></label>
  const pressureFields = <>
    <label>{t('systolic')}<span className={'weight-input'}><input id={'systolic'} type={'number'} inputMode={'numeric'} min={'50'} max={'300'} step={'1'} value={systolic} onChange={(event) => setSystolic(event.target.value)} required /><span>mmHg</span></span></label>
    <label>{t('diastolic')}<span className={'weight-input'}><input type={'number'} inputMode={'numeric'} min={'30'} max={'200'} step={'1'} value={diastolic} onChange={(event) => setDiastolic(event.target.value)} required /><span>mmHg</span></span></label>
    <label>{t('pulse')}<span className={'weight-input'}><input type={'number'} inputMode={'numeric'} min={'30'} max={'250'} step={'1'} value={pulse} onChange={(event) => setPulse(event.target.value)} required /><span>bpm</span></span></label>
  </>
  return <form id={'entry-form'} className={'entry-form card'} onSubmit={submit}>
    <div className={'form-grid'}>{dateField}{timeField}</div>{periodField}
    <div className={'bp-fields'}>{pressureFields}</div>
    <p className={'form-hint'}>{t('bpRangeHint')}</p>
    {error && <p className={'error'} role={'alert'}>{error}</p>}
    {editing && <button className={'delete-entry-button'} type={'button'} onClick={() => onDelete(editing.id)}>{t('delete')}</button>}
  </form>
}
