# Architecture

Health Tracker is a client-only React 19 application built with Vite. `App.jsx` coordinates feature components; UI, persistence, schema, migration, transfer, date, and download concerns live in separate modules. There is no router or network data layer.

## Data model

The current persisted root is `{ schemaVersion: 6, measurements: Measurement[], profile: Profile }`. Every older migration path remains sequential; v4-to-v5 removes the legacy morning/evening label without changing readings, and v5-to-v6 adds default module preferences. Measurements are a discriminated union: existing Weight records are unchanged, while blood-pressure records contain `id`, `type: "bloodPressure"`, exact `timestamp`, `systolicMmHg`, `diastolicMmHg`, and `pulseBpm`.

Version 1 stores are migrated with an empty profile; version 2 profiles gain the disabled graph-range preference; version 3 then migrates unchanged to version 4. Existing Weight records keep numeric kilograms, ISO timestamps, and notes up to 1,000 characters. IDs use `crypto.randomUUID()` where available.

`src/data/schema.js` owns the shared store envelope and delegates measurement validation to the module catalog. `migrations.js` performs sequential migrations, `storage.js` isolates browser persistence, and `transfer.js` owns versioned backup and dispatches CSV operations through module capabilities. New measurement types implement their own model and transfer rules without adding type branches to the application shell.

## Persistence and restore

Mixed Weight and blood-pressure stores are validated and included in JSON backup/restore. Store validation rejects duplicate IDs and invalid blood-pressure collections. During restore, existing IDs remain local and imported blood-pressure readings that conflict with the two-per-date rule are skipped. New, edited, and CSV-imported readings on the same date must be at least two hours apart; migration does not discard older data. CSV export remains Weight-only, while CSV import recognizes Weight and Blood Pressure row shapes.

The complete store is serialized under `health-tracker-data`; the language uses `health-tracker-language`. Invalid local data fails closed to an empty store. JSON backup envelopes contain a kind, format version, export timestamp, and full versioned store. Restore validates first, requests explicit confirmation, then adds records whose IDs are new. Matching IDs preserve the local record.


## Optional profile and BMI

The validated profile stores optional shared personal values, module preferences, and a non-empty ordered list of visible modules. The first module is the startup page and the list order controls the banner selector. Module-specific profile controls are contributed by the module registry: height and BMI controls belong to Weight and are hidden when Weight is disabled, while their stored values remain intact. When enabled and height plus a current weight are available, `src/modules/weight/bmi.js` calculates BMI as kilograms divided by squared height in metres. The BMI status uses WHO adult thresholds and is presented as a screening estimate, not a diagnosis. Ages under 18 receive no adult classification; ages 65 and over receive an interpretation caution. BMI is derived display data and is never stored as a measurement. Profile data remains local and is included in full JSON backups.

Restore imports a backed-up profile only when the local profile is still empty. An existing local profile always wins, preventing silent overwrite. CSV is not a complete recovery format.

## Module system

`src/modules/catalog.js` is the authoritative data-side module catalog: identifiers, measurement types, validators, collection constraints, and CSV capabilities live there. `src/modules/registry.jsx` enriches those definitions with each module’s Dashboard, Entry Form, optional Profile Settings, labels, and initial UI state. A contract test requires every catalog entry to provide a complete implementation.

`App.jsx` is only the application shell. It selects the active definition, filters records by its declared measurement type, and renders the registered Dashboard or Entry Form. It contains no Weight/Blood Pressure rendering branches or module-specific state. Each module owns its components, model, calculations, demo generator, transfer behavior, and tests under `src/modules/<module>/`; modules may depend on shared `src/data` and `src/utils` services but do not import one another.

### Adding a module

1. Create `src/modules/<module>/` with its model, Dashboard, Entry Form, and tests.
2. Add one catalog entry declaring its ID, label, measurement type, validator, collection constraints, and optional CSV capabilities.
3. Export its UI contract from the module `index.jsx` and connect that implementation in `registry.jsx`.
4. Add localized labels and, if needed, optional Profile Settings and demo measurements.

No rendering, entry, delete, import, or module-state branch should be added to `App.jsx`. The registry contract test fails when a catalog module lacks its required UI or data capabilities.

## Blood-pressure module

Seven-day measurement periods are derived with DST-safe local-calendar arithmetic and anchored to the earliest reading, so a person can begin on any weekday. Periods, averages, and coverage are never stored. Values average every available reading directly with full internal precision; there is no completeness requirement or medical interpretation.

The dependency-free chart has separate pressure lines, distinct first/second-reading marker shapes in individual mode, pointer/touch nearest-reading selection, and Left/Right/Home/End navigation. Pulse remains in tooltips and averages rather than becoming a third line.

## Weight graph

The dependency-free SVG chart filters measurements through `src/modules/weight/chart.js`, plots timestamps on a proportional time axis, and derives a padded kilogram scale from visible values. The default span is three months; one-year and all-time ranges are available without changing persisted data. The SVG chart scales to 100% of its container with no minimum width or internal horizontal scrolling, so it remains fully visible on narrow phones. The chart renders the exact trend without point markers. Pointer and touch movement snap a vertical crosshair to the nearest measurement; the same data is navigable by keyboard with Left/Right and Home/End.

## Screen flow

The dashboard is the default screen and opens the first module in the profile's ordered visible-module list. The banner selector changes modules without a router. Each module controls its own dashboard layout; Weight presents its graph first, while Blood Pressure opens its Overview tab. Top-right settings and module-specific add controls open dedicated settings and entry screens. Selecting an editable record opens it in the active module's form within the shared entry-screen shell. Its top bar owns Cancel and Save; existing records also expose confirmed deletion inside the edit screen. Save submits the form and returns to the active dashboard.

## Dashboard summaries

The graph span is dashboard-level state shared by the chart and summary. Current weight always uses the newest measurement; Change compares the newest and oldest measurements visible in the selected 3-month, 1-year, or all-time range and displays the localized date of that oldest comparison measurement. The previous-entry summary is intentionally omitted.

## Date-only weight policy

Weight entry and presentation are date-only. New records convert the chosen local date to local noon for the existing timestamp-based schema, avoiding common midnight timezone shifts while retaining extensibility for future measurement types. The entry form prevents a second weight on the same local calendar date and excludes the current record during editing. Existing persisted timestamps remain valid, but hours are not shown in weight UI.

On a new Weight entry, the newest recorded weight is presented as a muted placeholder and accessible hint. It remains an empty required field and is never submitted as the new value. Edit forms continue to use the stored measurement as the actual field value.

New and imported Weight measurements cannot use a local calendar date after today. Blood Pressure compares its exact timestamp and also rejects a time later today. Restore skips future imported measurements without removing existing local records. Existing future records are marked in red and remain available for editing or deletion.

## External CSV import

The importer detects rows by column count and parses quoted CSV cells. Weight rows require `DD/MM/YY,weight`, accept comma or point decimals, and skip explicit missing markers such as NN. Blood Pressure rows require `DD/MM/YY,HH:MM:SS,systolic,diastolic,pulse`. Dates may also use four-digit years; two-digit years mean 20xx. Invalid rows fail the complete import with their line number. Weight merge is date-based, so existing local dates win. Blood Pressure merge is chronological and skips readings that conflict with the two-per-date or two-hour rules.

## Offline and deployment

`deployment.config.mjs` is the deployment identity source. Vite uses `/HealthTracker/`; `vite-plugin-pwa` generates a manifest and auto-updating service worker that precaches the application shell. On pushes to `main`, the GitHub Actions Pages workflow installs with Node.js 24, then tests, lints, builds, and deploys the application.
