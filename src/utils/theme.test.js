import { describe, expect, it, vi } from 'vitest'
import { applyTheme, loadTheme, saveTheme, watchSystemTheme } from './theme.js'

function storageWith(value) {
  return { getItem: vi.fn(() => value), setItem: vi.fn() }
}

describe('theme preference', () => {
  it('loads valid preferences and defaults invalid values to system', () => {
    expect(loadTheme(storageWith('dark'))).toBe('dark')
    expect(loadTheme(storageWith('unknown'))).toBe('system')
  })

  it('saves only supported preferences', () => {
    const storage = storageWith(null)
    saveTheme('light', storage)
    saveTheme('unknown', storage)
    expect(storage.setItem).toHaveBeenCalledTimes(1)
    expect(storage.setItem).toHaveBeenCalledWith('health-tracker-theme', 'light')
  })

  it('resolves system, light, and dark preferences on the document root', () => {
    const root = { dataset: {} }
    expect(applyTheme('system', root, { matches: true })).toBe('dark')
    expect(root.dataset.theme).toBe('dark')
    expect(applyTheme('light', root, { matches: true })).toBe('light')
    expect(applyTheme('dark', root, { matches: false })).toBe('dark')
  })

  it('watches operating-system changes only while using system preference', () => {
    const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() }
    const cleanup = watchSystemTheme('system', () => {}, media)
    expect(media.addEventListener).toHaveBeenCalledOnce()
    cleanup()
    expect(media.removeEventListener).toHaveBeenCalledOnce()
    watchSystemTheme('dark', () => {}, media)
    expect(media.addEventListener).toHaveBeenCalledOnce()
  })
})
