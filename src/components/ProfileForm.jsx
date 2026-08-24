import { useState } from 'react'
import { MODULES, MODULES_BY_ID } from '../modules/registry.jsx'

export function ProfileForm({ profile, onSave, t }) {
  const [draft, setDraft] = useState(profile)
  const [error, setError] = useState('')

  function patchProfile(patch) { setDraft((current) => ({ ...current, ...patch })) }

  function submit(event) {
    event.preventDefault()
    const age = draft.age === '' ? null : Number(draft.age)
    const heightCm = draft.heightCm === '' ? null : Number(draft.heightCm)
    if ((age !== null && (!Number.isInteger(age) || age < 0 || age > 130))
      || (heightCm !== null && (!Number.isFinite(heightCm) || heightCm < 50 || heightCm > 300))) {
      setError(t('profileInvalid'))
      return
    }
    if (draft.showBmi && heightCm === null) { setError(t('heightRequiredForBmi')); return }
    if (!draft.modules.length) { setError(t('moduleRequired')); return }
    onSave({ ...draft, name: draft.name.trim(), age, heightCm, showBmiRange: draft.showBmi ? draft.showBmiRange : false })
  }

  function toggleModule(id) {
    const modules = draft.modules.includes(id) ? draft.modules.filter((item) => item !== id) : [...draft.modules, id]
    patchProfile({ modules })
    setError('')
  }

  function moveModule(id, offset) {
    const index = draft.modules.indexOf(id)
    const target = index + offset
    if (index < 0 || target < 0 || target >= draft.modules.length) return
    const modules = [...draft.modules]
    ;[modules[index], modules[target]] = [modules[target], modules[index]]
    patchProfile({ modules })
  }

  const orderedModules = [...draft.modules.map((id) => MODULES_BY_ID[id]), ...MODULES.filter((item) => !draft.modules.includes(item.id))]

  return <form id="profile-form" className="profile-form card" onSubmit={submit}>
    <p className="hint profile-intro">{t('profileOptional')}</p>
    <label>{t('name')}<input value={draft.name} maxLength="100" autoComplete="name" onChange={(event) => patchProfile({ name: event.target.value })} /></label>
    <label>{t('age')}<input type="number" inputMode="numeric" min="0" max="130" step="1" value={draft.age ?? ''} onChange={(event) => patchProfile({ age: event.target.value })} /></label>
    <fieldset className="module-preferences"><legend>{t('modulePreferences')}</legend><p>{t('modulePreferencesHint')}</p>
      {orderedModules.map((item) => {
        const index = draft.modules.indexOf(item.id)
        const enabled = index >= 0
        return <div className="module-preference" key={item.id}>
          <label><input type="checkbox" checked={enabled} onChange={() => toggleModule(item.id)} /><span>{t(item.labelKey)}</span></label>
          <div><button type="button" disabled={!enabled || index === 0} aria-label={t('moveModuleUp', { module: t(item.labelKey) })} onClick={() => moveModule(item.id, -1)}>↑</button><button type="button" disabled={!enabled || index === draft.modules.length - 1} aria-label={t('moveModuleDown', { module: t(item.labelKey) })} onClick={() => moveModule(item.id, 1)}>↓</button></div>
        </div>
      })}
    </fieldset>
    {draft.modules.map((id) => {
      const ModuleSettings = MODULES_BY_ID[id]?.ProfileSettings
      return ModuleSettings ? <ModuleSettings key={id} profile={draft} onChange={patchProfile} t={t} /> : null
    })}
    {error && <p className="error" role="alert">{error}</p>}
    <p className="profile-privacy">{t('profilePrivacy')}</p>
  </form>
}
