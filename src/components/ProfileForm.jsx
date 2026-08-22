import { useState } from 'react'

export function ProfileForm({ profile, onSave, t }) {
  const [name, setName] = useState(profile.name)
  const [age, setAge] = useState(profile.age ?? '')
  const [heightCm, setHeightCm] = useState(profile.heightCm ?? '')
  const [showBmi, setShowBmi] = useState(profile.showBmi)
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
    onSave({ name: name.trim(), age: parsedAge, heightCm: parsedHeight, showBmi })
  }

  return <form id="profile-form" className="profile-form card" onSubmit={submit}>
    <p className="hint profile-intro">{t('profileOptional')}</p>
    <label>{t('name')}<input value={name} maxLength="100" autoComplete="name" onChange={(event) => setName(event.target.value)} /></label>
    <label>{t('age')}<input type="number" inputMode="numeric" min="0" max="130" step="1" value={age} onChange={(event) => setAge(event.target.value)} /></label>
    <label>{t('height')}<div className="weight-input"><input type="number" inputMode="decimal" min="50" max="300" step="0.1" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} /><span>cm</span></div></label>
    <label className="toggle-row"><input type="checkbox" checked={showBmi} onChange={(event) => setShowBmi(event.target.checked)} /><span><strong>{t('showBmi')}</strong><small>{t('showBmiHint')}</small></span></label>
    {error && <p className="error" role="alert">{error}</p>}
    <p className="profile-privacy">{t('profilePrivacy')}</p>
  </form>
}