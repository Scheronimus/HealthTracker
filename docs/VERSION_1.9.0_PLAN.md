# Version 1.9.0 plan

Status: production integration implemented on `feature/goals-integration`; verification recorded below. Record measurements and Weight target are the agreed delivery scope; maintenance/activity discovery is deferred.

## Current delivery decision

Target completion: after the final target receives its fifth consecutive qualifying average, show a lasting gold trophy celebration with the target value and achievement date on both overview and detail. Show the completed progress bar, retain actual current-average/chart access and dated milestone history, and preserve completion after rebound/reload. Do not celebrate a single below-target entry. Keep the visual calm and accessible, without a blocking dialog or repeated animation.

Full Goals overview: hide the add button when both singleton goal types exist and restore it after a goal is removed. No explanatory message is needed.

Weight graph addition: a Target goal contributes labeled final-target and next-milestone gold lines, enabled by default. Separate switches hide each independently for the session; without a target there are no lines or switches. Reference values extend the chart range; coinciding visible milestone/target values share one line while remaining independently selectable. Updates follow goal edits, confirmation and deletion through a catalog capability, without cross-module imports. Verify rendering, calculations and four-language narrow light/dark behavior.

Chart addition verified with 197 passing unit tests, lint/build/whitespace checks, and 18 passing Goals browser scenarios across Chromium, Firefox and WebKit. Browser checks cover independent switches, default visibility after reload, absent controls after deletion, and Weight/Goals accessibility in all four languages and both themes at 320px. The narrow production chart was visually inspected using synthetic data.

Integration verification: 195 unit tests, lint, production build and whitespace checks pass. All 162 functional browser scenarios passed across Chromium, Firefox and WebKit; three additional two-reading reminder checks also passed. All 18 existing Windows visual baselines pass. Goals coverage includes missing-day examples, persisted ordering, real entry/chart navigation, backups, offline creation and four-language light/dark accessibility at 320px. The integrated mobile overview was visually inspected. Physical-device installation/keyboard checks remain for release preparation.

The user has now requested production integration of the two agreed designs: **Record measurements** and **Weight target**. These are the 1.9.0 delivery priorities. Defer Weight maintenance and Activity goals to a later release; their discovery notes and prototype examples below remain reference only, not accepted 1.9.0 scope.

Preserve the locked UI while replacing synthetic data and memory-only interactions with the real module catalog, local persistence, sequential schema migration, non-overwriting JSON restore, backup-change tracking and generic navigation to measurement entry and the Weight graph. Goals must remain a non-measurement module and must not import another health module. Retain the no-commit-without-approval workflow. The prototype is a coherent verified checkpoint before production integration.

The user has agreed that missing dates use the latest actual recorded weight as a derived calculation value. Use up to five available effective calendar days for each daily average, without inventing values before the first measurement. Five consecutive qualifying averages confirm; a nonqualifying average resets the current streak. The two day-1/day-2/day-7 acceptance examples are automated tests. This supersedes the historical provisional prototype policy below. Required acceptance includes singleton limits, persisted priority ordering, permanent dated achievements, all four languages, accessible due/done states, reload and backup recovery, and unchanged Weight/Blood Pressure validation and offline behavior.

## Purpose and working name

The sections below preserve earlier discovery. The current delivery decision above takes precedence. The implemented reminder schedules are daily or selected weekdays, with one Weight entry or one/two Blood Pressure readings. Targets support loss and gain with matching directional confirmation rules. Changing target settings retains earlier achievements separately. No release version metadata is changed on this feature branch.

Introduce an optional area where users define personal goals, see what needs attention, and track progress using their locally stored data. Working name: **Goals**; revisit naming after the workflows are agreed. The earlier Coach backlog proposal is the starting point, narrowed here to user-defined goals rather than health guidance.

## Proposed release scope

### Measurement consistency

- Let users choose a measurement module and how often they intend to enter data.
- Show an actionable reminder on the Goals page while an entry is due; a qualifying saved measurement satisfies it automatically.
- Daily Weight entry is the initial reference workflow: today's reminder remains until today's Weight entry exists.
- Define supported schedules before implementation: daily, selected weekdays, every N days, and N entries per week are candidates, not all committed features.
- Define start dates, period boundaries, whether Blood Pressure expects one or two readings, and handling of backfilled/edited/deleted measurements. Existing measurement validation continues to apply.
- Reminders are in-app. Do not promise notifications while the app is closed.

