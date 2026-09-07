export const THEME_KEY = 'health-tracker-theme'
export const THEMES = Object.freeze(['system', 'light', 'dark'])

export function loadTheme(storage = localStorage) {
  const saved = storage.getItem(THEME_KEY)
  return THEMES.includes(saved) ? saved : 'system'
}

export function saveTheme(theme, storage = localStorage) {
  if (THEMES.includes(theme)) storage.setItem(THEME_KEY, theme)
}

export function applyTheme(theme, root = document.documentElement, media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')) {
  const resolved = theme === 'system' && media?.matches ? 'dark' : theme === 'dark' ? 'dark' : 'light'
  root.dataset.theme = resolved
  return resolved
}

export function watchSystemTheme(theme, onChange, media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')) {
  if (theme !== 'system' || !media) return () => {}
  const listener = () => onChange()
  media.addEventListener?.('change', listener)
  return () => media.removeEventListener?.('change', listener)
}
