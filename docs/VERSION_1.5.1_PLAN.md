# Health Tracker v1.5.1 plan

## Scope

- Fix issue #1 so entry-screen header actions remain fully visible on narrow screens in every supported language.
- Allow long entry titles to wrap in the flexible center column without shrinking or clipping Cancel and Save.

## Constraints

- Keep the shared application shell module-neutral.
- Preserve keyboard, touch, safe-area, dark-mode, offline, and `/HealthTracker/` deployment behavior.
- Do not change health-data validation, persistence, or translations.

## Verification

- Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`.
- Manually inspect entry and profile headers at narrow mobile widths in English, Spanish, German, and French.

## Acceptance criteria

- The complete Cancel and Save labels remain visible in entry and profile headers at narrow mobile widths.
- Long centered titles wrap instead of forcing either action outside the viewport.
- Existing dashboard and settings headers remain unchanged.
