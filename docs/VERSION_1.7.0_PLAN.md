# Version 1.7.0 plan

## Intended scope

- Add an optional Weight chart average view averaging the current measurement and four preceding measurements in chronological order.
- Default off; retain the choice in module dashboard state for the current session, without changing the persisted schema.
- Calculate from full history before filtering the display range. Require five measurements for each average; do not fabricate measurements across gaps.
- Switch between the recorded graph and the average graph, showing only one line and its matching shaded area. Keep history and summaries based on recorded values. Distinguish the average view with a dashed line and localized toggle label; expose its value through existing pointer, touch, and keyboard selection.
- Provide equivalent English, Spanish, German, and French text. Preserve offline behavior, mobile layout, dark mode, and `/HealthTracker/`.

## Verification and acceptance

- Test the agreed nine-reading sample, chronological ordering, sparse history, incomplete windows, and range-independent averages.
- Test average view rendering, default-off behavior, single average, and dashboard range integration.
- Run npm test, npm run lint, npm run build, and git diff --check.
- Manually review narrow layouts, all languages, light/dark appearance with and without BMI zones, pointer/touch/keyboard selection, range changes, editing/deleting/backfilling, and offline use.
- No medical interpretation or persisted measurement changes. Release scope is frozen on `release/1.7.0`; version metadata, changelog, and all four localized in-app release notices describe this scope.

## Implementation status

- Implemented on `feature/weight-moving-average` with calculation, rendering, range-integration, registry-default, and translation-parity coverage.
- Automated verification: all 174 tests pass; lint, production PWA build, and whitespace checks pass.
- Production preview checked in isolated headless Edge at 320 px: all four languages in light/dark mode with BMI zones, mutually exclusive graph lines, no horizontal overflow, no removed explanation, keyboard End selection showing the expected 81.96 kg average, and offline reload with an active service worker. Physical-device touch/installation and the remaining manual checklist are pending in `docs/TESTING.md`.

## Release preparation

- Scope frozen on 2026-10-03: optional five-measurement Weight average mode, one displayed line with matching shading, no long explanatory caption.
- Version and lockfile updated to 1.7.0. Changelog and localized in-app notes describe the shipped feature, session-only switch, and unchanged schema.
- User reviewed the graph and accepted the single-line presentation. Remaining device/PWA regression checks are listed in `docs/TESTING.md`.
- Keep this plan until release finalization. Commits, integration into develop, and merge/publication require user authorization.
