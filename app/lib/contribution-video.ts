const VIDEO_FENCE = 'deshi-video'
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const FACEBOOK_HOSTS = new Set([
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'web.facebook.com'
])
const FACEBOOK_SHORT_HOSTS = new Set(['fb.watch', 'www.fb.watch'])
const EDITABLE_VIDEO_COMPONENTS = new Set(['YouTube', 'FacebookVideo'])

export type VideoProvider = 'youtube' | 'facebook'

export interface ContributionVideo {
  provider: VideoProvider
  url: string
  videoId?: string
  title: string
  caption?: string
  start?: number
  date?: string
  locale: 'bn' | 'en'
  thumbnail?: string
  uid?: string
  loading?: boolean
}

function safeUrl(value: string): URL | null {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

function durationSeconds(value: string | null): number | undefined {
  if (!value) return undefined
  if (/^\d+$/.test(value)) {
    const seconds = Number(value)
    return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : undefined
  }
  const match = value.toLowerCase().match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!match) return undefined
  const seconds = Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : undefined
}

function youtubeData(url: URL, locale: 'bn' | 'en'): ContributionVideo | null {
  const host = url.hostname.toLowerCase()
  let videoId = ''

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0] || ''
  } else if (
    host === 'youtube.com' ||
    host === 'www.youtube.com' ||
    host === 'm.youtube.com' ||
    host === 'music.youtube.com'
  ) {
    const parts = url.pathname.split('/').filter(Boolean)
    if (url.pathname === '/watch') videoId = url.searchParams.get('v') || ''
    else if (['shorts', 'live', 'embed'].includes(parts[0] || '')) videoId = parts[1] || ''
  } else if (
    host === 'youtube-nocookie.com' ||
    host === 'www.youtube-nocookie.com'
  ) {
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'embed') videoId = parts[1] || ''
  }

  if (!YOUTUBE_ID.test(videoId)) return null
  const start =
    durationSeconds(url.searchParams.get('t')) ||
    durationSeconds(url.searchParams.get('start'))
  const canonical = new URL('https://www.youtube.com/watch')
  canonical.searchParams.set('v', videoId)
  if (start) canonical.searchParams.set('t', String(start))

  return {
    provider: 'youtube',
    url: canonical.toString(),
    videoId,
    title: locale === 'en' ? 'YouTube video' : 'YouTube ভিডিও',
    ...(start ? { start } : {}),
    locale,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    loading: true
  }
}

function isFacebookVideoPath(url: URL): boolean {
  const path = url.pathname.replace(/\/+$/, '') || '/'
  return (
    /\/videos\/[^/]+$/i.test(path) ||
    /\/reel\/[^/]+$/i.test(path) ||
    /\/share\/(?:v|r)\/[^/]+$/i.test(path) ||
    (/^\/watch$/i.test(path) && Boolean(url.searchParams.get('v'))) ||
    (/^\/video\.php$/i.test(path) && Boolean(url.searchParams.get('v')))
  )
}

function facebookData(url: URL, locale: 'bn' | 'en'): ContributionVideo | null {
  const host = url.hostname.toLowerCase()
  if (FACEBOOK_SHORT_HOSTS.has(host)) {
    if (url.pathname === '/' || !url.pathname) return null
    const canonical = new URL(`https://fb.watch${url.pathname}`)
    return {
      provider: 'facebook',
      url: canonical.toString(),
      title: locale === 'en' ? 'Facebook video' : 'Facebook ভিডিও',
      locale,
      loading: false
    }
  }
  if (!FACEBOOK_HOSTS.has(host) || !isFacebookVideoPath(url)) return null

  const canonical = new URL(`https://www.facebook.com${url.pathname}`)
  for (const name of ['v', 'story_fbid', 'id']) {
    const value = url.searchParams.get(name)
    if (value) canonical.searchParams.set(name, value)
  }
  return {
    provider: 'facebook',
    url: canonical.toString(),
    title: locale === 'en' ? 'Facebook video' : 'Facebook ভিডিও',
    locale,
    loading: false
  }
}

