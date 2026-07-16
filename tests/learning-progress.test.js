import { describe, expect, it } from 'vitest'
import { emptyLanguageState, markChunkLearned, toggleBookmark } from '../src/lib/learning-progress.js'
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
