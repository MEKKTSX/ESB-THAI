import { describe, expect, it } from 'vitest'
import { buildReviewQueue, buildWeeklyActivitySeries, emptyLanguageState, getLanguageMetrics, markChunkLearned, rateReview, toggleBookmark } from '../src/lib/learning-progress.js'
import { createProgressRepository } from '../src/lib/progress-repository.js'

const now = new Date('2026-07-16T10:00:00.000Z')

const storage = () => {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value))
  }
}

describe('learning progress', () => {
  it('records each learned chunk and completes a lesson only after its final chunk', () => {
    let state = emptyLanguageState()
    state = markChunkLearned(state, 'A', 'en:A:1', 0, 2, now)
    expect(state.lessonProgress.A.completedAt).toBeNull()
    state = markChunkLearned(state, 'A', 'en:A:2', 1, 2, now)
    expect(state.lessonProgress.A.learnedChunkIds).toEqual(['en:A:1', 'en:A:2'])
    expect(state.lessonProgress.A.completedAt).toBe(now.toISOString())
    expect(Object.keys(state.srs)).toEqual(['en:A:1', 'en:A:2'])
  })

  it('adds a bookmark once and removes it when toggled again', () => {
    const state = emptyLanguageState()

    expect(toggleBookmark(state, 'en:A:1').bookmarks).toEqual(['en:A:1'])
    expect(toggleBookmark({ ...state, bookmarks: ['en:A:1'] }, 'en:A:1').bookmarks).toEqual([])
  })

  it('returns only learned cards due in next-review order', () => {
    const state = {
      ...emptyLanguageState(),
      lessonProgress: { A: { learnedChunkIds: ['en:A:early', 'en:A:later'] } },
      srs: {
        'en:A:early': { nextReview: 1 },
        'en:A:later': { nextReview: 5 },
        'en:A:future': { nextReview: 999 },
        'en:A:unlearned': { nextReview: 2 }
      }
    }

    expect(buildReviewQueue(state, 10).map(item => item.id)).toEqual(['en:A:early', 'en:A:later'])
  })

  it('derives course metrics from learned chunks and review events', () => {
    const state = {
      ...emptyLanguageState(),
      lessonProgress: { A: { learnedChunkIds: ['en:A:1', 'en:A:2'] } },
      srs: { 'en:A:1': { interval: 21, nextReview: 1 }, 'en:A:2': { interval: 4, nextReview: 999 } },
      reviewHistory: [{ cardId: 'en:A:1' }],
      activity: [{ type: 'review', at: '2026-07-16T10:00:00.000Z' }],
      xp: 7
    }

    expect(getLanguageMetrics(state, 10, 10)).toMatchObject({ progress: 20, due: 1, mastered: 1, reviewed: 1, xp: 7 })
  })

  it('records a rating event and schedules the reviewed card', () => {
    const state = { ...emptyLanguageState(), srs: { 'en:A:1': { interval: 0, ease: 2.5, nextReview: 0 } } }
    const rated = rateReview(state, 'en:A:1', 'good', now)

    expect(rated.srs['en:A:1'].nextReview).toBeGreaterThan(now.getTime())
    expect(rated.reviewHistory).toEqual([{ cardId: 'en:A:1', rating: 'good', at: now.toISOString() }])
    expect(rated.activity).toMatchObject([{ type: 'review', cardId: 'en:A:1', rating: 'good', at: now.toISOString() }])
    expect(rated.xp).toBeGreaterThan(0)
  })

  it('awards one deterministic learning event and study time for a newly learned chunk', () => {
    const first = markChunkLearned(emptyLanguageState(), 'A', 'en:A:1', 0, 2, now)
    const repeated = markChunkLearned(first, 'A', 'en:A:1', 0, 2, now)

    expect(first.activity).toEqual([expect.objectContaining({ type: 'learn', cardId: 'en:A:1', xp: 5, studySeconds: 30 })])
    expect(first.xp).toBe(5)
    expect(first.studySeconds).toBe(30)
    expect(repeated.activity).toHaveLength(1)
    expect(repeated.xp).toBe(5)
    expect(repeated.studySeconds).toBe(30)
  })

  it('does not let an orphaned SRS record inflate mastery', () => {
    const state = {
      ...emptyLanguageState(),
      lessonProgress: { A: { learnedChunkIds: ['en:A:1'] } },
      srs: { 'en:A:1': { interval: 21, nextReview: 1 }, 'en:orphan': { interval: 21, nextReview: 1 } }
    }

    expect(getLanguageMetrics(state, 10, 10).mastered).toBe(1)
  })

  it('builds weekly activity bars from review event days', () => {
    const state = {
      ...emptyLanguageState(),
      activity: [
        { type: 'review', at: '2026-07-10T08:00:00.000Z' },
        { type: 'review', at: '2026-07-14T08:00:00.000Z' },
        { type: 'review', at: '2026-07-14T10:00:00.000Z' },
        { type: 'review', at: '2026-07-16T08:00:00.000Z' }
      ]
    }

    expect(buildWeeklyActivitySeries(state, now).map(day => day.value)).toEqual([1, 0, 0, 0, 2, 0, 1])
  })

  it('normalizes persisted language progress with every language-state field', () => {
    const repository = createProgressRepository(storage())

    expect(repository.loadLanguage('en')).toEqual(emptyLanguageState())
  })

  it('adds newly required fields when loading older persisted language progress', () => {
    const local = storage()
    local.setItem('lingoflow-state-v1', JSON.stringify({
      version: 1,
      settings: {},
      languages: { en: { srs: { 'en:A:1': { interval: 4 } }, bookmarks: ['en:A:1'] } }
    }))
    const repository = createProgressRepository(local)

    expect(repository.loadLanguage('en')).toEqual({
      ...emptyLanguageState(),
      srs: { 'en:A:1': { interval: 4 } },
      bookmarks: ['en:A:1']
    })
  })
})
