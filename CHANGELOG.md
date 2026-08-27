# Changelog

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
