# Verification — 12 October 2026

## Completed

- JavaScript syntax checks: `app.js`, `store.js`, `model.js`, `starter.js`, `sw.js`.
- 21 automated Node model checks pass: empty history; four sessions; start snapshot; duplicate start guard; decimal and rep serialisation; third-set logging without automatic completion; correction and undo; out-of-order logging; invalid values; partial completion and finalisation identity; manual duration; 12h boundary and automatic duration; stale expired interactions; 2h setting; deliberate session skip/wrap; immutable history under programme edits; prefill from actual logged sets; stable exercise identity; no first-workout fabricated PR; PR recalculation after correction; v1 migration; invalid backup validation; kg/lb arithmetic.
- Source inspection: original storage uses one synchronous localStorage write without error handling, prompt-based editing and fragile full rerenders on input change. The revised source separates storage/model/UI, saves input without replacing focused controls, uses an explicit summary and editor, preserves snapshots, and checks transaction completion before showing saved state.
- Static asset references and service-worker asset list checked against the package.

## Not completed — do not interpret logic tests as browser tests

The managed preview process failed before startup: `bwrap: Can't mount proc on /newroot/proc: Operation not permitted`. The environment also did not provide a working local browser binary; the attempted browser download did not yield a valid archive. No browser session, screenshot, Safari engine test or real iPhone test was completed.

GitHub account identity was confirmed as SSMSNS23. The connection returned no accessible repositories and does not provide repository creation or Pages activation. No repository was changed and no live deployment URL was verified.

## Required next checks after publication

1. Open the actual Pages URL. Confirm empty history and clearly labelled example programme.
2. Check at 320, 375, 390 and 430px viewport widths and in iPhone Safari. Verify legible controls, no horizontal scroll and safe-area clearance.
3. Edit/add/remove/reorder an exercise; cancel and save; reload and confirm the saved programme.
4. Start; type 31.25kg and 9 reps; tap Log Set directly from the number keyboard; log three sets. Confirm the same exercise remains open.
5. Expand another exercise and log out of order; correct and undo a set; reload; background and reopen. Confirm actual set values and running workout persist.
6. Navigate Settings/History and use Resume. Confirm one running workout, kg/lb conversion and increments, Follow Device/Light/Dark.
7. Finish partially; confirm exact logged count/duration, Done returning to next session and history showing unlogged sets honestly. Edit template afterwards and confirm past records stay unchanged.
8. Start another workout containing the same exercise; confirm actual previous-set prefill and separate previous-session tiles.
9. In two same-origin tabs, finish the same running workout nearly simultaneously. Confirm one history record and one cycle advance. Check independent set changes are preserved.
10. Move lastActivity behind the configured inactivity threshold in a test-only database; reload and reopen both tabs. Confirm one auto-finished record, duration through lastActivity, no fabricated completed sets and no extra finalisation.
11. Verify service-worker install; go offline; reload and log a set; reconnect. Deploy a bumped shell version and confirm old active workouts survive the update.
12. Simulate unavailable storage/transaction failure; confirm no success claim, prior saved data survives, and retry/recovery is usable.
13. Export/restore a test backup; reject a malformed backup without changing current data.
14. Add to Home Screen on the actual iPhone, log a disposable test session, close/reopen the app and confirm storage. Complete this check before entering the real programme.

Only isolated synthetic test fixtures should be used for expiry, failure and correction tests. Do not write test fixtures into the user's real records or public repository as personal history.
