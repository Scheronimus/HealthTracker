# Health Tracker backlog

This document records candidate product work that is not committed to a release. Each item requires separate specification and acceptance criteria before implementation.

## Last reliable blood-pressure period

Show the latest useful seven-day blood-pressure summary instead of allowing a sparse or empty current period to dominate the overview:

- Search the most recent three months for the latest seven-day measurement period containing at least seven qualifying readings and show that period's average and coverage.
- If no such period exists, show the latest seven-day period that contains at least one reading and label its summary as not fully reliable because of limited coverage.
- Reuse the module's existing first-reading-anchored, DST-safe seven-day periods unless the final specification deliberately chooses calendar weeks.
- Keep the result factual and coverage-based. The word "good" must describe measurement coverage or protocol quality, not classify the blood-pressure values medically.
- Add focused calculation tests for boundary dates, exactly seven readings, the three-month cutoff, sparse fallback periods, and no-data behavior, plus equivalent wording in all four languages.

Open product questions:

- Does a "qualifying" reading mean every valid saved reading, or only readings taken according to a future measurement protocol, such as selected times or paired readings?
- Is the three-month window counted back from today or from the newest recorded reading?
- Should the overview replace the current-period summary, or show the last reliable period beside it?

Estimated difficulty: small-to-medium once these definitions are settled. This is the best candidate for a focused release soon after v1.5.0, or for v1.5.0 only if its scope is intentionally expanded.

## Coach module

Add an optional Coach area that helps users set goals and improve measurement consistency. Candidate capabilities include a weight target with factual progress feedback, prompts to add enough measurements for a useful trend, and neutral instructions for performing a consistent blood-pressure measurement.

Product and architecture constraints:

- Coach is cross-module guidance, not a new measurement type. Its contract must be designed without importing one health module directly into another or adding module-specific branches to `App.jsx`.
- Define goal settings, completion/dismissal state, and their migration/backup behavior before implementation. Adding persisted fields requires a schema version increment and sequential migration.
- Keep feedback factual and supportive; do not diagnose, prescribe treatment, or characterize blood-pressure values as medically good or bad.
- Separate in-app reminders from device notifications. In-app prompts can remain client-only; dependable notifications while the app is closed likely require push infrastructure and therefore a separate privacy/product decision.
- Complete the third-module modularity cleanup described in `docs/TECHNICAL_DEBT.md` before or as part of this work so Coach does not expand shared translation, style, settings, and demo-data coupling.

Estimated difficulty: large. Start with a later discovery/specification milestone, then consider a small first version limited to local goals, progress, education, and in-app prompts.

## Additional backup destinations and automation

These stages build on the local reminder and backup-status work planned for v1.6.0. Each requires a separate product specification and must keep complete JSON download/restore available as the service-independent recovery path.

### Share or save a backup through the device

Offer an explicit action that passes the existing complete JSON backup to the operating-system share sheet when file sharing is supported. This could let a person save to device files, Drive, iCloud, Dropbox, another device, or another installed destination without Health Tracker integrating separately with each provider.

- Keep normal JSON download as the universal fallback.
- Require an explicit user action and display the sensitive-data warning before sharing.
- Detect support at runtime and do not show a control that cannot share files.
- Do not assume that opening the share sheet proves the backup was saved successfully.
- Specify cancellation, errors, filename behavior, accessibility, localization, offline behavior, and mobile-browser testing before implementation.

Estimated difficulty: small-to-medium, but practical value depends on mobile browser and installed-app support.

### User-controlled Google Drive backup

Investigate an explicit, opt-in action that uploads the existing complete JSON backup to a file in the user's own Google Drive and can select that file for restore.

Feasibility and constraints:

- This is technically feasible in a browser-only PWA using Google Identity Services and the Drive REST API, with a narrowly scoped OAuth permission such as `drive.file`.
- Prefer manual "Save backup to Drive" and "Restore backup from Drive" actions first. A browser-only access token is short-lived, so silent scheduled backup across sessions is not dependable without a backend and securely stored refresh tokens.
- Upload only after an explicit user action and clearly disclose that the backup contains sensitive health and profile data. Keep local JSON download/restore available for users who do not connect Google.
- Use the existing validated backup envelope and non-overwriting restore rules. Do not create a parallel cloud data format or synchronization engine.
- Specify file naming, repeated-save behavior, account switching, expired authorization, offline behavior, revocation/disconnect, deletion, error recovery, and restore conflict handling.
- Update the privacy documentation and product wording because this is an external health-data integration and changes the current "data never leaves the device" promise, even though Health Tracker itself would still operate without a server.
- Register and configure a Google Cloud OAuth client for the production origin and complete any required consent-screen/brand verification before release.

Estimated difficulty: medium-to-large. Treat manual Drive backup as a standalone external-integration feature after the local reminder and device-sharing stages.

### Automatic cloud backup

Investigate true automatic backup only as a separate privacy and architecture decision. A dependable scheduled cloud backup while the PWA is closed is not equivalent to repeatedly downloading a file and may require accounts, durable authorization, background execution, and server-side infrastructure.

- Define the recovery guarantee, supported providers, encryption and key ownership, retention, deletion, account switching, revocation, offline changes, and conflict behavior before selecting an architecture.
- Obtain explicit opt-in consent and make clear which health and profile data leaves the device, where it is stored, and how the connection can be disabled.
- Keep local use and manual complete JSON backup available without a cloud account.
- Do not turn backup into multi-device synchronization without a separate data-conflict and product specification.
- Update the privacy promise, threat model, operational responsibilities, and applicable compliance assessment before implementation.

Estimated difficulty: very large. This is a long-term candidate, not an incremental extension of the local reminder.
