# Proposed v1.8.0 scope

## Scope

- Refine the Weight dashboard with a current-weight/chart hero, compact period control, quieter summary, expandable BMI context, and separated history rows.
- Preserve the blue/white header identity, all four languages, mobile and dark-mode support.
- Keep recorded values, calculations, ranges, averages, BMI zones, editing, storage, backup formats, and offline deployment unchanged.
- Keep implementation inside the Weight module; no release metadata changes until release preparation.
- UX review: remove unused tooltip spacing, improve phone axis-label readability, retain BMI context through an accessible info disclosure, and provide 44px touch targets for chart switches.
- Final polish: tighten header-to-hero and hero-to-chart spacing, slightly reduce hero type, shorten BMI zone switch labels in all languages, reduce segmented-control padding while retaining 44px targets, and quiet chart dates/count metadata without changing chart interactions.
- Hierarchy refinement: the hero always compares recorded measurements within the last three months, independently of chart selection. Insights contain selected-chart-period evolution and optional BMI, without a repeated current-weight value. Group chart controls and plot on a subtle blue-gray surface (slightly lighter than the dark page); keep hero, insights, and history open.
- Insight simplification: evolution shows only change and the actual reference measurement's localized “Since” date. BMI shows only its number with a subtle existing-zone-color badge and info control; classification, range, height/age interpretation, and the existing medical disclaimer move into a keyboard/touch-accessible popover. Chart-zone visibility never changes the badge color.
- Hero-only polish: center label, value/unit, and fixed-three-month change; slightly strengthen numeric type and breathing room while keeping the page background open. Share History's down/up color declarations for the change and arrow, including its existing down color for zero; keep period metadata neutral.

## Verification and acceptance

- Run npm test, npm run lint, npm run build, and git diff --check.
- Check range synchronization, newest-weight hero, single/empty chart states, BMI context, and history notes/future flags with focused component tests.
- Manually review 320px/mobile/desktop layouts in all languages and themes, chart pointer/touch/keyboard selection, edit/delete flows, and production offline/install behavior following docs/TESTING.md.
- Accept when the flow remains current weight/chart → summary → history, values are prominent, controls remain accessible, and rows no longer resemble input cards.

## UX review evidence

- Reviewed rendered Edge layouts with irregular demo measurements at 320px, 390px, and 1024px in English, Spanish, German, and French, in light and dark themes (24 combinations). No horizontal overflow, clipped axis labels, or chart switches below 44px height were detected.
- Verified keyboard Home/End, pointer selection, touch-emulated endpoint selection, recorded/average mode, BMI zones and disclosure, synchronized chart/history counts for all three spans, and entry edit/cancel preserving the full store. Selected tooltip remains below endpoint date labels.
- The latest hierarchy refinement removes the repeated current-weight insight and presents evolution/BMI side by side; the hero reference period remains fixed and is not configurable.
- Browser checks use an isolated test profile and synthetic demo data. Physical-device touch feel and PWA install/offline regression remain manual acceptance checks before release.
