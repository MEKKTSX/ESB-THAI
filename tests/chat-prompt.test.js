import { describe, expect, it } from 'vitest'
import { buildSystemPrompt } from '../api/chat-prompt.js'

describe('LingoFlow AI prompt', () => {
  it('uses the requested supported language and trusted learning context', () => {
    const prompt = buildSystemPrompt({ languageId: 'zh-Hans', context: { script: '你好', translation: 'สวัสดี' } })
    expect(prompt).toContain('Simplified Chinese')
    expect(prompt).toContain('你好')
    expect(prompt).not.toContain('undefined')
  })

  it('rejects unsupported languages', () => {
    expect(() => buildSystemPrompt({ languageId: 'javascript' })).toThrow('Unsupported learning language')
  })
})
