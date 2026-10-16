# Verification — 16 October 2026

## v0.15.0 simpler session editing and deletion

Removed Starting reps, Starting weight and Weight step from the programme exercise editor. Snapshotting now changes only name/set count, preserving previous defaults and increments and truncating per-set presets only when reducing sets. Current-workout editing and historical correction retain actual weight/rep controls.

Added confirmed Delete actions on Training session rows. Deleted templates are marked deleted and disabled internally, keeping indices stable for historical records. Training, sequencing, reordering and programme-only exercise catalogue entries exclude deleted sessions; history remains readable/filterable. Deleted sessions do not count towards the 50-session programme limit. Start, duplicate, pause and stale editor saves cannot revive deleted sessions. Deletion is blocked during a running workout and for the last enabled session. Removing the final unfinished session advances a fully completed automatic rotation once.

Validation: all 97 automated checks pass, including new deletion/history/backup/reorder/capacity/rotation boundary tests and an actual editor/delete flow covering cancellation, hidden default preservation and stale-editor rejection. App, model, store and service-worker syntax plus stylesheet parsing pass. Offline and visible version are v0.15.0. Browser/iPhone layout has not been visually verified. Home-screen range/block redesign is deferred for discussion.

## v0.14.2 clearer workout records

History cards now display logged/planned sets and duration in aligned columns, with an explicit unlogged-set notice. A shared read-only overview presents date, range, logged/planned count, duration and incomplete or complete status in both the saved summary and history detail. Auto-finished workouts retain the last-interaction explanation. Next-session information has its own compact card after saving; workout set tables, grouping and correction controls are retained.

Validation: all 91 existing checks pass, covering actual finish/summary, history navigation, correction and grouped-workout flows as well as model/persistence invariants. App/service-worker syntax and stylesheet parsing passed. Cache and visible version are v0.14.2. No browser or iPhone visual verification is claimed; narrow-screen spacing needs a phone check.

## v0.14.1 compact workout status

Combined range, local-save status, logged/planned set count, elapsed time, progress bar and optional rest timer into one workout card. Set and time values use aligned two-column metrics; rest reset retains its action and timer data attributes. The editing toolbar reads Edit workout with its full accessible label. Save-status hooks and all logging actions remain unchanged.

Validation: all 91 automated checks pass, plus app/service-worker syntax and stylesheet parsing. Offline cache and visible version are v0.14.1. Browser/iPhone spacing has not been visually verified.

## v0.14.0 compact sets and visible superset containers

Previous performance is now an independently collapsible native details panel, closed by default. Its per-exercise open state survives logging, adjustments and comparison changes while the workout remains open; it resets for a new workout or changed exercise layout. Stale detached toggle events are ignored. Collapsing reference data does not collapse the exercise or change its logged data.

Each exercise's sets share one bordered panel with compact rows, a Log/Undo button in the row heading, and side-by-side Weight/Reps columns. On narrow panels, large numeric fields have paired minus/plus controls beneath; on wider panels a container query puts steppers inline. All buttons retain at least 44px touch targets. Repetitive helper copy and per-set outer spacing were removed.

Superset/giant-set members now appear together inside one distinctive amber-bordered container, with a shared title, member count, round instruction and each member's position. Non-adjacent members are collected for display only; original indices, stored order, logging actions, history snapshots and rest logic are preserved. Saved workout summaries/history also present groups together.

Validation: all 91 checks passed. New tests cover read-only non-adjacent grouping without duplicates and an actual-handler flow for collapsed defaults, independently remembered reference toggles through edits/logs, original-index group logging/rest, stale toggle rejection and unchanged historical data. Updated the existing group UI assertion to the new shared-container/member-label presentation. App/service-worker syntax and full stylesheet parsing, including container rules, passed; offline version is updated. Browser/iPhone visual spacing remains unverified here and needs a phone check.

## v0.13.0 visual refinement

