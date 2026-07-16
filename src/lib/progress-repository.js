import { emptyLanguageState } from './learning-progress.js'

const STORAGE_KEY = 'lingoflow-state-v1'

const emptyLanguage = emptyLanguageState
const emptyState = () => ({ version: 1, settings: { theme: 'system', defaultLanguage: null }, languages: {} })
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)

const normalizeLessonEntry = value => {
  const entry = isObject(value) ? value : {}
  return {
    ...entry,
    currentChunkIndex: Number.isFinite(entry.currentChunkIndex) && Number.isInteger(entry.currentChunkIndex) && entry.currentChunkIndex >= 0 ? entry.currentChunkIndex : 0,
    learnedChunkIds: Array.isArray(entry.learnedChunkIds) ? [...new Set(entry.learnedChunkIds.filter(id => typeof id === 'string'))] : [],
    completedAt: typeof entry.completedAt === 'string' ? entry.completedAt : null,
    updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : null
  }
}

const normalizeLanguage = value => {
  const language = isObject(value) ? value : {}
  const lessonProgress = isObject(language.lessonProgress) ? language.lessonProgress : {}
  return {
    ...emptyLanguage(),
    ...language,
    lessonProgress: Object.fromEntries(Object.entries(lessonProgress).map(([lessonId, entry]) => [lessonId, normalizeLessonEntry(entry)]))
  }
}

export function createProgressRepository(storage = window.localStorage, storageKey = STORAGE_KEY) {
  const read = () => {
    try {
      const parsed = JSON.parse(storage.getItem(storageKey))
      return parsed && parsed.version === 1 ? parsed : emptyState()
    } catch {
      return emptyState()
    }
  }

  const write = state => storage.setItem(storageKey, JSON.stringify(state))

  return {
    loadState: () => structuredClone(read()),
    replaceAll: payload => write({ ...emptyState(), ...structuredClone(payload), version: 1 }),
    loadSettings: () => structuredClone(read().settings),
    saveSettings: settings => {
      const state = read()
      state.settings = { ...state.settings, ...structuredClone(settings) }
      write(state)
    },
    loadLanguage: languageId => structuredClone(normalizeLanguage(read().languages?.[languageId])),
    saveLanguage: (languageId, value) => {
      const state = read()
      state.languages = isObject(state.languages) ? state.languages : {}
      state.languages[languageId] = normalizeLanguage(structuredClone(value))
      write(state)
    }
  }
}
