import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./App.css', import.meta.url), 'utf8')
const darkBlock = css.match(/:root\[data-theme='dark'\] \{([^}]+)\}/)?.[1] ?? ''
const colors = Object.fromEntries([...darkBlock.matchAll(/--([\w-]+):\s*(#[\da-f]{6})/gi)].map((match) => [match[1], match[2]]))

function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((part) => Number.parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

describe('dark theme contrast', () => {
  it.each([
    ['main text', 'ink', 'cream'],
    ['muted text', 'muted', 'cream'],
    ['form labels', 'label', 'cream'],
    ['button text', 'primary-dark', 'button'],
    ['link text', 'accent', 'cream'],
    ['error text', 'danger', 'cream'],
    ['decrease text', 'decrease', 'cream'],
    ['increase text', 'increase', 'cream'],
    ['header subtitle', 'header-muted', 'primary'],
    ['header action', 'header-action', 'primary'],
    ['filled-button text', 'header-action', 'primary'],
    ['tooltip text', 'header-action', 'tooltip-bg'],
  ])('%s meets normal-text contrast', (_name, foreground, background) => {
    expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(4.5)
  })

  it.each([
    ['card border', 'line', 'cream'],
    ['input border', 'control-border', 'control'],
    ['chart crosshair', 'crosshair', 'cream'],
  ])('%s meets non-text contrast', (_name, foreground, background) => {
    expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(3)
  })
})
