# Goals: motivation walkthrough

Date: 14 October 2026. Reviewed the current isolated Goals prototype through Chromium at 375px phone width, including screenshots of the overview and target details. This is a simulated persona walkthrough by the development agent, not a study with a real participant. First-person reactions below are illustrative interpretations; observed interface behavior is identified separately. No medical suitability of the fictional target is implied.

## Persona and intended outcome

Alex wants to move from a self-chosen 92 kg starting weight toward 84 kg, using 0.5 kg milestones to make the distant target feel manageable. Alex sometimes misses measurements and loses motivation when a later reading rises. The desired experience is a brief daily visit: know what to do, record a weight, see evidence of progress, and retain a sense of achievement through setbacks. Alex also wants a personally chosen walking reminder, with workouts tracked elsewhere.

## Main use cases and actual walkthrough

| Use case | Action attempted | Observed result | Interpretation |
| --- | --- | --- | --- |
| Get started | Open empty overview and Add a goal | Empty state and four goal types are available | Starting is straightforward, but benefits of each type are not explained at selection |
| Create weight target | Set 92 kg start, 84 kg target, 0.5 kg milestones; use a personal name and note | Saves successfully; opens a detail page listing settings | “I have filled in a form, but what is my first small win?” |
| Understand milestones | Look for next milestone and open confirmation disclosure | Interval is shown; generated milestone values and confirmation progress are absent; disclosure describes five qualifying five-day averages | “Is my next goal 91.5 kg? When will it count?” |
| Establish a weighing habit | Separately create a daily Weight measurement goal | Additional goal can coexist with target | Requires another setup; target creation does not offer the related reminder |
| Record today's weight | Open reminder and select the simulated entry action | Completion changes to Done today and Undo completion; no actual weight form or target change | Expected prototype limitation; cannot demonstrate the essential entry-to-progress loop |
| Support a chosen activity | Add Walk after lunch, selected weekdays, then mark complete | Monday/Wednesday/Friday are preselected; completion changes to Done today | Custom activity is easy to add, but preselected days may go unnoticed |
| Check the overview | Return after both completions | Three compact cards show target configuration and reminder completion | Cleaner visual hierarchy, but target card lacks current average, next milestone, or progress |
| Set priority | Arrange goals using handles or keyboard | Previous browser verification established drag, keyboard focus, cancellation and Done mode | Ordering is available without normal-view clutter; this is not the main motivation gap |
| Correct configuration | Edit the target from 84 kg to 83 kg | Updated configuration saves | No explanation of consequences for existing milestones/history; those are not modeled yet |
| Recover from a form mistake | Select weekdays but clear every day, then Save | One generic error refers to weekday selection, maintenance bounds and weight targets together | The form rejects the input, but the message includes unrelated rules |
| Return later | Reload | Overview becomes empty, as the prototype banner explains | Deliberate memory-only behavior; daily engagement and long-term motivation cannot be evaluated yet |

## Main UX problems, ordered by impact

### 1. The daily motivation loop is missing

**Observed:** target overview/detail presents starting weight, target and interval rather than actual progress. The detail explicitly says measurements are not connected. Completing a simulated measurement does not change the target.

**Impact:** the user cannot answer “Am I moving toward my next milestone?” or see a payoff from returning. This is the largest functional prototype gap. The layout should reserve prominent space for progress even before production calculation work is complete.

**Proposed next design:** show current average with date/coverage, the next milestone, distance to it, and confirmation progress. Offer one clear next action. For no data, say what is needed and offer Record weight. For a connected-data design review, use explicitly labeled, coherent synthetic scenarios rather than real or fabricated user achievements.

### 2. Setup feels administrative and supplies arbitrary personal values

**Observed:** the new target form is prefilled with 85 kg, 75 kg and 1 kg, independent of the user's measurements. The name is another required field. No generated milestone preview is shown.

**Impact:** defaults can look like recommendations or the user's own values. Users must understand the algorithm before seeing its benefit.

