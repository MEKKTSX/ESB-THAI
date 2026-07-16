export const emptyLanguageState = () => ({
  lessonProgress: {},
  bookmarks: [],
  srs: {},
  reviewHistory: [],
  activity: [],
  studySeconds: 0,
  xp: 0
})

export function markChunkLearned(state, lessonId, chunkId, chunkIndex, totalChunks, now = new Date()) {
  const current = state.lessonProgress[lessonId] || { currentChunkIndex: 0, learnedChunkIds: [], completedAt: null }
  const learnedChunkIds = [...new Set([...current.learnedChunkIds, chunkId])]
  const completedAt = learnedChunkIds.length === totalChunks ? now.toISOString() : current.completedAt

  return {
    ...state,
    lessonProgress: {
      ...state.lessonProgress,
      [lessonId]: {
        ...current,
        currentChunkIndex: Math.min(chunkIndex + 1, totalChunks - 1),
        learnedChunkIds,
        completedAt,
        updatedAt: now.toISOString()
      }
    },
    srs: state.srs[chunkId] ? state.srs : {
      ...state.srs,
      [chunkId]: { interval: 0, ease: 2.5, nextReview: now.getTime() }
    }
  }
}

export function toggleBookmark(state, chunkId) {
  const bookmarks = state.bookmarks.includes(chunkId)
    ? state.bookmarks.filter(id => id !== chunkId)
    : [...state.bookmarks, chunkId]

  return { ...state, bookmarks }
}
