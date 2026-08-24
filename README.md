# Health Tracker

A private, mobile-first weight and blood-pressure tracker. Health Tracker works offline after its first successful load and keeps all health data only in the current browser on the current device—there are no accounts, backend, analytics, ads, telemetry, or external health services.

Production target: <https://scheronimus.github.io/HealthTracker/>

![QR code for the production app](docs/production-app-qr.svg)

## Features

Health Tracker supports modular Weight and Blood Pressure areas. Blood Pressure records exact local date/time, systolic and diastolic pressure, and pulse. Each date can contain up to two time-ordered readings at least two hours apart. Seven-day measurement periods begin with the first reading rather than on Monday. The app averages whatever readings are available and reports neutral coverage by readings and days. Mixed data is included in JSON backups; CSV stays Weight-only.

- Record, edit, and delete dated weight measurements in kilograms with optional notes.
- Record up to two blood-pressure readings per date with exact local date/time, systolic, diastolic, and pulse values.
- Review a focused blood-pressure overview, compact two-reading diary, and accessible 7-day to 1-year trends using daily or weekly averages without connecting individual readings into a misleading line.
- Prominent interactive weight graph with 3-month, 1-year, and all-time ranges.
- Newest-first history with current weight and graph-span change summaries.
- Optional local profile, WHO BMI screening context, and height-specific WHO color zones on the unchanged graph scale.
- English, Spanish, German, and French interfaces with a locally saved preference.
- Versioned and validated local data, tested migration infrastructure, JSON backup/merge restore, and CSV export.
- Installable PWA with a cached application shell for offline use.

## Run locally

Install Node.js 22 or newer, then run `npm ci` and `npm start`. On Windows, double-click `Start Health Tracker.cmd`. For a phone on the same Wi-Fi, double-click `Start Health Tracker on Mobile.cmd` and scan the terminal QR code.

PWA/offline behavior requires a production build: `npm run build` then `npm run preview`.

## Import CSV

Settings → Import CSV accepts headerless weight rows in `DD/MM/YY,weight` format, or blood-pressure rows in `DD/MM/YY,HH:MM:SS,systolic,diastolic,pulse` format. Decimal-comma weights must be quoted, for example `31/03/26,"99,7"`; integer or decimal-point weights are also accepted. `NN`, `NA`, `N/A`, and empty weights are treated as missing and skipped. Invalid rows reject the import with a line number. Existing weight dates remain unchanged. Blood-pressure imports preserve existing readings and skip rows that would exceed two readings per date or place readings less than two hours apart.
## One-year demo data

To test the graph and range controls, open Settings → Restore backup and choose one of these files:

- [`docs/dummy-weight-data-one-year-irregular.json`](docs/dummy-weight-data-one-year-irregular.json): 240 measurements with daily tracking, a 30-day forgotten period, entries every 3–7 days, then daily tracking again.
- [`docs/dummy-weight-data-one-year.json`](docs/dummy-weight-data-one-year.json): 53 weekly measurements for a simpler sparse-data test.

Restore merges demo records with existing data and does not overwrite matching IDs. Delete demo entries individually or clear this site's browser storage when testing is finished.

Regenerate them with `npm run generate:irregular-demo-backup` and `npm run generate:demo-backup`.

During local development, Settings → Temporary debug tools also provides **Load one-year demo data**. The same button adds the irregular weight series plus two well-separated blood-pressure readings for every tracked day, so no file transfer is needed for phone testing.

Demo data is intended for interface testing only.

## Quality checks

Run `npm test`, `npm run lint`, and `npm run build`. See [Testing](docs/TESTING.md) for manual checks.

## Branch and deployment workflow

Use `develop` for ongoing work. Merge reviewed, verified releases into `main`; pushes to `main` run the GitHub Pages workflow. The Vite and PWA base is `/HealthTracker/`.

Before the first deployment, open the repository's **Settings -> Pages** and set **Build and deployment -> Source** to **GitHub Actions**. This one-time repository setting cannot be created by the workflow's standard token.

## Data ownership

Clearing browser/site storage or losing the device can permanently remove the data. Download JSON backups regularly and store them somewhere safe. Restore merges new records and never silently overwrites an existing record with the same ID. See [Privacy and data recovery](docs/PRIVACY_AND_DATA_RECOVERY.md).

Additional documentation: [Architecture](docs/ARCHITECTURE.md) · [Testing](docs/TESTING.md) · [Technical debt](docs/TECHNICAL_DEBT.md)
