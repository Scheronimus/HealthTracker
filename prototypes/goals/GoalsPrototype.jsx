import { useRef, useState } from 'react'
import { editorText } from './editor-copy.js'
import { arrangeText } from './arrange-copy.js'
import { journeyText } from './journey-copy.js'
import { averageAt, milestones, scheduleState, shiftDate, startingReading, targetDirection, targetProgress, validateDraft } from './journey.js'
import { directionText } from './direction-copy.js'
import { createGoalDemo, demoText } from './demo.js'
import { progressText } from './progress-copy.js'
import { baselineText } from './baseline-copy.js'
import { WeightGraphPreview } from './WeightGraphPreview.jsx'
import { graphText } from './graph-copy.js'
import { recordText } from './record-copy.js'
import { localDateValue } from '../../src/utils/date.js'

const kinds = [['measurement', 32], ['weight', 33], ['maintenance', 34], ['activity', 35]]

export function GoalsPrototype({ copy }) {
  const [language, setLanguage] = useState('en')
  const [dark, setDark] = useState(false)
  const [goals, setGoals] = useState([])
  const [page, setPage] = useState('overview')
  const [selected, setSelected] = useState(null)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState({})
  const [readings, setReadings] = useState([])
  const [today, setToday] = useState(() => localDateValue(new Date()))
  const [reading, setReading] = useState({ date: '', weight: '' })
  const [readingError, setReadingError] = useState('')
  const [success, setSuccess] = useState(false)
  const [returnToDraft, setReturnToDraft] = useState(false)
  const [graphReturn, setGraphReturn] = useState('overview')
  const [arranging, setArranging] = useState(false)
  const [dragging, setDragging] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const drag = useRef(null)
  const t = (index) => copy[language][index]
  const e = (key) => editorText(language, key)
  const a = (key) => arrangeText(language, key)
  const j = (key, values) => journeyText(language, key, values)
  const d = (key, values) => directionText(language, key, values)
  const p = (key, values) => progressText(language, key, values)
  const baseline = (key, values) => baselineText(language, key, values)
  const graph = (key) => graphText(language, key)
  const goal = goals.find(({ id }) => id === selected)
  const title = (item) => item.name || (item.demoName ? demoText(language, item.demoName) : item.kind === 'weight' ? `${j('target')} ${number(item.target)} kg` : t(item.labelKey))
  const number = (value) => new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(Number(value))
  const weekdays = Array.from({ length: 7 }, (_, day) => new Intl.DateTimeFormat(language, { weekday: 'short' }).format(new Date(2026, 9, 11 + day, 12)))
  const formatDay = (date) => new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`))
  const firstWeightDate = readings.filter((item) => item.date <= today && Number.isFinite(item.weight) && item.weight > 0).map((item) => item.date).sort()[0] ?? null
  function navigate(next, id = null) {
    setPage(next); setSelected(id); setError({}); setArranging(false)
    window.scrollTo(0, 0)
    requestAnimationFrame(() => document.querySelector('main h1')?.focus())
  }
  function edit(item) {
    const source = startingReading(readings, item.startDate)
    setDraft({ ...item, start: source ? String(source.weight) : '', startReadingDate: source?.date ?? '', name: item.name || '', addReminder: false }); navigate('edit', item.id)
  }
  function create(kind, labelKey) {
    const existing = goals.find((item) => item.kind === kind)
    if (existing && kind !== 'activity') { edit(existing); return }
    const source = startingReading(readings, today)
    setDraft({ kind, labelKey, name: '', module: 'weight', entries: '1', schedule: 'daily', days: [], start: source ? String(source.weight) : '', startReadingDate: source?.date ?? '', target: '', interval: '1', reference: '', upper: '', lower: '', note: '', completions: [], achievements: [], startDate: today, addReminder: false })
    navigate('edit')
  }
  function save(event) {
    event.preventDefault()
    const source = draft.kind === 'weight' ? startingReading(readings, draft.startDate) : null
    const resolved = draft.kind === 'weight' ? { ...draft, start: source ? String(source.weight) : '', startReadingDate: source?.date ?? '' } : draft
    const errors = validateDraft(resolved)
    if (draft.kind === 'weight') {
      delete errors.start
      if (!draft.startDate || shiftDate(draft.startDate, 0) !== draft.startDate || draft.startDate > today) errors.startDate = 'invalid'
      else if (!source) errors.startDate = 'missing'
    }
    if (Object.keys(errors).length) {
      setError(errors)
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    const item = { ...resolved, name: draft.name.trim(), id: draft.id || crypto.randomUUID() }
    const changed = goal && item.kind === 'weight' && (goal.startDate !== item.startDate || ['start', 'target', 'interval'].some((key) => Number(goal[key]) !== Number(item[key])))
    if (changed) { item.previousAchievements = [...(goal.previousAchievements ?? []), ...(goal.achievements ?? [])]; item.achievements = [] }
    if (item.kind === 'weight') item.achievements = targetProgress(item, readings, today).achieved
    setGoals((current) => {
      if (!draft.id && draft.kind !== 'activity' && current.some((g) => g.kind === draft.kind)) return current
      const next = draft.id ? current.map((g) => g.id === item.id ? item : g) : [...current, item]
      if (item.kind === 'weight' && item.addReminder && !current.some((g) => g.kind === 'measurement')) next.push({ id: crypto.randomUUID(), kind: 'measurement', labelKey: 3, name: '', module: 'weight', entries: '1', schedule: 'daily', days: [], startDate: today, note: '', completions: [] })
      return next
    })
    navigate('detail', item.id)
  }
  function move(id, delta) {
    setGoals((current) => {
      const next = [...current], index = next.findIndex((item) => item.id === id), other = index + delta
      if (other < 0 || other >= next.length) return current
      ;[next[index], next[other]] = [next[other], next[index]]
      return next
    })
    setAnnouncement(a('moved'))
  }
  function startDrag(event, id) {
    if (event.button !== 0) return
    event.currentTarget.focus({ preventScroll: true })
    drag.current = { id, target: id, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(id)
  }
  function dragMove(event) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-goal-id]')
    if (!target || target.dataset.goalId === drag.current.id) return
    drag.current.target = target.dataset.goalId
    setDropTarget(target.dataset.goalId)
  }
  function endDrag(cancel = false) {
    if (!drag.current) return
    const { id, target } = drag.current
    if (!cancel && id !== target) setGoals((current) => {
      const from = current.findIndex((item) => item.id === id), to = current.findIndex((item) => item.id === target)
      if (from < 0 || to < 0) return current
      const next = [...current], [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    drag.current = null; setDragging(null); setDropTarget(null); setAnnouncement(a(cancel ? 'cancel' : 'moved'))
  }
  function remove() {
    if (!window.confirm(e('removeConfirm'))) return
    setGoals((current) => current.filter((item) => item.id !== goal.id)); navigate('overview')
  }
  function toggleDone(item) { setGoals((current) => current.map((g) => g.id === item.id ? { ...g, completions: g.completions.includes(today) ? g.completions.filter((date) => date !== today) : [...g.completions, today] } : g)) }
  function schedule(item) { return item.schedule === 'daily' ? e('daily') : item.days.map((day) => weekdays[day]).join(', ') }
  function overviewText(item) {
    if (item.kind === 'weight') return `${j('target')} ${number(item.target)} kg`
    if (item.kind === 'maintenance') return `${e('reference')}: ${number(item.reference)} kg`
    const complete = item.kind === 'measurement' && item.module === 'weight' ? readings.some((r) => r.date === today) : item.completions.includes(today)
    const status = scheduleState(item, today, complete)
    return `${schedule(item)} · ${status.complete ? j('complete') : status.due ? j('due') : j('nextDate', { date: formatDay(status.next) })}`
  }
  function field(key, type = 'text', optional = false) {
    return <label>{key === 'name' ? j('titleOptional') : e(key)}<input aria-label={key === 'name' ? j('titleOptional') : e(key)} type={type} value={draft[key] ?? ''} required={!optional && key !== 'name'} aria-invalid={Boolean(error[key])} aria-describedby={error[key] ? `error-${key}` : undefined} min={key === 'upper' || key === 'lower' ? '0' : '0.01'} max={type === 'number' ? '1000' : undefined} maxLength={type === 'text' ? 100 : undefined} step="0.01" onChange={(event) => { setDraft({ ...draft, [key]: event.target.value }); setError({ ...error, [key]: undefined }) }} />{optional && key !== 'name' && <small>{e('optional')}</small>}{error[key] && <small className="error" id={`error-${key}`}>{j(error[key])}</small>}</label>
  }
  function openWeight(item, fromDraft = false) {
    setReturnToDraft(fromDraft)
    let date = fromDraft && draft.startDate && draft.startDate <= today ? draft.startDate : today
    while (readings.some((r) => r.date === date)) date = shiftDate(date, -1)
    setReading({ date, weight: '' }); setReadingError(''); setSuccess(false); navigate('reading', item?.id ?? null)
  }
  function loadDemo() {
    if ((goals.length || readings.length) && !window.confirm(demoText(language, 'replace'))) return
    const demo = createGoalDemo(today)
    setGoals(demo.goals); setReadings(demo.readings); setSuccess(false); setArranging(false)
  }
  function applyReadings(next, date = today, changedGoal = null) {
    setReadings(next)
    setGoals((current) => current.map((item) => {
      const value = changedGoal && item.id === changedGoal.id ? changedGoal : item
      return value.kind === 'weight' ? { ...value, achievements: targetProgress(value, next, date).achieved } : value
    }))
  }
  function saveReading(event) {
    event.preventDefault()
    if (!reading.date || Number.isNaN(new Date(`${reading.date}T12:00:00`).getTime()) || localDateValue(new Date(`${reading.date}T12:00:00`)) !== reading.date) { setReadingError('readingDateError'); return }
    if (reading.date > today) { setReadingError('futureEntry'); return }
    if (!Number.isFinite(Number(reading.weight)) || Number(reading.weight) <= 0 || Number(reading.weight) > 1000) { setReadingError('entryError'); return }
    if (readings.some((r) => r.date === reading.date)) { setReadingError('duplicate'); return }
    const next = [...readings, { date: reading.date, weight: Number(reading.weight) }]
    applyReadings(next)
    if (returnToDraft) {
      const date = startingReading(next, draft.startDate) ? draft.startDate : reading.date
      const source = startingReading(next, date)
      setDraft({ ...draft, startDate: date, start: source ? String(source.weight) : '', startReadingDate: source?.date ?? '' })
      setReturnToDraft(false); navigate('edit', draft.id ?? null)
    } else { setSuccess(true); navigate('overview') }
  }
  function scenario(kind, item) {
    if (kind === 'four' || kind === 'reset') {
      const next = targetProgress(item, readings, today).next ?? milestones(item)[0]
      const direction = Number(item.target) < Number(item.start) ? -1 : 1
      const begin = shiftDate(today, kind === 'four' ? -7 : -8)
      const series = Array.from({ length: kind === 'four' ? 8 : 9 }, (_, index) => ({ date: shiftDate(begin, index), weight: Math.max(0.01, next + (index === 8 ? -direction * 1.5 : direction * 0.1)) }))
      const baselineDate = shiftDate(begin, -1)
      applyReadings([{ date: baselineDate, weight: Number(item.start) }, ...series], today, { ...item, startDate: baselineDate, startReadingDate: baselineDate }); setSuccess(false)
      return
    }
    const milestone = milestones(item)[0], direction = Number(item.target) < Number(item.start) ? -1 : 1
    const trendDemo = kind === 'toward' || kind === 'steady'
    const begin = shiftDate(today, kind === 'rebound' ? -13 : trendDemo ? -9 : -8)
    let series = Array.from({ length: kind === 'rebound' ? 14 : trendDemo ? 10 : 9 }, (_, index) => ({ date: shiftDate(begin, index), weight: Math.max(0.01, trendDemo ? (kind === 'steady' || index < 5 ? Number(item.start) : milestone + direction * 0.2) : index >= 9 ? Number(item.start) + (direction === -1 ? 1 : -1) : milestone + direction * 0.1) }))
    if (kind === 'gap') series = series.filter((_, index) => index !== 6)
    const baselineDate = shiftDate(begin, -1)
    applyReadings([{ date: baselineDate, weight: Number(item.start) }, ...series], today, { ...item, startDate: baselineDate, startReadingDate: baselineDate })
    setSuccess(false)
  }
  function targetView(item, detailed = false) {
    const status = targetProgress(item, readings, today)
    const trend = targetDirection(item, readings, today)
    const direction = Number(item.target) < Number(item.start) ? -1 : 1
    const hasTrend = trend.current !== null && trend.previous !== null
    const arrow = !hasTrend ? '—' : Math.abs(trend.change) < 0.005 ? '→' : trend.change < 0 ? '↘' : '↗'
    const arrowLabel = graph(!hasTrend ? 'unknown' : Math.abs(trend.change) < 0.005 ? 'steady' : trend.change < 0 ? 'falling' : 'rising')
    const trendDescription = hasTrend ? `${arrowLabel}. ${d(`${trend.state}Reason`, { value: number(Math.abs(trend.change)) })}` : arrowLabel
    const milestonePosition = status.next === null ? null : Math.max(0, Math.min(1, (status.next - Number(item.start)) / (Number(item.target) - Number(item.start))))
    return <div className="target-progress">
      <div className="overall-progress">
        <div className="overall-heading"><span>{p('overall')}</span></div>
        {status.value !== null && <div className="overall-bar"><progress aria-label={p('overall')} value={status.fraction} max="1" />{milestonePosition !== null && <span className="milestone-marker" style={{ left: `${milestonePosition * 100}%` }} role="img" aria-label={`${d('next')}: ${number(status.next)} kg`} title={`${d('next')}: ${number(status.next)} kg`} />}</div>}
        <div className="overall-endpoints"><span>{number(item.start)} kg</span><span>{j('target')} {number(item.target)} kg</span></div>
        {status.value === null ? <p className="target-data-hint">{p('pending')}</p> : <p className="overall-average"><span>{p('current', { value: number(status.value) })}</span><button type="button" className={`average-trend ${hasTrend && trend.state === 'toward' ? 'toward' : hasTrend && trend.state === 'away' ? 'away' : 'neutral'}`} disabled={arranging} aria-label={`${graph('link')}. ${trendDescription}`} title={`${graph('link')}. ${trendDescription}`} onClick={() => { setGraphReturn(detailed ? 'detail' : 'overview'); navigate('weightGraph', item.id) }}><span aria-hidden="true">{arrow}</span></button></p>}
      </div>
      {status.next !== null && <div className="milestone-motivation"><div className="milestone-heading"><span>{d('next')}</span><strong>{number(status.next)} kg</strong></div><div className="success-streak"><div className="green-dots" role="img" aria-label={p('streak', { count: status.streak })}>{Array.from({ length: status.streak }, (_, i) => <span key={i} />)}</div><small>{p('streak', { count: status.streak })}</small></div></div>}
      {status.achieved.length > 0 && <details className="achievement-history"><summary>{p('achievements', { count: status.achieved.length })}</summary><ol>{status.achieved.map((achievement) => <li key={achievement.value}><div><strong>{number(achievement.value)} kg</strong><span>{p('achieved', { date: formatDay(achievement.date) })}</span></div><div className="green-dots" role="img" aria-label={j('confirmed')}>{Array.from({ length: 5 }, (_, i) => <span key={i} />)}</div></li>)}</ol></details>}
      {!arranging && (detailed || status.value === null || !readings.some((r) => r.date === today)) && <button className="primary card-action" onClick={() => openWeight(item)}>{j('record')}</button>}
      {detailed && <>
        <details className="milestone-details"><summary>{d('details')}</summary>
          <p className="muted footnote">{formatDay(today)} · {j('coverage', { count: status.coverage })}</p>
          {trend.previous !== null && trend.current !== null && <p className="muted footnote">{d('comparison')}: {number(trend.current)} / {number(trend.previous)} kg</p>}
          <p>{direction === -1 ? p('rule') : j('policy')}</p>
          {status.value === null && <p className="muted footnote">{j('missingWindow', { count: 5 - status.coverage })}</p>}
          {!status.achieved.length && <p className="muted">{j('noAchievements')}</p>}
          {item.previousAchievements?.length > 0 && <details><summary>{j('previous')}</summary>{item.previousAchievements.map((a, i) => <p key={i}>✓ {number(a.value)} kg · {formatDay(a.date)}</p>)}</details>}
          <details><summary>{t(20)}</summary><p>{j('policy')}</p></details>
        </details>
        <details><summary>{j('scenarios')}</summary><p className="muted">{j('scenarioHelp')}</p><div className="scenario-actions"><button onClick={() => scenario('four', item)}>{p('fourDemo')}</button><button onClick={() => scenario('reset', item)}>{p('resetDemo')}</button><button onClick={() => scenario('toward', item)}>{d('towardDemo')}</button><button onClick={() => scenario('steady', item)}>{d('steadyDemo')}</button><button onClick={() => scenario('confirmation', item)}>{j('confirmationDemo')}</button><button onClick={() => scenario('rebound', item)}>{j('reboundDemo')}</button><button onClick={() => scenario('gap', item)}>{j('gapDemo')}</button></div></details>
      </>}
    </div>
  }
  function routineAction(item) {
    const complete = item.kind === 'measurement' && item.module === 'weight' ? readings.some((r) => r.date === today) : item.completions.includes(today)
    const status = scheduleState(item, today, complete)
    if (arranging || !status.due) return null
    return <div className="routine-action">{item.kind === 'measurement' && item.module === 'weight' ? (!complete && <button className="primary" onClick={() => openWeight(item)}>{j('record')}</button>) : <button className={complete ? 'text-action' : 'primary'} onClick={() => toggleDone(item)}>{complete ? t(19) : t(18)}</button>}{complete && <small>{j('nextDate', { date: formatDay(status.next) })}</small>}</div>
  }
  function recordState(item) {
    if (item.kind !== 'measurement') return ''
    const complete = item.module === 'weight' ? readings.some((reading) => reading.date === today) : item.completions.includes(today)
    const status = scheduleState(item, today, complete)
    return status.complete ? 'done' : status.due ? 'due' : 'idle'
  }
  function recordBadge(item) {
    const state = recordState(item)
    return <div className={`record-status record-status-${state}`}><span className="record-state-icon" aria-hidden="true">{state === 'done' ? '✓' : state === 'due' ? '!' : '—'}</span><strong>{recordText(language, state)}</strong></div>
  }
  return <div className={`prototype ${dark ? 'dark' : ''}`} lang={language}>
    <aside className="demo">{t(1)}</aside>
    <header><span className="wordmark">Health Tracker</span><div className="tools"><select aria-label="Language / Sprache / Idioma / Langue" value={language} onChange={(event) => { setLanguage(event.target.value); document.documentElement.lang = event.target.value }}><option value="en">English</option><option value="de">Deutsch</option><option value="es">Español</option><option value="fr">Français</option></select><button aria-label={t(42)} onClick={() => setDark(!dark)}>{t(dark ? 43 : 44)}</button></div></header>
    <main><div className="page-heading">{page !== 'overview' && <button className="back" onClick={() => { if (page === 'weightGraph') { navigate(graphReturn, graphReturn === 'detail' ? selected : null) } else if (page === 'reading' && returnToDraft) { setReturnToDraft(false); navigate('edit', draft.id ?? null) } else navigate(page === 'edit' && selected ? 'detail' : 'overview', page === 'edit' ? selected : null) }}>← {t(16)}</button>}<div className="heading-line"><h1 tabIndex="-1">{page === 'detail' && goal ? title(goal) : page === 'edit' ? (selected ? e('edit') : t(30)) : page === 'reading' ? j('record') : page === 'weightGraph' ? graph('title') : t(page === 'create' ? 30 : 0)}</h1>{page === 'overview' && <button className="add" aria-label={t(30)} onClick={() => navigate('create')}>+</button>}</div></div>
      {page === 'overview' && <>
        <div className="demo-clock"><span>{formatDay(today)}</span><button onClick={() => { setToday(shiftDate(today, 1)); setSuccess(false) }}>{j('tomorrow')}</button></div>
        <div className="demo-loader"><button onClick={loadDemo}>{demoText(language, 'load')}</button><small>{demoText(language, 'help')}</small></div>
        {success && <p role="status" className="status">{j('updated')}</p>}
        {goals.length > 1 && <div className="overview-toolbar"><button className={`arrange-toggle ${arranging ? 'active' : ''}`} aria-pressed={arranging} onClick={() => { endDrag(); setArranging(!arranging) }}>{a(arranging ? 'done' : 'arrange')}</button></div>}
        {arranging && <p id="arrange-hint" className="arrange-hint">{a('hint')}</p>}
        <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
        {!goals.length && <section><p>{e('empty')}</p><button className="primary" onClick={() => navigate('create')}>{t(30)}</button></section>}
        <div className={`goal-list ${arranging ? 'arranging' : ''}`}>
          {goals.map((item, index) => <section key={item.id} data-goal-id={item.id} className={`goal-summary ${item.kind === 'measurement' ? `record-${recordState(item)}` : ''} ${dragging === item.id ? 'dragging' : ''} ${dropTarget === item.id ? 'drop-target' : ''}`}>
            {arranging && <button className="drag-handle" aria-label={`${a('handle')}: ${title(item)}`} aria-describedby="arrange-hint" onPointerDown={(event) => startDrag(event, item.id)} onPointerMove={dragMove} onPointerUp={() => endDrag()} onPointerCancel={() => endDrag(true)} onLostPointerCapture={() => endDrag()} onKeyDown={(event) => {
              if (event.key === 'Escape') { endDrag(true); return }
              if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); move(item.id, event.key === 'ArrowUp' ? -1 : 1) }
            }}><svg width="16" height="24" viewBox="0 0 16 24" aria-hidden="true">{[6, 12, 18].flatMap((y) => [5, 11].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="currentColor" />))}</svg></button>}
            <div className="goal-content"><span className={"goal-symbol goal-symbol-" + item.kind} role="img" aria-label={j({ measurement: 'typeMeasurement', weight: 'typeWeight', maintenance: 'typeMaintenance', activity: 'typeActivity' }[item.kind])}>{({ measurement: '▦', weight: '◎', maintenance: '≈', activity: '↗' })[item.kind]}</span><button className="title-link" disabled={arranging} onClick={() => navigate('detail', item.id)}>{title(item)} {!arranging && <span aria-hidden="true">↗</span>}</button>{item.kind === 'measurement' && recordBadge(item)}{(item.kind !== 'weight' || item.name) && <p className="muted">{item.kind === 'measurement' ? schedule(item) : overviewText(item)}</p>}{item.kind === 'weight' && targetView(item)}{['measurement', 'activity'].includes(item.kind) && routineAction(item)}{item.note && <p className="footnote">{item.note}</p>}
              {arranging && <div className="reorder-fallback"><button disabled={index === 0} aria-label={`${e('up')}: ${title(item)}`} onClick={() => move(item.id, -1)}>↑</button><button disabled={index === goals.length - 1} aria-label={`${e('down')}: ${title(item)}`} onClick={() => move(item.id, 1)}>↓</button></div>}
            </div>
          </section>)}
        </div>
      </>}
      {page === 'create' && <section><h2>{t(31)}</h2><p className="muted">{e('limit')}</p>{kinds.map(([kind, labelKey]) => {
        const exists = kind !== 'activity' && goals.some((item) => item.kind === kind)
        return <button className="goal-row" key={kind} onClick={() => create(kind, labelKey)}><span><strong>{t(labelKey)}</strong><small>{exists ? e('existing') : j({measurement: 'reasonMeasurement', weight: 'reasonWeight', maintenance: 'reasonMaintenance', activity: 'reasonActivity'}[kind])}</small></span><span aria-hidden="true">{exists ? '↗' : '+'}</span></button>
      })}</section>}
      {page === 'edit' && draft && <form onSubmit={save} noValidate className="goal-editor">{field('name', 'text', true)}
        {draft.kind === 'weight' && <><label>{baseline('date')}<input type="date" aria-label={baseline('date')} min={firstWeightDate ?? undefined} max={today} disabled={!firstWeightDate} value={firstWeightDate ? draft.startDate : ''} required aria-invalid={Boolean(error.startDate)} aria-describedby={`start-date-help start-source${error.startDate ? ' error-startDate' : ''}`} onChange={(event) => { if (!event.target.value || !firstWeightDate) return; const date = event.target.value < firstWeightDate ? firstWeightDate : event.target.value > today ? today : event.target.value; const source = startingReading(readings, date); setDraft({ ...draft, startDate: date, start: source ? String(source.weight) : '', startReadingDate: source?.date ?? '' }); setError({ ...error, startDate: undefined }) }} /><small id="start-date-help">{baseline('help')}</small></label><div id="start-source" className="milestone-preview">{draft.start && draft.startReadingDate ? baseline('source', { weight: number(draft.start), date: formatDay(draft.startReadingDate) }) : <><p>{baseline('first')}</p><button type="button" onClick={() => openWeight(null, true)}>{j('record')}</button></>}</div>{error.startDate && <p id="error-startDate" className="error">{baseline(error.startDate)}</p>}{field('target', 'number')}{field('interval', 'number', true)}<div className="milestone-chips">{['0.5', '1', '5', ''].map((value) => <button type="button" key={value} aria-pressed={draft.interval === value} onClick={() => setDraft({ ...draft, interval: value })}>{value === '' ? j('none') : `${number(value)} kg`}</button>)}</div>{Number(draft.start) > 0 && Number(draft.target) > 0 && !Object.keys(validateDraft(draft)).length && <div className="milestone-preview"><strong>{j('preview')}</strong><p>{milestones(draft).slice(0, 4).map((value) => `${number(value)} kg`).join(' → ')}{milestones(draft).length > 4 ? ` … ${number(draft.target)} kg` : ''}</p></div>}{!selected && !goals.some((item) => item.kind === 'measurement') && <label className="checkbox-label"><input type="checkbox" checked={draft.addReminder} onChange={(event) => setDraft({ ...draft, addReminder: event.target.checked })} />{j('reminder')}</label>}{selected && <p className="muted footnote">{j('changed')}</p>}</>}
        {draft.kind === 'maintenance' && <>{field('reference', 'number')}{field('upper', 'number', true)}{field('lower', 'number', true)}</>}
        {draft.kind === 'measurement' && <><label>{e('module')}<select value={draft.module} onChange={(event) => setDraft({ ...draft, module: event.target.value, entries: '1' })}><option value="weight">{e('weight')}</option><option value="bloodPressure">{e('pressure')}</option></select></label>{draft.module === 'bloodPressure' && <label>{e('entries')}<select value={draft.entries} onChange={(event) => setDraft({ ...draft, entries: event.target.value })}><option>1</option><option>2</option></select></label>}</>}
        {['measurement', 'activity'].includes(draft.kind) && <><label>{e('schedule')}<select value={draft.schedule} onChange={(event) => setDraft({ ...draft, schedule: event.target.value })}><option value="daily">{e('daily')}</option><option value="weekdays">{e('weekdays')}</option></select></label>{draft.schedule === 'weekdays' && <fieldset tabIndex="-1" aria-invalid={Boolean(error.days)} aria-describedby={error.days ? 'error-days' : undefined}><legend>{e('days')}</legend><div className="weekday-options">{weekdays.map((day, index) => <label key={index}><input type="checkbox" checked={draft.days.includes(index)} onChange={() => setDraft({ ...draft, days: draft.days.includes(index) ? draft.days.filter((d) => d !== index) : [...draft.days, index].sort() })} />{day}</label>)}</div>{error.days && <p id="error-days" className="error">{j(error.days)}</p>}</fieldset>}</>}
        <label>{e('notes')}<textarea rows="3" maxLength="1000" value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} /></label>{Object.values(error).some(Boolean) && <div role="alert" className="sr-only">{Object.entries(error).filter(([, key]) => key).map(([field, key]) => field === 'startDate' ? baseline(key) : j(key)).join(' ')}</div>}<div className="editor-actions"><button className="primary" type="submit" disabled={draft.kind === 'weight' && !firstWeightDate}>{e('save')}</button><button type="button" onClick={() => navigate(selected ? 'detail' : 'overview', selected)}>{e('cancel')}</button></div>
      </form>}
      {page === 'detail' && goal && <><section>{goal.kind === 'weight' && targetView(goal, true)}{goal.kind === 'measurement' && recordBadge(goal)}<details open={goal.kind !== 'weight'}><summary>{e('configuration')}</summary><p>{overviewText(goal)}</p>
        {goal.kind === 'weight' && <p>{baseline('date')}: {formatDay(goal.startDate)}<br />{baseline('source', { weight: number(goal.start), date: formatDay(goal.startReadingDate ?? goal.startDate) })}<br />{e('interval')}: {goal.interval === '' ? '—' : `${number(goal.interval)} kg`}</p>}
        {goal.kind === 'maintenance' && <><p>{e('upper')}: {goal.upper === '' ? '—' : `${number(goal.upper)} kg`}</p><p>{e('lower')}: {goal.lower === '' ? '—' : `${number(goal.lower)} kg`}</p></>}
        {goal.kind === 'measurement' && <p>{e('module')}: {e(goal.module === 'weight' ? 'weight' : 'pressure')} · {e('entries')}: {goal.entries}</p>}
        {goal.note && <p>{goal.note}</p>}</details>
        {['measurement', 'activity'].includes(goal.kind) && <>{routineAction(goal)}{goal.kind === 'activity' && <details><summary>{t(37)}</summary>{goal.completions.map((date) => <p key={date}>✓ {formatDay(date)}</p>)}</details>}</>}
        {goal.kind === 'maintenance' && <p className="status">{(() => { const value = averageAt(readings, today).value; return value === null ? j('maintenanceUnknown') : value > Number(goal.reference) + Number(goal.upper) && goal.upper !== '' ? j('above') : value < Number(goal.reference) - Number(goal.lower) && goal.lower !== '' ? j('below') : j('within') })()}</p>}
      </section><section className="detail-actions"><button className="primary" onClick={() => edit(goal)}>{e('edit')}</button><button className="danger" onClick={remove}>{e('remove')}</button></section></>}
      {page === 'reading' && <form className="goal-editor" onSubmit={saveReading} noValidate><p className="muted footnote">{t(1)}</p><label>{j('date')}<input type="date" value={reading.date} max={today} required onChange={(event) => setReading({ ...reading, date: event.target.value })} /></label><label>{j('weight')}<input type="number" inputMode="decimal" min="0.01" max="1000" step="0.01" required value={reading.weight} aria-invalid={Boolean(readingError)} aria-describedby={readingError ? 'reading-error' : undefined} onChange={(event) => { setReading({ ...reading, weight: event.target.value }); setReadingError('') }} /></label>{readingError && <p id="reading-error" role="alert" className="error">{j(readingError)}</p>}<button className="primary" type="submit">{j('saveReading')}</button></form>}
      {page === 'detail' && goal?.kind === 'weight' && readings.length > 0 && <details><summary>{j('history')}</summary>{[...readings].sort((a, b) => b.date.localeCompare(a.date)).map((r) => <p key={r.date}>{formatDay(r.date)} · {number(r.weight)} kg</p>)}</details>}
      {page === 'weightGraph' && <><p className="muted footnote">{graph('demo')}</p><WeightGraphPreview readings={readings} language={language} today={today} /><p className="muted footnote">{graph('method')}</p></>}
    </main><footer>{t(1)}</footer>
  </div>
}
