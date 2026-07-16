import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Bookmark, Bot, ChartNoAxesCombined, ChevronLeft, ChevronRight, Download, Flame, Home, Languages, Moon, RefreshCcw, Settings, Sparkles, Sun, Upload, UserRound, Volume2 } from 'lucide-react'
import { LANGUAGE_CATALOG, getLanguage } from './lib/catalog.js'
import { createProgressRepository } from './lib/progress-repository.js'
import { createCurriculumRepository, lessonPath } from './lib/curriculum-repository.js'
import { buildLessonProgress, buildPracticeQueue, buildReviewQueue, getLanguageMetrics, markChunkLearned, rateReview, toggleBookmark } from './lib/learning-progress.js'
import { createBackup, importBackup, validateBackup } from './lib/backup.js'
import { migrateLegacyEsb } from './lib/migration.js'

const title = language => language.id === 'en' ? 'English sentence practice' : '15 Units · 150 lessons'
const emptyStats = language => ({ language, progress: 0, due: 0, mastered: 0, reviewed: 0 })
const curriculumChunkCount = curriculum => curriculum?.units?.reduce((total, unit) => total + unit.lessons.reduce((count, lesson) => count + (lesson.chunkCount || 0), 0), 0) || 0

function LanguageSetup({ onChoose }) {
  return <main className="setup-screen"><div className="setup-card">
    <Brand />
    <p className="eyebrow">WELCOME TO YOUR FLOW</p>
    <h1>Choose your first language</h1>
    <p className="muted">You can add or change it anytime from Profile.</p>
    <div className="language-picker">{LANGUAGE_CATALOG.map(language => <button key={language.id} onClick={() => onChoose(language.id)} className="language-choice" aria-label={language.name}>
      <span className="flag">{language.flag}</span><span><strong>{language.nativeName}</strong><small>{title(language)}</small></span><ChevronRight />
    </button>)}</div>
  </div></main>
}

function Brand() { return <div className="brand"><span className="brand-mark">◒</span><strong>Lingo<span>Flow</span></strong></div> }

