export const DEFAULT_BOOKMARKS = [
  {
    id: 'ddg-lite',
    title: 'DuckDuckGo Lite',
    url: 'https://lite.duckduckgo.com/lite/',
    icon: '🔍',
    category: 'Search',
    description: 'Fast, privacy-friendly text search engine',
  },
  {
    id: 'wikipedia',
    title: 'Wikipedia',
    url: 'https://en.m.wikipedia.org/wiki/Classic_Mac_OS',
    icon: '📖',
    category: 'Reference',
    description: 'Free encyclopedia mobile view',
  },
  {
    id: 'frogfind',
    title: 'FrogFind',
    url: 'http://frogfind.com',
    icon: '🐸',
    category: 'Retro Web',
    description: 'The search engine for vintage computers',
  },
  {
    id: '68k-news',
    title: '68k.news',
    url: 'http://68k.news',
    icon: '📰',
    category: 'News',
    description: 'Minimalist global news headlines',
  },
  {
    id: 'hn',
    title: 'Hacker News',
    url: 'https://news.ycombinator.com/',
    icon: '⚡',
    category: 'Tech',
    description: 'Tech discussions and developer news',
  },
  {
    id: 'osm',
    title: 'World Map',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox=95.0%2C-11.0%2C141.0%2C6.0&layer=mapnik',
    icon: '🗺️',
    category: 'Utility',
    description: 'Interactive OpenStreetMap',
  },
  {
    id: 'w3c',
    title: 'W3C Web',
    url: 'https://www.w3.org/',
    icon: '🌐',
    category: 'Standards',
    description: 'World Wide Web Consortium standards',
  },
]

export const HOME_PAGE_URL = 'about:home'

export function normalizeBrowserUrl(input) {
  const trimmed = (input || '').trim()
  if (!trimmed) return HOME_PAGE_URL
  if (trimmed === 'about:home' || trimmed === 'about:blank') return trimmed

  // Check if it already has protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Check if it looks like a domain (e.g., example.com, sub.domain.org/path)
  const isDomainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed)
  if (isDomainPattern) {
    return `https://${trimmed}`
  }

  // Otherwise, treat as search query on DuckDuckGo
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`
}

export function isKnownFrameRestrictedDomain(url) {
  if (!url || typeof url !== 'string') return false
  if (url === HOME_PAGE_URL || url.startsWith('about:')) return false
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    const restricted = [
      'google.com',
      'google.co.id',
      'youtube.com',
      'github.com',
      'facebook.com',
      'twitter.com',
      'x.com',
      'instagram.com',
      'reddit.com',
      'linkedin.com',
      'amazon.com',
      'netflix.com',
      'apple.com',
      'microsoft.com',
    ]
    return restricted.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}
