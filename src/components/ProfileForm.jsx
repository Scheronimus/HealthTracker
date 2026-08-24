import { useState } from 'react'
import { FEATURES } from '../features.js'

export function ProfileForm({ profile, onSave, t }) {
  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(profile.age ?? '')
  const [heightCm, setHeightCm] = useState(profile.heightCm ?? '')
  const [showBmi, setShowBmi] = useState(profile.showBmi)
  const [modules, setModules] = useState(profile.modules)
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const parsedAge = age === '' ? null : Number(age)
    const parsedHeight = heightCm === '' ? null : Number(heightCm)
    if ((parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 130))
      || (parsedHeight !== null && (!Number.isFinite(parsedHeight) || parsedHeight < 50 || parsedHeight > 300))) {
      setError(t('profileInvalid'))
      return
    }
    if (showBmi && parsedHeight === null) {
      setError(t('heightRequiredForBmi'))
      return
    }
    if (!modules.length) { setError(t('moduleRequired')); return }
    onSave({ name: name.trim(), age: parsedAge, heightCm: parsedHeight, showBmi, showBmiRange: showBmi ? profile.showBmiRange : false, modules })
  }

  function toggleModule(id) {
    setModules((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setError('')
  }

  function moveModule(id, offset) {
    setModules((current) => {
      const index = current.indexOf(id)
      const target = index + offset
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  return <form id="profile-form" className="profile-form card" onSubmit={submit}>
    <p className="hint profile-intro">{t('profileOptional')}</p>
    <label>{t('name')}<input value={name} maxLength="100" autoComplete="name" onChange={(event) => setName(event.target.value)} /></label>
    <label>{t('age')}<input type="number" inputMode="numeric" min="0" max="130" step="1" value={age} onChange={(event) => setAge(event.target.value)} /></label>
    <label>{t('height')}<div className="weight-input"><input type="number" inputMode="decimal" min="50" max="300" step="0.1" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} /><span>cm</span></div></label>
    <label className="toggle-row"><input type="checkbox" checked={showBmi} onChange={(event) => setShowBmi(event.target.checked)} /><span><strong>{t('showBmi')}</strong><small>{t('showBmiHint')}</small></span></label>
    <fieldset className="module-preferences"><legend>{t('modulePreferences')}</legend><p>{t('modulePreferencesHint')}</p>
      {[...modules.map((id) => FEATURES.find((item) => item.id === id)), ...FEATURES.filter((item) => !modules.includes(item.id))].map((item) => {
        const index = modules.indexOf(item.id)
        const enabled = index >= 0
        return <div className="module-preference" key={item.id}>
          <label><input type="checkbox" checked={enabled} onChange={() => toggleModule(item.id)} /><span>{t(item.labelKey)}</span></label>
          <div><button type="button" disabled={!enabled || index === 0} aria-label={t('moveModuleUp', { module: t(item.labelKey) })} onClick={() => moveModule(item.id, -1)}>↑</button><button type="button" disabled={!enabled || index === modules.length - 1} aria-label={t('moveModuleDown', { module: t(item.labelKey) })} onClick={() => moveModule(item.id, 1)}>↓</button></div>
        </div>
      })}
    </fieldset>
    {error && <p className="error" role="alert">{error}</p>}
    <p className="profile-privacy">{t('profilePrivacy')}</p>
  </form>
}
