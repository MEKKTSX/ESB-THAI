const MIGRATION_KEY = 'lingoflow-migrated-esb-v1'

export function migrateLegacyEsb(repository, storage, legacyCardMap) {
  if (storage.getItem(MIGRATION_KEY)) return false
  const parse = key => {
    try { return JSON.parse(storage.getItem(key)) || {} } catch { return {} }
  }
  const srs = parse('esb_srs_data')
  const bookmarks = parse('esb_bookmarks')
  const reviewHistory = parse('esb_review_history')
  const mapRecord = record => Object.fromEntries(Object.entries(record)
    .filter(([key]) => legacyCardMap[key])
    .map(([key, value]) => [legacyCardMap[key], value]))
  const existing = repository.loadLanguage('en')
  repository.saveLanguage('en', {
    ...existing,
    srs: { ...existing.srs, ...mapRecord(srs) },
    bookmarks: [...new Set([...existing.bookmarks, ...bookmarks.map(key => legacyCardMap[key]).filter(Boolean)])],
    reviewHistory: { ...existing.reviewHistory, ...mapRecord(reviewHistory) }
  })
  storage.setItem(MIGRATION_KEY, '1')
  return true
}
