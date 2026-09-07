# Changelog

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