### Weight target and milestones

- Let users set a target weight and optionally choose a milestone interval, including 0.5 kg, 1 kg, and 5 kg.
- Show factual progress toward the target and the next milestone, with supportive acknowledgment of achievements.
- Confirmation has two layers: calculate a rolling five-day average, then require five qualifying average values in a row to meet the threshold. With daily entries, this means five daily five-day averages. Missing-day handling remains open as described below.
- Once confirmed, an achievement stays locked when subsequent averages rise again.
- Derive milestone values from a defined starting weight, stop at the exact target, avoid duplicate target milestones, and use decimal-safe comparisons.
- Decide whether the first release supports weight reduction only or also weight gain. The requested “under the value” rule currently describes reduction; gain would require a corresponding above-threshold rule.
- Decide strict below versus at-or-below, the starting-weight source, treatment of a goal already met when created, and whether pre-start history contributes to averaging or achievement.

### Weight maintenance

- Let users set a reference weight and independent optional upper/lower tolerances in kilograms. An empty tolerance disables that bound; zero is an active bound. Require at least one active bound.
- Show an in-app attention state after the average remains outside an enabled bound for the agreed five-day duration.
- Example: reference 80 kg, upper tolerance 1 kg, lower tolerance empty. Only averages above 81 kg contribute to an upper-bound attention state; lower weights do not trigger it.
- Unlike target achievements, maintenance is ongoing. Specify when an attention state clears, and whether switching from above to below an asymmetric band resets the streak.
- Resolve the wording difference between “longer than five days” and the example “five days in a row”: proposed behavior is to trigger on the fifth qualifying day.
- Missing or stale measurements must be visible as insufficient current evidence, rather than being presented as proof of stability.

### Activity goals: planned, deferrable

The user performs workouts in another app and wants motivation and reminders here. Include activity goals in the initial 1.9.0 plan, with explicit permission to move them to a later version if needed. Proposed small scope: a named activity, a schedule, and a manual dated completion check-in. No integrations, automatic exercise detection, workout prescription, duration/calorie analysis, or external health services are proposed.

Define correction/deletion, backdating, duplicate completion, and backup behavior before implementation. Review delivery scope after specifying the three primary workflows; record any deferral explicitly in this plan.

## Calculation decisions to settle

1. **Average definition:** user clarification specifies five average values in a row, each being a five-day average. Working interpretation: on each measured local date, average available recorded weights within that date and the preceding four local dates. Confirm minimum coverage and calendar-window interpretation before implementation. This differs from the existing graph's five-measurement average when dates are missing; explain the distinction in the UI if retained.
2. **Missing days:** the user wants sensible tolerance for missing entries; an automatic reset on every missing day is not agreed. Proposed approach: an unmeasured day neither advances nor immediately resets confirmation progress; only a fresh measured date with sufficient window coverage contributes an average. An observed nonqualifying average resets progress. Agree minimum coverage and a maximum permissible gap before accepting this rule, so widely separated observations cannot claim sustained progress. Do not fabricate readings or count a repeated stale average as fresh evidence. Apply an explicit equivalent policy to maintenance and distinguish unknown status from stability.
3. **Thresholds:** confirm equality behavior, target direction, fifth-day triggering, and maintenance recovery.
4. **History changes:** normal progress recalculates after measurement edits, deletions, imports, and backfills. Specify how permanent achievements relate to corrected source data; persistence must not accidentally revoke them on reload.
5. **Goal changes:** define whether changing target, interval, or start date creates a new goal revision with its own achievements. Propose preserving prior achievements in history rather than silently relabeling them.
6. **Lifecycle:** define multiple concurrent goals, overlap/duplicates, pause, archive, delete, and whether maintenance can follow a completed target automatically. These are decisions, not committed features.
   User decision: goals are optional and can be added, edited, and removed independently. At most one measurement-entry goal, one weight target, and one maintenance goal may exist; multiple activity goals are allowed. Users customize each goal's settings, name, and priority. Target and maintenance may coexist but neither is mandatory. The priority order controls the overview; new goals initially append to the bottom. Any future archive policy must define whether archived goals consume a singleton slot.
7. **Time:** use local-calendar helpers across DST; specify timezone changes and evaluation on reopening after days away. A background timer must not be required for correct results.