**Proposed next design:** derive starting weight from available local records with its date and allow correction; otherwise require an empty input. Leave target empty. Offer milestone chips (0.5 / 1 / 5 kg / none) and a preview such as 91.5 → 91 → 90.5 … 84 kg. Make a custom title optional with a generated default. Keep the personal motivation note optional.

### 3. Goal setup and today's action are disconnected

**Observed:** target and reminder require separate creation flows. A reminder requires opening details before completion. The prototype offers no navigation to the actual Weight entry form.

**Impact:** routine actions take extra navigation; the user must design their own habit system.

**Proposed next design:** after target creation, optionally offer Add a weighing reminder, respecting the singleton limit and keeping it opt-in. Give due measurement cards a Record weight action and activity cards a completion action with Undo. A target remains valid without a reminder.

### 4. Confirmation and setbacks are hard to predict

**Observed:** confirmation explanation is behind a disclosure, uses “qualifying” without coverage details, and says missing-day rules are undecided. Locked achievements and rebound states cannot be exercised.

**Impact:** delayed acknowledgment may feel like failure when a reading already crossed the milestone. A missing day may create uncertainty.

**Proposed next design:** distinguish Reached the value / Confirming / Confirmed. Show “3 of 5 confirming averages” and which observations contributed. Explain why a measured day did not contribute. For a gap, use a factual pending-data state; settle coverage and gap rules before making promises. Preserve a confirmed milestone visibly after a later rise. Avoid judgmental failure language.

### 5. Schedules are configured but not demonstrated as schedules

**Observed:** overview shows the selected schedule and a generic reminder. Completion is a single boolean, not dated history. Source inspection confirms there is no due-date evaluation. The selected-weekday form initially checks Monday/Wednesday/Friday.

**Impact:** it cannot answer “Is this due today?” or show the next occurrence. A completed action may appear to apply indefinitely until reload.

**Proposed next design:** display Due today or Next: Friday, with date-based completion and correction. Only due items should ask for today's action. Do not preselect weekdays silently. Keep completed goals accessible without letting them crowd the next action; preserve the user's relative ordering.

### 6. Custom names conceal goal identity

**Observed:** after removing the priority/type heading, the user-defined name is the only title. The target summary says “Starting weight (kg): 92 → 84 kg”; the reference to the target is implicit.

**Impact:** a motivational name can make the goal's purpose less recognizable. Form labels on the overview feel technical.

**Proposed next design:** retain the clean title, add a subtle goal-type icon with an accessible label, and use concise summaries such as Target 84 kg / Next milestone 91.5 kg. Do not restore priority numbers or large type headings.

### 7. Error feedback does not point to the correction

**Observed:** clearing scheduled days triggers a generic message discussing weekday selection, maintenance bounds and target equality together.

**Impact:** unrelated conditions make a small mistake harder to correct.

**Proposed next design:** field-specific errors, e.g. Choose at least one day, displayed beside the relevant control with accessible association and focus guidance.

### 8. Long-term commitment and changes are not reviewable yet

**Observed:** reload clears goals; there is no dated completion history, archive, milestone history or goal revision model. Removal has confirmation. Editing a target simply changes its settings.

**Impact:** durability, recovery after a missed week, and achievement preservation cannot be tested. These are deliberate prototype gaps, not regressions in production storage.

**Proposed next design:** specify how target/interval changes affect historical achievements before adding persistence. Test reload, backup/restore, corrections, gaps and rebounds once implemented. A pause/archive option is a candidate rather than agreed release scope.

## What already works well

- Users choose which goals exist; the singleton limits and repeatable activities are understandable.
- Personal names/notes allow the user's own motivation rather than prescribed targets.
- Overview spacing and compact surfaces are readable on the inspected phone screenshot.
- Arrange mode keeps ordering tools out of everyday browsing.
- Activity completion is reversible; removal requires confirmation.
- Prototype limitations are disclosed instead of presenting simulated progress as real health results.

