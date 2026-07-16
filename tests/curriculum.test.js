import { describe, expect, it } from 'vitest'
import { buildChineseCurriculum, buildEnglishCurriculum } from '../src/lib/curriculum-builders.js'

describe('curriculum builders', () => {
  it('groups Chinese chunks into unit and lesson assets without changing their identity', () => {
    const chunks = Array.from({ length: 10 }, (_, index) => ({
      dataset_version: 'cc-v2', chunk_id: `U01-L01-C${String(index + 1).padStart(3, '0')}`,
      unit: 1, lesson: 1, position: index + 1, hanzi: `汉字${index + 1}`, pinyin: 'hàn zì', thai_translation: 'คำแปล'
    }))
    const result = buildChineseCurriculum(chunks, [{ number: 1, title: 'Unit 1', lessons: [{ number: 1, title: 'Lesson 1' }] }])

    expect(result.units).toHaveLength(1)
    expect(result.units[0].lessons[0].chunks).toHaveLength(10)
    expect(result.units[0].lessons[0].chunks[0]).toMatchObject({ id: 'zh-Hans:U01-L01-C001', script: '汉字1' })
  })

  it('converts English sessions into reusable unit, lesson, and card records', () => {
    const sessions = [{ id: 'session-1', title: 'Session 1: Basics', data: [{ id: 'A', title: 'Greetings', sentences: [{ en: 'How are you today?', th: 'วันนี้เป็นอย่างไรบ้าง?' }] }] }]
    const result = buildEnglishCurriculum(sessions)

    expect(result.units[0].id).toBe('session-1')
    expect(result.units[0].lessons[0].chunks[0]).toMatchObject({
      id: 'en:session-1:A:1', script: 'How are you today?', translation: 'วันนี้เป็นอย่างไรบ้าง?', chunks: ['How are you today?']
    })
  })
})
