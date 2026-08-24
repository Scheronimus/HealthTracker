# Architecture

Health Tracker is a client-only React 19 application built with Vite. `App.jsx` coordinates feature components; UI, persistence, schema, migration, transfer, date, and download concerns live in separate modules. There is no router or network data layer.

## Data model

The current persisted root is `{ schemaVersion: 6, measurements: Measurement[], profile: Profile }`. Every older migration path remains sequential; v4-to-v5 removes the legacy morning/evening label without changing readings, and v5-to-v6 adds default module preferences. Measurements are a discriminated union: existing Weight records are unchanged, while blood-pressure records contain `id`, `type: "bloodPressure"`, exact `timestamp`, `systolicMmHg`, `diastolicMmHg`, and `pulseBpm`.

Version 1 stores are migrated with an empty profile; version 2 profiles gain the disabled graph-range preference; version 3 then migrates unchanged to version 4. Existing Weight records keep numeric kilograms, ISO timestamps, and notes up to 1,000 characters. IDs use `crypto.randomUUID()` where available.

`src/data/schema.js` owns validation and constants, `migrations.js` performs sequential migrations and validates the result, `storage.js` isolates browser persistence, and `transfer.js` owns versioned backup, safe merge restore, and CSV generation. New measurement types should add type-specific validation, presentation, and export rules without changing the root model.

## Persistence and restore

Mixed Weight and blood-pressure stores are validated and included in JSON backup/restore. Duplicate IDs and blood-pressure readings beyond the two-per-local-date limit are rejected or preserved locally during merge. New, edited, and CSV-imported readings on the same date must be at least two hours apart; migration does not discard older data. CSV export remains Weight-only, while CSV import recognizes Weight and Blood Pressure row shapes.

The complete store is serialized under `health-tracker-data`; the language uses `health-tracker-language`. Invalid local data fails closed to an empty store. JSON backup envelopes contain a kind, format version, export timestamp, and full versioned store. Restore validates first, requests explicit confirmation, then adds records whose IDs are new. Matching IDs preserve the local record.


## Optional profile and BMI

The validated profile stores optional `name`, `age`, and `heightCm` values, BMI preferences, and a non-empty ordered list of visible modules. The first module is the startup page and the list order controls the banner selector. Profile editing has its own Settings sub-screen; the zone switch appears in the graph only while current BMI is enabled. Disabling BMI also disables the graph zones. When enabled and height plus a current weight are available, `src/utils/bmi.js` calculates BMI as kilograms divided by squared height in metres. The BMI status uses WHO adult thresholds and is presented as a screening estimate, not a diagnosis. Ages under 18 receive no adult classification; ages 65 and over receive an interpretation caution. BMI is derived display data and is never stored as a measurement. When enabled, the graph converts all six WHO adult BMI categories into kilogram boundaries using profile height. It clips those colored background zones to the existing measurement-derived vertical scale, so enabling them never expands or otherwise changes the graph scale. A complete legend remains visible even when some zones fall outside the displayed weights. Profile data remains local and is included in full JSON backups.

Restore imports a backed-up profile only when the local profile is still empty. An existing local profile always wins, preventing silent overwrite. CSV is not a complete recovery format.

## Offline and deployment

## Blood-pressure module

`src/features.js` defines the top-level module catalog while `App.jsx` renders it as a selector in the application banner; this remains compact as more modules are added. Weight remains the default. Blood-pressure calculations, chart geometry, forms, dashboard, and week presentation live in isolated modules. Every Weight consumer receives an explicitly filtered Weight array.

Seven-day measurement periods are derived with DST-safe local-calendar arithmetic and anchored to the earliest reading, so a person can begin on any weekday. Periods, averages, and coverage are never stored. Values average every available reading directly with full internal precision; there is no completeness requirement or medical interpretation.

The dependency-free chart has separate pressure lines, distinct first/second-reading marker shapes in individual mode, pointer/touch nearest-reading selection, and Left/Right/Home/End navigation. Pulse remains in tooltips and averages rather than becoming a third line.

`deployment.config.mjs` is the deployment identity source. Vite uses `/HealthTracker/`; `vite-plugin-pwa` generates a manifest and auto-updating service worker that precaches the application shell. GitHub Actions tests, lints, builds, and deploys `main` to Pages.

## Weight graph

The dependency-free SVG chart filters measurements through src/utils/chart.js, plots timestamps on a proportional time axis, and derives a padded kilogram scale from visible values. The default span is three months; one-year and all-time ranges are available without changing persisted data. The SVG chart scales to 100% of its container with no minimum width or internal horizontal scrolling, so it remains fully visible on narrow phones. The chart renders the exact trend without point markers. Pointer and touch movement snap a vertical crosshair to the nearest measurement; the same data is navigable by keyboard with Left/Right and Home/End.

## Screen flow

The dashboard is the default screen and presents the weight graph first, followed by summaries and the complete editable history. Top-right settings and add controls open dedicated settings and entry screens. Selecting any history row opens that record on the shared entry screen. Its top bar owns Cancel and Save; existing records also expose confirmed deletion inside the edit screen. Save submits the associated form and returns to the dashboard.

## Dashboard summaries

The graph span is dashboard-level state shared by the chart and summary. Current weight always uses the newest measurement; Change compares the newest and oldest measurements visible in the selected 3-month, 1-year, or all-time range and displays the localized date of that oldest comparison measurement. The previous-entry summary is intentionally omitted.

## Date-only weight policy

Weight entry and presentation are date-only. New records convert the chosen local date to local noon for the existing timestamp-based schema, avoiding common midnight timezone shifts while retaining extensibility for future measurement types. The entry form prevents a second weight on the same local calendar date and excludes the current record during editing. Existing persisted timestamps remain valid, but hours are not shown in weight UI.

## External CSV import

The importer detects rows by column count and parses quoted CSV cells. Weight rows require `DD/MM/YY,weight`, accept comma or point decimals, and skip explicit missing markers such as NN. Blood Pressure rows require `DD/MM/YY,HH:MM:SS,systolic,diastolic,pulse`. Dates may also use four-digit years; two-digit years mean 20xx. Invalid rows fail the complete import with their line number. Weight merge is date-based, so existing local dates win. Blood Pressure merge is chronological and skips readings that conflict with the two-per-date or two-hour rules.
