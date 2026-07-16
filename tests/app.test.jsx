import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App, { LessonPlayer } from '../src/App.jsx'

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
})
