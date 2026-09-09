# Privacy and data recovery

Weight and blood-pressure records share the same local-only, versioned store. A downloaded Health Tracker backup is the complete mixed-data recovery format. Restore preserves matching IDs and keeps local records when an imported blood-pressure reading would exceed the two-readings-per-date limit.

Health Tracker sends no health data anywhere. It has no account, backend, analytics, advertising, telemetry, or external health integration. Measurements, optional profile details, BMI preferences, visible-module order, and language preference remain in browser `localStorage` for the current origin and browser profile.

This also means there is no server-side recovery. Data can be lost if site data is cleared, the browser profile is removed, the device is lost, or a private-browsing session ends. Download JSON backups regularly, verify the file is safely stored, and create a fresh backup after important changes.

Restore accepts only a valid, supported Health Tracker backup. It merges records by collision-resistant ID: new IDs are added, while existing IDs remain unchanged. The app reports how many records were added, kept unchanged as duplicates, or skipped because they were dated in the future. To intentionally replace a record, edit it in the app; restore never silently replaces one.

The backup file uses JSON internally and contains sensitive health information, so it should be protected accordingly. CSV data exchange is not exposed in the production interface because it does not yet provide a complete, round-trippable format.

Personal profile fields are optional; the profile object also stores module visibility and order. BMI and the optional WHO graph range are calculated locally from the latest weight and saved height only when enabled; the calculated BMI is not persisted as a separate measurement. JSON backup includes the profile and module preferences, while CSV does not.
