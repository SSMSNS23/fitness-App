# Personal Training Log — Milestone 1

A buildless iPhone-first personal workout tracker. No accounts, external APIs, subscriptions or cloud storage.

## Included

- Four clearly labelled editable example sessions: Upper A → Lower A → Upper B → Lower B.
- Dedicated programme editor with Save Workout, add/remove exercises, reorder controls, starting loads/reps/sets and optional exercise weight increments.
- Large Start Workout; deliberate session selection explains how it affects the cycle.
- One vertical workout screen with manually collapsible exercises and one open at a time. Finishing the last set does not advance or collapse it.
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
5. Wait for the GitHub Pages deployment to succeed. Use the **Visit site** URL provided in Pages settings. No live URL has been verified as part of this package.
6. Run the browser checks listed in `VERIFICATION.md` before treating the app as ready for real workout data.

No build step is required. Keep all application files in the same directory. Relative asset and manifest paths support the GitHub Pages repository subpath.

## iPhone use after publishing

Open the verified URL in **Safari** → Share → **Add to Home Screen** → Add. Launch the Home Screen app, edit the example sessions and start a workout. Keep logging in the same Home Screen app; Safari and installed-app storage behaviour can differ. If moving between contexts, export/import a backup instead of assuming records have transferred.

After the first successful online load, the installed service worker caches the app shell for offline use. Its runtime behaviour still needs browser verification. Updates wait until the app is reopened without an active workout. Bump the version in `sw.js` when changing the deployed app shell.

## Storage limitations

Local saving is not cloud backup. Clearing website data, deleting the Home Screen app, losing the phone or browser storage eviction can remove records. Export a backup periodically. The app requests persistent browser storage when available; the browser decides whether to grant it.

## Source and tests

`app.js`: UI and interactions. `model.js`: workout operations. `store.js`: validation, migration and transaction queue. `styles.css`: mobile styling. `sw.js`: offline shell. `starter.js`: example programme.

With a recent Node.js version, run the package's tests from the outer folder:

    node --test tests/model.test.mjs

21 logic checks pass. Real-browser, real IndexedDB, offline, mobile layout and iPhone Home Screen verification are pending because the build environment's preview service could not start. See `VERIFICATION.md`.

## Deferred

Nutrition, Weight, Heavy/Mid/Light rotations, rest timer, supersets/giant sets, drag handles, exercise-library discovery, full progress analytics, temporary workout changes, accounts and cloud sync. The original full specification is preserved separately in the outer package's planning folder.
