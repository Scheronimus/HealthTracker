# Health Tracker agent guide

This file applies to the entire repository. Read `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, and `docs/TECHNICAL_DEBT.md` when the task touches their subject.

## Product constraints

- Health Tracker is a client-only, mobile-first React 19/Vite PWA. Health data stays in browser `localStorage`; do not add accounts, servers, analytics, telemetry, advertising, or external health integrations without an explicit product decision.
- Preserve offline/installable behavior and the deployment base `/HealthTracker/`.
- Present blood-pressure measurements, averages, and trends factually. Do not introduce medical interpretation, diagnosis, treatment advice, or unsourced threshold classifications.
- Keep all four interfaces—English, Spanish, German, and French—functionally equivalent when adding user-facing text.
- Weight is date-only. Blood Pressure stores exact local date/time, allows at most two readings per local date, and new/edited/imported readings on the same date must be at least two hours apart.

## Architecture and module boundaries

- `src/App.jsx` is the application shell. It must not gain module-specific rendering, entry, delete, import, or state branches.
- `src/modules/catalog.js` is the authoritative data-side catalog. `src/modules/registry.jsx` connects catalog entries to UI implementations.
- Each health module belongs in `src/modules/<module>/` and owns its components, model/validation, calculations, transfer behavior, demo generator, and tests.
- Modules may use shared services in `src/data/` and `src/utils/`, but must not import another health module.
- A module UI contract provides at least `Dashboard`, `EntryForm`, `initialState`, and add/edit/delete translation keys. Optional capabilities include profile settings, CSV import/export, restore constraints, and demo data.
- Add or update the registry contract test whenever the module contract changes. Adding a module must not require a conditional in `App.jsx`.
- Weight-specific BMI controls are contributed by the Weight module. Keep current flat persisted profile fields until the namespaced `moduleSettings` debt item is intentionally scheduled.
- Module-specific styles/translations and remaining compatibility exports are known debt; follow `docs/TECHNICAL_DEBT.md` rather than expanding that coupling casually.

## Data safety and migrations

- The persisted store is versioned. Never change its shape without incrementing `SCHEMA_VERSION`, adding a sequential migration, and testing old-to-current migration.
- Migrations must preserve valid user measurements. Do not discard or reinterpret older records merely to satisfy a newer entry rule.
- JSON is the complete backup format. Restore must validate before merging and must never silently overwrite an existing matching ID.
- CSV is an import/export convenience, not complete recovery. Keep parsing and merge rules inside the owning module.
- Preserve collision-resistant IDs and the discriminated `measurement.type` model.
- Treat existing user data and repository changes as valuable: avoid destructive Git/filesystem operations and do not overwrite unrelated work.

## Code and file conventions

- Use focused React function components and plain dependency-free utilities unless a dependency is clearly justified.
- Keep module filenames explicit (`WeightEntryForm`, `BloodPressureDashboard`) and shared filenames generic only when they are genuinely module-neutral.
- Put calculation and validation rules in testable functions, not JSX event handlers when they are shared or non-trivial.
- Use local-calendar helpers for user-entered dates; avoid UTC slicing where it would change the user’s calendar date. Exercise extra care around DST.
- Maintain keyboard, pointer, touch, narrow-screen, and dark-mode behavior for charts and navigation.
- Update relevant documentation alongside behavior, schema, import format, architecture, or manual-testing changes.
- Do not hand-edit generated `dist/` output. Regenerate documented demo fixtures only when their generator changes.

## Verification

For normal code changes, run all of:

```sh
npm test
npm run lint
npm run build
git diff --check
```

Also add focused tests for changed data rules, migrations, calculations, imports, or module contracts. Follow the manual regression list in `docs/TESTING.md` for UI/PWA-sensitive work.

## Git workflow

- Before implementation begins for a new version, create `docs/VERSION_<version>_PLAN.md` and record the intended scope, constraints, verification, and acceptance criteria. Treat it as a living plan that may expand or be refined as decisions are made.
- A focused, disposable prototype may be created before a version plan when its purpose is to test whether an idea is useful or technically viable. Prototyping does not by itself place the idea in a release.
- Once a prototype is accepted for a version, add it to that version's plan before or as part of merging it into `develop`. No accepted release feature may reach `develop` without being represented in the version plan.
- Freeze the agreed scope when preparing `release/<version>`. Update version metadata, release notes, changelog, tests, and documentation on that branch before review and merge to `main`.
- The version plan is temporary working documentation and may be deleted when the release is finalized. Delete it only after verifying that the changelog and localized in-app “What’s new” notice accurately and completely describe the shipped scope; Git history retains the planning record.
- Ongoing work starts from `develop` on a focused feature branch. Prepare releases on `release/<version>` from `develop`; reviewed and verified releases merge into `main`.
- Do not commit without the user’s approval. If the current work already forms a coherent, verified milestone and a new request would be cleaner in a separate commit, proactively suggest committing the milestone and ask the user before continuing. Before committing, confirm tests/lint/build are successful and the working tree contains only intended changes.
- Use concise conventional-style commit messages consistent with repository history.
