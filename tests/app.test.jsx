import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App, { LessonPlayer, ProfileScreen, ReviewScreen } from '../src/App.jsx'

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
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ units: [{ id: 'session-1', lessons: [{ id: 'A', path: '/content/en/A.json' }] }] }) }).mockResolvedValueOnce({ ok: true, json: async () => lesson })

    render(<ReviewScreen language={english} repository={repository} onLanguageChange={() => {}} onChange={() => {}} />)

    expect(await screen.findByText('Hello')).toBeTruthy()
    fireEvent.click(document.querySelector('.rating-grid .good'))
    expect(state.reviewHistory).toHaveLength(1)
    expect(state.reviewHistory[0]).toMatchObject({ cardId: 'en:A:1', rating: 'good' })
    fetchMock.mockRestore()
  })

  it('records one grade when the active review card is clicked twice before the queue advances', async () => {
    const state = {
      lessonProgress: { A: { learnedChunkIds: ['en:A:1', 'en:A:2'] } }, bookmarks: [],
      srs: { 'en:A:1': { interval: 0, ease: 2.5, nextReview: 0 }, 'en:A:2': { interval: 0, ease: 2.5, nextReview: 0 } },
      reviewHistory: [], activity: [], studySeconds: 0, xp: 0
    }
    const repository = { loadLanguage: () => state, saveLanguage: (_languageId, nextState) => Object.assign(state, nextState) }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ units: [{ id: 'session-1', lessons: [{ id: 'A' }] }] }) }).mockResolvedValueOnce({ ok: true, json: async () => lesson })

    render(<ReviewScreen language={english} repository={repository} onLanguageChange={() => {}} onChange={() => {}} />)

    expect(await screen.findByText('Hello')).toBeTruthy()
    const good = document.querySelector('.rating-grid .good')
    fireEvent.click(good)
    fireEvent.click(good)
    expect(state.reviewHistory).toEqual([expect.objectContaining({ cardId: 'en:A:1', rating: 'good' })])
    expect(state.activity).toHaveLength(1)
    expect(state.xp).toBe(3)
    fetchMock.mockRestore()
  })

  it('offers the earliest future learned card as Practice without changing its schedule', async () => {
    const future = Date.now() + 60_000
    const state = { lessonProgress: { A: { learnedChunkIds: ['en:A:1'] } }, bookmarks: [], srs: { 'en:A:1': { interval: 4, ease: 2.5, nextReview: future } }, reviewHistory: [], activity: [], studySeconds: 0, xp: 0 }
    const repository = { loadLanguage: () => state, saveLanguage: (_languageId, nextState) => Object.assign(state, nextState) }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: true, json: async () => ({ units: [{ id: 'session-1', lessons: [{ id: 'A' }] }] }) }).mockResolvedValueOnce({ ok: true, json: async () => lesson })

    render(<ReviewScreen language={english} repository={repository} onLanguageChange={() => {}} onChange={() => {}} />)

    expect(await screen.findByText('Practice')).toBeTruthy()
    expect(state.srs['en:A:1'].nextReview).toBe(future)
    fetchMock.mockRestore()
  })

  it('shows a manifest failure with its path and retry action', async () => {
    const state = { lessonProgress: { A: { learnedChunkIds: ['en:A:1'] } }, bookmarks: [], srs: { 'en:A:1': { nextReview: 0 } }, reviewHistory: [], activity: [], studySeconds: 0, xp: 0 }
    const repository = { loadLanguage: () => state, saveLanguage: () => {} }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false })

    render(<ReviewScreen language={english} repository={repository} onLanguageChange={() => {}} onChange={() => {}} />)

    expect((await screen.findByRole('alert')).textContent).toContain('/content/en/manifest.json')
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy()
    fetchMock.mockRestore()
  })

  it('rejects malformed backup files before asking to replace progress', async () => {
    const confirm = vi.spyOn(window, 'confirm')
    const repository = { loadState: () => ({}), replaceAll: vi.fn() }
    render(<ProfileScreen settings={{ theme: 'system', defaultLanguage: 'en' }} setSettings={() => {}} repository={repository} />)
    const input = document.querySelector('input[type="file"]')
    fireEvent.change(input, { target: { files: [{ text: async () => '{broken' }] } })

    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(confirm).not.toHaveBeenCalled()
    expect(repository.replaceAll).not.toHaveBeenCalled()
    confirm.mockRestore()
  })
})
