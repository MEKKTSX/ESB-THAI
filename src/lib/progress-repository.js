const STORAGE_KEY = 'lingoflow-state-v1'

const emptyLanguage = () => ({ srs: {}, bookmarks: [], reviewHistory: {}, activity: [] })
const emptyState = () => ({ version: 1, settings: { theme: 'system', defaultLanguage: null }, languages: {} })

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
    loadLanguage: languageId => structuredClone(read().languages[languageId] || emptyLanguage()),
    saveLanguage: (languageId, value) => {
      const state = read()
      state.languages[languageId] = { ...emptyLanguage(), ...structuredClone(value) }
      write(state)
    }
  }
}
