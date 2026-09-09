# Health Tracker v1.4.0 plan

Status: Implemented on `feature/v1.4.0`; automated verification passed, manual release regression pending.

Version 1.4.0 is a focused data-safety and language-quality release. It makes complete backup and restore the obvious path, removes unfinished CSV workflows from the production interface, and reviews the complete interface copy in English, Spanish, German, and French. No persisted schema change or migration is expected.

## Product decisions

### Rename the section to “Data”

The Options screen already presents Language and Appearance above the section heading. Calling the following section “Data & language” is inaccurate and duplicates the Language control. Rename only that section to the localized equivalent of “Data”:

- English: Data
- Spanish: Datos
- German: Daten
- French: Données

Keep the screen title/menu terminology separate from this section label. Review the visual hierarchy so Profile, Language, Appearance, and Data are easy to scan on a narrow phone.

### Make backup and restore the primary workflow

Present one clearly grouped backup card before any secondary data tools:

- Primary action: **Download backup**. Explain that it creates a complete Health Tracker backup containing Weight, Blood Pressure, profile details, and module preferences.
- Secondary action: **Restore from backup**. Explain that restore adds valid missing records, preserves matching local records, and does not replace existing records silently.
- Use “backup” in the visible wording instead of exposing “JSON” as the main concept. The selected file and download filename may still use `.json`.
- State near the actions that the file contains sensitive health information and should be stored safely.
- Keep the existing confirmation and result summary, but rewrite both in plain language and distinguish added, unchanged, and skipped records.
- Do not describe restore as a full replacement: its current and intended behavior is a safe merge.

The first-time path should be understandable without knowing file formats: choose **Download backup**, keep the file, then choose **Restore from backup** when recovery or transfer is needed.

### Remove CSV from the production interface for v1.4.0

CSV should not remain beside backup and restore as if all four actions were equivalent. Today the feature is asymmetric and easy to misunderstand:

- JSON is the only complete recovery format.
- CSV export includes Weight only.
- CSV import accepts external Weight or Blood Pressure row layouts that do not match the Weight CSV export layout.
- CSV omits profile and module preferences and cannot round-trip the full store.
- The interface does not explain these format and merge differences before a file is selected.

For v1.4.0, remove the CSV import and export controls from production Options. Preserve the parsing/merge utilities and their tests for now so existing work is not destructively discarded and a future data-exchange feature can build on it. Do not advertise CSV as a supported user feature in the README, privacy/recovery guide, or production manual-regression list.

Keeping hidden, unused code is a deliberate short-term compromise. Add a technical-debt note to decide whether to remove it or bring it back only after the product contract below is approved. Development-only exposure is unnecessary unless maintainers identify a concrete fixture-testing need.

### Gate any future CSV return behind a complete contract

CSV may return in a later version as an explicitly named **Advanced data exchange** feature, not as backup. Before that happens, decide and document:

- whether export is one mixed file, one file per module, or module-selectable;
- whether every exported file can be imported by the same app without manual conversion;
- stable headers, date/time format, units, encoding, versioning, and locale-independent decimals;
- collision, duplicate, future-record, two-readings-per-day, and two-hour-spacing behavior;
- whether notes and all module fields round-trip;
- preview, validation-error, partial-import, cancellation, and result-summary UX;
- accessibility, all four languages, and representative external spreadsheet behavior;
- explicit messaging that CSV is incomplete data exchange and never a backup.

Until those acceptance criteria are met, hiding CSV is safer and clearer than labeling unfinished behavior “Advanced.”

## Show “What’s new” once after an update

Add a short, dismissible release-note notice on the first launch of v1.4.0. This is useful because the revised Data workflow changes where users find recovery controls and removes CSV from production Options.

A browser PWA cannot reliably identify the exact moment an update was installed. Define the behavior as **first app launch after the running version changes**:

- Compare the current application version with a separate local `last-seen-release` value.
- Show the notice once when v1.4.0 is newer or different, then record v1.4.0 only after the user dismisses it.
- Do not put this preference in the versioned health-data store or include it in backups; it is device/browser UI state, like language and appearance.
- Do not show historical release notes in sequence. On a new browser profile or after site storage is cleared, show the current release note once; this is deterministic and avoids unreliable attempts to distinguish a clean install from an update.
- Never block dashboard access, data entry, backup, restore, or offline use. Use a compact banner, card, or lightweight dialog with a clear Close action and accessible focus behavior.
- Keep the content to a title, two or three user-relevant bullets, and an optional link/button to view the relevant Options area. Do not reproduce the full changelog.
- Localize the notice in English, Spanish, German, and French and ship its content with the application so it works offline.
- If the user changes language before dismissing it, render the same release note in the newly selected language.

For v1.4.0, mention the clearer backup/restore experience, the revised wording, and that CSV is no longer offered as a production transfer option. Phrase the CSV point neutrally and direct users to complete backups for recovery.

Keep release-note content separate from general translations if that makes future notes easier to retire. Retain only the current release’s notice in the app unless a product decision introduces a full changelog screen.

## Four-language wording review

Review all user-facing copy, not only the Data section. The known German error `JSON-Sicherung laden` labels a download action as “load”; it should use wording equivalent to “Download backup.” Treat that as evidence for a systematic audit rather than an isolated substitution.

### Review method

