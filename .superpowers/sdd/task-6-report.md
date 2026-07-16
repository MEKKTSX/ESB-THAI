# Task 6 corrective report

## Implemented corrections

- Legacy ESB migration now normalizes migrated review history to an array, adds mapped English cards to a synthetic `legacy-migrated` lesson progress record, and keeps all migrated data scoped to English.
- Rating normalizes old object-shaped review history before appending a new event.
- Newly learned chunks add one deterministic learning event (5 XP, 30 study seconds); repeated learning does not add XP or time.
- Review can select the earliest learned future card in Practice mode without changing its schedule until a rating is submitted.
- Manifest and lesson loading use the validated curriculum repository. Failures render path-bearing alerts with Retry instead of leaving loading state indefinitely.
- Backup import parses and validates before confirmation; malformed files retain state and display a readable alert.
- Mastery counts only learned SRS records, excluding orphaned entries.

## TDD evidence

Added focused regressions for migrated history/queue/progress, old history rating, learning event idempotency, orphan mastery, future practice, manifest retry alert, and malformed backup confirmation ordering. The initial focused run failed for all intended missing behaviors; the focused green run passed 26 tests.

## Verification

- `npm test -- tests/learning-progress.test.js tests/core.test.js tests/app.test.jsx` — 26 passed.
- `npm test` — 35 passed.
- `npm run build` — passed.
- `git diff --check` — passed.