export function parseContributionVideoUrl(
  value: string,
  locale: 'bn' | 'en' = 'bn'
): ContributionVideo | null {
  const url = safeUrl(value)
  if (!url) return null
  return youtubeData(url, locale) || facebookData(url, locale)
}

export function isValidFacebookVideoUrl(value: string): boolean {
  return parseContributionVideoUrl(value, 'en')?.provider === 'facebook'
}

export async function fetchYouTubeMetadata(
  video: ContributionVideo
): Promise<Pick<ContributionVideo, 'title' | 'thumbnail' | 'loading'>> {
  if (video.provider !== 'youtube' || !video.videoId) {
    return { title: video.title, thumbnail: video.thumbnail, loading: false }
  }
  const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}`
  const endpoint =
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watchUrl)}`
  try {
    const response = await fetch(endpoint, { mode: 'cors', credentials: 'omit' })
    if (!response.ok) throw new Error(`youtube_oembed_${response.status}`)
    const metadata = await response.json()
    const title =
      typeof metadata?.title === 'string' ? metadata.title.trim().slice(0, 300) : ''
    return {
      title: title || video.title,
      thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
      loading: false
    }
  } catch {
    return { title: video.title, thumbnail: video.thumbnail, loading: false }
  }
}

function mapOutsideCodeFences(source: string, transform: (segment: string) => string): string {
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) || []
  const output: string[] = []
  let plain = ''
  let fence: { char: string; length: number } | null = null

  const flushPlain = () => {
    if (!plain) return
    output.push(transform(plain))
    plain = ''
  }

  for (const line of lines) {
    const opening: RegExpMatchArray | null = fence
      ? null
      : line.match(/^[ \t]{0,3}(`{3,}|~{3,})/)
    if (opening) {
      flushPlain()
      fence = { char: opening[1][0], length: opening[1].length }
      output.push(line)
      continue
    }
    if (fence) {
      output.push(line)
      const trimmed = line.trim()
      if (
        trimmed.length >= fence.length &&
        [...trimmed].every((character) => character === fence?.char)
      ) {
        fence = null
      }
      continue
    }
    plain += line
  }
  flushPlain()
  return output.join('')
}

function decodeMdxAttribute(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function mdxAttributes(raw: string): Record<string, string> {
  const output: Record<string, string> = {}
  for (const match of raw.matchAll(
    /([A-Za-z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g
  )) {
    output[match[1]] = decodeMdxAttribute(match[2] ?? match[3] ?? match[4] ?? '')
  }
  return output
}

function normalizedVideo(value: unknown): ContributionVideo | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Partial<ContributionVideo>
  if (raw.provider !== 'youtube' && raw.provider !== 'facebook') return null
  if (typeof raw.url !== 'string') return null
  const parsed = parseContributionVideoUrl(raw.url, raw.locale === 'en' ? 'en' : 'bn')
  if (!parsed || parsed.provider !== raw.provider) return null

  const title = typeof raw.title === 'string' ? raw.title.slice(0, 300) : parsed.title
  const caption = typeof raw.caption === 'string' ? raw.caption.slice(0, 500) : ''
  const date = typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
    ? raw.date
    : ''
  const start =
    raw.provider === 'youtube' && Number.isSafeInteger(Number(raw.start)) && Number(raw.start) > 0
      ? Math.min(Number(raw.start), 86_400)
      : parsed.start

  return {
    ...parsed,
    title,
    ...(caption ? { caption } : {}),
    ...(start ? { start } : {}),
    ...(date ? { date } : {}),
    locale: raw.locale === 'en' ? 'en' : 'bn',
    ...(typeof raw.thumbnail === 'string' ? { thumbnail: raw.thumbnail } : {}),
    ...(typeof raw.uid === 'string' ? { uid: raw.uid } : {}),
    loading: Boolean(raw.loading)
  }
}

export function videoFencePayload(video: ContributionVideo): string {
  const normalized = normalizedVideo(video)
  if (!normalized) throw new Error('invalid_video')
  return JSON.stringify(normalized)
}

export function videoFence(video: ContributionVideo): string {
  return `\`\`\`${VIDEO_FENCE}\n${videoFencePayload(video)}\n\`\`\``
}

export function parseVideoFencePayload(payload: string): ContributionVideo | null {
  try {
    return normalizedVideo(JSON.parse(payload))
  } catch {
    return null
  }
}

export function isVideoFenceNode(node: { type?: unknown; lang?: unknown; value?: unknown }): boolean {
  return (
    node.type === 'code' &&
    node.lang === VIDEO_FENCE &&
    typeof node.value === 'string' &&
    Boolean(parseVideoFencePayload(node.value))
  )
}

function componentVideo(name: string, rawAttributes: string): ContributionVideo | null {
  const attrs = mdxAttributes(rawAttributes)
  const locale = attrs.locale === 'en' ? 'en' : 'bn'
  if (name === 'YouTube') {
    const parsed = parseContributionVideoUrl(
      `https://www.youtube.com/watch?v=${attrs.id || ''}${
        attrs.start ? `&t=${attrs.start}` : ''
      }`,
      locale
    )
    if (!parsed) return null
    return normalizedVideo({
      ...parsed,
      title: attrs.title || parsed.title,
      caption: attrs.caption,
      start: attrs.start ? Number(attrs.start) : parsed.start,
      date: attrs.date,
      locale,
      loading: false
    })
  }
  if (name === 'FacebookVideo') {
    const parsed = parseContributionVideoUrl(attrs.url || '', locale)
    if (!parsed) return null
    return normalizedVideo({
      ...parsed,
      title: attrs.title || parsed.title,
      caption: attrs.caption,
      date: attrs.date,
      locale,
      loading: false
    })
  }
  return null
}

export function encodeEditableVideos(body: string): string {
  return mapOutsideCodeFences(body, (segment) =>
    segment.replace(
      /<(YouTube|FacebookVideo)\b([\s\S]*?)\/>/g,
      (match, name: string, rawAttributes: string) => {
        const video = componentVideo(name, rawAttributes)
        return video ? videoFence(video) : match
      }
    )
  )
}

function escapeMdxAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r?\n/g, ' ')
}