function Nav({ tab, setTab }) {
  const items = [["home", Home, 'Home'], ['courses', BookOpen, 'Courses'], ['review', RefreshCcw, 'SRS Review'], ['progress', ChartNoAxesCombined, 'Progress'], ['profile', UserRound, 'Profile']]
  return <nav className="bottom-nav">{items.map(([id, Icon, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}><Icon /><span>{label}</span></button>)}</nav>
}

function CourseRow({ stat, onOpen, compact = false }) {
  const { language, progress, due } = stat
  return <button className={'course-row ' + (compact ? 'compact' : '')} onClick={() => onOpen(language.id)}>
    <span className="flag">{language.flag}</span><span className="course-copy"><strong>{language.nativeName}</strong><small>{due ? `${due} items due` : title(language)}</small><span className="track"><span style={{ width: `${progress}%` }} /></span></span><span className="course-percent">{progress}%</span>
  </button>
}

function HomeScreen({ stats, metrics, onOpen, onReview }) {
  return <section className="screen home-screen"><header className="topbar"><Brand /><button className="icon-button" aria-label="Notifications">●</button></header>
    <h1>Hello, learner <span>👋</span></h1><p className="muted">Let’s keep your streak going!</p>
    <div className="metric-strip"><Metric icon={<Flame />} value={metrics.dayStreak} label="Day streak" /><Metric icon={<Sparkles />} value={metrics.xpToday} label="XP today" /><Metric icon={<ChartNoAxesCombined />} value={Math.floor(metrics.xp / 100) + 1} label="Level" /></div>
    <SectionTitle title="Today’s Review" action="See all" />
    <div className="panel">{stats.map(stat => <div className="review-row" key={stat.language.id}><span>{stat.language.flag}</span><span><strong>{stat.language.nativeName}</strong><small>{stat.due} items due</small></span><button onClick={() => onReview(stat.language.id)}>Review</button></div>)}</div>
    <SectionTitle title="Your Courses" action="See all" />
    <div className="panel course-panel">{stats.map(stat => <CourseRow key={stat.language.id} stat={stat} onOpen={onOpen} compact />)}</div>
  </section>
}

function Metric({ icon, value, label }) { return <div className="metric"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div> }
function SectionTitle({ title, action }) { return <div className="section-title"><h2>{title}</h2><button>{action}</button></div> }

function CoursesScreen({ stats, onOpen }) {
  return <section className="screen"><header className="screen-header"><div><h1>Courses</h1><p className="muted">Choose a language to learn</p></div><Languages /></header>
    <div className="filter-tabs"><button className="selected">All</button><button>Learning</button><button>Completed</button><button>Plan to learn</button></div>
    <div className="course-list">{stats.map(stat => <CourseRow key={stat.language.id} stat={stat} onOpen={onOpen} />)}</div>
    <div className="add-language"><span>+</span><div><strong>Add new language</strong><small>More languages coming soon!</small></div><ChevronRight /></div>
  </section>
}

export function StudyScreen({ language, curriculum, curriculumError, retryCurriculum, curriculumRepository, repository, onChange }) {
  const [unitId, setUnitId] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [failedLesson, setFailedLesson] = useState(null)
  useEffect(() => { setUnitId(curriculum?.units?.[0]?.id ?? null); setLesson(null); setFailedLesson(null) }, [curriculum, language.id])
  const unit = curriculum?.units?.find(item => item.id === unitId) || curriculum?.units?.[0]
  const progress = repository.loadLanguage(language.id)
  const openLesson = async lessonMeta => {
    const path = lessonPath(language.id, unit.id, lessonMeta.id)
    setFailedLesson(null)
    try {
      setLesson(await curriculumRepository.loadLesson(language.id, unit.id, lessonMeta.id))
    } catch {
      setFailedLesson({ lessonMeta, path })
    }
  }
  return <section className="screen"><header className="screen-header"><div><h1>{language.nativeName}</h1><p className="muted">{title(language)}</p></div><span className="language-pill">{language.flag} {language.name}</span></header>
    {curriculumError ? <LoadAlert message={curriculumError} onRetry={retryCurriculum} /> : !curriculum ? <Loading /> : <><div className="unit-rail">{curriculum.units.map(item => { const unitProgress = buildLessonProgress(progress.lessonProgress, item); return <button key={item.id} onClick={() => { setUnitId(item.id); setLesson(null); setFailedLesson(null) }} className={item.id === unit.id ? 'selected' : ''}>UNIT {item.number} · {unitProgress.learned}/{unitProgress.total} ({unitProgress.percent}%)</button> })}</div>
    <p className="unit-progress">Unit progress: {buildLessonProgress(progress.lessonProgress, unit).learned} / {buildLessonProgress(progress.lessonProgress, unit).total} chunks ({buildLessonProgress(progress.lessonProgress, unit).percent}%)</p><div className="lesson-list">{unit.lessons.map(item => { const lessonProgress = buildLessonProgress(progress.lessonProgress, item); return <button key={item.id} onClick={() => openLesson(item)} className="lesson-row"><span><small>LESSON {item.number}</small><strong>{item.title}</strong><em>{lessonProgress.learned} / {lessonProgress.total} chunks ({lessonProgress.percent}%)</em></span><ChevronRight /></button> })}</div>
    {failedLesson && <div className="lesson-alert" role="alert">Could not load {failedLesson.path}<button onClick={() => openLesson(failedLesson.lessonMeta)}>Retry</button></div>}
    {lesson && <LessonPlayer language={language} lesson={lesson} repository={repository} onClose={() => setLesson(null)} onChange={onChange} />}</>}</section>
}

export function LessonPlayer({ language, lesson, repository, onClose, onChange = () => {} }) {
  const [progress, setProgress] = useState(() => repository.loadLanguage(language.id))
  const [revealed, setRevealed] = useState(false)
  const sessionStartedAt = useRef(Date.now())
  const recordedSessionSeconds = useRef(0)
  useEffect(() => { sessionStartedAt.current = Date.now(); recordedSessionSeconds.current = 0; setProgress(repository.loadLanguage(language.id)); setRevealed(false) }, [language.id, lesson.id, repository])

  const savedProgress = progress.lessonProgress[lesson.id]
  const chunkIndex = Math.min(savedProgress?.currentChunkIndex ?? 0, lesson.chunks.length - 1)
  const chunk = lesson.chunks[chunkIndex]
  const learnedCount = savedProgress?.learnedChunkIds.length ?? 0
  const save = nextProgress => { repository.saveLanguage(language.id, nextProgress); setProgress(nextProgress); onChange() }
  const previous = () => {
    if (chunkIndex === 0) return
    save({ ...progress, lessonProgress: { ...progress.lessonProgress, [lesson.id]: { ...savedProgress, currentChunkIndex: chunkIndex - 1 } } })
    setRevealed(false)
  }
  const advance = () => {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartedAt.current) / 1000) - recordedSessionSeconds.current)
    const isNewlyLearned = !(savedProgress?.learnedChunkIds || []).includes(chunk.id)
    const nextProgress = markChunkLearned(progress, lesson.id, chunk.id, chunkIndex, lesson.chunks.length, new Date(), elapsedSeconds)
    if (isNewlyLearned) recordedSessionSeconds.current += elapsedSeconds
    save(nextProgress)
    setRevealed(false)
    if (chunkIndex === lesson.chunks.length - 1) onClose()
  }
  const isLastChunk = chunkIndex === lesson.chunks.length - 1
  const isBookmarked = progress.bookmarks.includes(chunk.id)

  return <div className="modal-backdrop"><article className="lesson-modal lesson-player" aria-label={`${lesson.title} lesson player`}><button className="close" aria-label="Close lesson" onClick={onClose}>×</button><small>LESSON {lesson.number}</small><h2>{lesson.title}</h2><div className="lesson-progress"><span style={{ width: `${(learnedCount / lesson.chunks.length) * 100}%` }} /></div><p className="saved-position">Saved position: Chunk {chunkIndex + 1} of {lesson.chunks.length}</p><article className="study-card active-chunk"><div><strong className="script">{chunk.script}</strong>{chunk.pronunciation && <span className="pronunciation">{chunk.pronunciation}</span>}{revealed && <p>{chunk.translation}</p>}</div><Volume2 /></article>{!revealed && <button className="translation-toggle" onClick={() => setRevealed(true)}>Show translation</button>}<div className="lesson-actions"><button className="icon-action" aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark chunk'} onClick={() => save(toggleBookmark(progress, chunk.id))}><Bookmark fill={isBookmarked ? 'currentColor' : 'none'} /></button><button className="secondary" onClick={previous} disabled={chunkIndex === 0}><ChevronLeft /> Previous</button><button className="primary" onClick={advance}>{isLastChunk ? 'Finish' : 'Next chunk'} {!isLastChunk && <ChevronRight />}</button></div></article></div>
}

