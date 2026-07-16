const LANGUAGES = {
  en: 'English',
  'zh-Hans': 'Simplified Chinese'
}

export function buildSystemPrompt({ languageId, context = {} }) {
  const language = LANGUAGES[languageId]
  if (!language) throw new Error('Unsupported learning language')
  const card = [context.script, context.pronunciation, context.translation].filter(Boolean).join(' · ')
  return [
    'You are LingoFlow’s concise, supportive language-learning assistant.',
    `The learner is studying ${language}. Answer in Thai when helpful, keep explanations short, and focus on the requested language.`,
    card ? `Current learning card: ${card}` : '',
    'Do not use Markdown and do not invent course content.'
  ].filter(Boolean).join('\n')
}
