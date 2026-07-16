import { scheduleReview } from './scheduler.js'

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

const reviewXp = { again: 1, hard: 2, good: 3, easy: 4 }

const learnedCardIds = state => new Set(Object.values(state.lessonProgress).flatMap(progress => progress.learnedChunkIds || []))

export function buildReviewQueue(state, now = Date.now()) {
  const timestamp = now instanceof Date ? now.getTime() : now
  const learned = learnedCardIds(state)

  return Object.entries(state.srs)
    .filter(([id, card]) => learned.has(id) && card.nextReview <= timestamp)
    .map(([id, card]) => ({ id, ...card }))
    .sort((left, right) => left.nextReview - right.nextReview)
}

export function rateReview(state, cardId, rating, now = new Date()) {
  const timestamp = now instanceof Date ? now.getTime() : now
  const at = new Date(timestamp).toISOString()
  const event = { cardId, rating, at }
  const activity = { type: 'review', ...event, xp: reviewXp[rating] || 0 }

  return {
    ...state,
    srs: { ...state.srs, [cardId]: scheduleReview(state.srs[cardId], rating, timestamp) },
    reviewHistory: [...state.reviewHistory, event],
    activity: [...state.activity, activity],
    xp: state.xp + activity.xp
  }
}

export function getLanguageMetrics(state, totalChunks, now = Date.now()) {
  const timestamp = now instanceof Date ? now.getTime() : now
  const today = new Date(timestamp).toISOString().slice(0, 10)
  const weekStart = timestamp - 6 * 24 * 60 * 60 * 1000
  const reviewActivity = state.activity.filter(event => event.type === 'review')
  const activeDays = new Set(reviewActivity.map(event => event.at?.slice(0, 10)).filter(Boolean))
  let dayStreak = 0
  for (let day = new Date(`${today}T00:00:00.000Z`); activeDays.has(day.toISOString().slice(0, 10)); day.setUTCDate(day.getUTCDate() - 1)) dayStreak += 1
  const xpFor = events => events.reduce((sum, event) => sum + (event.xp || 0), 0)
  const learned = learnedCardIds(state).size

  return {
    progress: totalChunks ? Math.round((learned / totalChunks) * 100) : 0,
    due: buildReviewQueue(state, timestamp).length,
    mastered: Object.values(state.srs).filter(card => card.interval >= 21).length,
    reviewed: state.reviewHistory.length,
    xp: state.xp,
    dayStreak,
    xpToday: xpFor(reviewActivity.filter(event => event.at?.slice(0, 10) === today)),
    xpThisWeek: xpFor(reviewActivity.filter(event => new Date(event.at).getTime() >= weekStart && new Date(event.at).getTime() <= timestamp)),
    reviewedThisWeek: reviewActivity.filter(event => new Date(event.at).getTime() >= weekStart && new Date(event.at).getTime() <= timestamp).length
  }
}
