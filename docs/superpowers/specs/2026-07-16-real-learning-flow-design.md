# LingoFlow Real Learning Flow Design

## Goal

Restore the complete learning behavior of ESB-THAI inside the LingoFlow interface while making every curriculum and progress operation language-aware. A learner must be able to choose a language, open any UNIT and lesson, study every chunk, bookmark content, complete lessons, and review learned chunks through an isolated SRS queue.

## Scope

Version 1 supports English (`en`) and Simplified Chinese (`zh-Hans`). The design preserves the current four-grade SRS behavior and the canonical generated curriculum assets. It does not add accounts, cloud sync, fake languages, or curriculum skill analytics.

## Architecture

The UI will consume two explicit boundaries instead of fetching and mutating data directly:

- `CurriculumRepository` loads and validates the language manifest and lesson files. It exposes language, unit, lesson, and chunk lookup functions and returns actionable errors when an asset is missing or malformed.
- `ProgressRepository` owns all local learning state under a language namespace. It records lesson position, learned chunk IDs, completed lessons, bookmarks, SRS records, review history, XP events, and elapsed study time.

Screen components receive repositories and domain values through props. Language-specific behavior comes only from catalog and curriculum data; screens do not branch on English versus Chinese.

## Curriculum Flow

1. Courses lists the two real curricula from the language catalog.
2. Selecting a course opens its UNIT list and remembers the selected language.
3. Selecting a lesson loads the lesson JSON through `CurriculumRepository`.
4. The Lesson Player starts at the first unfinished chunk or the learner's saved position.
5. The learner can move backward and forward, reveal the translation, bookmark the chunk, and hear supported audio.
6. Advancing marks the current chunk learned and creates its initial language-scoped SRS record if one does not already exist.
7. Completing the final chunk records lesson completion, XP, study time, and returns to the lesson list with updated progress.
8. A completed lesson can be reopened without resetting SRS or completion data.

English keeps all 1,725 existing cards. Chinese keeps 15 UNITs, 150 lessons, and exactly 10 chunks per lesson from `chinese_dataset.json`.

## Progress Data

Each language namespace stores:

```js
{
  lessonProgress: {
    [lessonId]: {
      currentChunkIndex: 0,
      learnedChunkIds: [],
      completedAt: null,
      updatedAt: "ISO timestamp"
    }
  },
  bookmarks: [],
  srs: {},
  reviewHistory: [],
  activity: [],
  studySeconds: 0,
  xp: 0
}
```

Repository reads normalize older saved states so existing LingoFlow and migrated ESB data remain usable. Backup continues to export one versioned envelope containing settings and every language namespace.

## SRS Review

The review queue is built only from chunks learned in the selected language. Due cards are sorted by `nextReview`; when no cards are due, the screen shows the next scheduled review and offers a practice mode using learned cards without modifying due dates until a grade is chosen.

Each grade (`again`, `hard`, `good`, `easy`) passes through the existing scheduler interface. Rating a card updates that card, appends language-scoped review history and activity, awards XP, and advances to the next queue item. Switching language rebuilds the queue from that language only.

## Real Metrics

- Course progress is learned chunks divided by total curriculum chunks.
- UNIT and lesson progress use the same learned-chunk calculation at their own scope.
- Due counts come from learned SRS records whose `nextReview` is at or before the current time.
- XP, review counts, study time, streak, and weekly activity come from stored events.
- Mastery is the share of learned SRS records at or above the scheduler's mastery interval.
- Skills remains a coming-soon state because the curricula do not include skill metadata.

No dashboard metric will use a decorative hard-coded value.

## UI States and Errors

Every curriculum boundary has loading, empty, and error states. Missing manifests or lessons show a retry action and the failing asset path. The Lesson Player disables navigation while a save is in progress and retains the current chunk after a recoverable error. Import rejects incompatible backups before asking for replacement confirmation.

The existing LingoFlow mobile-first Light/Dark visual system remains. The key interaction hierarchy is Courses → UNIT → Lesson → Chunk Player → SRS Review.

## Compatibility

The one-time `esb_*` migration continues to map all legacy English IDs into the English namespace. Existing LingoFlow backups are normalized on import. New fields use defaults so a previously exported version-1 backup can still be loaded without losing SRS records or bookmarks.

## Testing and Acceptance

Automated tests must prove:

- every catalog lesson resolves to valid curriculum content;
- Chinese resolves 150 lessons and 1,500 chunks, with 10 chunks in each lesson;
- English resolves all 1,725 cards;
- completing a lesson records every learned chunk and creates the matching SRS records;
- reopening a lesson resumes the saved position without duplicating records;
- bookmarks, lesson progress, due queues, and review history never cross language namespaces;
- all four SRS grades advance the queue and persist scheduler output;
- dashboard metrics change from stored learning events;
- backup export/import round-trips both languages and legacy state;
- unavailable curriculum assets show a recoverable UI error rather than an empty screen.

Browser acceptance requires exercising onboarding, one English lesson, one Chinese lesson, language switching, SRS rating, reload persistence, backup export/import, and Light/Dark responsive layouts. The Draft PR must not be marked ready or merged until these flows pass against a production build.

## Out of Scope

- Authentication and cloud synchronization
- Additional selectable languages
- Fabricated progress or skill scores
- Rewriting the scheduler algorithm beyond preserving the existing four-grade semantics
