# Health Tracker v1.5.1 plan

## Scope

- Fix issue #1 so entry-screen header actions remain fully visible on narrow screens in every supported language.
- Allow long entry titles to wrap in the flexible center column without shrinking or clipping Cancel and Save.
- Keep the shared entry header pinned while Weight and Blood Pressure forms scroll, accounting for its translated dynamic height in the form offset.
- Keep the release notice on the dashboard instead of carrying it into entry screens.

## Constraints

- Keep the shared application shell module-neutral.
- Preserve keyboard, touch, safe-area, dark-mode, offline, and `/HealthTracker/` deployment behavior.
- Do not change health-data validation, persistence, or translations.

## Verification

- Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`.
- Manually inspect entry and profile headers at narrow mobile widths in English, Spanish, German, and French.
- Scroll each entry form and confirm its complete header remains pinned without covering the form.

## Acceptance criteria

- The complete Cancel and Save labels remain visible in entry and profile headers at narrow mobile widths.
- Long centered titles wrap instead of forcing either action outside the viewport.
- Existing dashboard and settings headers remain unchanged.
- Weight and Blood Pressure entry headers remain visible while their forms scroll, including when a translated title wraps.
