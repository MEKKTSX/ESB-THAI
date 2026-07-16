import fs from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('LingoFlow PWA branding', () => {
  it('declares LingoFlow install metadata and a service worker', () => {
    const manifest = JSON.parse(fs.readFileSync('public/manifest.webmanifest', 'utf8'))
    const worker = fs.readFileSync('public/sw.js', 'utf8')
    expect(manifest.name).toBe('LingoFlow')
    expect(manifest.icons.some(icon => icon.src.includes('lingoflow-icon'))).toBe(true)
    expect(worker).toContain('lingoflow-v1')
    expect(worker).toContain('/content/')
  })
})
