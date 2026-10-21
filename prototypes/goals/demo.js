import { shiftDate, targetProgress } from './journey.js'

export function createGoalDemo(today) {
  const startDate = shiftDate(today, -29)
  const fluctuations = [0, 0.12, -0.05, 0.08, -0.1, 0.04, -0.02]
  const readings = Array.from({ length: 30 }, (_, index) => ({ date: shiftDate(startDate, index), weight: Math.round((92 - index * 0.08 + fluctuations[index % fluctuations.length]) * 100) / 100 }))
  const target = { id: 'demo-target', kind: 'weight', labelKey: 33, name: '', start: '92', target: '84', interval: '0.5', startDate, note: '', achievements: [], previousAchievements: [] }
  target.achievements = targetProgress(target, readings, today).achieved
  return { readings, goals: [
    target,
    { id: 'demo-record', kind: 'measurement', labelKey: 3, name: '', module: 'weight', entries: '1', schedule: 'daily', days: [], startDate, completions: [], note: '' },
    { id: 'demo-walk', kind: 'activity', labelKey: 5, name: '', schedule: 'daily', days: [], startDate, completions: [shiftDate(today, -1), shiftDate(today, -2)], note: '' },
    { id: 'demo-strength', kind: 'activity', demoName: 'strength', labelKey: 35, name: '', schedule: 'weekdays', days: [2, 5], startDate, completions: [shiftDate(today, -7)], note: '' },
  ] }
}

const copy = {
  en: { load: 'Load demo data', help: '30 days of sample weights, a target and activity reminders.', replace: 'Replace your current prototype goals and demo measurements with the sample? Real health data is not affected.', strength: 'Strength session' },
  de: { load: 'Demo-Daten laden', help: '30 Tage Beispielgewichte, ein Ziel und Aktivitätserinnerungen.', replace: 'Aktuelle Prototypziele und Demo-Messungen durch das Beispiel ersetzen? Echte Gesundheitsdaten bleiben unberührt.', strength: 'Krafttraining' },
  es: { load: 'Cargar datos de demo', help: '30 días de pesos de ejemplo, un objetivo y recordatorios de actividad.', replace: '¿Reemplazar los objetivos y mediciones del prototipo por el ejemplo? Los datos reales no se modifican.', strength: 'Sesión de fuerza' },
  fr: { load: 'Charger les données de démo', help: '30 jours de poids fictifs, une cible et des rappels d’activité.', replace: 'Remplacer les objectifs et mesures du prototype par cet exemple ? Les données réelles restent intactes.', strength: 'Séance de renforcement' },
}
export function demoText(language, key) { return copy[language][key] }
