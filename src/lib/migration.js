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
  const migratedSrs = mapRecord(srs)
  const migratedCardIds = Object.keys(migratedSrs)
  const migratedHistory = Object.entries(reviewHistory).flatMap(([key, value]) => {
    const cardId = legacyCardMap[key]
    if (!cardId) return []
    return (Array.isArray(value) ? value : [value]).map(entry => ({ ...(entry || {}), cardId }))
  })
  const existingHistory = Array.isArray(existing.reviewHistory) ? existing.reviewHistory : Object.values(existing.reviewHistory || {})
  repository.saveLanguage('en', {
    ...existing,
    srs: { ...existing.srs, ...migratedSrs },
    bookmarks: [...new Set([...existing.bookmarks, ...bookmarks.map(key => legacyCardMap[key]).filter(Boolean)])],
    reviewHistory: [...existingHistory, ...migratedHistory],
    lessonProgress: migratedCardIds.length ? {
      ...existing.lessonProgress,
      'legacy-migrated': {
        currentChunkIndex: 0,
        learnedChunkIds: [...new Set([...(existing.lessonProgress['legacy-migrated']?.learnedChunkIds || []), ...migratedCardIds])],
        completedAt: null,
        updatedAt: new Date().toISOString()
      }
    } : existing.lessonProgress
  })
  storage.setItem(MIGRATION_KEY, '1')
  return true
}