export function ReviewScreen({ language, repository, onLanguageChange, onChange }) {
  const [progress, setProgress] = useState(() => repository.loadLanguage(language.id))
  const [card, setCard] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [loadRevision, setLoadRevision] = useState(0)
  const ratingInProgress = useRef(false)
  const curriculumRepository = useMemo(() => createCurriculumRepository(), [])
  const now = Date.now()
  const dueQueue = buildReviewQueue(progress, now)
  const practiceQueue = buildPracticeQueue(progress, now)
  const mode = dueQueue.length ? 'Review' : practiceQueue.length ? 'Practice' : null
  const queuedCardId = (dueQueue[0] || practiceQueue[0])?.id
  useEffect(() => { ratingInProgress.current = false; setProgress(repository.loadLanguage(language.id)); setCard(null); setRevealed(false); setLoadError(null) }, [language.id, repository])
  useEffect(() => {
    if (!queuedCardId) { ratingInProgress.current = false; setCard(null); return }
    let cancelled = false
    setLoadError(null)
    curriculumRepository.loadManifest(language.id).then(async manifest => {
      const unit = manifest.units.find(item => item.lessons.some(lesson => queuedCardId.startsWith(`${language.id}:${lesson.id}`) || queuedCardId.includes(`:${lesson.id}:`)))
      const lesson = unit?.lessons.find(item => queuedCardId.startsWith(`${language.id}:${item.id}`) || queuedCardId.includes(`:${item.id}:`))
      if (!lesson) return null
      const payload = await curriculumRepository.loadLesson(language.id, unit.id, lesson.id)
      return payload.chunks.find(item => item.id === queuedCardId) || null
    }).then(nextCard => { if (!cancelled) { ratingInProgress.current = false; setCard(nextCard) } }).catch(error => { if (!cancelled) { ratingInProgress.current = false; setCard(null); setLoadError(error.message) } })
    return () => { cancelled = true }
  }, [language.id, queuedCardId, loadRevision, curriculumRepository])
  const rate = rating => {
    if (!card || ratingInProgress.current) return
    ratingInProgress.current = true
    setCard(null)
    const nextProgress = rateReview(progress, card.id, rating)
    repository.saveLanguage(language.id, nextProgress)
    setProgress(nextProgress)
    onChange()
    setRevealed(false)
  }
  return <section className="screen review-screen"><header className="review-header"><h1>SRS Review</h1><Settings /></header><select value={language.id} onChange={event => onLanguageChange(event.target.value)}>{LANGUAGE_CATALOG.map(item => <option key={item.id} value={item.id}>{item.flag} {item.nativeName}</option>)}</select><div className="review-progress"><span /></div>
    {loadError ? <LoadAlert message={loadError} onRetry={() => setLoadRevision(value => value + 1)} /> : card ? <><p className="review-mode">{mode}</p><button className="review-card" onClick={() => setRevealed(true)}><strong className="script">{card.script}</strong>{card.pronunciation && <span className="pronunciation">{card.pronunciation}</span>}{revealed && <p>{card.translation}</p>}{!revealed && <small>✦ Tap to show answer</small>}<Volume2 /></button><div className="rating-grid">{[['again','ยากอีกครั้ง'],['hard','จำได้ 1 วัน'],['good','ง่าย 4 วัน'],['easy','ง่ายมาก 7 วัน']].map(([rating, label]) => <button key={rating} className={rating} onClick={() => rate(rating)}><span>{rating === 'again' ? '☹' : rating === 'hard' ? '😐' : rating === 'good' ? '🙂' : '😄'}</span>{label}</button>)}</div></> : queuedCardId ? <Loading /> : <div className="loading">No reviews due right now.</div>}</section>
}