## Experience

### Record measurements design: agreed and locked

On 21 October 2026, the user accepted and locked the current measurement reminder design. Preserve it unless the user reopens it:

- Missing scheduled measurements stand out with an amber surface/border, attention icon, To do today label and primary entry action.
- Completed reminders become muted grey with a checkmark and All done label. Hide the completed Weight entry action and show the next occurrence.
- Unscheduled dates remain neutral with Nothing due today.
- Keep reminders configurable and preserve accessible contrast, text/icon cues, four-language parity and dark mode.

This locks the UI direction alongside Target, not the entire release scope. Production measurement integration, persistence, backup and schedule-rule verification remain required; the current implementation is an isolated prototype.

### Target goal design: agreed and locked

On 21 October 2026, the user accepted the current Target goal design and locked it for now. Preserve this agreed UI unless the user reopens it:

- A start date determines the baseline from the exact-date or latest earlier measurement, with date selection bounded by available history and today.
- Overall progress is the main visual, with a start-to-target bar, a gold next-milestone marker and current average. No large percentage or distance-covered sentence.
- A trend arrow aligned with the current average opens the Weight chart; retain its color and do not add a separate hyperlink or visible trend explanation.
- Milestones align to the chosen interval rather than inheriting baseline decimals, and include the exact final target.
- Only consecutive qualifying averages produce green dots. A nonqualifying average resets the active streak to zero; five confirm an achievement permanently.
- Achieved milestones expand to show weights and achievement dates.

This acceptance locks the UI direction, not the full release scope or an implementation-ready data contract. Production integration, persistence/migrations, backup/restore, and the previously unresolved missing-day policy still require completion. The current prototype remains memory-only.

Accepted UI direction: a focused overview and individual detail pages. Start with the isolated interactive prototype in `prototypes/goals/` to review all four goal types before connecting persistence and calculation rules. This prototype uses demo data and memory-only interactions; it is not the production module.

The simulated motivation-focused review is recorded in [GOALS_UX_WALKTHROUGH.md](GOALS_UX_WALKTHROUGH.md). Its main finding is that the prototype currently supports configuration better than daily progress. Proposed next design milestone: a coherent synthetic entry-to-milestone journey, retaining the clean overview. Recommendations remain subject to product agreement.

- Proposed Goals dashboard: due measurement reminders, active target progress with next milestone and five-day confirmation progress, maintenance status, and achieved milestones.
- Empty state explains supported goal types and offers goal creation.
- Distinguish insufficient data, progressing, confirmed achievement, and maintenance attention without medical judgments or punitive missed-day language.
- Choose whether to offer navigation from a reminder directly to the owning measurement form through a generic shell capability.
- Respect visible-module preferences. Define behavior when Weight or Blood Pressure is hidden while a related goal remains active; hiding a module must not delete data or goals.
- Keep all functionality equivalent in English, Spanish, German, and French, with keyboard, touch, narrow-screen, and dark-mode support.

## Architecture and persistence

- Goals is a cross-module feature, not a new health measurement type. Extend the catalog/registry contract to support non-measurement modules through generic capabilities; do not invent goal measurements to fit the current contract.
- Keep App.jsx as the generic shell, without goal-specific rendering, state, CRUD, or transfer branches. Update registry contract tests for the revised capabilities.
- Goals must not import Weight or Blood Pressure. Define a neutral read interface or catalog-provided capability for goal-relevant observations/calculations; keep measurement-specific logic with its owning module.
- Reconsider the third-module cleanup explicitly: module-owned styles/translations, demo capability registration, transfer compatibility exports, and namespaced moduleSettings. Decide and record the required subset before implementation; any deferral needs a rationale that avoids expanding existing coupling.
- Draft a persisted goal model covering stable IDs, discriminated goal kinds, configuration, start dates, lifecycle, and durable achievements. Keep goals separate from measurement records. Do not finalize shape until the rules above are agreed.
- The current store is schema v6. Any persisted addition requires the next schema version, a sequential migration preserving all existing measurements/profile data, and old-to-current migration tests.
- Complete JSON backups must include goals and durable achievements. Validate before merging; matching IDs retain local records. Specify goal/achievement references and atomic merge behavior so restore cannot attach an achievement to an incompatible goal configuration.
- Include goal changes in meaningful-backup-change detection and make goal-only stores eligible for complete backup/recovery.
- Keep browser localStorage, offline/installable operation, and deployment base /HealthTracker/. No accounts, backend, telemetry, or external integrations.

