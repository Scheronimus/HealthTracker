# Version 1.7.1 hotfix plan

- Place Weight BMI-zone and Average switches side by side above the time-span selector.
- Shorten the average switch label to Average in all four languages.
- Keep the time-span selector directly above the graph on mobile and desktop.
- Preserve calculations, session state, recorded data, keyboard/touch behavior, dark mode, offline behavior, and deployment base.
- Verify narrow layouts in all languages, with and without BMI controls; run npm test, npm run lint, npm run build, and git diff --check.
- Release metadata and localized release notes will be prepared on release/1.7.1 after review. Do not commit or publish without user approval.

Scope frozen on 2026-10-03. User approved commit and release. Browser layout checks passed at 320, 390, and 900 px in all four languages with BMI controls enabled and disabled (24 cases).
