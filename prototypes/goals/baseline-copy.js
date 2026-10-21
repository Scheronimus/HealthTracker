const copy = {
  en: { date: 'Goal start date', source: 'Starting weight: {weight} kg · recorded {date}', help: 'Uses the weight recorded on this date, or the latest earlier entry. No later reading is used.', missing: 'No weight recorded on or before this date. Record a weight to set the starting point.', invalid: 'Choose a valid start date on or before the demo day.' },
  de: { date: 'Startdatum des Ziels', source: 'Startgewicht: {weight} kg · erfasst am {date}', help: 'Verwendet das Gewicht dieses Datums oder den letzten früheren Eintrag. Spätere Messungen werden nicht verwendet.', missing: 'Kein Gewicht an oder vor diesem Datum erfasst. Trage ein Gewicht als Ausgangspunkt ein.', invalid: 'Wähle ein gültiges Startdatum bis zum Demo-Tag.' },
  es: { date: 'Fecha de inicio del objetivo', source: 'Peso inicial: {weight} kg · registrado el {date}', help: 'Usa el peso de esta fecha o el último registro anterior. Nunca usa mediciones posteriores.', missing: 'No hay peso registrado en esta fecha ni antes. Registra un peso para fijar el punto inicial.', invalid: 'Elige una fecha inicial válida hasta el día de demo.' },
  fr: { date: 'Date de début de l’objectif', source: 'Poids de départ : {weight} kg · saisi le {date}', help: 'Utilise le poids saisi à cette date ou la dernière saisie antérieure. Aucune mesure ultérieure n’est utilisée.', missing: 'Aucun poids saisi à cette date ou avant. Saisissez un poids pour définir le point de départ.', invalid: 'Choisissez une date de début valide jusqu’au jour de démo.' },
}
export function baselineText(language, key, values = {}) {
  if (key === 'first') return { en: 'Record your first weight to choose a start date.', de: 'Trage dein erstes Gewicht ein, um ein Startdatum zu wählen.', es: 'Registra tu primer peso para elegir la fecha inicial.', fr: 'Saisissez votre premier poids pour choisir une date de début.' }[language]
  return copy[language][key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '')
}
