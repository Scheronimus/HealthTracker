# Health Tracker v1.6.0 plan

This living plan defines the intended scope for the next feature release. The release focuses on reducing the risk that locally stored health data is lost because a person did not realize that regular backups were necessary.

## Scope

### Backup reminders

- Keep the existing complete, validated JSON backup and non-overwriting restore behavior.
- Record locally when a backup download is initiated and whether health data has changed since that download. Do not claim that the browser verified where the file was saved or that it remains recoverable.
- Show the latest recorded backup date and whether newer measurements or profile changes exist in Settings.
- Show a prominent, localized reminder when the app is opened after the backup interval has elapsed and recoverable health data exists.
- Let the person download a complete backup immediately or defer the reminder. The reminder must not block viewing or recording health data.
- Provide 7-, 14-, and 30-day reminder intervals, with 14 days as the default, rather than requiring people to understand backup strategy before protection begins. “Remind me later” defers an actionable reminder for three days.
- Explain that a backup file contains sensitive health information and should be saved outside this browser, such as in protected device files, another device, or a cloud-storage location chosen by the person.
- Keep reminder state outside the versioned health-data store. It is a device/browser preference and must not be presented as part of a recoverable backup.

### Reminder experience

- Present the reminder as a compact data-safety card near the top of the dashboard, below the header and any “What’s new” notice. Do not use a blocking modal.
- Use a calm, supportive tone such as “Keep your data recoverable.” Avoid blame, fear, medical urgency, or wording that implies a verified backup.
- Show useful context: the recorded date of the latest backup download and a concise summary of meaningful changes since then. Changes include added, edited, deleted, and restored measurements plus profile changes.
- Provide “Download backup” directly on the card as the primary action and a quiet, temporary “Remind me later” action. A person must not have to navigate through Settings to respond.
- After initiating the download, briefly confirm that the backup download started and remind the person to store the file somewhere safe. Do not say that the backup succeeded or was safely stored.
- Use progressive presentation rather than constant alerts:
  - Show no reminder when there is no recoverable health data.
  - After the first few measurements, show a friendly introduction if no backup has been recorded.
  - Hide the dashboard card while the recorded backup is current; keep an “Up to date” status in Settings.
  - Use the normal accent treatment when the configured interval is reached.
  - Use a more prominent but non-alarming amber treatment when significantly overdue. Reserve red for errors rather than backup age.
  - Hide a deferred reminder until its snooze date unless the final specification defines an exceptional change threshold.
- Keep the primary Data screen simple: complete-backup download and restore remain the prominent actions. Put the latest recorded download date, newer-change summary, and reminder interval in a dedicated Advanced backup settings screen reached from Data.
- Use specific localized dates and counts where possible instead of relying only on vague terms such as “recently.”
- Ensure the card remains compact on narrow screens, supports keyboard and screen-reader use, and works in light and dark appearances.

### Development preview controls

- Extend the existing development-only Settings tools with controls that preview every backup presentation state without waiting for real time to pass or changing the device clock.
- Include at least: no data/no reminder, first measurements with no recorded backup, current/up to date, reminder due, significantly overdue, deferred, and download-started confirmation.
- Where useful, allow representative change summaries to be previewed so singular, plural, long translated text, and narrow-screen wrapping can be checked.
- Keep preview state separate from measurements and normal backup-reminder preferences. Entering or leaving a preview must not add, edit, delete, restore, or mark real health data as backed up.
- Make the active preview state obvious and provide one action to return to normal calculated behavior.
- Compile or render these controls only in development, following the existing temporary debug-tools pattern; production users must not see them.

## Constraints

- Remain client-only, offline-capable, and usable without an account or external service.
- Do not silently upload health data or add an external health integration.
- Do not describe a download as a successful or verified backup; the app can observe only that it initiated the browser download.
- Preserve the deployment base `/HealthTracker/` and all existing backup validation, migration, and restore rules.
- Keep English, Spanish, German, and French behavior and wording equivalent.
- Ensure reminders remain accessible on narrow screens and with keyboard, touch, pointer, light, and dark appearances.

## Verification

- Add focused tests for due-date calculation, changed-versus-current backup state, empty-data behavior, clock boundaries, interval selection, and deferral.
- Add component tests for reminder visibility, Settings status, backup actions, and translation parity.
- Test the progressive visual states, snooze behavior, direct dashboard download action, and post-download confirmation wording.
- Add tests that every development preview maps to the intended presentation and that preview actions do not mutate the persisted health store or normal reminder state.
- Manually verify download behavior in supported desktop and mobile browsers.
- Run `npm test`, `npm run lint`, `npm run build`, and `git diff --check`.

## Acceptance criteria

- A person with recoverable health data is reminded after the configured interval when no newer backup download has been recorded.
- A person can create the existing complete JSON backup directly from the reminder.
- Settings clearly reports the recorded download date and whether data changed afterward.
- Normal users see backup status and scheduling only after opening Advanced backup settings; these details do not compete with download and restore on the primary Data screen.
- Deferring a reminder is temporary, does not mark the data as backed up, and does not prevent measurement entry.
- The dashboard reminder is useful but non-blocking, gives immediate access to backup download, and becomes more prominent without using medical or alarm styling as it grows overdue.
- A developer or tester can reliably trigger every reminder and storage-capability presentation through development-only controls, then return to genuine calculated state without affecting user data.
- No health data leaves the device unless the person explicitly chooses what to do with the downloaded backup file.

## Out of scope

- Sharing a backup through the operating-system share sheet.
- Google Drive authorization, upload, file selection, or restore.
- Automatic cloud backup, background synchronization, or multi-device synchronization.

These later stages remain candidates in `docs/BACKLOG.md`.
