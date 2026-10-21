import { useRef, useState } from 'react'
import { localDateValue } from '../../utils/date.js'
import { goalWeights, measurementGoalStatus } from './model.js'
import { targetDirection, targetProgress } from './calculations.js'
import './goals.css'

export function GoalsDashboard({ measurements: goals, sources, profile, language, state, onStateChange, onRecordsChange, onNavigate, onEdit, onDelete, t }) {
  const [dragging, setDragging] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const drag = useRef(null)
  const today = localDateValue(), weights = goalWeights(sources)
  const g = (key, values) => t(`goal_${key}`, values)
  const number = (value) => new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value)
  const formatDay = (date) => new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(new Date(`${date}T12:00:00`))
  const title = (goal) => goal.name || (goal.kind === 'weight' ? `${t('weightArea')} · ${number(goal.target)} kg` : `${g('recordKind')} · ${t(sources[goal.module].labelKey)}`)
  const selected = goals.find((goal) => goal.id === state.selectedId)
  const enabled = (id) => profile.modules.includes(id)
  function patch(patch) { onStateChange({ ...state, ...patch }) }
  function open(goal) {
    patch({ selectedId: goal.id, arranging: false }); window.scrollTo(0, 0)
    requestAnimationFrame(() => document.querySelector('.goal-detail-title')?.focus())
  }
  function move(id, delta) {
    const next = [...goals], index = next.findIndex((goal) => goal.id === id), other = index + delta
    if (other < 0 || other >= next.length) return
    ;[next[index], next[other]] = [next[other], next[index]]
    onRecordsChange(next); setAnnouncement(g('orderUpdated'))
  }
  function startDrag(event, id) {
    if (event.button !== 0) return
    event.currentTarget.focus({ preventScroll: true })
    drag.current = { id, target: id, pointer: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId); setDragging(id)
  }
  function dragMove(event) {
    if (!drag.current || event.pointerId !== drag.current.pointer) return
    const element = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-goal-id]')
    if (element && element.dataset.goalId !== drag.current.id) { drag.current.target = element.dataset.goalId; setDropTarget(element.dataset.goalId) }
  }
  function endDrag(cancel = false) {
    if (!drag.current) return
    const { id, target } = drag.current
    if (!cancel && id !== target) {
      const next = [...goals], from = next.findIndex((goal) => goal.id === id), to = next.findIndex((goal) => goal.id === target)
      const [item] = next.splice(from, 1); next.splice(to, 0, item); onRecordsChange(next); setAnnouncement(g('orderUpdated'))
    }
    drag.current = null; setDragging(null); setDropTarget(null)
  }
  function recordView(goal) {
    const status = measurementGoalStatus(goal, sources, today)
    return <>
      <div className={`goal-record-status goal-record-status-${status.state}`}><span aria-hidden="true">{status.state === 'done' ? '✓' : status.state === 'due' ? '!' : '—'}</span><strong>{g(status.state === 'done' ? 'complete' : status.state === 'due' ? 'due' : 'idle')}</strong></div>
      <p className="goal-muted">{goal.schedule === 'daily' ? g('daily') : goal.days.map((day) => new Intl.DateTimeFormat(language, { weekday: 'short' }).format(new Date(2026, 9, 11 + day, 12))).join(', ')}{goal.entries > 1 && ` · ${status.count}/${goal.entries}`}</p>
      {!state.arranging && status.state === 'due' && <button className="primary" type="button" disabled={!enabled(goal.module)} onClick={() => onNavigate(goal.module, { entry: true, preset: { date: today } })}>{g(goal.module === 'weight' ? 'recordWeight' : 'recordReading')}</button>}
      {status.state !== 'due' && <p className="goal-muted goal-small">{g('nextDate', { date: formatDay(status.next) })}</p>}
      {!enabled(goal.module) && <p className="goal-muted goal-small">{g('hiddenSource')}</p>}
    </>
  }
  function targetView(goal, detail = false) {
    const status = targetProgress(goal, weights, today), trend = targetDirection(goal, weights, today)
    const completion = status.achieved.find((item) => item.value === goal.target)
    const hasTrend = trend.current !== null && trend.previous !== null
    const movement = !hasTrend ? 'unknown' : Math.abs(trend.change) < 0.005 ? 'flat' : trend.change < 0 ? 'falling' : 'rising'
    const arrow = movement === 'falling' ? '↘' : movement === 'rising' ? '↗' : movement === 'flat' ? '→' : '—'
    const marker = status.next === null ? null : Math.max(0, Math.min(1, (status.next - goal.start) / (goal.target - goal.start)))
    return <>
      {completion && <div className="goal-completion" role="status">
        <svg className="goal-trophy" viewBox="0 0 96 96" aria-hidden="true"><circle className="goal-trophy-halo" cx="48" cy="48" r="42" /><path className="goal-trophy-cup" d="M32 25h32v18c0 13-7 21-16 21s-16-8-16-21V25Z" /><path className="goal-trophy-outline" d="M32 30H22v9c0 10 6 15 14 15m28-24h10v9c0 10-6 15-14 15M48 64v12m-12 2h24" /><path className="goal-trophy-star" d="m48 33 3.2 6.5 7.2 1-5.2 5.1 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5.1 7.2-1Z" /><path className="goal-trophy-sparkles" d="M15 17v10m-5-5h10m57 40v10m-5-5h10M77 14v6m-3-3h6" /></svg>
        <div className="goal-completion-copy"><strong>{g('targetAchieved')}</strong><span className="goal-completion-weight">{number(goal.target)} <small>kg</small></span><span>{g('celebrate')}</span><small>{g('achieved', { date: formatDay(completion.date) })}</small></div>
      </div>}
      <div className={`goal-overall${completion ? ' goal-overall-complete' : ''}`}><strong className="goal-overall-title">{g('overall')}</strong>
        {(status.value !== null || completion) && <div className="goal-bar"><progress aria-label={g('overall')} value={completion ? 1 : status.fraction} max="1" />{marker !== null && <span className="goal-milestone-marker" style={{ left: `${marker * 100}%` }} role="img" aria-label={`${g('next')}: ${number(status.next)} kg`} title={`${g('next')}: ${number(status.next)} kg`} />}</div>}
        <div className="goal-endpoints"><span>{number(goal.start)} kg</span><span>{number(goal.target)} kg</span></div>
        {status.value === null ? <p className="goal-muted">{g('insufficient')}</p> : <div className="goal-current"><span>{g('current', { value: number(status.value) })}</span><button type="button" className={`goal-trend ${trend.state === 'toward' ? 'toward' : trend.state === 'away' ? 'away' : ''}`} disabled={state.arranging || !enabled('weight')} aria-label={`${g('graph')}. ${g(movement)}`} title={`${g('graph')}. ${g(movement)}`} onClick={() => onNavigate('weight')}><span aria-hidden="true">{arrow}</span></button></div>}
      </div>
      {status.next !== null && <div className="goal-next"><div><span>{g('next')}</span><strong>{number(status.next)} kg</strong></div><div className="goal-streak"><div className="goal-green-dots" role="img" aria-label={g('streak', { count: status.streak })}>{Array.from({ length: status.streak }, (_, index) => <i key={index} />)}</div><small>{g('streak', { count: status.streak })}</small></div></div>}
      {status.achieved.length > 0 && <details className="goal-achievements"><summary>{g('achievements', { count: status.achieved.length })}</summary><ol>{status.achieved.map((achievement) => <li key={achievement.value}><div><strong>{number(achievement.value)} kg</strong><small>{g('achieved', { date: formatDay(achievement.date) })}</small></div><div className="goal-green-dots" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <i key={index} />)}</div></li>)}</ol></details>}
      {!completion && !state.arranging && !weights.some((reading) => reading.date === today) && <button className="primary" disabled={!enabled('weight')} onClick={() => onNavigate('weight', { entry: true, preset: { date: today } })}>{g('recordWeight')}</button>}
      {!enabled('weight') && <p className="goal-muted goal-small">{g('hiddenSource')}</p>}
      {detail && <><details><summary>{g('details')}</summary><p>{g('baseline', { weight: number(goal.start), date: formatDay(goal.startReadingDate) })}</p><p>{g('startDate')}: {formatDay(goal.startDate)}</p><p>{g('policy')}</p></details>{goal.previousAchievements.length > 0 && <details><summary>{g('previous')}</summary>{goal.previousAchievements.map((item, index) => <p key={index}>{number(item.value)} kg · {formatDay(item.date)}</p>)}</details>}</>}
    </>
  }
  if (selected) return <div className="goals-dashboard"><button className="goal-back" onClick={() => patch({ selectedId: null })}>← {t('back')}</button><h2 className="goal-detail-title" tabIndex="-1">{title(selected)}</h2><section className={`goal-card ${selected.kind === 'measurement' ? `goal-record-${measurementGoalStatus(selected, sources, today).state}` : ''}`}>{selected.kind === 'weight' ? targetView(selected, true) : recordView(selected)}{selected.note && <p className="goal-muted">{selected.note}</p>}</section><div className="goal-detail-actions"><button className="primary" onClick={() => onEdit(selected)}>{g('edit')}</button><button className="goal-delete" onClick={() => onDelete(selected.id)}>{t('delete')}</button></div></div>
  return <div className="goals-dashboard">
    {goals.length === 0 && <section className="goal-card goal-empty"><h2>{g('area')}</h2><p>{g('empty')}</p><button className="primary" onClick={() => onEdit(null)}>{g('add')}</button></section>}
    {goals.length > 1 && <div className="goal-toolbar"><button aria-pressed={state.arranging} onClick={() => { endDrag(); patch({ arranging: !state.arranging }) }}>{g(state.arranging ? 'done' : 'arrange')}</button></div>}
    {state.arranging && <p id="goal-arrange-hint" className="goal-muted goal-small">{g('arrangeHint')}</p>}
    <div role="status" className="visually-hidden">{announcement}</div>
    <div className="goal-list">{goals.map((goal, index) => <section key={goal.id} data-goal-id={goal.id} className={`goal-card ${goal.kind === 'measurement' ? `goal-record-${measurementGoalStatus(goal, sources, today).state}` : ''} ${dragging === goal.id ? 'goal-dragging' : ''} ${dropTarget === goal.id ? 'goal-drop-target' : ''}`}>
      {state.arranging && <button className="goal-drag-handle" aria-label={`${g('arrange')}: ${title(goal)}`} aria-describedby="goal-arrange-hint" onPointerDown={(event) => startDrag(event, goal.id)} onPointerMove={dragMove} onPointerUp={() => endDrag()} onPointerCancel={() => endDrag(true)} onLostPointerCapture={() => endDrag()} onKeyDown={(event) => { if (event.key === 'Escape') endDrag(true); if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); move(goal.id, event.key === 'ArrowUp' ? -1 : 1) } }}>⠿</button>}
      <div className="goal-content"><button className="goal-title" disabled={state.arranging} onClick={() => open(goal)}><span className="goal-symbol" aria-hidden="true">{goal.kind === 'weight' ? '◎' : '▦'}</span><strong>{title(goal)}</strong><span aria-hidden="true">↗</span></button>{goal.kind === 'weight' ? targetView(goal) : recordView(goal)}{goal.note && <p className="goal-muted goal-small">{goal.note}</p>}
        {state.arranging && <div className="goal-order-buttons"><button disabled={index === 0} aria-label={`${g('up')}: ${title(goal)}`} onClick={() => move(goal.id, -1)}>↑</button><button disabled={index === goals.length - 1} aria-label={`${g('down')}: ${title(goal)}`} onClick={() => move(goal.id, 1)}>↓</button></div>}
      </div>
    </section>)}</div>
  </div>
}
