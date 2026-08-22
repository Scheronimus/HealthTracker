# Architecture

Health Tracker is a client-only React 19 application built with Vite. `App.jsx` coordinates feature components; UI, persistence, schema, migration, transfer, date, and download concerns live in separate modules. There is no router or network data layer.

## Data model

The persisted root is `{ schemaVersion: 3, measurements: Measurement[], profile: Profile }`. Version 1 stores are migrated automatically with an empty profile; version 2 profiles are migrated with the graph range disabled. A measurement is `{ id, type, value, unit, timestamp, note }`. Version 1 supports `type: "weight"`, numeric values in `unit: "kg"`, ISO timestamps, and notes up to 1,000 characters. IDs use `crypto.randomUUID()` where available.

`src/data/schema.js` owns validation and constants, `migrations.js` performs sequential migrations and validates the result, `storage.js` isolates browser persistence, and `transfer.js` owns versioned backup, safe merge restore, and CSV generation. New measurement types should add type-specific validation, presentation, and export rules without changing the root model.

## Persistence and restore

The complete store is serialized under `health-tracker-data`; the language uses `health-tracker-language`. Invalid local data fails closed to an empty store. JSON backup envelopes contain a kind, format version, export timestamp, and full versioned store. Restore validates first, requests explicit confirmation, then adds records whose IDs are new. Matching IDs preserve the local record.


## Optional profile and BMI

The validated profile stores optional `name`, `age`, and `heightCm` values plus an explicit `showBmi` preference and the persisted graph-level `showBmiRange` state. Profile editing has its own Settings sub-screen; the zone switch appears in the graph only while current BMI is enabled. Disabling BMI also disables the graph zones. When enabled and height plus a current weight are available, `src/utils/bmi.js` calculates BMI as kilograms divided by squared height in metres. The BMI status uses WHO adult thresholds and is presented as a screening estimate, not a diagnosis. Ages under 18 receive no adult classification; ages 65 and over receive an interpretation caution. BMI is derived display data and is never stored as a measurement. When enabled, the graph converts all six WHO adult BMI categories into kilogram boundaries using profile height. It clips those colored background zones to the existing measurement-derived vertical scale, so enabling them never expands or otherwise changes the graph scale. A complete legend remains visible even when some zones fall outside the displayed weights. Profile data remains local and is included in full JSON backups.

Restore imports a backed-up profile only when the local profile is still empty. An existing local profile always wins, preventing silent overwrite. CSV remains weight-only.

## Offline and deployment

`deployment.config.mjs` is the deployment identity source. Vite uses `/HealthTracker/`; `vite-plugin-pwa` generates a manifest and auto-updating service worker that precaches the application shell. GitHub Actions tests, lints, builds, and deploys `main` to Pages.

## Weight graph

The dependency-free SVG chart filters measurements through src/utils/chart.js, plots timestamps on a proportional time axis, and derives a padded kilogram scale from visible values. The default span is three months; one-year and all-time ranges are available without changing persisted data. The SVG chart scales to 100% of its container with no minimum width or internal horizontal scrolling, so it remains fully visible on narrow phones. The chart renders the exact trend without point markers. Pointer and touch movement snap a vertical crosshair to the nearest measurement; the same data is navigable by keyboard with Left/Right and Home/End.

## Screen flow

The dashboard is the default screen and presents the weight graph first, followed by summaries and the complete editable history. Top-right settings and add controls open dedicated settings and entry screens. Selecting any history row opens that record on the shared entry screen. Its top bar owns Cancel and Save; existing records also expose confirmed deletion inside the edit screen. Save submits the associated form and returns to the dashboard.

## Dashboard summaries

The graph span is dashboard-level state shared by the chart and summary. Current weight always uses the newest measurement; Change compares the newest and oldest measurements visible in the selected 3-month, 1-year, or all-time range and displays the localized date of that oldest comparison measurement. The previous-entry summary is intentionally omitted.

## Date-only weight policy

Weight entry and presentation are date-only. New records convert the chosen local date to local noon for the existing timestamp-based schema, avoiding common midnight timezone shifts while retaining extensibility for future measurement types. The entry form prevents a second weight on the same local calendar date and excludes the current record during editing. Existing persisted timestamps remain valid, but hours are not shown in weight UI.

## External weight CSV import

The importer parses quoted CSV cells, requires DD/MM/YY or DD/MM/YYYY dates, interprets two-digit years as 20xx, accepts comma or point decimals, and skips explicit missing markers such as NN. Invalid non-missing rows fail the complete import with their line number. Merge is date-based: existing local weight dates and earlier rows in the same file win, so import never silently overwrites a daily weight.
