export function scheduleReview(card = {}, rating, now = Date.now()) {
  let { interval = 0, ease = 2.5, step = 0 } = card
  if (rating === 'again') {
    interval = 0
    step = 0
    ease = Math.max(1.3, ease - 0.2)
  } else if (rating === 'hard') {
    if (step === 0) {
      interval = 1
      step = 1
    } else {
      interval = Math.max(1, Math.round(interval * 1.2))
      ease = Math.max(1.3, ease - 0.15)
    }
  } else if (rating === 'good') {
    interval = step === 0 ? 4 : Math.max(1, Math.round(interval * ease))
    step = 1
  } else if (rating === 'easy') {
    interval = step === 0 ? 7 : Math.max(7, Math.round(interval * ease * 1.3))
    step = 1
    if (card.step !== 0) ease += 0.15
  } else {
    throw new Error('Unknown SRS rating: ' + rating)
  }

  const reviewAt = new Date(now)
  if (interval === 0) reviewAt.setMinutes(reviewAt.getMinutes() + 10)
  else {
    reviewAt.setDate(reviewAt.getDate() + interval)
    reviewAt.setHours(4, 0, 0, 0)
  }
  return { interval, ease, step, nextReview: reviewAt.getTime() }
}
