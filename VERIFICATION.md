# Verification — 16 October 2026

## v0.5.0 workout review and result columns

- All 37 model checks pass with `node --test tests/model.test.mjs`.
- JavaScript syntax checks pass for app.js and sw.js.
- An isolated runtime check of the actual finish handler confirms that incomplete workouts remain active until acknowledged, an acknowledgement for another workout cannot finish the current workout, explicit acknowledgement preserves recorded set values, and fully logged workouts finish directly.
- Result-table checks confirm Set / kg / Reps columns, original set numbering, and explicit Not logged rows with dashes instead of template values.
- Exercise panels now use an independent set of open panel IDs, with Expand all and Collapse all controls.
- Live browser workflow verification is pending GitHub Pages deployment; the initial deployment failed because its API connection closed, and the failed-job retry remained queued.

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
