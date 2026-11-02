# Release 1.9.1 record

Prepared on 2 November 2026 on `release/1.9.1`, from `develop` containing implementation commit `94d4daa`. Scope is frozen. The user approved publication on 3 November 2026. Git tags and GitHub Actions record publication and deployment status.

## Frozen scope

- Compact Weight graph settings behind an accessible icon; period controls remain visible. History starts collapsed, shows its filtered count and remains expanded during entry editing/return.
- Persist graph period, Average mode and independent target/milestone visibility across sessions. Keep existing BMI-zone profile persistence; tolerate malformed or blocked display-preference storage.
- Selected average in the purple Average-mode tooltip, retaining date/note and removing duplicate average text. Recorded tooltip and current-weight hero are preserved. Navigate only available averages and preserve the selected date across modes where possible.
- BMI legend limited to visible swatches and numeric ranges; explanatory context stays in the information popover.
- Tight whole-kilogram bounds independent of tick spacing; one scale fits recorded values, averages and visible reference lines in both modes. Preserve dates, flat-series padding and all calculations.
- Equivalent English, Spanish, German and French interfaces, dark mode, keyboard/pointer/touch behavior and offline use.

## Metadata and compatibility

- Package and lockfile version: 1.9.1; no dependency changes.
- Changelog date: 2026-11-02. All four localized in-app notices describe this release's complete scope.
- Schema 7, measurements, averaging rules, BMI/Goals calculations and JSON backup formats are unchanged; no migration is required.
- Graph display preferences use device-local storage outside backups. Existing BMI-zone settings remain in the backed-up profile.
- Preserve the client-only PWA and `/HealthTracker/` base.
- The temporary `VERSION_1.9.1_PLAN.md` is archived in Git history after checking the final changelog and all four localized notices against the complete shipped scope. Release preparation is retained in commit `e382e8d`.

## Verification

`npm run test:release` passed on Windows on 2 November 2026:

- 202 unit tests across 28 files.
- ESLint and production Vite/PWA build.
- 202 Playwright checks: 180 functional/accessibility/offline scenarios across Chromium, Firefox and WebKit, plus 22 Windows/Chromium visual baselines.
- `git diff --check`.

Reviewed all 22 baselines against the committed implementation: 20 differ only in the 7-by-9-pixel version digit in the footer; two are pixel-identical. All image dimensions match. Package and both lockfile versions, all four notice titles and the single changelog entry agree on 1.9.1. The changelog and localized notices cover the frozen scope.

Release preparation and review are complete. The user approved merging and publishing this verified release.

Physical-device keyboard/touch behavior, native installation and an actual deployed service-worker upgrade are not claimed as completed by browser automation.

## Publication

Finalization follows the repository convention: merge the verified release into `main`, tag `v1.9.1`, push to trigger the gated GitHub Pages workflow, and synchronize `develop`. GitHub Actions provides the authoritative deployment result.
