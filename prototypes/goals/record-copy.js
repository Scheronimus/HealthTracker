const text = {
  en: { due: 'To do today', done: 'All done', idle: 'Nothing due today' },
  de: { due: 'Heute zu erledigen', done: 'Alles erledigt', idle: 'Heute nichts fällig' },
  es: { due: 'Pendiente hoy', done: 'Todo completado', idle: 'Nada pendiente hoy' },
  fr: { due: 'À faire aujourd’hui', done: 'Tout est fait', idle: 'Rien à faire aujourd’hui' },
}
export function recordText(language, state) { return text[language][state] }