## Implementation sequence after specification agreement

1. Settle schedule, average, streak, threshold, lifecycle, naming, and activity scope decisions; refine acceptance examples.
2. Agree generic non-measurement module contracts and necessary modularity cleanup.
3. Add goal schema, migration, validation, backup/merge, and calculation tests.
4. Implement measurement reminders, weight targets/milestones, and maintenance UI with all four languages.
5. Implement planned activity check-ins, or explicitly record a scope decision moving them to a later version.
6. Verify accessibility, mobile/PWA behavior, release documentation, and localized What's new content. Freeze scope on release/1.9.0 and update version metadata there.

Implementation work starts on a focused feature branch from develop. Do not commit without user approval.

## Verification and acceptance

- Daily Weight reminder disappears after today's entry; unrelated dates do not satisfy it. Editing/deleting/backfilling entries follows the agreed schedule rules.
- Test exact thresholds, decimal milestones, final partial intervals, insufficient average history, missing days, fifth qualifying day, and DST/year/month boundaries.
- With complete daily data, verify five successive rolling five-day averages: the first is available on day five and the fifth on day nine, assuming no pre-start history contributes. Test missing-day coverage and gap limits once agreed; absent days must never create confirmation evidence.
- Test durable achievement behavior after a later rebound, reload, source corrections, goal edits, backup, and restore.
- Test asymmetric maintenance tolerances, disabled versus zero bounds, equality, five-day crossing, recovery, and insufficient/stale data.
- Existing Weight and Blood Pressure workflows and valid historical measurements remain intact.
- Test migration from every supported schema, malformed goal data, unsupported goal kinds, ID collisions, and full JSON round trips including goal-only data.
- Test the updated catalog/registry contract, hidden-module behavior, backup change detection, and translation parity.
- Run npm test, npm run lint, npm run build, and git diff --check for implementation changes; run the release browser/accessibility/offline/visual gate before release.
- Extend docs/TESTING.md with goal scenarios and perform the relevant physical-device smoke tests. Update README.md, docs/ARCHITECTURE.md, privacy/recovery documentation where affected, technical debt, changelog, and all localized release notices alongside implementation.

This planning-only change requires documentation review and git diff --check; application checks are deferred until code changes.

## Overview/detail prototype

Measurement reminder visual states: scheduled-but-missing entries use a warm amber surface/border, attention icon, To do today label and primary entry action. Completed reminders use a muted grey surface/title/icon with a checkmark and All done label; the Weight entry action disappears and the next occurrence remains visible. Unscheduled dates show a neutral Nothing due today state. Preserve contrast, text/icon cues, four-language parity and dark mode. This change is limited to measurement reminders; the locked Target UI is unchanged.

Chart navigation now uses the trend arrow itself, without a separate hyperlink. Preserve its trend color on interaction and vertically align it with the current-average text. Maintain a keyboard focus indicator and accessible chart-navigation label.

Compact trend refinement: remove the visible trend headline and explanatory paragraph. Place a physical weight-direction arrow next to the current average (falling/rising/unchanged; dash if two recent averages are unavailable), with tooltip and accessible comparison text. Add View weight graph. In this isolated prototype it reuses the actual WeightChart component with the same memory-only demo readings and supports returning to the originating overview/detail. Production integration must provide generic module navigation rather than a Goals-to-Weight import or goal-specific App branch. The prototype wrapper lives outside health modules; production code and health storage remain unchanged.

A vertical marker on the overall bar locates the next unconfirmed milestone on the full start-to-target scale. Its accessible label and hover title name the milestone; it moves after confirmation and disappears after all milestones are confirmed. The large percentage stays removed.

Milestones align to interval boundaries after a full first step rather than inheriting a fractional baseline offset: 92.04 kg with 1 kg yields 91, 90, 89…; 0.5 kg yields 91.5, 91, 90.5…. Include the exact final target once. The recorded starting weight remains unchanged for overall progress.

The Goal start date picker is bounded by the earliest recorded Weight date and the current demo day; manually entered out-of-range dates are clamped to those bounds. Without measurements, disable date selection and goal saving, and offer Record your first weight. After entry, return to the preserved draft with an eligible date selected.

