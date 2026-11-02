import { describe, expect, it } from 'vitest'
import { graphPreferences, loadGraphPreferences, saveGraphPreferences } from './preferences.js'

describe('Weight graph preferences', () => {
  it('round trips only display choices, excluding transient state', () => {
    let stored
    const storage = { getItem: () => stored, setItem: (_, value) => { stored = value } }
    const choices = { chartSpan: 'allTime', showAverage: true, showFinalTarget: false, showMilestone: true }
    saveGraphPreferences({ ...choices, historyOpen: true, activeIndex: 4 }, storage)
    expect(JSON.parse(stored)).toEqual(choices)
    expect(loadGraphPreferences(storage)).toEqual(choices)
  })

  it('defaults invalid fields and tolerates malformed or unavailable storage', () => {
    const defaults = graphPreferences(null)
    expect(graphPreferences({ chartSpan: 'invalid', showAverage: 'true', showMilestone: null })).toEqual(defaults)
    for (const value of [null, 'null', '[]', '{broken']) {
      expect(loadGraphPreferences({ getItem: () => value })).toEqual(defaults)
    }
    const blocked = { getItem: () => { throw Error('blocked') }, setItem: () => { throw Error('blocked') } }
    expect(loadGraphPreferences(blocked)).toEqual(defaults)
    expect(() => saveGraphPreferences(defaults, blocked)).not.toThrow()
  })
})
