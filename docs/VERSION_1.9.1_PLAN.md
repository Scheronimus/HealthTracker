# Version 1.9.1 implementation plan

Status: scope frozen on release/1.9.1 on 2 November 2026. Implementation committed as 94d4daa and integrated into develop. Release preparation and the complete release gate passed; ready for review, with publication pending. See RELEASE_1.9.1.md for the release record. Retain this plan until release finalization.

## Scope and decisions

Make the Weight dashboard more compact on phones and retain graph preferences across sessions.

- In Average mode, the selected-point tooltip (the blue value/date card beneath the graph) shows the selected existing average as its primary value, without an extra label or the separate "5-measurement average: ..." line. Preserve date and note details.
- Change only that tooltip's background to purple in Average mode, matching the average graph identity with readable white text. Use a darker purple in dark mode. Recorded-mode tooltip styling remains unchanged.
- Keep the top current-weight hero completely unchanged in both modes: its recorded value, label, background and change indicator.
- Keep all existing calculations unchanged: five-measurement averaging, its five-reading minimum, full-history inputs, recorded-weight change indicators, BMI, Goals calculations, and history values.
- When no average exists, show the existing insufficient-data explanation and no selected-average tooltip; never silently substitute a recorded value. Retain the existing insufficient-data explanation where needed. In Average mode, chart interaction must not present an early recorded measurement as an average.
- Tighten the chart scale around both series: whole-kilogram outer bounds independent of coarse tick spacing, one shared scale derived from recorded values and averages in both modes, and visible target/milestone lines included. Preserve the time axis and flat/single-point padding.
- Limit the BMI legend to bands intersecting the plotted vertical scale, using the chart's existing visible-band calculation. Show color swatches and numeric BMI ranges without descriptive classifications such as "above WHO...". Keep BMI context in the existing information popover.
- Add a compact sliders/options button beside the chart title. It expands an inline panel containing Average, BMI zones, final-target and milestone controls when applicable. Keep the period selector visible. The panel starts closed on launch.
- Remember graph period, Average mode, BMI-zone visibility, and the independent final-target/milestone choices across sessions. Keep choices when their controls are temporarily unavailable. BMI-zone visibility already persists in the profile; preserve that behavior.
- Make Weight History a collapsed-by-default disclosure with its filtered record count. Expanding it reveals the existing rows and editing behavior, still filtered to the graph period. Keep it open during ordinary dashboard interactions; start collapsed on a fresh app launch.

## Constraints

- Weight-only scope; no Blood Pressure redesign.
- Client-only and offline, with the existing deployment base and no new dependencies expected.
- Keep measurements, calculation rules, health-store schema and JSON backup format unchanged.
- Store new display preferences separately in browser localStorage, following existing local preference patterns. Validate known fields, default invalid values safely, and tolerate unavailable storage. These device display preferences are outside health-data backups; the existing backed-up BMI profile field remains as-is.
- Keep implementation in the Weight module and shared neutral storage helpers if useful. Do not add Weight-specific state or rendering branches to App.jsx. If a generic registry capability is needed, define its contract and extend the registry contract test.
- Preserve four-language parity, keyboard/touch access, dark mode and narrow-screen layout. The settings button exposes an accessible name, expanded state and panel relationship; disclosures remain keyboard operable with visible focus.
- Do not commit without user approval. Implementation starts on a focused feature branch from develop. Planning alone does not update release metadata or publish a release.

## Implementation sequence

1. Add validated Weight display-preference persistence and hydrate the dashboard's graph choices without persisting transient chart selection, entry drafts, or disclosure state. Verify existing module navigation preserves the preferences.
2. Wire the existing selected average into the tooltip primary value and give that tooltip its Average-mode purple background. Remove the duplicate average text and handle unavailable averages without changing calculations. Preserve existing displayed precision unless a precision change is explicitly agreed.
3. Render the BMI legend from visible bands and remove its descriptive text.
4. Add the compact graph-settings disclosure and collapsed History disclosure. Keep period controls and the History count visible.
5. Update focused tests, affected browser workflows and reviewed visual baselines. Update README, architecture and manual-testing documentation to describe persisted choices and the new compact layout.
6. When preparing the release branch, freeze scope and update version metadata, changelog and all four localized What's new notices. Finalize this plan only after shipped scope is fully captured there.

## Verification

- Run npm test, npm run lint, npm run build, and git diff --check after implementation.
- Test preference round trips, absent/malformed preferences and blocked storage; verify reload and offline reuse through browser workflows.
- Test that Average mode uses the existing selected average in the tooltip and preserves the hero, removes duplicate text, and handles zero to four measurements, one average point, older chart periods and backfilled/edited/deleted readings correctly. Existing arithmetic tests remain unchanged and must pass.
- Test legend entries against the rendered bands, including a single visible band, multiple bands, zones off and under-18 profiles.
- Test settings and History toggles with keyboard and pointer, expanded-state accessibility, filtered counts, entry editing and retained graph choices after returning from entry screens.
- Run affected production browser workflows across Chromium, Firefox and WebKit, accessibility checks and Windows visual comparisons. Review 320px/375px and desktop layouts in all four languages and both themes. Perform the relevant physical-phone touch/PWA smoke checks from docs/TESTING.md where a device is available; record any unperformed device checks.

## Acceptance criteria

- Average mode shows the selected existing average in the purple tooltip without an extra label or duplicate average sentence; recorded mode keeps the blue tooltip and recorded value. The hero is unchanged.
- Existing change indicators, BMI, Goals, measurements and averaging rules are unchanged.
- Every BMI legend entry corresponds to a band actually drawn, with only its swatch and numeric range visible.
- Graph settings and History consume a compact collapsed row by default and remain accessible when expanded; period selection stays visible.
- Last graph preferences survive closing/reopening the app and work offline. Malformed or inaccessible preference storage does not prevent use of the dashboard.
- All required automated checks pass and relevant documentation reflects the new behavior.

## Verification record

- Release gate for 1.9.1: npm run test:release passed with 202 unit tests, lint, production build, 202 Playwright checks (180 across three browsers plus 22 visual baselines), and git diff --check. Version metadata, changelog and all four localized notices match the frozen scope.
- Unit tests: 202 passed across 28 files. Lint, production build and git diff --check passed.
- Chromium functional workflows passed, including disclosure keyboard behavior, History editing/return, persisted graph choices and offline period reuse. Four-language, two-theme accessibility checks include expanded controls.
- Final affected browser workflows, target-line checks, tooltip contrast and visual snapshots passed across Chromium, Firefox and WebKit (88 checks). The common scale fits both series and does not move when Average is toggled. Selected dates remain selected across modes wherever an average exists.
- Firefox page creation required running outside the filesystem sandbox. The complete Firefox regression and visual suite then passed (81 checks); subsequent affected checks cover the final scale in all three engines.
- Physical-phone touch, installed-PWA launch and deployment-upgrade smoke checks have not been performed in this environment.
- User clarification: "blue card" means the selected-point tooltip, not the hero. The tooltip alone displays the selected average and gains a purple background in Average mode. All earlier proposed hero changes have been removed.
