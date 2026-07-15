import { createCardId } from './catalog.js'

const smartChunk = text => {
  const words = text.split(' ')
  const chunks = []
  const current = []
  const breakWords = new Set(['and', 'but', 'or', 'so', 'because', 'to', 'for', 'with', 'in', 'on', 'at', 'about', 'which', 'that', 'who', 'when', 'where', 'while'])
  words.forEach(word => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '')
    if (breakWords.has(clean) && current.length) {
      chunks.push(current.join(' '))
      current.splice(0, current.length, word)
    } else {
      current.push(word)
      if (/[.,!?:]$/.test(word)) {
        chunks.push(current.join(' '))
        current.splice(0)
      }
    }
  })
  if (current.length) chunks.push(current.join(' '))
  return chunks.filter(Boolean)
}

export function buildChineseCurriculum(chunks, unitManifest) {
  return {
    languageId: 'zh-Hans',
    units: unitManifest.map(unit => ({
      id: `U${String(unit.number).padStart(2, '0')}`,
      number: unit.number,
      title: unit.title,
      description: unit.description || '',
      lessons: unit.lessons.map(lesson => ({
        id: `U${String(unit.number).padStart(2, '0')}-L${String(lesson.number).padStart(2, '0')}`,
        number: lesson.number,
        title: lesson.title,
        chunks: chunks
          .filter(chunk => chunk.unit === unit.number && chunk.lesson === lesson.number)
          .sort((left, right) => left.position - right.position)
          .map(chunk => ({
            id: createCardId('zh-Hans', chunk.chunk_id),
            legacyId: chunk.chunk_id,
            position: chunk.position,
            script: chunk.hanzi,
            pronunciation: chunk.pinyin,
            phonetic: chunk.thai_phonetic || '',
            translation: chunk.thai_translation,
            chunks: [chunk.hanzi]
          }))
      }))
    }))
  }
}

export function buildEnglishCurriculum(sessions) {
  return {
    languageId: 'en',
    units: sessions.map((session, unitIndex) => ({
      id: session.id,
      number: unitIndex + 1,
      title: session.title,
      description: 'English sentence practice',
      lessons: session.data.map((category, lessonIndex) => ({
        id: category.id,
        number: lessonIndex + 1,
        title: category.title,
        chunks: category.sentences.map((sentence, index) => ({
          id: createCardId('en', session.id, category.id, index + 1),
          legacyId: `${category.id}-${index}`,
          position: index + 1,
          script: sentence.en,
          pronunciation: '',
          phonetic: '',
          translation: sentence.th,
          chunks: smartChunk(sentence.en)
        }))
      }))
    }))
  }
}