function ProgressScreen({ stats, metrics }) { const total = Math.round(stats.reduce((sum, item) => sum + item.progress, 0) / stats.length); const studyTime = `${Math.floor(metrics.studySeconds / 60)}m ${metrics.studySeconds % 60}s`; return <section className="screen"><header className="screen-header"><h1>Progress</h1><ChartNoAxesCombined /></header><div className="filter-tabs"><button className="selected">Overview</button><button>Languages</button><button>Skills</button></div><div className="progress-card"><div className="donut" style={{ '--progress': `${total * 3.6}deg` }}><strong>{total}%</strong><small>Mastery</small></div><div>{stats.map(stat => <div className="progress-row" key={stat.language.id}><span>{stat.language.flag} {stat.language.nativeName}</span><strong>{stat.progress}%</strong><div className="track"><span style={{width: `${stat.progress}%`}} /></div></div>)}</div></div><h2>Weekly activity</h2><div className="bars">{metrics.weeklyActivity.map(day => <span key={day.date} style={{height: `${day.value * 24}px`}} aria-label={`${day.value} activities on ${day.date}`}><i />{day.label}</span>)}</div><div className="stat-cards"><div><Sparkles /><strong>{metrics.xpThisWeek}</strong><small>XP this week</small></div><div><BookOpen /><strong>{metrics.reviewedThisWeek}</strong><small>Items reviewed</small></div><div><ChartNoAxesCombined /><strong>{studyTime}</strong><small>Study time</small></div></div><div className="coming-soon"><Bot /><div><strong>Skills</strong><p>Skill-level insights are coming with future curriculum metadata.</p></div></div></section> }

