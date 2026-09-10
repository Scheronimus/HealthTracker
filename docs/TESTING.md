# Testing

## Automated

Tests cover the module registry contract, schema v6 and all migration paths, mixed stores/backups, module and appearance preferences, backup-reminder timing/change/status behavior, persistent-storage capability handling, translation-key and placeholder parity across all four languages, the Data and v1.5.1 release-note wording, once-per-version notice state, date-input limits, core dark-theme WCAG contrast pairs, specialized dark button styling, the two-readings-per-date limit and edit exclusion, local date/time conversion, DST-safe first-reading-anchored periods, available-reading averages, chart ordering/scale/domain/markers/nearest point, Weight graph/history range synchronization and empty states, and the retained internal CSV parsing behavior.

Run `npm test`, `npm run lint`, and `npm run build`. Regenerate the weekly and irregular one-year graph fixtures with `npm run generate:demo-backup` and `npm run generate:irregular-demo-backup` when their generators change. Tests cover schema validation, unique IDs, version-zero migration, future-version rejection, backup round trips, non-overwriting restore, malformed imports, and CSV escaping.

## Manual regression

For Blood Pressure, also verify the focused Overview, up to two time-ordered readings per date, historical backfilling, compact Diary navigation, factual averages without medical interpretation, future-date prevention, pointer/touch and keyboard chart navigation, four languages, narrow layouts, and dark mode. Confirm the banner module selector switches between Weight and Blood Pressure and remains usable with keyboard navigation.

- Enter two readings on the same date less than two hours apart and confirm the second is rejected; confirm a two-hour separation is accepted.
- Confirm the entry form asks only for date and time, and that a third reading on the same date is rejected.

