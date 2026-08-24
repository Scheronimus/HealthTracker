import { BloodPressureChart } from './BloodPressureChart.jsx'
import { BloodPressureDiary } from './BloodPressureDiary.jsx'
import { BloodPressureOverview } from './BloodPressureOverview.jsx'

export function BloodPressureDashboard({ weeks, measurements, selectedWeek, view, language, onSlot, onSelectWeek, onView, t }) {
  const current = weeks[0]
  const selectedIndex = Math.max(0, weeks.findIndex((week) => week.start === selectedWeek))
  const selected = weeks[selectedIndex] ?? current
  function selectView(next) {
    if (next === 'diary' && !selectedWeek) onSelectWeek(current.start)
    onView(next)
  }

  return <div className={'bp-dashboard'}>
    <nav className={'bp-view-nav'} aria-label={t('bloodPressureViews')}>
      {['overview', 'diary', 'trends'].map((item) => <button key={item} type={'button'} className={view === item ? 'active' : ''} aria-pressed={view === item} onClick={() => selectView(item)}>{t(item)}</button>)}
    </nav>
    {view === 'overview' && <BloodPressureOverview current={current} previous={weeks[1]} onSlot={onSlot} t={t} />}
    {view === 'diary' && <BloodPressureDiary week={selected} language={language} canGoNewer={selectedIndex > 0} canGoOlder={selectedIndex < weeks.length - 1} onNewer={() => onSelectWeek(weeks[selectedIndex - 1].start)} onOlder={() => onSelectWeek(weeks[selectedIndex + 1].start)} onSlot={onSlot} t={t} />}
    {view === 'trends' && <BloodPressureChart measurements={measurements} language={language} t={t} />}
  </div>
}