function videoComponent(video: ContributionVideo): string {
  const common = [
    `title="${escapeMdxAttribute(video.title.trim())}"`,
    video.caption ? `caption="${escapeMdxAttribute(video.caption)}"` : '',
    video.date ? `date="${video.date}"` : '',
    video.locale === 'en' ? 'locale="en"' : ''
  ].filter(Boolean)
  if (video.provider === 'youtube') {
    return `<YouTube ${[
      `id="${video.videoId}"`,
      ...common,
      video.start ? `start={${video.start}}` : ''
    ].filter(Boolean).join(' ')} />`
  }
  return `<FacebookVideo ${[
    `url="${escapeMdxAttribute(video.url)}"`,
    ...common
  ].join(' ')} />`
}

export function decodeEditableVideos(markdown: string): string {
  return markdown.replace(
    new RegExp(`\`\`\`${VIDEO_FENCE}\\r?\\n([^\\n]+)\\r?\\n\`\`\``, 'g'),
    (match, payload: string) => {
      const video = parseVideoFencePayload(payload)
      return video ? videoComponent(video) : match
    }
  )
}

export function editableVideoError(markdown: string): string | null {
  const pattern = new RegExp(
    `\`\`\`${VIDEO_FENCE}\\r?\\n([^\\n]+)\\r?\\n\`\`\``,
    'g'
  )
  let error: string | null = null
  const remainder = markdown.replace(pattern, (_match, payload: string) => {
    const video = parseVideoFencePayload(payload)
    if (!video) error = 'video_link_invalid'
    else if (!video.title.trim()) error = 'video_title_required'
    return ''
  })
  if (error) return error
  return remainder.includes(`\`\`\`${VIDEO_FENCE}`)
    ? 'video_link_invalid'
    : null
}

export function isEditableVideoComponent(name: string): boolean {
  return EDITABLE_VIDEO_COMPONENTS.has(name)
}
