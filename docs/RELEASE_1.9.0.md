# Release 1.9.0 record

Prepared and approved for release on 21 October 2026 on `release/1.9.0`, from `develop` containing integration commit `39f41bf`. Scope is frozen. This document records release scope and verification; Git tags and GitHub Actions record publication and deployment status.

## Frozen scope

- Optional Goals module: one customizable Record goal and one Weight target, with persisted ordering and accessible arrangement controls.
- Daily/weekday reminders using actual Weight or one/two Blood Pressure readings, due/done styling and existing entry-form return navigation.
- Date-derived target baseline, overall progress, interval-aligned milestones, five-consecutive-average confirmation, latest-weight carry-forward for missing dates, permanent dated achievements and gold final-target celebration.
- Gold final-target/next-milestone lines in Weight, with independent switches enabled by default.
- Schema 7 migration, complete goal backup/restore, goal-aware backup reminders, offline behavior and four equivalent language interfaces.

Maintenance/activity goals, background notifications and external integrations are deferred. The discovery prototype is not a production feature. Existing Weight and Blood Pressure rules and the Weight five-measurement average remain unchanged.

## Release metadata and review

- Package and lockfile version: 1.9.0; no dependency changes.
- Changelog date: 2026-10-21, including data compatibility and deferred scope.
- Localized in-app notice: Goals, reminders, milestone/target achievements, graph controls and local/offline backup compatibility.
- Preserve `/HealthTracker/` and the client-only PWA.
- The temporary `VERSION_1.9.0_PLAN.md` is archived in Git history after checking the shipped scope against the changelog and all four localized notices. Preparation is retained in commit `e00205f`.

## Verification

`npm run test:release` passed on Windows on 21 October 2026:

- 197 unit tests across 27 files.
- ESLint and production Vite/PWA build.
- 186 Playwright checks: 168 functional/accessibility/offline scenarios across Chromium, Firefox and WebKit, plus 18 Windows/Chromium visual baselines.
- `git diff --check`.

Reviewed all 18 regenerated visual baselines against the previous commit: version-footer digits changed from 1.8.0 to 1.9.0, dimensions and layouts stayed the same. One English dark screenshot also has a nine-pixel select-arrow antialiasing difference, inspected separately. No unreviewed layout changes were accepted. The changelog has exactly one section per version, and both package versions plus all four notice titles match 1.9.0.

Physical-device installation, native keyboard behavior and an actual deployed service-worker upgrade remain device checks; browser emulation does not establish these. These checks have not been claimed as completed.

The user approved committing and performing the release. Finalization follows the repository convention: merge the verified release into `main`, tag `v1.9.0`, push to trigger the gated Pages workflow, and synchronize `develop`. Existing repository releases use Git tags rather than separate GitHub Release objects. Check GitHub Actions for the authoritative deployment result.
