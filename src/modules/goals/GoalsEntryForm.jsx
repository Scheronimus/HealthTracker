import { useState } from 'react'
import { createGoal, goalWeights, validGoalDate } from './model.js'
import { milestones, startingReading } from './calculations.js'
import { localDateValue } from '../../utils/date.js'
import './goals.css'

export function GoalsEntryForm({ editing, preset, measurements: goals, sources, profile, language, state, onStateChange, onNavigate, onSave, onDelete, t }) {
  const today = localDateValue()
  const weights = goalWeights(sources)
  const firstDate = weights.map((item) => item.date).sort()[0]
  const kinds = ['measurement', 'weight']
  const available = (kind) => !goals.some((item) => item.kind === kind && item.id !== editing?.id)
  const [draft, setDraft] = useState(() => state.entryDraft ?? {
    kind: editing?.kind ?? preset?.kind ?? kinds.find(available) ?? 'measurement', name: editing?.name ?? '', note: editing?.note ?? '',
    startDate: editing?.startDate ?? today, target: editing?.target ?? '', interval: editing?.interval ?? (editing ? '' : '1'),
    module: editing?.module ?? 'weight', entries: editing?.entries ?? 1, schedule: editing?.schedule ?? 'daily', days: editing?.days ?? [], addReminder: false,
  })
  const [errors, setErrors] = useState({})
  const g = (key, values) => t(`goal_${key}`, values)
  const number = (value) => new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value)
  const formatDay = (date) => new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`))
  const baseline = startingReading(weights, draft.startDate) ?? (editing?.kind === 'weight' && draft.startDate === editing.startDate ? { weight: editing.start, date: editing.startReadingDate } : null)
  const candidate = { start: baseline?.weight ?? '', target: draft.target, interval: draft.interval }

  function patch(patch) {
    const next = { ...draft, ...patch }
    setDraft(next); onStateChange({ ...state, entryDraft: next }); setErrors({})
  }
  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!available(draft.kind)) nextErrors.kind = 'duplicate'
    if (draft.kind === 'weight') {
      if (!validGoalDate(draft.startDate) || draft.startDate > today || (!baseline && (!firstDate || draft.startDate < firstDate))) nextErrors.startDate = 'dateError'
      else if (!baseline) nextErrors.startDate = 'baselineMissing'
      if (draft.target === '' || !Number.isFinite(Number(draft.target)) || Number(draft.target) <= 0 || Number(draft.target) > 1000) nextErrors.target = 'weightError'
      else if (Number(draft.target) === baseline?.weight) nextErrors.target = 'targetEqual'
      if (draft.interval !== '' && draft.interval !== null && (!Number.isFinite(Number(draft.interval)) || Number(draft.interval) < 0.01 || Number(draft.interval) > 1000 || Math.abs(Number(draft.interval) * 100 - Math.round(Number(draft.interval) * 100)) > 1e-7)) nextErrors.interval = 'intervalError'
    } else if (draft.schedule === 'weekdays' && !draft.days.length) nextErrors.days = 'daysRequired'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      requestAnimationFrame(() => document.querySelector('.goal-entry [aria-invalid="true"]')?.focus())
      return
    }
    try {
      const item = createGoal(draft, sources, editing)
      const companion = !editing && draft.kind === 'weight' && draft.addReminder && available('measurement')
        ? [createGoal({ kind: 'measurement', name: '', note: '', startDate: today, module: 'weight', entries: 1, schedule: 'daily', days: [] }, sources)] : []
      onSave(item, companion)
    } catch (error) { setErrors({ form: error.message.startsWith('goal_') ? error.message.slice(5) : 'invalid' }) }
  }
  const fieldError = (key) => errors[key] && <small id={`goal-error-${key}`} className="error">{g(errors[key])}</small>
  return <form id="entry-form" className="goal-entry card" noValidate onSubmit={submit}>
    {!editing && <fieldset className="goal-kind"><legend>{g('add')}</legend>{kinds.map((kind) => <label key={kind}><input type="radio" name="goal-kind" value={kind} checked={draft.kind === kind} disabled={!available(kind)} onChange={() => patch({ kind })} /><span>{g(kind === 'weight' ? 'targetKind' : 'recordKind')}</span></label>)}</fieldset>}
    {fieldError('kind')}
    <label>{g('name')}<input value={draft.name} maxLength="100" onChange={(event) => patch({ name: event.target.value })} /></label>
    {draft.kind === 'weight' ? <>
      <label>{g('startDate')}<input aria-label={g('startDate')} type="date" min={firstDate} max={today} value={baseline || firstDate ? draft.startDate : ''} disabled={!firstDate} aria-invalid={Boolean(errors.startDate)} aria-describedby={`goal-baseline-help${errors.startDate ? ' goal-error-startDate' : ''}`} onChange={(event) => { if (!event.target.value || !firstDate) return; patch({ startDate: event.target.value < firstDate ? firstDate : event.target.value > today ? today : event.target.value }) }} />{fieldError('startDate')}<small id="goal-baseline-help">{g('baselineHelp')}</small></label>
      <div className="goal-baseline">{baseline ? g('baseline', { weight: number(baseline.weight), date: formatDay(baseline.date) }) : <><p>{g('firstWeight')}</p><button type="button" disabled={!profile.modules.includes('weight')} onClick={() => onNavigate('weight', { entry: true, preset: { date: draft.startDate } })}>{g('recordWeight')}</button>{!profile.modules.includes('weight') && <small>{g('hiddenSource')}</small>}</>}</div>
      <label>{g('target')}<input aria-label={g('target')} type="number" inputMode="decimal" step="0.01" min="0.01" max="1000" value={draft.target} aria-invalid={Boolean(errors.target)} aria-describedby={errors.target ? 'goal-error-target' : undefined} onChange={(event) => patch({ target: event.target.value })} />{fieldError('target')}</label>
      <label>{g('interval')}<input aria-label={g('interval')} type="number" inputMode="decimal" step="0.01" min="0.01" max="1000" value={draft.interval ?? ''} aria-invalid={Boolean(errors.interval)} aria-describedby={errors.interval ? 'goal-error-interval' : undefined} onChange={(event) => patch({ interval: event.target.value })} />{fieldError('interval')}</label>
      <div className="goal-chips">{['0.5', '1', '5', ''].map((value) => <button type="button" key={value} aria-pressed={String(draft.interval ?? '') === value} onClick={() => patch({ interval: value })}>{value ? `${number(Number(value))} kg` : g('none')}</button>)}</div>
      {baseline && Number(draft.target) > 0 && Number(draft.target) !== baseline.weight && <div className="goal-baseline"><strong>{g('preview')}</strong><p>{milestones(candidate).slice(0, 4).map((value) => `${number(value)} kg`).join(' → ')}{milestones(candidate).length > 4 ? ` … ${number(Number(draft.target))} kg` : ''}</p></div>}
      {!editing && available('measurement') && <label className="goal-check"><input type="checkbox" checked={draft.addReminder} onChange={(event) => patch({ addReminder: event.target.checked })} /><span>{g('recordKind')} · {t('weightArea')}</span></label>}
      {editing && <p className="hint">{g('changeHint')}</p>}
    </> : <>
      <label>{g('source')}<select value={draft.module} onChange={(event) => patch({ module: event.target.value, entries: 1 })}>{Object.values(sources).map((source) => <option key={source.id} value={source.id}>{t(source.labelKey)}</option>)}</select></label>
      {sources[draft.module].maxDailyEntries > 1 && <label>{g('entries')}<select value={draft.entries} onChange={(event) => patch({ entries: Number(event.target.value) })}>{Array.from({ length: sources[draft.module].maxDailyEntries }, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label>}
      <label>{g('schedule')}<select value={draft.schedule} onChange={(event) => patch({ schedule: event.target.value })}><option value="daily">{g('daily')}</option><option value="weekdays">{g('weekdays')}</option></select></label>
      {draft.schedule === 'weekdays' && <fieldset className="goal-weekdays" tabIndex="-1" aria-invalid={Boolean(errors.days)} aria-describedby={errors.days ? 'goal-error-days' : undefined}><legend>{g('days')}</legend>{Array.from({ length: 7 }, (_, day) => <label key={day}><input type="checkbox" checked={draft.days.includes(day)} onChange={() => patch({ days: draft.days.includes(day) ? draft.days.filter((value) => value !== day) : [...draft.days, day] })} />{new Intl.DateTimeFormat(language, { weekday: 'short' }).format(new Date(2026, 9, 11 + day, 12))}</label>)}{fieldError('days')}</fieldset>}
    </>}
    <label>{g('note')}<textarea rows="3" maxLength="1000" value={draft.note} onChange={(event) => patch({ note: event.target.value })} /></label>
    {errors.form && <p role="alert" className="error">{g(errors.form)}</p>}
    {Object.keys(errors).length > 0 && <p role="alert" className="visually-hidden">{Object.values(errors).map((key) => g(key)).join(' ')}</p>}
    {editing && <button className="delete-entry-button" type="button" onClick={() => onDelete(editing.id)}>{t('delete')}</button>}
  </form>
}
