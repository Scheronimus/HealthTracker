const locales = { en: 'en-GB', es: 'es-ES', de: 'de-DE', fr: 'fr-FR' }

export function formatDateTime(timestamp, language) {
  return new Intl.DateTimeFormat(locales[language], { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
}

export function formatDate(timestamp, language) {
  return new Intl.DateTimeFormat(locales[language], { dateStyle: 'medium' }).format(new Date(timestamp))
}

export function localFormValues(timestamp = new Date().toISOString()) {
  const date = new Date(timestamp)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
  return { date: local.slice(0, 10), time: local.slice(11, 16) }
}

export function toIsoTimestamp(date, time) {
  const parsed = new Date(`${date}T${time}`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}