1. Inventory every translation key used by the interface, including confirmations, validation errors, status summaries, chart accessibility text, debug-only text, and PWA/offline messaging.
2. Establish English source copy in plain, concise language. Remove ambiguity and unnecessary technical terms before translating it.
3. Create a small terminology glossary for recurring concepts such as measurement, reading, entry, backup, restore, import, module, period/range, profile, and appearance.
4. Review Spanish, German, and French against the source meaning, the glossary, grammar, tone, capitalization, punctuation, interpolation placeholders, and available mobile space.
5. Prefer idiomatic interface language over literal translation. Keep the existing form of address consistent within each language.
6. Have a proficient or native reviewer approve each non-English language. Automated tests can verify completeness and placeholders, but cannot certify translation quality.

The audit must also check that wording remains factual and does not add medical interpretation, diagnosis, treatment advice, or unsourced classifications.

### Translation quality safeguards

- Require the same translation-key set in all four languages.
- Verify that every placeholder in English appears exactly once in each corresponding translation and that no unknown placeholder is introduced.
- Add focused rendering assertions for the Data heading, backup actions, warnings, confirmations, and result messages in every language.
- Test long German and French labels at narrow mobile widths without truncation or overlapping controls.
- Check accessible names and status announcements in each language, not only visible labels.

## Implementation scope

Likely implementation areas include:

- `src/components/Settings.jsx` and its focused tests for the revised hierarchy and removal of production CSV controls;
- `src/i18n.js` and translation tests for the complete copy audit and key/placeholder parity;
- `src/App.css` only where the backup-first layout needs responsive or focus-state adjustments;
- a small version-notice utility/component and focused tests for once-per-version local state;
- `README.md`, `docs/PRIVACY_AND_DATA_RECOVERY.md`, `docs/TESTING.md`, and `docs/TECHNICAL_DEBT.md` to align the public contract and future CSV decision;
- version metadata for v1.4.0 during release preparation.

Do not change `src/App.jsx` to implement module-specific transfer behavior. Keep complete backup mechanics in the shared transfer layer and module-owned CSV logic within its current boundaries. Do not change the persisted store or backup format merely to revise this UX.

## Delivery sequence

1. Agree on the English source copy and recurring-term glossary.
2. Restructure Options around a Data section with the complete backup workflow first.
3. Remove CSV controls from the production interface while retaining and testing the underlying utilities.
4. Review and revise all four language sets, with proficient/native review for Spanish, German, and French.
5. Add translation parity, placeholder, focused rendering, and accessibility coverage.
6. Add the localized, non-blocking v1.4.0 “What’s new” notice and once-per-version state.
7. Update public data-recovery, testing, technical-debt, and feature documentation.
8. Bump application release metadata to 1.4.0.
9. Run the complete automated and manual verification below.
10. Prepare `release/1.4.0` from `develop` after the feature branch is reviewed and integrated.

## Automated verification

Run all standard checks:

```sh
npm test
npm run lint
npm run build
git diff --check
```

Add focused tests that verify:

- Options renders the localized Data heading in all four languages.
- Download backup and Restore from backup are present and ordered clearly.
- Production Options does not expose CSV import or export.
- Backup generation and restore parsing/merge behavior remain unchanged.
- CSV parsing and merge utilities remain covered while hidden from production UI.
- Translation keys and interpolation placeholders remain equivalent across languages.
- Confirmation, invalid-file, and result messages render the expected variables accessibly.
- Existing browser profiles see the v1.4.0 notice once, dismissal persists locally, and a later app version can trigger a new notice.
- A new browser profile sees only the current release note, regardless of whether health measurements exist.
- The release note remains available and localized offline.

## Manual regression

- In each language, create a backup and confirm the downloaded `.json` contains both measurement modules and the profile/module preferences.
- Add records after downloading, restore the older backup, and confirm restore merges without overwriting matching IDs.
- Try malformed, unsupported, duplicate-ID, future-dated, and constraint-conflicting backups; confirm existing local data remains safe and the result is understandable.
- Confirm no production Options control describes or accepts CSV.
- Review every screen in all four languages for meaning, tone, consistency, clipping, wrapping, and stale English text.
- Pay particular attention to confirmations, errors, empty states, chart labels/tooltips, screen-reader names, and status announcements.
- Repeat the Options and restore flows on narrow mobile layouts, with keyboard navigation, and in light and dark appearance modes.
- Simulate an update from v1.3.0, confirm the v1.4.0 notice appears without blocking the dashboard, switch languages before dismissal, dismiss it, and confirm it stays hidden after reload.
- Verify a clean browser profile sees only the current release note and confirm deleting health records through the app does not make it reappear.
- Build and preview offline, then confirm backup download and local restore still work in the installed PWA context supported by the target browsers.

## Release acceptance criteria

Version 1.4.0 is ready when:

- the section formerly called “Data & language” is correctly labeled Data in all four languages;
- complete backup and safe merge restore are the only production transfer actions and are understandable without knowledge of JSON;
- CSV is absent from the production interface and documentation, with its future decision recorded as technical debt;
- every user-facing string has been reviewed in English, Spanish, German, and French, with non-English approval recorded during review;
- automated parity checks catch missing keys and placeholder drift;
- the localized v1.4.0 notice appears only for the intended first post-update launch, is accessible and non-blocking, and stays dismissed on later launches;
- backup contents and restore safety behavior have not regressed;
- all standard verification and relevant manual regression checks pass.
