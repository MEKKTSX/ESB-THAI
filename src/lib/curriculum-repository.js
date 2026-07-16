export const lessonPath = (languageId, unitId, lessonId) =>
  `/content/${languageId}/units/${unitId}/lessons/${lessonId}.json`

export function createCurriculumRepository(fetchImpl = fetch) {
  const loadJson = async path => {
    const response = await fetchImpl(path)
    if (!response.ok) throw new Error(`Unable to load ${path}`)
    return response.json()
  }

  return {
    loadManifest: languageId => loadJson(`/content/${languageId}/manifest.json`),
    async loadLesson(languageId, unitId, lessonId) {
      const path = lessonPath(languageId, unitId, lessonId)
      const lesson = await loadJson(path)
      if (lesson.id !== lessonId || !Array.isArray(lesson.chunks) || !lesson.chunks.length) {
        throw new Error(`Invalid lesson asset: ${path}`)
      }
      return lesson
    }
  }
}
