# Health Tracker v1.3.0 plan

Status: Planned; implementation has not started.

Version 1.3.0 is a focused usability and visual-quality release. It prevents future measurements, improves the new Weight entry experience, keeps Weight history aligned with the graph filter, and revises dark mode. No persisted schema change or migration is expected.

## 1. Prevent future measurements

Apply the rule consistently to Weight and Blood Pressure across all data-entry paths.

### Weight

- Set the date input's maximum to the current local date.
- Validate the date again during submission so bypassing the browser control cannot save a future date.

### Blood Pressure

- Retain the date input's maximum of the current local date.
- Strengthen submission validation to reject an exact timestamp later than the current local time, including a time later today.

### Imports and restore

- Reject future Weight dates and future Blood Pressure timestamps during CSV parsing, using the existing line-specific error handling.
- During JSON restore, do not remove or modify records already stored locally.
- Skip future-dated imported measurements during the restore merge and report them as skipped or conflicting records.
- Preserve older records through migrations, even if a device-clock change makes a timestamp appear to be in the future later.

### Implementation notes

- Keep reusable local-date and local-time comparisons in the appropriate module or shared date utility.
- Do not add module-specific validation branches to `src/App.jsx`.
- Add automated coverage for tomorrow, a later time today, exactly the current time, editing existing measurements, and future CSV and backup records.

## 2. Show the latest weight as an empty-field hint

On the new Weight entry screen:

- Display the newest recorded weight in muted grey inside the Weight field.
- Implement it as a placeholder rather than the input value. The field must remain empty and must not submit the hinted weight accidentally.
- Let the hint disappear as soon as the user types and reappear if the field is cleared.
- Do not display a hint when there is no previous Weight measurement.
- When editing an existing measurement, continue to show its stored weight as the actual field value.
- Use localized decimal presentation where practical while keeping numeric entry and submission unambiguous.
- Add accessible supporting text if the placeholder alone does not adequately expose the hint to assistive technology.

Likely files include `src/modules/weight/components/WeightEntryForm.jsx`, `src/App.css`, `src/i18n.js`, and focused tests.

## 3. Filter Weight raw data with the graph range

For this release, "raw data" means the Weight History list beneath the graph.

- Pass the graph's existing `visibleMeasurements` collection to `WeightHistory`.
- When 3 months is selected, show only entries within that same three-month range.
- When 1 year is selected, show only entries within that same one-year range.
- When All time is selected, show every Weight entry.
- Make the History count reflect the filtered records.
- Show the existing empty state when the selected range contains no records.
- Calculate each displayed row's change relative to the preceding displayed record, not a hidden out-of-range record.
- Keep Current weight unchanged: it continues to represent the newest overall Weight measurement.

Likely files include `src/modules/weight/components/WeightDashboard.jsx`, `src/modules/weight/components/WeightHistory.jsx`, their tests, `docs/ARCHITECTURE.md`, and `docs/TESTING.md`.

## 4. Revise dark mode

Continue using the operating system's `prefers-color-scheme` setting. A manual theme selector is outside this release unless separately approved.

- Replace scattered dark-mode colors with a coherent semantic token set for:
  - page and header backgrounds;
  - cards and elevated surfaces;
  - borders and shadows;
  - primary, muted, danger, and link text;
  - inputs, buttons, segmented controls, and disabled states;
  - chart axes, grids, trend lines, markers, tooltips, and BMI bands.
- Correct components that retain inappropriate light-theme colors, especially privacy panels, selected controls, labels, status cards, and interactive history rows.
- Set `color-scheme` so native date and time controls match the active theme.
- Ensure readable contrast for normal text, muted text, focus indicators, errors, and chart series.
- Verify hover, focus, active, disabled, and selected states on desktop and touch layouts.
- Preserve the existing light-mode appearance unless a shared-token adjustment is necessary.

The primary files are `src/App.css` and `src/index.css`. Component changes should be limited to cases where additional styling hooks are required.

## Delivery sequence

1. Create a focused feature branch from `develop`.
2. Add shared future-date and future-time validation with tests.
3. Update both entry forms and the CSV import and JSON restore paths.
4. Add the latest-weight placeholder behavior.
5. Connect Weight History to the selected graph range.
6. Refactor and revise dark-mode styling.
7. Update the README, architecture, and testing documentation and bump the application version to 1.3.0.
8. Run the complete automated verification suite.
9. Complete the relevant manual regression checks in all four languages, narrow mobile layouts, light mode, dark mode, and an offline production build.
10. Prepare `release/1.3.0` after review. Do not commit or merge without approval.

## Automated verification

Run all standard checks:

```sh
npm test
npm run lint
npm run build
git diff --check
```

Add focused tests for:

- Weight dates after today.
- Blood Pressure dates after today and times later today.
- Boundary behavior at the current date and time.
- Future-dated Weight and Blood Pressure CSV rows.
- Future-dated records in JSON restore data.
- Preservation of existing local measurements during restore.
- Latest-weight placeholder behavior for new, empty, cleared, and edit forms.
- Weight History contents, count, empty state, and per-row changes for every graph range.

## Manual regression

- Attempt future manual entries in both modules.
- Attempt a Blood Pressure entry later on the current date.
- Import CSV files containing future records and confirm the error identifies the correct line.
- Restore a backup containing future records and confirm existing local data remains unchanged while future imported records are skipped and reported.
- Open a new Weight form with and without existing data; confirm the grey hint is never treated as an entered value.
- Edit an existing Weight entry and confirm its stored value remains editable normally.
- Switch among 3 months, 1 year, and All time; confirm the graph, History list, History count, and displayed changes use the same range.
- Check empty and single-entry ranges.
- Review dashboards, entry forms, Profile, Settings, charts, tooltips, controls, focus indicators, and error states in light and dark modes.
- Repeat user-facing checks in English, Spanish, German, and French.
- Check narrow phone layouts, keyboard use, pointer and touch chart interaction, offline reload, and installed PWA launch.

## Release acceptance criteria

Version 1.3.0 is ready when:

- No manual entry, CSV import, or JSON restore can add a future Weight or Blood Pressure measurement.
- Existing valid user data is preserved.
- A new Weight form hints at the latest weight without treating it as entered data.
- Weight History and its count always match the selected graph range.
- Dark mode is visually consistent and accessible across dashboards, forms, settings, charts, and all four languages.
- The complete automated verification suite passes.
