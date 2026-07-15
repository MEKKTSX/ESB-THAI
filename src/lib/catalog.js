export const LANGUAGE_CATALOG = [
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    accent: 'mint',
    curriculum: '/content/en/manifest.json'
  },
  {
    id: 'zh-Hans',
    name: 'Chinese',
    nativeName: '中文（简体）',
    flag: '🇨🇳',
    accent: 'sky',
    curriculum: '/content/zh-Hans/manifest.json'
  }
]

export const createCardId = (...parts) => parts.filter(part => part !== undefined).join(':')

export const getLanguage = languageId =>
  LANGUAGE_CATALOG.find(language => language.id === languageId)
