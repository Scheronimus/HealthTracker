const locales = { en: 'en-GB', es: 'es-ES', de: 'de-DE', fr: 'fr-FR' }

export function formatDate(timestamp, language) {
  return new Intl.DateTimeFormat(locales[language], { dateStyle: 'medium' }).format(new Date(timestamp))
}

export function localDateValue(timestamp = new Date().toISOString()) {
  const date = new Date(timestamp)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
  return local.slice(0, 10)
}

export function toDateTimestamp(date) {
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export function isFutureLocalDate(date, now = new Date()) {
  const timestamp = typeof date === 'string' ? toDateTimestamp(date) : null
  return Boolean(timestamp && localDateValue(timestamp) === date && date > localDateValue(now))
}

export function isFutureTimestamp(timestamp, now = new Date()) {
  const value = Date.parse(timestamp)
  return !Number.isNaN(value) && value > now.getTime()
}

export function hasWeightOnDate(measurements, date, excludedId = null) {
  return measurements.some((item) => item.type === 'weight' && item.id !== excludedId && localDateValue(item.timestamp) === date)
}
