# Architecture

Health Tracker is a client-only React 19 application built with Vite. `App.jsx` coordinates feature components; UI, persistence, schema, migration, transfer, date, and download concerns live in separate modules. There is no router or network data layer.

## Data model

The persisted root is `{ schemaVersion: 1, measurements: Measurement[] }`. A measurement is `{ id, type, value, unit, timestamp, note }`. Version 1 supports `type: "weight"`, numeric values in `unit: "kg"`, ISO timestamps, and notes up to 1,000 characters. IDs use `crypto.randomUUID()` where available.

`src/data/schema.js` owns validation and constants, `migrations.js` performs sequential migrations and validates the result, `storage.js` isolates browser persistence, and `transfer.js` owns versioned backup, safe merge restore, and CSV generation. New measurement types should add type-specific validation, presentation, and export rules without changing the root model.

## Persistence and restore

The complete store is serialized under `health-tracker-data`; the language uses `health-tracker-language`. Invalid local data fails closed to an empty store. JSON backup envelopes contain a kind, format version, export timestamp, and full versioned store. Restore validates first, requests explicit confirmation, then adds records whose IDs are new. Matching IDs preserve the local record.

## Offline and deployment

`deployment.config.mjs` is the deployment identity source. Vite uses `/HealthTracker/`; `vite-plugin-pwa` generates a manifest and auto-updating service worker that precaches the application shell. GitHub Actions tests, lints, builds, and deploys `main` to Pages.
