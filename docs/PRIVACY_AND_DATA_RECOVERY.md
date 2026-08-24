# Privacy and data recovery

Weight and blood-pressure records share the same local-only, versioned store. JSON is the complete mixed-data recovery format. Weight CSV is for Weight analysis only; blood-pressure CSV import/export is not provided. Restore preserves matching IDs and also keeps the local record when an imported blood-pressure reading collides with an existing local date-and-period slot.

Health Tracker sends no health data anywhere. It has no account, backend, analytics, advertising, telemetry, or external health integration. Measurements, optional profile details, BMI preference, and language preference remain in browser `localStorage` for the current origin and browser profile.

This also means there is no server-side recovery. Data can be lost if site data is cleared, the browser profile is removed, the device is lost, or a private-browsing session ends. Download JSON backups regularly, verify the file is safely stored, and create a fresh backup after important changes.

Restore accepts only a valid, supported Health Tracker backup. It merges records by collision-resistant ID: new IDs are added, while existing IDs remain unchanged. The app reports both counts. To intentionally replace a record, edit it in the app; restore never silently replaces one.

CSV is intended for analysis and is not a full recovery format. JSON is the full backup format. Both exports contain sensitive health information and should be protected accordingly.

The profile is optional. BMI and the optional WHO graph range are calculated locally from the latest weight and saved height only when enabled; the calculated BMI is not persisted as a separate measurement. JSON backup includes the profile, while CSV does not.
