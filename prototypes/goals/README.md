# Goals overview/detail prototype

Run `npm start` from the repository root and open `/HealthTracker/prototypes/goals/index.html` on the development server. This separate React entry point is excluded from the production build and never accesses browser health storage.

Start empty and add only the goals you want. One measurement reminder, target, and maintenance goal may exist; activities can repeat. Edit names, notes, schedules, weights, intervals, and optional bounds. Confirm removal from details.

## Review the motivation loop

Measurement reminders visually distinguish action from completion: amber To do today when a scheduled measurement is missing, muted grey All done after entry, and neutral Nothing due today on unscheduled dates. Use Next demo day after loading samples to see the reminder become due, then record a weight to return it to grey.

The current average has a compact trend arrow instead of a visible trend paragraph. It indicates actual rising/falling averages rather than the desired goal direction; the tooltip/accessibility label explains the comparison. Without two recent five-day windows, a dash indicates insufficient trend evidence. View weight graph opens the existing Weight module chart with this prototype's demo data; Back restores the goal view. It never loads or changes the real app's health data.

Select **Load demo data** on the overview for 30 synthetic daily weights (92 kg toward 84 kg), automatically calculated milestone achievements, a daily Weight reminder, and two activities. Loading again asks before replacing current prototype work. The example stays memory-only and never accesses real health storage.

1. Add a weight target with a Goal start date and target weight. The starting weight is derived from the entry on that date, or the latest earlier entry, with its actual date shown. If none exists, record a demo weight and return to the preserved goal draft. Future start dates are rejected. The title is optional.
2. Choose a milestone interval and review the generated preview. Optionally add the daily weighing reminder in the same step.
3. Use Record demo weight on the overview or details. A dated demo measurement updates coverage, progress, and the weighing reminder automatically. Duplicate dates and future demo dates are rejected.
4. Use Next demo day to exercise daily return and dated activity completion. Select weekdays explicitly; none are silently preselected.
5. Open target details and Try a demo situation to preview a confirmed milestone, a rebound, or a missing day. These controls replace the demo measurement series with labelled synthetic data. They do not access real measurements.
6. Confirm that achievements stay visible after rebound and older achievements remain separate after a target/interval change.
7. Review English, Spanish, German, and French at narrow widths in light/dark mode.

The demonstration requires all five dates for an average and five consecutive averages for confirmation. This is a conservative prototype policy; production missing-day rules are still undecided. Maintenance shows the current average's position against configured bounds; full sustained-crossing behavior remains unimplemented. Blood Pressure reminders do not open a real entry form in this prototype.

## Ordering

Overall start-to-target progress is now the leading Target visual: percentage, larger progress bar, full distance and current average. The next milestone follows the direction summary. Only successful consecutive averages produce green dots; a miss resets the current dots to zero, never adds red dots. Open Achieved milestones on the overview or detail to see each date and five confirmation dots. Target demo controls include four successful averages and a streak reset.

The Target card leads with movement toward the target, movement away, unchanged averages, or insufficient data. It compares the current five-day average with the previous non-overlapping five-day average when available; otherwise it explicitly compares with starting weight. Current average and next milestone are the main figures. Confirmation dots/rules and achievement history live in Milestone details. Demo situations also include moving toward the target and an unchanged trend.

Select Arrange to reveal drag handles. Drag with mouse/touch, focus a handle and use Up/Down, or use the tap arrows. Done returns to clean browsing. Escape or a cancelled gesture leaves the pre-drag order unchanged. Reordering does not open details.

## Verification and limits

Milestones use interval boundaries after a full first step. A 92.04 kg baseline and 1 kg interval yield 91, 90, 89… rather than 91.04, 90.04…. The exact final target is still included; overall progress uses the unchanged recorded baseline.

Goal start dates are selectable only from the first recorded weight through the current demo day. With no weights, the picker and Save are disabled until the first demo weight is recorded; the goal draft is preserved during entry.

Run `node --test prototypes/goals/journey.test.mjs` for prototype calculations alongside the standard repository checks. Browser verification covers the synthetic journey, dated actions, ordering, narrow layouts and axe accessibility scans.

All goals, measurements, completions and achievements are memory-only and reset on reload. No production schema, local health data, backups, or app version is changed. Physical mobile touch behavior and production integration still require later verification.
