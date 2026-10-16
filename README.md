# Personal Training Log

## Flexible range progression v0.17.0

Change current block can move to any configured range/round. Undo last change restores the most recent block setup while no workout or conflicting program change has occurred. Manage program now edits the order of Heavy/Medium/Light and one or two rounds for each range. Existing round progress is retained when saving a sequence where possible, and completed-session progression remains independent of calendar dates. Visible app wording uses Program. All 109 automated checks pass; phone layout still needs review.

## Training block home screen v0.16.0

Training now opens with a vertical Heavy → Medium → Light indicator, the current round (1 or 2), and completed/remaining sessions for that round. Start next workout or Resume is prominent; a checklist marks Completed, Next, Remaining, Paused and In progress. Edit/Delete remain beside sessions. Add, duplicate, order and progression controls sit inside Manage programme. Existing programmes using individual ranges have a Use training blocks action to switch future sessions together; historical ranges are preserved. Progress advances after completed sessions, never elapsed calendar time. All 100 automated checks pass; phone layout still needs review.

## Simpler session editing and deletion v0.15.0

Programme exercises now need only a name and set count. Existing weight/rep defaults, per-set presets and increments stay available for workout prefilling; weights and reps are adjusted while training. Each Training session row has an explicit Delete action with confirmation, preserving completed workout history and its filters. Finish a running workout before deleting, and retain at least one active session. The Heavy/Medium/Light home-screen redesign is still being discussed.

## Clearer workout records v0.14.2

History cards align logged/planned sets and duration in two columns, with unlogged sets visible in the list. Saved summaries and reopened workouts use the same date, range and metrics card. The next session has a separate compact panel after saving. Existing set tables, group containers, history correction and finish review remain available. All 91 automated checks pass; iPhone visual review remains outstanding.

## Compact workout status v0.14.1

Workout range, save status, set progress, elapsed time and the optional rest timer now share one compact card. The editing toolbar has a shorter visible label while retaining its full accessible name. All 91 automated checks pass; iPhone visual review remains outstanding.

## Compact logging and clear groups v0.14.0

Previous performance collapses independently and starts closed. Current sets share one compact panel, with weight/reps columns side by side and Log/Undo actions in each set heading. Supersets and giant sets share an obvious bordered container, including non-adjacent members, while stored order and data indices stay intact. Summaries/history also show groups together. All 91 checks pass; responsive appearance still needs an iPhone review.

## Visual refinement v0.13.0

A restrained slate/amber visual system with a warm light theme, clearer Start action, ordered session rows, compact expandable training structure, segmented views and distinct previous-performance panels. Large logging controls and all saved-data behaviour are retained. The separate polish.css layer is cached offline. All 89 existing checks pass, plus stylesheet parsing and key contrast checks. Actual visual spacing and viewport layout still need an iPhone review.

## Exercise drag handles v0.12.0

Programme and today's-workout editors offer a Move grip for pointer/touch reordering, including drop indicators and edge scrolling. Arrow buttons remain available. Dragging changes only the edit draft; Save applies it. Complete exercise data, groups and logged sets move together. Historical correction and active logging have no drag handles. All 89 automated checks pass; the new touch gesture still requires an iPhone check.

## Session ordering v0.11.0

Training → Reorder sessions previews a sequence with up/down controls and explicit Save order. It retains the current next workout, completed rotation markers, stable session identities and all historical snapshots. Paused sessions keep their place and are skipped. New sessions append; mode changes and backup restore retain the sequence. Reordering is blocked during a running workout, and stale changes are rejected. All 81 automated checks pass; latest iPhone appearance still needs confirmation.

## Training progress v0.10.0

Training → Progress shows logged workout/set/rep totals, lifting volume, date-spaced per-exercise load charts and actual new load records. Use 4-week, 12-week or all-time periods and range filters. Charts and totals respect global kg/lb. Workout links return to Progress with filters preserved. Unlogged sets and active workouts are excluded; records require earlier actual data and recalculate after corrections. All 73 automated checks pass; latest iPhone appearance still needs confirmation. Programme-wide strength indexing remains a later enhancement.

## Exercise library and history v0.9.0

Training → Exercises lists actually logged exercises by recency, with live search, latest logged sets and session counts. All my exercises includes clearly labelled programme-only entries. Exercise details show range-filtered session tables, latest sets and actual heaviest loads; each entry links back to the full workout. Session editors can add/replace from this library or create a named custom exercise. Picker changes remain drafts until the session editor is saved; existing today-only/programme choices are retained. All 66 automated checks pass; iPhone appearance still needs confirmation.

## Supersets and giant sets v0.8.0

Session editors and Edit today's workout have a Supersets & giant sets panel. Select any two exercises for a superset or three or more for a giant set; non-adjacent selections and ungrouping are supported. Save the editor to apply changes. Imported group markers are recognised. Labels remain visible in programme previews, running workouts, summaries and historical snapshots. Rest starts after the full grouped round; exercise navigation stays manual. All 59 automated checks pass; latest iPhone appearance still needs confirmation.

Sessions also support independent names/range tags, optional automatic rotation, editable duplication, and explicit today-only versus today-and-programme edits.

## Flexible programme v0.4.0

Use any number of active sessions (1–50). Add sessions from Programme, rename in Edit, or pause/enable sessions without deleting their workout history. Heavy/Mid/Light phases each use two complete rotations of the active sessions. A three-session programme therefore completes a phase in six workouts.

