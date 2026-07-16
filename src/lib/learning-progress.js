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

export function markChunkLearned(state, lessonId, chunkId, chunkIndex, totalChunks, now = new Date(), elapsedStudySeconds = 0) {
  const current = state.lessonProgress[lessonId] || { currentChunkIndex: 0, learnedChunkIds: [], completedAt: null }
  const isNewlyLearned = !current.learnedChunkIds.includes(chunkId)
  const learnedChunkIds = [...new Set([...current.learnedChunkIds, chunkId])]
  const completedAt = learnedChunkIds.length === totalChunks ? now.toISOString() : current.completedAt
  const studySeconds = Number.isFinite(elapsedStudySeconds) && elapsedStudySeconds >= 0 ? Math.floor(elapsedStudySeconds) : 0
  const learningEvent = { type: 'learn', cardId: chunkId, at: now.toISOString(), xp: 5, studySeconds }

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
    },
    activity: isNewlyLearned ? [...state.activity, learningEvent] : state.activity,
    xp: isNewlyLearned ? state.xp + learningEvent.xp : state.xp,
    studySeconds: isNewlyLearned ? state.studySeconds + learningEvent.studySeconds : state.studySeconds
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

export function buildWeeklyActivitySeries(state, now = new Date()) {
  const timestamp = now instanceof Date ? now.getTime() : now
  const end = new Date(timestamp)
  end.setUTCHours(0, 0, 0, 0)
  const counts = new Map()
  state.activity.forEach(event => {
    const day = event.at?.slice(0, 10)
    if (day) counts.set(day, (counts.get(day) || 0) + 1)
  })

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(end)
    day.setUTCDate(end.getUTCDate() - 6 + index)
    const date = day.toISOString().slice(0, 10)
    return { date, label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.getUTCDay()], value: counts.get(date) || 0 }
  })
}

export function buildReviewQueue(state, now = Date.now()) {
  const timestamp = now instanceof Date ? now.getTime() : now
  const learned = learnedCardIds(state)

  return Object.entries(state.srs)
    .filter(([id, card]) => learned.has(id) && card.nextReview <= timestamp)
    .map(([id, card]) => ({ id, ...card }))
    .sort((left, right) => left.nextReview - right.nextReview)
}

export function buildPracticeQueue(state, now = Date.now()) {
  const timestamp = now instanceof Date ? now.getTime() : now
  const learned = learnedCardIds(state)
  return Object.entries(state.srs)
    .filter(([id, card]) => learned.has(id) && card.nextReview > timestamp)
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
    reviewHistory: [...(Array.isArray(state.reviewHistory) ? state.reviewHistory : Object.values(state.reviewHistory || {})), event],
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
    mastered: Object.entries(state.srs).filter(([id, card]) => learnedCardIds(state).has(id) && card.interval >= 21).length,
    reviewed: Array.isArray(state.reviewHistory) ? state.reviewHistory.length : Object.keys(state.reviewHistory || {}).length,
    xp: state.xp,
    studySeconds: Number.isFinite(state.studySeconds) && state.studySeconds >= 0 ? state.studySeconds : 0,
    dayStreak,
    xpToday: xpFor(reviewActivity.filter(event => event.at?.slice(0, 10) === today)),
    xpThisWeek: xpFor(reviewActivity.filter(event => new Date(event.at).getTime() >= weekStart && new Date(event.at).getTime() <= timestamp)),
    reviewedThisWeek: reviewActivity.filter(event => new Date(event.at).getTime() >= weekStart && new Date(event.at).getTime() <= timestamp).length,
    weeklyActivity: buildWeeklyActivitySeries(state, timestamp)
  }
}

export function buildLessonProgress(lessonProgress, item) {
  const lessons = Array.isArray(item.lessons) ? item.lessons : [item]
  const counts = lessons.reduce((result, lesson) => {
    const total = Number.isFinite(lesson.chunkCount) && lesson.chunkCount >= 0 ? lesson.chunkCount : 0
    const saved = lessonProgress?.[lesson.id]
    const learned = saved?.completedAt ? total : Math.min(Array.isArray(saved?.learnedChunkIds) ? new Set(saved.learnedChunkIds).size : 0, total)
    return { learned: result.learned + learned, total: result.total + total }
  }, { learned: 0, total: 0 })
  return { ...counts, percent: counts.total ? Math.round((counts.learned / counts.total) * 100) : 0 }
}