Introduced a separate polish.css layer for consistent deep-slate/amber dark mode and warm off-white light mode, system typography, quieter secondary controls, consistent radii and spacing, segmented Training tabs and a less prominent bottom navigation. The selected workout now has a range badge, clear exercise/set counts and Start as its primary action, with edit/duplicate controls below the exercise preview. Training structure is an expandable section with its current mode visible. Session rows have ordered number markers and grouped add/reorder controls. Existing data actions and save behaviour are retained.

Active logging retains the large 56px number controls and Log buttons. Previous performance is separated into a slate reference panel; completed states remain green and finishing uses a restrained amber outline. History, editing controls, tables and other screens inherit the visual system. New styles are cached offline, and the browser theme colour matches the palette.

Validation: all existing 89 checks passed after markup changes, plus app/service-worker syntax. The new stylesheet parsed without errors, including responsive rules. Verified stylesheet ordering and offline-cache inclusion. Key contrast checks: dark text 14.16:1, secondary 6.66:1, amber 8.56:1 and primary button 5.47:1; light main text 13.95:1, amber 5.63:1 and primary button 6.56:1. Light secondary text was adjusted to reach 4.72:1 on the slate reference panel. No browser preview/control capability was available, so visual appearance, viewport overflow and spacing still need an iPhone check; no screenshot verification is claimed.

## v0.12.0 drag to reorder exercises

Programme and today's-workout editors have a Move grip on each exercise, retaining the existing up/down buttons. Pointer dragging snapshots current form values, shows a source and insertion marker, scrolls near viewport edges, and moves the complete exercise object only on release. Draft changes still require Save. A small movement threshold prevents taps from moving/scolling. Pointer cancellation, lost capture, Escape, focus loss, hidden documents and replaced editor DOM cancel safely. No drag handles appear in historical correction or active logging screens. Only the handle disables native touch scrolling.

Groups, per-set presets, increments and logged sets stay attached to the exercise. Existing today-only versus programme saving and rest-timestamp remapping are retained. The service worker caches reorder.js with the release.

Validation: all 89 tests passed. Seven module checks cover insertion geometry, object identity and bounds, primary pointer release-only commits, tap/jitter prevention, cancellation paths, bounded edge scrolling, stale DOM and disabled/secondary pointers. An actual application wiring test passes pointer drag → preserve typed weight/logged state/group → no persistence before Save → Save for today without modifying the template; programme handles, existing arrows and history exclusion are checked. All existing workflows passed, plus app/module/service-worker syntax. Browser/iPhone touch behaviour and visual appearance remain unverified for this release; phone testing is needed for the new gesture.

## v0.11.0 session ordering

Programme has Reorder sessions, with large labelled up/down controls, a draft preview and explicit Save order/Cancel. Reordering is blocked while a workout is running. It changes a separate programme sequence, leaving template indices, session IDs and every historical snapshot unchanged. The existing next workout and completed rotation markers stay intact. Future advancement follows the custom order and skips paused sessions. New sessions append; mode changes and backups preserve order; a new programme import resets order to its supplied list.

Saving checks that the session identities and original order still match, rejecting concurrent programme changes. Invalid/malformed order data is rejected. Paused-next backup recovery respects custom order. Training lists and History filter options follow the saved sequence. Failed save retries finish the order screen correctly, and cancelling discards the pending order action.

Validation: all 81 tests passed. Seven model checks cover historical/identity isolation, manual wrapping and pauses, automatic phase progression, partial rotations, append/mode/import/backup behaviour, invalid/stale/active save rejection and ordered backup recovery. An actual-handler VM check covers labelled/escaped preview, draft moves without persistence, navigation-discard cancellation, Cancel unchanged, Save, displayed and filter order, pinned next/completed state, active-workout blocking, subsequent advancement and backup restore. App and service-worker syntax passed. Browser/iPhone visual QA remains unverified for this release.

## v0.10.0 training progress

Training has Programme / Exercises / Progress views. Progress provides 4-week, 12-week and all-time filters, plus All / Heavy / Medium / Light / No tag ranges. Summary totals count finished workouts with actual logged sets, logged sets, reps and lifting volume (sum of recorded load × reps). Unlogged sets and active workouts are excluded. Date windows use local calendar days and exclude future starts.

