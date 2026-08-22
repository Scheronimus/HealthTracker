import { emptyStore, LANGUAGE_KEY, STORAGE_KEY, SUPPORTED_LANGUAGES } from './schema.js'
import { migrateStore } from './migrations.js'

export function loadStore(storage = localStorage) {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return emptyStore()
  try { return migrateStore(JSON.parse(raw)) } catch { return emptyStore() }
}

export function saveStore(store, storage = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function loadLanguage(storage = localStorage) {
  const saved = storage.getItem(LANGUAGE_KEY)
  if (SUPPORTED_LANGUAGES.includes(saved)) return saved
  const browser = globalThis.navigator?.language?.slice(0, 2)
  return SUPPORTED_LANGUAGES.includes(browser) ? browser : 'en'
}

export function saveLanguage(language, storage = localStorage) {
  if (SUPPORTED_LANGUAGES.includes(language)) storage.setItem(LANGUAGE_KEY, language)
}
