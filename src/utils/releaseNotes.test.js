import { describe, expect, it, vi } from 'vitest'
import { LAST_SEEN_RELEASE_KEY, markReleaseNotesSeen, shouldShowReleaseNotes } from './releaseNotes.js'

describe('release notes visibility', () => {
  it('shows the current release on a new profile and after a version change', () => {
    const storage = { getItem: vi.fn(() => null) }
    expect(shouldShowReleaseNotes('1.4.0', storage)).toBe(true)
    storage.getItem.mockReturnValue('1.3.0')
    expect(shouldShowReleaseNotes('1.4.0', storage)).toBe(true)
  })

  it('stays hidden after the current release is dismissed', () => {
    const storage = { getItem: vi.fn(() => '1.4.0') }
    expect(shouldShowReleaseNotes('1.4.0', storage)).toBe(false)
  })

  it('stores dismissal separately from health data', () => {
    const storage = { setItem: vi.fn() }
    markReleaseNotesSeen('1.4.0', storage)
    expect(storage.setItem).toHaveBeenCalledWith(LAST_SEEN_RELEASE_KEY, '1.4.0')
  })
})
