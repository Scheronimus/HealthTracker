# Changelog

## 1.8.0 - 2026-10-03

### Changed

- Refined the mobile Weight screen with a centered current-weight hero, compact period selector, a subtle chart surface, quieter typography, and clean history rows with notes and weight changes.
- Kept the hero change fixed to the last three months, independently of the chart period. The complementary insight below the chart follows the selected period and shows the actual reference measurement date.
- Removed the duplicated current-weight statistic. BMI now uses a subtle badge matching the existing chart-zone color and an accessible info popover for classification, range, interpretation, and the medical disclaimer.
- Preserved light/dark appearance, responsive layouts, keyboard/pointer/touch chart interactions, and equivalent English, Spanish, German, and French interfaces.

### Added

- Added a single automated release gate covering unit tests, lint, production builds, Chromium/Firefox/WebKit workflows, accessibility, backup/restore safety, migrations, persistence, and real service-worker offline editing.
- Added reviewed Windows/Chromium visual baselines for all languages and themes, narrow/mobile/desktop layouts, empty states, chart tooltips, and BMI popovers. CI retains failure evidence and gates Pages deployment.

### Fixed

- Kept the chart keyboard slider accessible to assistive technology, prevented narrow localized header actions from being obscured, and improved Settings privacy text contrast.
- Preserved absent optional age and height as null when saving a profile, rather than converting them to zero.

### Data compatibility

- Recorded measurements, BMI thresholds, five-measurement averages, backup formats, and persisted schema version 6 are unchanged; no migration is required.
- All health data remains local to the browser. Offline behavior and the `/HealthTracker/` deployment base are preserved.

## 1.7.1 - 2026-10-03

### Fixed

- Placed the Weight BMI-zone and Average switches side by side, with a short localized Average label in all four languages.
- Kept the time-span selector directly above the graph on mobile and desktop.

### Data compatibility

- Measurements, five-measurement average calculations, and persisted schema version 6 are unchanged; no migration is required.

## 1.7.0 - 2026-10-03

### Added

- Added an optional Weight graph mode showing the average of each measurement and the previous four in chronological order. Averages begin at the fifth measurement and use full history before filtering, so overlapping dates retain the same average across graph ranges.
- Added a localized switch between recorded weights and the dashed average line, showing one line and its matching shaded area at a time. A single available average appears as a point; ranges without an average show an availability message.
- Included the corresponding average in existing pointer, touch, and keyboard selected-reading details.
- Added English, Spanish, German, and French labels and an updated in-app “What’s new” notice.

### Data compatibility

- The persisted health-data schema remains at version 6; no migration is required. Recorded measurements, history, and weight summaries are unchanged.
- The graph switch defaults off and lasts only for the current session; it is not included in backups.
- The average uses five measurements regardless of their spacing and does not create measurements for missing days. Offline behavior and `/HealthTracker/` deployment are preserved.

## 1.6.0 - 2026-09-11

### Added

- Added calm, non-blocking dashboard reminders to create the existing complete JSON backup after the first few measurements and when changed data has gone beyond its reminder interval.
- Added direct Download backup and three-day deferral actions to reminder cards, plus a short confirmation that accurately reports only that the browser download started.
- Added an Advanced backup settings screen with locally recorded backup status and 7-, 14-, or 30-day reminder intervals; 14 days is the default.
- Added development-only previews for every reminder presentation state without changing real health data or backup status.

### Changed

- Kept the primary Data screen focused on complete backup download and safe merge restore, with reminder details placed behind the advanced settings row.
- Added singular and plural change summaries in English, Spanish, German, and French.

### Data compatibility

- The persisted health-data schema remains at version 6; no migration is required.
- Reminder timing, change revisions, snooze state, and the recorded download date are stored separately under `health-tracker-backup-reminder` and are not included in health-data backups.
- A recorded backup date means only that Health Tracker initiated the browser download; it does not verify where the file was saved or whether it remains recoverable.

## 1.5.1 - 2026-09-10

### Fixed

