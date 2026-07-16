import { describe, expect, it, beforeEach } from 'vitest'
import { LANGUAGE_CATALOG, createCardId } from '../src/lib/catalog.js'
import { createProgressRepository } from '../src/lib/progress-repository.js'
import { createBackup, importBackup, validateBackup } from '../src/lib/backup.js'
import { migrateLegacyEsb } from '../src/lib/migration.js'
import { scheduleReview } from '../src/lib/scheduler.js'
import { buildReviewQueue, getLanguageMetrics, rateReview } from '../src/lib/learning-progress.js'

const storage = () => {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    clear: () => values.clear()
  }
}

describe('LingoFlow core', () => {
  let local
  let repository

  beforeEach(() => {
    local = storage()
    repository = createProgressRepository(local)
  })

  it('registers English and Simplified Chinese as real v1 languages', () => {
    expect(LANGUAGE_CATALOG.map(language => language.id)).toEqual(['en', 'zh-Hans'])
    expect(LANGUAGE_CATALOG.every(language => language.curriculum)).toBe(true)
  })

  it('keeps SRS progress isolated by language', () => {
    repository.saveLanguage('en', { srs: { 'en:session-1:A:1': { interval: 4 } } })
    repository.saveLanguage('zh-Hans', { srs: { 'zh-Hans:U01-L01-C001': { interval: 7 } } })

    expect(repository.loadLanguage('en').srs).toEqual({ 'en:session-1:A:1': { interval: 4 } })
    expect(repository.loadLanguage('zh-Hans').srs).toEqual({ 'zh-Hans:U01-L01-C001': { interval: 7 } })
  })

  it('exports and restores one versioned backup for every language', () => {
    repository.saveSettings({ theme: 'dark', defaultLanguage: 'zh-Hans' })
    repository.saveLanguage('en', { bookmarks: ['en:session-1:A:1'] })
    repository.saveLanguage('zh-Hans', { bookmarks: ['zh-Hans:U01-L01-C001'] })
    const backup = createBackup(repository)

    repository.replaceAll({ settings: {}, languages: {} })
    importBackup(repository, backup)

    expect(repository.loadSettings()).toMatchObject({ theme: 'dark', defaultLanguage: 'zh-Hans' })
    expect(repository.loadLanguage('en').bookmarks).toEqual(['en:session-1:A:1'])
    expect(repository.loadLanguage('zh-Hans').bookmarks).toEqual(['zh-Hans:U01-L01-C001'])
  })

  it.each([
    ['an array state', []],
    ['missing settings', { languages: {} }],
    ['missing languages', { settings: {} }],
    ['a malformed language namespace', { settings: {}, languages: { en: [] } }]
  ])('rejects a backup with %s', (_label, state) => {
    expect(() => validateBackup({ format: 'lingoflow-backup', version: 1, state })).toThrow('Unsupported LingoFlow backup')
  })

  it('migrates each legacy ESB card key only once into English', () => {
    local.setItem('esb_srs_data', JSON.stringify({ 'A-0': { interval: 4, nextReview: 1 } }))
    local.setItem('esb_bookmarks', JSON.stringify(['A-0']))
    local.setItem('esb_review_history', JSON.stringify({ 'A-0': { rating: 'good' } }))
    const legacyMap = { 'A-0': createCardId('en', 'session-1', 'A', 1) }

    expect(migrateLegacyEsb(repository, local, legacyMap)).toBe(true)
    expect(repository.loadLanguage('en').bookmarks).toEqual(['en:session-1:A:1'])
    expect(repository.loadLanguage('en').reviewHistory).toEqual([expect.objectContaining({ cardId: 'en:session-1:A:1' })])
    expect(buildReviewQueue(repository.loadLanguage('en'), 10).map(card => card.id)).toEqual(['en:session-1:A:1'])
    expect(getLanguageMetrics(repository.loadLanguage('en'), 100, 10).progress).toBeGreaterThan(0)
    expect(migrateLegacyEsb(repository, local, legacyMap)).toBe(false)
  })

  it('rates an older object-shaped review history without crashing', () => {
    const state = { ...repository.loadLanguage('en'), reviewHistory: { old: { cardId: 'en:A:1' } }, srs: { 'en:A:1': { nextReview: 0 } } }

    expect(() => rateReview(state, 'en:A:1', 'good', 0)).not.toThrow()
    expect(rateReview(state, 'en:A:1', 'good', 0).reviewHistory).toHaveLength(2)
  })

  it('schedules again, hard, good, and easy as distinct four-grade outcomes', () => {
    const now = new Date('2026-07-15T10:00:00.000Z').getTime()
    const card = { interval: 4, ease: 2.5, step: 1 }
    const ratings = ['again', 'hard', 'good', 'easy'].map(rating => scheduleReview(card, rating, now))

    expect(ratings.map(item => item.interval)).toEqual([0, 5, 10, 13])
    expect(ratings.every(item => item.nextReview > now)).toBe(true)
  })
})
