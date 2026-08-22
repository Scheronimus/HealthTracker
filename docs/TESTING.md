# Testing

## Automated

Run `npm test`, `npm run lint`, and `npm run build`. Regenerate the one-year graph fixture with `npm run generate:demo-backup` when its generator changes. Tests cover schema validation, unique IDs, version-zero migration, future-version rejection, backup round trips, non-overwriting restore, malformed imports, and CSV escaping.

## Manual regression

- Confirm the dashboard shows the graph first, with summaries and the complete history below it.
- Select the top-right + and confirm the dedicated entry screen opens with Cancel and Save in its top bar.
- Select the settings button and confirm language, backup, restore, CSV, privacy, and offline information open on a separate screen; Close returns to the dashboard.
- In development, confirm Delete all entries appears under Temporary debug tools, cancellation preserves data, and confirmation removes measurements but preserves language.
- In a production build, confirm the temporary debug section is absent.
- Confirm Cancel returns without changes; confirm Save validates, stores the entry, and returns to the dashboard.
- Confirm history has no inline Edit/Delete buttons; select anywhere on a row and confirm the edit screen opens with its existing data.
- Confirm Delete appears on existing-record edit screens only, still requires confirmation, and returns to the dashboard after deletion.
- Add a valid weight with date, time, and multiline note; refresh and confirm it persists.
- Reject empty, zero, negative, and over-1000 kg values.
- Add measurements out of chronological order and confirm newest-first history and summaries.
- Confirm the graph defaults to 3 months and correctly switches to 1 year and all time.
- Tap, click, and keyboard-focus graph points; confirm weight, localized date/time, and note details appear.
- Confirm empty ranges and a single visible measurement render clearly.
- Import the 240-entry irregular fixture and confirm the full trend line remains visible without a large marker on every measurement.
- Edit an entry and confirm its ID is retained. Cancel and accept delete confirmations.
- Switch among English, Spanish, German, and French; refresh and confirm the language persists.
- Export CSV and inspect commas, quotes, Unicode, timestamps, and kilogram values.
- Export JSON, add another record, restore the older file, and confirm current IDs are never overwritten.
- Try malformed JSON, an unsupported schema version, duplicate IDs, invalid units, and invalid timestamps; confirm nothing changes.
- Build and preview, load once online, go offline, reload, and confirm the shell and local edits work.
- Install on supported desktop/mobile browsers and confirm standalone launch under `/HealthTracker/`.
- Run the same-Wi-Fi launcher and open its QR URL from a phone. Note that install/service-worker testing generally requires HTTPS or localhost, so use production for the final PWA check.
