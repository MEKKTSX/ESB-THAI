import { describe, expect, it, vi } from 'vitest'
import { createCurriculumRepository } from '../src/lib/curriculum-repository.js'

describe('curriculum repository', () => {
  it('loads a requested lesson and rejects malformed content', async () => {
    const fetchImpl = vi.fn(url => Promise.resolve({
      ok: true,
      json: async () => url.endsWith('U01-L01.json')
        ? { id: 'U01-L01', chunks: [{ id: 'zh-Hans:U01-L01:001' }] }
        : { id: 'wrong', chunks: [] }
    }))
    const repo = createCurriculumRepository(fetchImpl)

    await expect(repo.loadLesson('zh-Hans', 'U01', 'U01-L01')).resolves.toMatchObject({ id: 'U01-L01' })
    await expect(repo.loadLesson('zh-Hans', 'U01', 'U01-L02')).rejects.toThrow('Invalid lesson asset')
  })
})
