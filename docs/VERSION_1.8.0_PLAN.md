# Proposed v1.8.0 scope

## Scope

- Refine the Weight dashboard with a current-weight/chart hero, compact period control, quieter summary, expandable BMI context, and separated history rows.
- Preserve the blue/white header identity, all four languages, mobile and dark-mode support.
- Keep recorded values, calculations, ranges, averages, BMI zones, editing, storage, backup formats, and offline deployment unchanged.
- Keep implementation inside the Weight module; no release metadata changes until release preparation.
- UX review: remove unused tooltip spacing, improve phone axis-label readability, retain a visible BMI disclaimer with a concise localized details disclosure, and provide 44px touch targets for chart switches.
- Final polish: tighten header-to-hero and hero-to-chart spacing, slightly reduce hero type, shorten BMI zone switch labels in all languages, reduce segmented-control padding while retaining 44px targets, and quiet chart dates/count metadata without changing chart interactions.

## Verification and acceptance

- Run npm test, npm run lint, npm run build, and git diff --check.
- Check range synchronization, newest-weight hero, single/empty chart states, BMI context, and history notes/future flags with focused component tests.
- Manually review 320px/mobile/desktop layouts in all languages and themes, chart pointer/touch/keyboard selection, edit/delete flows, and production offline/install behavior following docs/TESTING.md.
- Accept when the flow remains current weight/chart → summary → history, values are prominent, controls remain accessible, and rows no longer resemble input cards.

## UX review evidence

- Reviewed rendered Edge layouts with irregular demo measurements at 320px, 390px, and 1024px in English, Spanish, German, and French, in light and dark themes (24 combinations). No horizontal overflow, clipped axis labels, or chart switches below 44px height were detected.
- Verified keyboard Home/End, pointer selection, touch-emulated endpoint selection, recorded/average mode, BMI zones and disclosure, synchronized chart/history counts for all three spans, and entry edit/cancel preserving the full store. Selected tooltip remains below endpoint date labels.
- The Weight screen has stronger hierarchy and quieter framing. The requested summary recap still repeats hero information, and optional BMI context remains a comparatively tall section on phones; these are remaining design tradeoffs.
- Browser checks use an isolated test profile and synthetic demo data. Physical-device touch feel and PWA install/offline regression remain manual acceptance checks before release.
