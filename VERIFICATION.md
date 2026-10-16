# Verification — 16 October 2026

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
