const BACKUP_VERSION = 1
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)

export function createBackup(repository) {
  const state = repository.loadState()
  return { format: 'lingoflow-backup', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), state }
}

export function importBackup(repository, backup) {
  validateBackup(backup)
  repository.replaceAll(backup.state)
}

export function validateBackup(backup) {
  if (!backup || backup.format !== 'lingoflow-backup' || backup.version !== BACKUP_VERSION || !isObject(backup.state)) {
    throw new Error('Unsupported LingoFlow backup')
  }
  const { settings, languages } = backup.state
  if (!isObject(settings) || !isObject(languages)) throw new Error('Unsupported LingoFlow backup')
  for (const language of Object.values(languages)) {
    if (!isObject(language)
      || !isObject(language.lessonProgress)
      || !Array.isArray(language.bookmarks)
      || !isObject(language.srs)
      || !Array.isArray(language.reviewHistory)
      || !Array.isArray(language.activity)
      || !Number.isFinite(language.xp) || language.xp < 0
      || !Number.isFinite(language.studySeconds) || language.studySeconds < 0) {
      throw new Error('Unsupported LingoFlow backup')
    }
  }
  return backup
}