Choose any previously logged exercise for a date-spaced SVG chart of its highest actual load per workout, with exact values in the newest-first list below. Single-point and zero-load histories render without invented points; no matching data has an explicit empty state. Global kg/lb changes chart, records and volume display. New load records require earlier actual logged sets and compare against earlier records outside the selected window too; historical corrections recalculate results. Workout links open the full record and Back returns to Progress retaining filters. This is the first progress slice; no estimated strength index is introduced.

Validation: all 73 tests passed. Six new logic checks cover empty data, local date boundaries/future/active exclusions, exact sets/reps/volume arithmetic and date points, all range filters, record comparisons outside the date window and correction recalculation, renamed identities and read-only analytics. An actual-handler VM test checks rendered chart/list, escaped names, range/date/exercise controls, kg/lb conversion, no-data and zero-load rendering, and workout/back navigation with preserved filters. App and service worker syntax passed. Browser/iPhone visual QA remains unverified for this release.

## v0.9.0 exercise library and history

Training has Programme / Exercises views. Exercises defaults to a compact no-image list of actually logged exercises ordered by latest recorded session, with live search, latest logged weight/reps and unique workout count. All my exercises also includes programme-only exercises clearly labelled as having no logged history. Exercise details show actual latest sets, heaviest logged load and newest-first session/set tables, with All / Heavy / Medium / Light / No tag filters. A Workout button opens the full historical record; Back returns to the exercise details and selected range.

Programme and today's editors offer Choose from library and library-backed Replace. Search updates just the result list without replacing the focused input. Picker Back preserves the draft. A name-only custom exercise form creates an editable draft exercise. Adding/replacing does not save until the existing session-editor save action. Today's replacements confirm removal of logged sets, retain target group membership, and create unlogged sets; matching-range actual previous sets prefill when available. Source group membership is not copied when adding. Earlier history remains unchanged; the existing explicit today-only versus future-programme choices still apply. The service worker includes the new exercises.js module.

Validation: all 66 tests passed. New logic checks cover honest empty history, unique workout counts, exclusion of unlogged drafts, chronological/range filtering, real heaviest loads, renamed/deleted exercise discovery, alias search, independent reuse of IDs/presets/increments, correct target groups, no copied logged flags and matching-range prefills. An actual-handler VM flow checks library/search escaping, live search, range detail, full-workout/back navigation, picker cancellation and preservation of draft edits, template replacement, logged-replacement confirmation, today-only saving and custom creation. Existing group/editor tests passed, and app/service-worker syntax passed. Browser/iPhone visual QA remains unverified for this release.

## v0.8.0 supersets and giant sets

Programme and today's-workout editors now include an expandable Supersets & giant sets panel. Select any two exercises (including non-adjacent rows) and Group selected for a superset; three or more form a giant set. Ungroup selected removes chosen memberships; Ungroup removes an entire group. Exercise order stays unchanged, singleton remnants are cleared on save, and draft changes require the editor's existing save action. Replacing today's exercise keeps its group membership.

Existing imported string group markers are recognised automatically. Group badges appear in programme previews, active exercises, finish review and saved summary/history. Groups are workout snapshots and survive backup/import/duplication. Editing a future template does not change old groups in history. No automatic exercise opening, advancement or collapse was added.

Individual set timestamps are retained, but grouped rest starts only once every exercise with that round's set index is logged. Unequal set counts use the remaining participants. Undoing a group member restores the most recent completed round or standalone set. Duplicate logs do not restart rest. Today's reorder/group changes recalculate eligible rest while retaining a manual reset if the underlying completed-round timestamp is unchanged.

Validation: all 59 tests passed. Seven model checks cover non-adjacent grouping, giant sets, regrouping/singleton cleanup, full-round/out-of-order/undo rest, unequal set counts, snapshot/backup/import/duplicate preservation, invalid metadata, and today's reorder/save behaviour. One end-to-end VM test uses actual application editor/action/snapshot/submit handlers for group → save template → start/log without forced collapse → group today only → finish review → saved history → ungroup future template → unchanged historical group → backup restore. App/service worker syntax checks passed. Browser/iPhone visual QA remains unverified for this release.