- Kept complete Cancel and Save labels visible in narrow entry and profile headers across English, Spanish, German, and French, allowing long centered titles to wrap without displacing either action.
- Kept the localized “What’s new” notice on the dashboard instead of carrying it into measurement entry screens.

### Data compatibility

- The persisted health-data schema remains at version 6; no migration is required.

## 1.5.0 - 2026-09-09

### Added

- Added a localized native share button below the existing Settings QR code, with clipboard and visible-link fallbacks where the Web Share API is unavailable.

### Data compatibility

- Sharing includes only the public app name, description, and production URL; locally stored health data and profile details are never included.
- The persisted health-data schema remains at version 6; no migration is required.

## 1.4.0 - 2026-09-09

- Reworked Options around a clearly named Data section with complete backup and safe merge restore as the primary recovery workflow.
- Removed incomplete CSV import/export controls from the production interface while retaining the underlying tested utilities for a future product decision.
- Reviewed interface wording across English, Spanish, German, and French and added automated translation-key and placeholder parity checks.
- Added a localized, dismissible “What’s new” notice that appears once for each app version and remains available offline.

## 1.3.0 - 2026-09-07

### Added

- A locally saved appearance preference with system, light, and dark choices in English, Spanish, German, and French.
- The latest recorded Weight as a muted, accessible empty-field hint when adding the next measurement.

### Changed

- Prevented future Weight dates and future Blood Pressure timestamps in manual entry and CSV import, and skipped future measurements during backup restore without removing existing local data.
- Marked existing future-dated records in red while keeping them available for editing and deletion.
- Filtered the raw Weight history, count, empty state, and row changes to the selected graph range.
- Revised dark-mode surfaces, controls, contrast, chart presentation, and BMI colors while preserving the Weight graph's area shading.

### Data compatibility

- The persisted health-data schema remains at version 6; no migration is required.
- The appearance preference is stored separately and is not included in health-data backups.

## 1.2.0 - 2026-08-28

### Added

- A discreet, expandable sharing section in Settings with a production-app QR code and direct link, available in English, Spanish, German, and French.

### Data compatibility

- The persisted data schema remains at version 6; no migration is required.

## 1.1.0 - 2026-08-25

### Added

- Blood Pressure tracking with exact local timestamps, systolic and diastolic pressure, pulse, period summaries, a compact diary, charts, and demo data.
- Blood Pressure CSV import using `DD/MM/YY,HH:MM:SS,systolic,diastolic,pulse` rows.
- User-configurable module visibility and ordering, with the first enabled module used as the start page.

### Changed

- Reorganized Weight and Blood Pressure into independent feature modules with catalog-driven data and UI contracts.
- Replaced fixed module navigation with a selector in the application banner.
- Made Blood Pressure periods independent of morning/evening labels: a date supports up to two readings separated by at least two hours.
- Kept Blood Pressure summaries factual and removed medical threshold interpretation when the measurement protocol cannot be certified.
- Improved dense-reading chart interaction and removed oversized highlighted points.

### Data compatibility

- Existing local data is migrated sequentially to schema version 6.
- JSON backup and restore includes both modules and module preferences.
- CSV export remains Weight-only; CSV import accepts Weight and Blood Pressure formats.

## 1.0.0 - 2026-08-23

### Added

- Private, client-only Weight tracking with date-only entry, optional notes, newest-first history, editing, and confirmed deletion.
- A responsive interactive weight graph with 3-month, 1-year, and all-time ranges, adaptive axes, touch/pointer crosshair selection, and keyboard navigation.
- Optional local profile details, BMI screening context, and height-specific WHO adult BMI color zones.
- English, Spanish, German, and French interfaces with a locally persisted language preference.
- Versioned local storage, validated JSON backup and non-overwriting restore, plus Weight CSV import and export.
- An installable offline PWA, GitHub Pages deployment workflow, production QR asset, and mobile development launcher.

### Data compatibility

- The initial release stored Weight measurements and optional profile data using schema version 3, with sequential migrations from earlier development schemas.