function Assistant({ language }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [status, setStatus] = useState('')
  const ask = async event => {
    event.preventDefault()
    if (!message.trim()) return
    setStatus('Thinking…')
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, languageId: language.id, context: { screen: 'learning' } }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to reach the tutor.')
      setAnswer(payload.reply || payload.text || 'I am ready to help you keep learning.')
      setStatus('')
    } catch (error) { setStatus(error.message || 'Unable to reach the tutor.') }
  }
  return <><button className="assistant-trigger" aria-label="Ask LingoFlow" onClick={() => setOpen(true)}><Bot /></button>{open && <div className="assistant-backdrop" role="dialog" aria-modal="true" aria-label="LingoFlow assistant"><form className="assistant-panel" onSubmit={ask}><header><div><Bot /><strong>Ask LingoFlow</strong><small>{language.flag} {language.nativeName}</small></div><button type="button" aria-label="Close assistant" onClick={() => setOpen(false)}>×</button></header><p>{answer || `Ask about your ${language.name} course, a sentence, or a study tip.`}</p><label><span className="sr-only">Question for LingoFlow</span><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask a question…" autoFocus /></label><footer><small>{status}</small><button className="primary" type="submit">Send</button></footer></form></div>}</>
}

export function ProfileScreen({ settings, setSettings, repository }) {
  const [importError, setImportError] = useState('')
  const exportBackup = () => { const blob = new Blob([JSON.stringify(createBackup(repository), null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'lingoflow-backup.json'; link.click(); URL.revokeObjectURL(link.href) }
  const importFile = async event => { const file = event.target.files?.[0]; if (!file) return; try { const backup = validateBackup(JSON.parse(await file.text())); if (!window.confirm('Replace all LingoFlow progress with this backup?')) return; importBackup(repository, backup); window.location.reload() } catch { setImportError('Unable to import backup. Choose a compatible LingoFlow backup file.') } }
  if (importError) return <section className="screen"><div className="lesson-alert" role="alert">{importError}</div></section>
  return <section className="screen"><header className="screen-header"><div><h1>Profile</h1><p className="muted">Your learning space</p></div><UserRound /></header><div className="profile-hero"><span>LF</span><div><strong>LingoFlow learner</strong><small>Learning at your pace</small></div></div><h2>Appearance</h2><div className="settings-row"><span>{settings.theme === 'dark' ? <Moon /> : <Sun />}</span><div><strong>Theme</strong><small>Follow system or choose your preference</small></div><select value={settings.theme} onChange={event => setSettings({ ...settings, theme: event.target.value })}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div><h2>Learning</h2><div className="settings-row"><Languages /><div><strong>Default language</strong><small>Used when opening study or review</small></div><select value={settings.defaultLanguage} onChange={event => setSettings({ ...settings, defaultLanguage: event.target.value })}>{LANGUAGE_CATALOG.map(language => <option key={language.id} value={language.id}>{language.nativeName}</option>)}</select></div><h2>Backup</h2><div className="backup-actions"><button onClick={exportBackup}><Download /> Export all languages</button><label><Upload /> Import and replace<input type="file" accept="application/json" onChange={importFile} /></label></div></section>
}

function Loading() { return <div className="loading">Loading your course…</div> }

function LoadAlert({ message, onRetry }) { return <div className="lesson-alert" role="alert">Could not load {message}<button onClick={onRetry}>Retry</button></div> }

export default function App({ storageKey }) {
  const repository = useMemo(() => createProgressRepository(window.localStorage, storageKey), [storageKey])
  const curriculumRepository = useMemo(() => createCurriculumRepository(), [])
  const [settings, setSettingsState] = useState(() => repository.loadSettings())
  const [activeLanguageId, setActiveLanguageId] = useState(settings.defaultLanguage)
  const [tab, setTab] = useState('home')
  const [curricula, setCurricula] = useState({})
  const [curriculumErrors, setCurriculumErrors] = useState({})
  const [, setRevision] = useState(0)
  const setSettings = value => { repository.saveSettings(value); setSettingsState(repository.loadSettings()); if (value.defaultLanguage) setActiveLanguageId(value.defaultLanguage) }
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)') || { matches: false, addEventListener: () => {}, removeEventListener: () => {} }
    const apply = () => { document.documentElement.dataset.theme = settings.theme === 'system' ? (media.matches ? 'dark' : 'light') : settings.theme }
    apply(); media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [settings.theme])
  const loadCurriculum = languageId => curriculumRepository.loadManifest(languageId)
    .then(data => { setCurricula(current => ({ ...current, [languageId]: data })); setCurriculumErrors(current => ({ ...current, [languageId]: null })) })
    .catch(error => setCurriculumErrors(current => ({ ...current, [languageId]: error.message })))
  useEffect(() => { LANGUAGE_CATALOG.forEach(language => loadCurriculum(language.id)) }, [curriculumRepository])
  useEffect(() => { fetch('/content/en/legacy-map.json').then(response => response.json()).then(map => { if (migrateLegacyEsb(repository, window.localStorage, map)) setRevision(value => value + 1) }).catch(() => {}) }, [repository])
  if (!activeLanguageId) return <LanguageSetup onChoose={languageId => setSettings({ ...settings, defaultLanguage: languageId })} />
  const activeLanguage = getLanguage(activeLanguageId)
  const stats = LANGUAGE_CATALOG.map(language => {
    const metrics = getLanguageMetrics(repository.loadLanguage(language.id), curriculumChunkCount(curricula[language.id]), Date.now())
    return { ...emptyStats(language), ...metrics, language }
  })
  const activeMetrics = stats.find(stat => stat.language.id === activeLanguageId) || emptyStats(activeLanguage)
  const openLanguage = languageId => { setActiveLanguageId(languageId); setTab('study') }
  const openReview = languageId => { setActiveLanguageId(languageId); setTab('review') }
  const onProgressChange = () => setRevision(value => value + 1)
  const screens = { home: <HomeScreen stats={stats} metrics={activeMetrics} onOpen={openLanguage} onReview={openReview} />, courses: <CoursesScreen stats={stats} onOpen={openLanguage} />, study: <StudyScreen language={activeLanguage} curriculum={curricula[activeLanguageId]} curriculumError={curriculumErrors[activeLanguageId]} retryCurriculum={() => loadCurriculum(activeLanguageId)} curriculumRepository={curriculumRepository} repository={repository} onChange={onProgressChange} />, review: <ReviewScreen language={activeLanguage} repository={repository} onLanguageChange={setActiveLanguageId} onChange={onProgressChange} />, progress: <ProgressScreen stats={stats} metrics={activeMetrics} />, profile: <ProfileScreen settings={settings} setSettings={setSettings} repository={repository} /> }
  return <main className="app-shell">{screens[tab]}<Assistant language={activeLanguage} /><Nav tab={tab} setTab={setTab} /></main>
}
