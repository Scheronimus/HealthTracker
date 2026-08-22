# Health Tracker

A private, mobile-first body-weight tracker. Health Tracker works offline after its first successful load and keeps all health data only in the current browser on the current device—there are no accounts, backend, analytics, ads, telemetry, or external health services.

Production target: <https://scheronimus.github.io/HealthTracker/>

![QR code for the production app](docs/production-app-qr.svg)

## Features

- Record, edit, and delete dated weight measurements in kilograms with optional notes.
- Newest-first history and latest, previous-entry, and total-change summaries.
- English, Spanish, German, and French interfaces with a locally saved preference.
- Versioned and validated local data, tested migration infrastructure, JSON backup/merge restore, and CSV export.
- Installable PWA with a cached application shell for offline use.

## Run locally

Install Node.js 22 or newer, then run `npm ci` and `npm start`. On Windows, double-click `Start Health Tracker.cmd`. For a phone on the same Wi-Fi, double-click `Start Health Tracker on Mobile.cmd` and scan the terminal QR code.

PWA/offline behavior requires a production build: `npm run build` then `npm run preview`.

## Quality checks

Run `npm test`, `npm run lint`, and `npm run build`. See [Testing](docs/TESTING.md) for manual checks.

## Branch and deployment workflow

Use `develop` for ongoing work. Merge reviewed, verified releases into `main`; pushes to `main` run the GitHub Pages workflow. The Vite and PWA base is `/HealthTracker/`.

## Data ownership

Clearing browser/site storage or losing the device can permanently remove the data. Download JSON backups regularly and store them somewhere safe. Restore merges new records and never silently overwrites an existing record with the same ID. See [Privacy and data recovery](docs/PRIVACY_AND_DATA_RECOVERY.md).

Additional documentation: [Architecture](docs/ARCHITECTURE.md) · [Testing](docs/TESTING.md) · [Technical debt](docs/TECHNICAL_DEBT.md)