- Confirm Blood Pressure opens on Overview with a combined period average, change from the previous period, today’s first/second reading slots, and progress out of 14 possible readings.
- Confirm Diary shows seven compact date rows with Reading 1/Reading 2 columns, orders readings by time, navigates older and newer periods, and returns to the same period and tab after adding or editing a reading.
- Confirm Trends defaults to 30-day daily averages; switch among 7 days, 30 days, 3 months, and 1 year and confirm longer ranges use weekly averages.
- Switch Trends between Averages and Individual readings; confirm the average view uses connected trend lines, while individual first/second readings remain separate markers without a misleading connecting line.
- Confirm Individual readings automatically moves a longer range to 30 days, disables 3-month and 1-year ranges, and uses smaller markers when more than 30 readings are visible.
- Confirm the selected-range average and change remain stable when only the chart display mode changes, and all three blood-pressure tabs are keyboard accessible.
- Select the top-right + and confirm the dedicated entry screen opens with Cancel and Save in its top bar.
- At a narrow mobile width, open Weight and Blood Pressure entry screens in all four languages; confirm the complete Cancel and Save labels remain visible and long centered titles wrap without overlapping either action. Repeat for the Profile screen.
- Confirm the flat options icon is crisp and recognizable on desktop and mobile, then select it and confirm Language, Appearance, the Data backup/restore workflow, privacy, sharing, and offline information open on a separate screen; Close returns to the dashboard.
- Expand Share Health Tracker, scan the QR code, and confirm it opens `https://scheronimus.github.io/HealthTracker/`; use the button below the QR code and confirm it opens the device share sheet (or copies/explains how to copy the link when sharing is unavailable); repeat in all four languages.
- In development, confirm Load one-year demo data directly adds all 240 irregular weight records and 480 blood-pressure records (two per tracked date), and a second selection adds no duplicates.
- In development, confirm Delete all entries appears under Temporary debug tools, cancellation preserves data, and confirmation removes measurements while preserving profile, module, and language preferences.
- In a production build, confirm the temporary debug section is absent.
- Confirm Cancel returns without changes; confirm Save validates, stores the entry, and returns to the dashboard.
- Confirm Weight rejects a date after today and Blood Pressure rejects both a later date and a time later today.
- If an existing future-dated record is present, confirm it is marked in red and can still be opened and deleted in both modules.
- Confirm history has no inline Edit/Delete buttons; select anywhere on a row and confirm the edit screen opens with its existing data.
- Confirm Delete appears on existing-record edit screens only, still requires confirmation, and returns to the dashboard after deletion.
- Add a valid weight with date and multiline note; confirm no time field is shown, then refresh and confirm it persists.
- Open a new Weight form and confirm the latest weight appears in grey while the field remains empty and required. Type a value and confirm the hint disappears; clear the field and confirm it returns. Confirm edit forms show the stored value instead of the hint.
- Try adding another weight on the same date and confirm it is rejected; edit the existing entry without changing its date and confirm saving remains allowed.
- Reject empty, zero, negative, and over-1000 kg values.
- Add measurements out of chronological order and confirm newest-first history and summaries.
- Confirm the graph defaults to 3 months and correctly switches to 1 year and all time.
- Switch each graph span and confirm the Weight History list, count, empty state, and row changes use only measurements visible in that same range.
- Confirm Current weight always shows the newest measurement and no Since previous card is present.
- Switch each graph span and confirm Change compares the first and last measurements visible in that range and shows the localized date of the older comparison measurement.
- On a narrow smartphone, confirm the entire graph and both date labels fit without a horizontal scrollbar.
- Tap, drag, or move across the graph and confirm the vertical crosshair snaps to the nearest measurement with weight, localized date, and note details.
- On a narrow phone, select the first and last Weight and Blood Pressure chart points and confirm the selected-reading tooltip stays below the graph without covering endpoint dates.
- Drag the crosshair from edge to edge and confirm the page does not scroll sideways or lose touch tracking.
- Focus the graph navigation area and confirm Left/Right and Home/End move through measurements.
- Confirm empty ranges and a single visible measurement render clearly.
- Import the 240-entry irregular fixture and confirm the full trend line remains readable with no point markers.
- Edit an entry and confirm its ID is retained. Cancel and accept delete confirmations.
- Switch among English, Spanish, German, and French; refresh and confirm the language persists.
- In Settings, switch among Use device setting, Light, and Dark. Confirm the preference persists after reload, explicit choices override the device setting, and System responds to an operating-system theme change.
- Visually review the overall hierarchy, native date/time controls, hover states, and disabled states in both appearance modes; automated checks cover the core palette contrast and theme-specific selectors.
- In Profile, hide a module and confirm it disappears from the banner selector. Reorder the enabled modules, reload, and confirm the first one opens by default. Confirm saving with no visible module is rejected.
- Confirm production Options contains no CSV controls or CSV recovery claims.
- Download a backup, add another record, restore the older file, and confirm current IDs are never overwritten.
- With no measurements, confirm no dashboard backup reminder appears and Settings explains that measurements are needed. Add three measurements and confirm the friendly first-backup card appears below any release notice.
- Download from the dashboard reminder and confirm a short “download started” message replaces it. Verify Settings records the date without claiming the file was saved successfully.
- Add, edit, delete, and restore measurements and change the profile; confirm each kind of change makes the Settings backup status newer than the last recorded download.
- Change the reminder interval among 7, 14, and 30 days. Confirm the due and overdue cards remain non-blocking, use accent/amber rather than error red, and “Remind me in 3 days” temporarily hides the normal card without marking data as backed up.
- Request browser-storage protection in Settings and confirm granted, denied, and unsupported results are explained without suggesting protection against manual clearing or device loss.
- In development Settings, select every backup preview state. Confirm the dashboard and Settings render the expected state in all four languages, the preview is clearly identified, “Return to real status” restores calculated behavior, and no preview changes measurements or real backup status.
- In a production build, confirm the backup preview selector is absent while normal reminders and status remain available.
- Try malformed JSON, an unsupported schema version, duplicate IDs, invalid units, and invalid timestamps; confirm nothing changes.
- Simulate a previous app version and confirm the localized v1.5.1 notice appears without blocking the dashboard. Change language before dismissing it, dismiss it, reload, and confirm it stays hidden.
- While the release notice is visible, open an entry screen and confirm the notice remains dashboard-only and does not appear beneath the entry header.
- Build and preview, load once online, go offline, reload, and confirm the shell and local edits work.
- Install on supported desktop/mobile browsers and confirm standalone launch under `/HealthTracker/`.
- Run the same-Wi-Fi launcher and open its QR URL from a phone. Note that install/service-worker testing generally requires HTTPS or localhost, so use production for the final PWA check.

## Profile and BMI checks

Automated tests cover BMI calculation and WHO categories, six-band weight conversion, chart-layer ordering, optional profile validation, sequential migrations through schema version 6, unchanged measurement-derived graph scaling, module preferences, and safe profile restore. Manually verify Profile Cancel/Save, localized labels, the height requirement when BMI is enabled, BMI visibility using the newest weight, the graph-level zone switch appearing only with BMI enabled, matching chart/legend zone colors in light and dark modes, and mobile summary layout.
