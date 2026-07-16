import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { lessonPath } from '../src/lib/curriculum-repository.js'

const root = process.cwd()
const load = target => JSON.parse(fs.readFileSync(path.join(root, target), 'utf8'))

describe('generated curriculum assets', () => {
  it('contains the complete Chinese 15 × 10 × 10 curriculum', () => {
    const manifest = load('public/content/zh-Hans/manifest.json')
    expect(manifest.units).toHaveLength(15)
    expect(manifest.units.every(unit => unit.lessons.length === 10)).toBe(true)
    const lessons = manifest.units.flatMap(unit => unit.lessons.map(lesson => ({ unit, lesson })))
    expect(lessons).toHaveLength(150)
    expect(lessons.every(({ unit, lesson }) => {
      const file = load(`public/content/zh-Hans/units/${unit.id}/lessons/${lesson.id}.json`)
      return file.chunks.length === 10 && file.chunks.every(chunk => chunk.id.startsWith('zh-Hans:U'))
    })).toBe(true)
  })

  it('maps every Chinese lesson to its generated asset path', () => {
    const chinese = load('public/content/zh-Hans/manifest.json')

    for (const unit of chinese.units) for (const lesson of unit.lessons) {
      expect(lessonPath('zh-Hans', unit.id, lesson.id))
        .toMatch(/U\d\d\/lessons\/U\d\d-L\d\d\.json$/)
    }
  })

  it('contains every legacy English card in the shared curriculum schema', () => {
    const manifest = load('public/content/en/manifest.json')
    const cards = manifest.units.flatMap(unit => unit.lessons.flatMap(lesson =>
      load(`public/content/en/units/${unit.id}/lessons/${lesson.id}.json`).chunks))
    expect(cards).toHaveLength(1725)
    expect(cards.every(card => card.id.startsWith('en:') && card.translation)).toBe(true)
  })
})
