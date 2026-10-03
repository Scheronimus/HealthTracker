import { useEffect, useId, useRef } from 'react'

export function WeightBmiInfo({ status, band, profile, t }) {
  const disclosure = useRef(null)
  const contentId = useId()

  useEffect(() => {
    function dismiss(event) {
      if (disclosure.current && !disclosure.current.contains(event.target)) disclosure.current.open = false
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [])

  return <details className="weight-bmi-info" ref={disclosure}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false }}
    onKeyDown={(event) => {
      if (event.key === 'Escape' && event.currentTarget.open) {
        event.preventDefault()
        event.currentTarget.open = false
        event.currentTarget.querySelector('summary').focus()
      }
    }}>
    <summary aria-label={t('bmiDetails')} aria-controls={contentId}><span aria-hidden="true">ⓘ</span></summary>
    <div id={contentId} className="weight-bmi-popover" role="region" aria-label={t('bmiDetails')}>
      <p className="weight-bmi-classification">{t(status)}</p>
      {band && <p>{t('weightBmi')}: {band.range}</p>}
      <p>{t('bmiBasedOn', { height: profile.heightCm })}</p>
      {profile.age !== null && profile.age >= 65 && <p>{t('bmiOlderCaution')}</p>}
      <p>{t('bmiDisclaimer')}</p>
    </div>
  </details>
}
