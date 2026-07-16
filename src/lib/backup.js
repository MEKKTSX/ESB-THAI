const BACKUP_VERSION = 1

export function createBackup(repository) {
  const state = repository.loadState()
  return { format: 'lingoflow-backup', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), state }
}

export function importBackup(repository, backup) {
  validateBackup(backup)
  repository.replaceAll(backup.state)
}

export function validateBackup(backup) {
  if (!backup || backup.format !== 'lingoflow-backup' || backup.version !== BACKUP_VERSION || !backup.state) {
    throw new Error('Unsupported LingoFlow backup')
  }
  return backup
}