Target baseline refinement: replace the editable starting-weight field with a user-selected Goal start date. Resolve the exact-date Weight entry, falling back to the latest earlier entry, never a later measurement; show its weight and actual recorded date. Reject future/invalid dates and block saving if no eligible measurement exists. Offer entry creation and return to the preserved draft. Date changes update preview/progress, preserve earlier configuration achievements separately, and use the selected date when evaluating historical confirmation. This remains prototype-only and does not change production persistence.

Accepted target hierarchy refinement: lead with a prominent overall start-to-main-target progress block (percentage, bar, full distance, current average), then factual trend, then the next milestone as motivation. The milestone displays only filled green dots for the current consecutive qualifying-average streak. One qualifying average means one dot; four means four; a nonqualifying average resets to zero, with no red/failure dots. Five confirms and locks the achievement. Achieved milestones opens directly from the overview to show each value, achievement date and five green dots. Missing-day tolerance remains provisional and unchanged by this visual refinement.

Load demo data on the overview visualizes 30 synthetic daily weights, a target with calculated achievements, a Weight reminder, and two activities. Replacing existing prototype work asks for confirmation. Real health storage and production demo generators are unaffected.

### Motivation-loop follow-up

Target refinement: lead with a factual direction headline rather than confirmation mechanics. The overview shows direction, a brief comparison, current average and next milestone; confirmation dots, coverage rules, and achievement history move into Milestone details. Record goal presentation remains unchanged.

The prototype compares complete, non-overlapping five-day averages (current five dates versus preceding five dates) when sufficient in-goal data exists. Earlier feedback explicitly compares with the starting weight. Sparse data says that recent direction is unavailable. This describes movement toward/away or unchanged averages without judging health, predicting completion, or claiming deadline adherence. Movement away can coexist with retained achievements. The comparison is a prototype design choice to review.

The prototype now implements the UX review's core synthetic journey: empty personal weight fields, optional generated/custom titles, milestone chips and preview, opt-in reminder creation, a dated demo Weight form, automatic Weight reminder completion, and progress/coverage on both overview and detail. Activity completion is dated with due/next occurrence and Undo. Validation messages identify the specific field and focus it. Changing target settings separates previous achievements from new confirmation history.

Labelled synthetic confirmation, rebound, and missing-day scenarios are available in target details. The demonstration requires complete five-calendar-day windows and five consecutive averages, with strict directional comparisons; this conservative policy is **not** acceptance of the unresolved production missing-day rule. Confirmed achievements survive later increases within the same goal configuration. No real measurements are read, invented, or overwritten.

Run `node --test prototypes/goals/journey.test.mjs` for the isolated prototype calculations in addition to normal repository checks. The prototype stays outside the production bundle and uses only memory: reload/backup, real module navigation, production goal migrations, full maintenance streak behavior and Blood Pressure measurement entry remain later work. Those limitations must not be presented as completed release features.

- Run `npm start`, then open `/HealthTracker/prototypes/goals/index.html` on the Vite development server. The normal production build does not include this separate entry point.
- Review Today's reminders, target progress, next milestone confirmation, maintenance summary, and the expandable completed section.
- Open each goal's detail page, simulate a measurement, complete/undo an activity, and return to the overview. All interactions reset on reload and never access health storage.
- Switch among all four languages and both themes; review at 320px, phone, and desktop widths with keyboard and touch.
- The add action creates configurable goals. Existing singleton types open their editor instead of creating duplicates; activities can be added repeatedly. Edit names, notes, schedules, measurement module/reading count, weights, milestone intervals, and independent bounds. Empty milestone interval disables milestones; empty bounds disable only that bound, and zero is allowed.
- Use Move up/Move down buttons to order every goal by priority, including activities. Remove goals from details with confirmation. An empty overview offers goal creation.
- Revised visual direction: remove all visible priority numbers/type headings and normal-mode arrows. Show clean, compact goal surfaces in user-defined order. An Arrange mode reveals pointer/touch drag handles, keyboard Up/Down reordering, and optional tap arrow controls; Done returns to normal browsing. Test drag cancellation and focus retention alongside narrow layouts in all four languages/themes.
- Goal CRUD and ordering are memory-only prototype interactions. Archive, real calculations, migration, backup, and production navigation remain implementation work. Static progress claims have been replaced by an explicit unconnected-data state so custom settings do not appear to have fabricated achievements.
