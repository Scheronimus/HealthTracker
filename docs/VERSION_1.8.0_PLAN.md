# v1.8.0 release scope — frozen 2026-10-03

## Scope

- Refine the Weight dashboard with a current-weight/chart hero, compact period control, quieter summary, expandable BMI context, and separated history rows.
- Preserve the blue/white header identity, all four languages, mobile and dark-mode support.
- Keep recorded values, calculations, ranges, averages, BMI zones, editing, storage, backup formats, and offline deployment unchanged.
- Keep Weight implementation inside its module; update version metadata and localized release notes during release preparation. Shared accessibility and profile fixes are limited to defects exposed by release automation.
- UX review: remove unused tooltip spacing, improve phone axis-label readability, retain BMI context through an accessible info disclosure, and provide 44px touch targets for chart switches.
- Final polish: tighten header-to-hero and hero-to-chart spacing, slightly reduce hero type, shorten BMI zone switch labels in all languages, reduce segmented-control padding while retaining 44px targets, and quiet chart dates/count metadata without changing chart interactions.
- Hierarchy refinement: the hero always compares recorded measurements within the last three months, independently of chart selection. Insights contain selected-chart-period evolution and optional BMI, without a repeated current-weight value. Group chart controls and plot on a subtle blue-gray surface (slightly lighter than the dark page); keep hero, insights, and history open.
- Insight simplification: evolution shows only change and the actual reference measurement's localized “Since” date. BMI shows only its number with a subtle existing-zone-color badge and info control; classification, range, height/age interpretation, and the existing medical disclaimer move into a keyboard/touch-accessible popover. Chart-zone visibility never changes the badge color.
- Hero-only polish: center label, value/unit, and fixed-three-month change; slightly strengthen numeric type and breathing room while keeping the page background open. Share History's down/up color declarations for the change and arrow, including its existing down color for zero; keep period metadata neutral.

## Verification and acceptance

- Add Playwright release automation against the production build with isolated storage, a fixed clock, deterministic fixtures, and Chromium/Firefox/WebKit projects.
- Automate Weight entry/edit/delete/validation, hero/insight/history synchronization, chart and BMI interactions, backup/restore safety, production offline behavior, accessibility scans, and controlled Chromium visual baselines.
- Run browser checks in CI for pull requests and release branches and gate deployment on them; retain failure traces, screenshots, and HTML reports. Use Windows as the canonical screenshot environment to match locally reviewable baselines.
- Keep device-only acceptance limited to native mobile keyboard/touch feel and actual installation; no product or persisted-schema changes are part of this test work.
- Fix accessibility defects demonstrated by the new scans: expose the interactive Weight SVG as a labeled group rather than an atomic image so its keyboard slider remains available to assistive technology.
- Correct other defects exposed by release tests: keep narrow localized header actions unobscured, improve Settings privacy text contrast, and preserve absent optional profile numbers as null rather than coercing them to zero during Save.

- Run npm test, npm run lint, npm run build, and git diff --check.
- Check range synchronization, newest-weight hero, single/empty chart states, BMI context, and history notes/future flags with focused component tests.
- Review canonical visual baselines at narrow/mobile/desktop widths in all languages and themes. Automate chart pointer/touch/keyboard selection, edit/delete flows, and production offline behavior following docs/TESTING.md; retain only the small physical-device smoke test.
- Accept when the flow remains current weight/chart → summary → history, values are prominent, controls remain accessible, and rows no longer resemble input cards.

## UX review evidence

- Release preparation: package metadata and all four localized notices identify v1.8.0. Changelog covers the complete shipped scope, and release-notice browser tests cover accessibility, dashboard-only display, persistent dismissal, and unchanged health data. Final local gate passed 180 unit tests and 165 browser/visual checks; refreshed baselines retain the approved layout. Initial develop CI passed. Physical-device installation/keyboard/touch smoke testing remains unverified.

- Release automation verified locally on Windows: 180 unit tests and 120 browser checks passed (34 scenarios in each of Chromium, Firefox, and WebKit, plus 18 Chromium screenshot comparisons). Lint, production build, and whitespace checks passed. Reviewed all 18 visual baselines; CI configuration awaits its first pushed run.

- Reviewed rendered Edge layouts with irregular demo measurements at 320px, 390px, and 1024px in English, Spanish, German, and French, in light and dark themes (24 combinations). No horizontal overflow, clipped axis labels, or chart switches below 44px height were detected.
- Verified keyboard Home/End, pointer selection, touch-emulated endpoint selection, recorded/average mode, BMI zones and disclosure, synchronized chart/history counts for all three spans, and entry edit/cancel preserving the full store. Selected tooltip remains below endpoint date labels.
- The latest hierarchy refinement removes the repeated current-weight insight and presents evolution/BMI side by side; the hero reference period remains fixed and is not configurable.
- Browser checks use an isolated test profile and synthetic demo data. Production offline reload/edit/reconnect is automated with a stoppable origin; physical-device touch feel, actual PWA installation, and installed service-worker upgrades remain device acceptance checks before release.
