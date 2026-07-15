import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../src/App.jsx'

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
})
