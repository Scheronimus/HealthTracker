const copy = {
  en: { overall: 'Overall progress', endpoints: '{start} kg → {target} kg', covered: '{done} of {total} kg toward your target', current: 'Current average: {value} kg', pending: 'Add recent measurements to see overall progress.', streak: '{count}/5 consecutive averages', achievements: 'Achieved milestones ({count})', achieved: 'Achieved {date}', rule: 'Each average below the milestone adds one green dot. Five in a row confirms it. An average at or above it resets the current dots to zero; confirmed milestones remain achieved.' },
  de: { overall: 'Gesamtfortschritt', endpoints: '{start} kg → {target} kg', covered: '{done} von {total} kg zum Ziel', current: 'Aktueller Durchschnitt: {value} kg', pending: 'Aktuelle Messungen hinzufügen, um den Gesamtfortschritt zu sehen.', streak: '{count}/5 aufeinanderfolgende Durchschnitte', achievements: 'Erreichte Meilensteine ({count})', achieved: 'Erreicht am {date}', rule: 'Jeder Durchschnitt unter dem Meilenstein ergänzt einen grünen Punkt. Fünf in Folge bestätigen ihn. Ein Durchschnitt auf oder über dem Wert setzt die aktuellen Punkte auf null; bestätigte Meilensteine bleiben erreicht.' },
  es: { overall: 'Progreso total', endpoints: '{start} kg → {target} kg', covered: '{done} de {total} kg hacia tu objetivo', current: 'Promedio actual: {value} kg', pending: 'Añade mediciones recientes para ver el progreso total.', streak: '{count}/5 promedios consecutivos', achievements: 'Hitos alcanzados ({count})', achieved: 'Alcanzado el {date}', rule: 'Cada promedio por debajo del hito añade un punto verde. Cinco seguidos lo confirman. Un promedio igual o superior reinicia los puntos actuales a cero; los hitos confirmados se conservan.' },
  fr: { overall: 'Progression globale', endpoints: '{start} kg → {target} kg', covered: '{done} sur {total} kg vers votre cible', current: 'Moyenne actuelle : {value} kg', pending: 'Ajoutez des mesures récentes pour voir la progression globale.', streak: '{count}/5 moyennes consécutives', achievements: 'Paliers atteints ({count})', achieved: 'Atteint le {date}', rule: 'Chaque moyenne sous le palier ajoute un point vert. Cinq de suite le confirment. Une moyenne égale ou supérieure remet les points actuels à zéro ; les paliers confirmés restent acquis.' },
}
export function progressText(language, key, values = {}) {
  const scenarios = {
    en: { fourDemo: 'Preview four green dots', resetDemo: 'Preview streak reset' },
    de: { fourDemo: 'Vier grüne Punkte ansehen', resetDemo: 'Zurückgesetzte Reihe ansehen' },
    es: { fourDemo: 'Ver cuatro puntos verdes', resetDemo: 'Ver reinicio de la racha' },
    fr: { fourDemo: 'Voir quatre points verts', resetDemo: 'Voir la remise à zéro' },
  }
  if (scenarios[language][key]) return scenarios[language][key]
  return copy[language][key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '')
}
