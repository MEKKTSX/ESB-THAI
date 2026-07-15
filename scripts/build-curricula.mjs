import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'
import { buildChineseCurriculum, buildEnglishCurriculum } from '../src/lib/curriculum-builders.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const option = name => args[args.indexOf(name) + 1]
const chinesePath = option('--chinese')
const chineseManifestPath = option('--chinese-manifest')

if (!chinesePath || !chineseManifestPath) {
  throw new Error('Usage: node scripts/build-curricula.mjs --chinese <dataset.json> --chinese-manifest <manifest.json>')
}

const readJson = source => JSON.parse(fs.readFileSync(source, 'utf8'))
const writeJson = (target, value) => {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, JSON.stringify(value, null, 2) + '\n')
}

function loadEnglishSessions() {
  const context = { window: { ESB_Sessions: [] } }
  vm.createContext(context)
  for (const file of ['session1.js', 'session2.js', 'session2.1.js', 'session2.2.js', 'session2.3.js', 'session3.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file })
  }
  return context.window.ESB_Sessions
}

const generatedAssets = []

function writeLanguage(curriculum) {
  const destination = path.join(root, 'public', 'content', curriculum.languageId)
  const manifest = {
    languageId: curriculum.languageId,
    units: curriculum.units.map(unit => ({
      id: unit.id, number: unit.number, title: unit.title, description: unit.description,
      lessons: unit.lessons.map(lesson => ({ id: lesson.id, number: lesson.number, title: lesson.title, chunkCount: lesson.chunks.length }))
    }))
  }
  writeJson(path.join(destination, 'manifest.json'), manifest)
  generatedAssets.push(`/content/${curriculum.languageId}/manifest.json`)
  curriculum.units.forEach(unit => {
    writeJson(path.join(destination, 'units', `${unit.id}.json`), manifest.units.find(entry => entry.id === unit.id))
    generatedAssets.push(`/content/${curriculum.languageId}/units/${unit.id}.json`)
    unit.lessons.forEach(lesson => {
      writeJson(path.join(destination, 'units', unit.id, 'lessons', `${lesson.id}.json`), lesson)
      generatedAssets.push(`/content/${curriculum.languageId}/units/${unit.id}/lessons/${lesson.id}.json`)
    })
  })
}

writeLanguage(buildChineseCurriculum(readJson(chinesePath), readJson(chineseManifestPath).units))
const englishCurriculum = buildEnglishCurriculum(loadEnglishSessions())
writeLanguage(englishCurriculum)
writeJson(path.join(root, 'public', 'content', 'en', 'legacy-map.json'), Object.fromEntries(
  englishCurriculum.units.flatMap(unit => unit.lessons.flatMap(lesson => lesson.chunks.map(chunk => [chunk.legacyId, chunk.id])))
))
generatedAssets.push('/content/en/legacy-map.json')
writeJson(path.join(root, 'public', 'content', 'assets.json'), generatedAssets)
