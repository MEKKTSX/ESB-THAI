export const lessonPath = (languageId, unitId, lessonId) =>
  `/content/${languageId}/units/${unitId}/lessons/${lessonId}.json`

export function createCurriculumRepository(fetchImpl = fetch) {
  const loadJson = async path => {
    const response = await fetchImpl(path)
    if (!response.ok) throw new Error(`Unable to load ${path}`)
    return response.json()
  }

  return {
    async loadManifest(languageId) {
      const path = `/content/${languageId}/manifest.json`
      const manifest = await loadJson(path)
      if (!Array.isArray(manifest.units) || !manifest.units.every(unit => unit?.id && Array.isArray(unit.lessons))) {
        throw new Error(`Invalid manifest asset: ${path}`)
      }
      return manifest
    },
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
