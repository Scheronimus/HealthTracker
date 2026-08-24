export function WeightProfileSettings({ profile, onChange, t }) {
  return <fieldset className="module-settings"><legend>{t('weightArea')}</legend>
    <label>{t('height')}<div className="weight-input"><input type="number" inputMode="decimal" min="50" max="300" step="0.1" value={profile.heightCm ?? ''} onChange={(event) => onChange({ heightCm: event.target.value })} /><span>cm</span></div></label>
    <label className="toggle-row"><input type="checkbox" checked={profile.showBmi} onChange={(event) => onChange({ showBmi: event.target.checked })} /><span><strong>{t('showBmi')}</strong><small>{t('showBmiHint')}</small></span></label>
  </fieldset>
}