Settings → Import programme file accepts a programme-only JSON document. It changes future session templates, preserves every historical snapshot, and starts a fresh rotation in the current phase. Active workouts must be finished first. Different per-set starting weights/reps are supported by imported templates. Missing screenshot values remain blank on the logging screen until entered; provisional set counts remain editable.

Personal programme imports and workout logs remain private local data; they must never be committed to this public repository. Superset markers retained in imports now drive grouped labels and round-based rest behaviour.


## Training refinement v0.3.0

Heavy → Mid → Light, with two full four-session rotations per phase. Completing a different session first retains unfinished sessions; repeats do not falsely finish a rotation. Earlier history keeps its original unphased status. New sessions prefill actual values from their own phase; no matching record means editable template defaults, not inferred lighter/heavier loads.

Previous-session Heavy/Mid/Light/Earlier reference tabs do not overwrite current entries. History has phase filters. A non-blocking count-up rest timer starts on a logged set, survives reload/backgrounding, and can be reset or disabled in Settings. No automatic exercise advance.

An explicitly labelled `?sandbox=true` testing mode uses separate local databases, legacy keys and cross-tab channels. Never log real workouts in that mode. Thirty model tests pass; live browser checks for this release are recorded in VERIFICATION.md.

Live app: https://ssmsns23.github.io/fitness-App/

A buildless iPhone-first personal workout tracker. No accounts, external APIs, subscriptions or cloud storage.

## Included

- Four clearly labelled editable example sessions: Upper A → Lower A → Upper B → Lower B.
- Dedicated programme editor with Save Workout, add/remove exercises, reorder controls, starting loads/reps/sets and optional exercise weight increments.
- Large Start Workout; deliberate session selection explains how it affects the cycle.
- One vertical workout screen with independently collapsible exercises, Expand all and Collapse all. Finishing the last set does not advance or collapse it.
- Direct number entry, large weight/reps controls, immediate save, logged-set corrections and undo.
- Previous session's individual set tiles, actual previous-set prefilling and highest recorded load comparisons.
- Finish at any point; exact logged-set count and wall-clock duration; Done returns to Programme.
- Honest history, session filter and explicit Save Correction. No demonstration history.
- Follow Device (default), Light/Dark and kg/lb with matching unit increments.
- Resume running workout after reload; informational elapsed timer; 12h inactivity auto-finish adjustable 2–24h. Auto duration stops at last workout interaction.
- IndexedDB transactions serialize writes across tabs; finalisation checks workout identity to avoid duplicate history. Save errors remain visible and do not overwrite saved data.
- Prototype v1 localStorage migration, preserving existing snapshots. Original localStorage data is retained.
- Scoped, versioned offline app shell and PNG iPhone Home Screen icon.
- Simple JSON backup/restore retained from the prototype, with validation and a replacement confirmation.

The supplied sessions and loads are examples. The exact personal programme still needs to be supplied or entered. No personal logs or credentials are in this source.

## GitHub Pages publication

1. In GitHub account `SSMSNS23`, create a **public** repository named `fitness-App` and initialise it with a README.
2. Allow the connected GitHub app to access that repository if repository selection is restricted.
3. Upload the files **inside this training-log folder** to the repository root, including `.nojekyll`. Do not upload the outer ZIP as the website, test fixtures, backups or planning documents.
4. Repository Settings → Pages → Source: **Deploy from a branch** → Branch: **main** → Folder: **/(root)** → Save.
5. Wait for the GitHub Pages deployment to succeed. Use the **Visit site** URL provided in Pages settings. The live URL above was verified on 12 October 2026.
6. Run the browser checks listed in `VERIFICATION.md` before treating the app as ready for real workout data.

No build step is required. Keep all application files in the same directory. Relative asset and manifest paths support the GitHub Pages repository subpath.

## iPhone use after publishing

Open the verified URL in **Safari** → Share → **Add to Home Screen** → Add. Launch the Home Screen app, edit the example sessions and start a workout. Keep logging in the same Home Screen app; Safari and installed-app storage behaviour can differ. If moving between contexts, export/import a backup instead of assuming records have transferred.

After the first successful online load, the installed service worker caches the app shell for offline use. App updates have been verified in Chrome; offline reload in iPhone airplane mode remains to be checked. Updates wait until the app is reopened without an active workout. Bump the version in `sw.js` when changing the deployed app shell.

## Storage limitations

Local saving is not cloud backup. Clearing website data, deleting the Home Screen app, losing the phone or browser storage eviction can remove records. Export a backup periodically. The app requests persistent browser storage when available; the browser decides whether to grant it.

## Source and tests

`app.js`: UI and interactions. `model.js`: workout operations. `store.js`: validation, migration and transaction queue. `styles.css`: mobile styling. `sw.js`: offline shell. `starter.js`: example programme.

With a recent Node.js version, run the tests from the repository root:

    node --test tests/model.test.mjs

37 logic checks pass. Chrome browser workflows, actual IndexedDB persistence, concurrent finalisation and mobile layouts have also been verified. Real iPhone Safari/Home Screen and airplane-mode use remain to be checked. See `VERIFICATION.md`.

## Deferred

Nutrition, Weight, drag handles, illustrated discovery beyond your own exercises, full progress analytics, accounts and cloud sync. The original full specification is preserved in the supplied handoff package.
