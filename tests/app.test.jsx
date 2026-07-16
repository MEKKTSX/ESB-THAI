import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App, { LessonPlayer, ReviewScreen } from '../src/App.jsx'

const english = { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
const lesson = {
  id: 'A',
  number: 1,
  title: 'First lesson',
  chunks: [
    { id: 'en:A:1', script: 'Hello', pronunciation: 'heh-low', translation: 'Hello' },
    { id: 'en:A:2', script: 'Goodbye', pronunciation: 'good-bye', translation: 'Goodbye' }
  ]
}

describe('LingoFlow app shell', () => {
  afterEach(cleanup)
  it('asks a new learner to choose English or Chinese before entering', () => {
    render(<App storageKey="test-onboarding" />)
    expect(screen.getByRole('heading', { name: 'Choose your first language' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /English/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Chinese/i })).toBeTruthy()
  })

  it('enters Home after selecting a default language', () => {
    render(<App storageKey="test-selection" />)
    fireEvent.click(screen.getByRole('button', { name: /Chinese/i }))
    expect(screen.getByRole('heading', { name: /Hello, learner/i })).toBeTruthy()
    expect(screen.getAllByText('中文（简体）').length).toBeGreaterThan(0)
  })
  it('opens the language-aware assistant after onboarding', () => {
    render(<App storageKey="test-assistant" />)
    fireEvent.click(screen.getByRole('button', { name: /Chinese/i }))
    expect(screen.getByRole('button', { name: 'Ask LingoFlow' })).toBeTruthy()
  })

  it('saves the current chunk before advancing to the next one', () => {
    let state = { lessonProgress: {}, bookmarks: [], srs: {}, reviewHistory: [], activity: [], studySeconds: 0, xp: 0 }
    const repository = {
      loadLanguage: () => state,
      saveLanguage: (_languageId, nextState) => { state = nextState }
    }
    render(<LessonPlayer language={english} lesson={lesson} repository={repository} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Next chunk' }))
    expect(repository.loadLanguage('en').lessonProgress.A.learnedChunkIds).toContain(lesson.chunks[0].id)
    expect(screen.getByText(lesson.chunks[1].script)).toBeTruthy()
  })

  it('persists the selected previous chunk for the next lesson session', () => {
    let state = { lessonProgress: { A: { currentChunkIndex: 1, learnedChunkIds: ['en:A:1'], completedAt: null } }, bookmarks: [], srs: {}, reviewHistory: [], activity: [], studySeconds: 0, xp: 0 }
    const repository = {
      loadLanguage: () => state,
      saveLanguage: (_languageId, nextState) => { state = nextState }
    }
    const view = render(<LessonPlayer language={english} lesson={lesson} repository={repository} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Previous/ }))
    view.unmount()
    render(<LessonPlayer language={english} lesson={lesson} repository={repository} onClose={() => {}} />)
    expect(screen.getByText(lesson.chunks[0].script)).toBeTruthy()
  })

  it('reviews the next due learned card and records its grade', async () => {
    const state = {
      lessonProgress: { A: { learnedChunkIds: ['en:A:1'] } }, bookmarks: [],
      srs: { 'en:A:1': { interval: 0, ease: 2.5, nextReview: 0 } },
      reviewHistory: [], activity: [], studySeconds: 0, xp: 0
    }
    const repository = {
      loadLanguage: () => state,
      saveLanguage: (_languageId, nextState) => Object.assign(state, nextState)
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ json: async () => ({ units: [{ lessons: [{ id: 'A', path: '/content/en/A.json' }] }] }) }).mockResolvedValueOnce({ json: async () => lesson })

    render(<ReviewScreen language={english} repository={repository} onLanguageChange={() => {}} onChange={() => {}} />)

    expect(await screen.findByText('Hello')).toBeTruthy()
    fireEvent.click(document.querySelector('.rating-grid .good'))
    expect(state.reviewHistory).toHaveLength(1)
    expect(state.reviewHistory[0]).toMatchObject({ cardId: 'en:A:1', rating: 'good' })
    expect(await screen.findByText('No reviews due right now.')).toBeTruthy()
    fetchMock.mockRestore()
  })
})