## v0.7.0 edit today's workout

Active workouts offer Edit today's workout. The dedicated draft editor supports names, per-set weights/reps, adding/removing sets (1–12), adding/removing/replacing exercises, and reordering. Existing logged states travel with the exercise. Removing/replacing an exercise or last set that is logged requires confirmation; Cancel discards only the edit draft. Save for today changes only the running workout; Save today & programme explicitly also replaces this session's future exercise list/name and per-set starting values. It preserves the template's range policy, workout phase/start time, earlier history and programme position. Future starting values contain no logged flags.

Save checks the workout identity, inactivity expiration, and an exact original active snapshot; permanent edits also check the original template. Conflicting edits are rejected rather than overwriting another tab. Candidate data is validated before applying either update. Rest timestamps are remapped when exercises move and removed when their logged sets are removed.

Validation: all 51 model tests passed, including today-only isolation, reordered logged sets/rest undo, removal timer behaviour, explicit future template updates, unchanged historical snapshots, stale/expired save rejection and invalid draft atomicity. Actual application action/snapshot/submit handlers passed Add/Reorder → Cancel unchanged → protect removal of a logged exercise → Save for today without template changes → reopen → Save today & programme. Existing duplication/tag editor workflows also passed; app and service worker syntax passed. Browser/iPhone visual QA remains unverified for this release.

## v0.6.2 duplicate session

Training now offers Duplicate session beside Edit name & tag. It opens an unsaved draft with a unique copy name, a new session ID and independent cloned exercises, preserving range tag/default inheritance, per-set presets and increments. Exercise IDs remain shared because these are the same exercises, supporting existing performance references. A paused source produces an enabled copy. Save appends and selects the new session; Cancel leaves state untouched. History and the active workout are not copied or modified. The existing 50-session limit is enforced before opening and on save.

Validation: all 45 model tests passed. Actual application action/snapshot/submit handlers passed duplicate → cancel unchanged → duplicate again → rename/retag → save → select copy → backup restore, with the source unchanged and no added history. App syntax passed. Browser/iPhone visual QA remains unverified for this release.

## v0.6.0 session names and training tags

v0.6.1 discoverability: confirmed the public v0.6.0 app.js contained the tag selector and manual structure option. Added Edit name & tag immediately under the selected session name, moved Training structure above the programme session list, and made the editor label explicitly name Heavy / Medium / Light. The existing actual-handler VM check passed again, with additional checks that the shortcut opens the editor and the structure form precedes the session list. App syntax passed. No data schema or training behaviour changed. Browser/iPhone visual confirmation remains outstanding.

Added independent session names and optional Heavy, Medium (stored as Mid for compatibility), Light or no-tag values in Add/Edit Session. Existing sessions continue following their automatic rotation unless explicitly changed. Training structure can switch to session tags, which keeps the session sequence but stops automatic range changes. Mode changes are blocked during an active workout. Session edits preserve past workout names and tags. Programme import and full backup restore retain tags and the selected structure.

Validation: all 43 model tests passed, including six new tests for tag snapshots and backup restore, 28 manual sessions without automatic range changes, fixed and no-tag overrides without stalled rotation, matching-range prefill, mode-change protection, and programme import/invalid data rejection. A VM check using the actual application editor, snapshot and submit handlers passed Add Session → choose Medium → Add Exercise without losing the tag → save → switch to session tags → reopen → backup round trip → start with the saved name/tag. App and service worker syntax checks passed. Browser visual QA was unavailable for this change; iPhone appearance remains to be confirmed.

## v0.5.0 workout review and result columns

### Backup round trip — 16 October 2026

The live app's Download backup control produced a valid JSON backup in the direct, isolated sandbox app. After changing the test unit preference, Restore backup restored the file successfully. A second downloaded backup matched every original field exactly except the internal revision counter, including all templates, workout history, logged and unlogged sets, active state, next session, phase cycle and settings. The test contained four sessions and one saved workout with one logged set. Real user records were not accessed or modified. The download event was not captured from the QA iframe; direct app download and restore both succeeded.