## Recommended next prototype milestone

Build one complete, explicitly synthetic weight-loss journey: target setup with milestone preview → due weighing reminder → demo measurement form → updated progress card → five-average confirmation → retained milestone after rebound → missing-data state. Keep the current compact overview and individual details; prioritize this loop before expanding maintenance UI or ordering polish.

Acceptance for that design review:

- A user can identify the next action and next milestone from the overview without opening settings.
- No personal start/target weight is silently prefilled with arbitrary example values.
- A recorded synthetic measurement produces a consistent, explainable progress update.
- Five-average confirmation, a missing day, and a rebound have distinct, understandable states without medical advice or invented measurements.
- Activities use dated demo completions and show the next occurrence.
- Field errors name the specific correction.

These recommendations are proposals, not permission to change the agreed calculation rules or add production features. Validate them with real users when a connected prototype is available.

## Follow-up implementation

The user authorized addressing these findings. The updated prototype now has:

- Empty start/target/reference weights; existing demo measurements can supply a dated starting value. Names are optional, with generated target titles.
- Milestone chips and an immediate preview, plus optional daily reminder creation in the target setup flow.
- A dated demo Weight form, automatic reminder completion from measurements, and overview/detail average coverage, next milestone, confirmation progress and achieved milestones.
- Labelled synthetic scenarios for confirmation, rebound and missing-day coverage. A confirmed milestone stays visible after rebound; missing data is identified explicitly.
- Direct overview actions, dated activity completion/Undo, weekday scheduling without silently selected days, and next occurrences.
- Specific errors associated with fields, plus focus on the first invalid field.
- Compact type icons instead of priority/type headings. Ordering remains in Arrange mode.
- Progress appears before settings in target details; configuration is in a disclosure. Target changes preserve earlier achievements in a separate history.

Verification exercised target creation, reminder opt-in, recording, confirmation/rebound/gaps, dated activity rollover, target revision history, keyboard ordering, four languages at 320px, and accessible light/dark presentation. Dedicated calculation tests cover milestones, strict comparisons, confirmation, locked achievements, sparse windows, weekday schedules, validation, and calendar boundaries.

Still intentionally unresolved: real health-data integration, reload/backup durability, the release missing-day tolerance, complete maintenance confirmation/recovery, and real Blood Pressure entry. The current complete-window rule is a conservative, disclosed demo policy. These remain necessary before release and before a real longitudinal user study.

### Target clarity refinement

Latest simplification removes the trend headline and paragraph, retaining only a physical direction arrow beside current average. A link opens the existing Weight chart component with the same prototype measurements. Trend evidence remains in the arrow's tooltip/accessibility label; insufficient recent comparison data gives a dash. Production cross-module navigation remains a generic-contract integration task.

Later feedback replaced manual baseline-weight entry with Goal start date. The prototype resolves the exact or latest earlier measurement and shows the recorded date. Missing data has a focused explanation and an entry action that returns to the unchanged draft. This removes the need to remember and retype a historical weight. Future dates and dates without any eligible earlier measurement cannot be saved.

Subsequent user feedback put overall advancement first. The target now leads with a full start-to-main-target percentage/bar and distance, followed by direction and then milestone motivation. Only the current consecutive successful-average streak produces green dots; no failure dots appear and a nonqualifying average clears the active dots. Confirmed milestones open as a dated achievement list directly from the overview. Verification covers four green dots, reset to zero, and five-dot dated confirmation, independently from the full-target progress calculation.

The user found the first progress design too complicated to answer “Am I moving toward my target?” The Target overview now leads with direction and its evidence, followed by current average and next milestone. Milestone details holds confirmation dots and rules. Direction compares two separate five-day windows when available; early feedback explicitly references starting weight. Sparse data yields an insufficient-data headline. A recent move away can coexist with retained achievements, so a past success does not conceal a rebound. Record goal presentation is unchanged.