- All 37 model checks pass with `node --test tests/model.test.mjs`.
- JavaScript syntax checks pass for app.js and sw.js.
- An isolated runtime check of the actual finish handler confirms that incomplete workouts remain active until acknowledged, an acknowledgement for another workout cannot finish the current workout, explicit acknowledgement preserves recorded set values, and fully logged workouts finish directly.
- Result-table checks confirm Set / kg / Reps columns, original set numbering, and explicit Not logged rows with dashes instead of template values.
- Exercise panels now use an independent set of open panel IDs, with Expand all and Collapse all controls.
- Live browser checks pass: four exercise panels remained open; collapsing one left the other three open; returning from finish review preserved all four panels and recorded weight/reps; explicit acknowledgement saved all ten unlogged rows; a fully logged nine-set workout finished directly without review.
- Result columns align across exercises at phone widths, and the 320 px finish review has no horizontal overflow.
- GitHub Pages deployed v0.5.0 successfully after an initial API connection failure.

## Earlier verification — 12 October 2026

Live app: https://ssmsns23.github.io/fitness-App/
Repository: SSMSNS23/fitness-App. Pages uses main/root with HTTPS enforced. App version v0.2.3.

## Automated checks

21 Node model checks pass, covering the four-session cycle, empty history, immutable snapshots, decimals, out-of-order logging, correction/undo, partial and duplicate finishes, inactivity boundaries/durations, actual previous-set prefilling, honest highest-load records, migration, backup validation and unit arithmetic.

Run `node --test tests/model.test.mjs` from the repository root. JavaScript syntax and static asset/module references were checked.

## Chrome browser workflows verified

- Live app loaded with four labelled example sessions and empty actual history.
- Typed 31.25 kg and 9 reps; clicked Log Set directly; logged three sets without collapsing or automatically advancing the exercise.
- Running workout and set values survived refresh.
- Weight increase, correction, undo and deliberate out-of-order exercise switching worked.
- Settings navigation, Resume and kg/lb switching preserved stored workout values.
- Partial finish gave accurate count/duration and returned to the next session through Done.
- Programme rename, reorder, add/remove and Save Workout worked; historical snapshots remained unchanged.
- Save Correction updated a historical value; the next session prefilled that actual value and showed separately recorded prior sets.
- Simultaneous End Workout clicks from two tabs produced one history record and one cycle advance.
- Disposable expired-session fixture auto-finished once, saving one logged set and a 30-minute duration through lastActivity. Reload did not duplicate it.
- Malformed backup was rejected without changing records; valid empty backup restore returned the test browser to a clean programme and zero workouts.
- Changed 2-hour inactivity preference persisted after refresh.
- Exported JSON backup was parsed locally: actual current test set (22.5 kg × 10), prior history and settings were preserved.
- Updated v0.2.3 loaded. Service-worker installs revalidate shell assets to avoid stale HTTP-cached code/styles.
- No application-origin errors appeared in the checked console log window.

All browser records were disposable synthetic test data on the agent's browser. No personal logs, backups, credentials or private planning documents were published.

## Phone layout verified

The live app was rendered at 320, 375, 390 and 430px iframe widths. Numeric controls stayed within their rows, without horizontal document overflow. Buttons measure 48–52px. Mobile-width logging and refresh preserved saved values.

Browser QA found and fixed invisible light-mode +/− symbols and overflowing control rows. Phone controls now use their full available width.

## Remaining verification limits

These are Chrome checks, not a real iPhone or Safari-engine test. Safari keyboard behaviour, safe-area insets, Add to Home Screen, reopening after phone lock and airplane-mode offline reload still need the actual device. Storage eviction/quota failure has not been simulated in-browser.

Local saving is not cloud backup. Clearing website data, removing the installed app, changing devices or losing the phone may remove records. Export a backup periodically and keep using the same Home Screen app/browser context.
