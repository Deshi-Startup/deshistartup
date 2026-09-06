interface PagefindItem {
  id: string
  data: () => Promise<{
    url: string
    meta?: { title?: string; stub?: boolean | string | number }
    title?: string
    excerpt?: string
    content?: string
  }>
}

export interface Pagefind {
  init: () => Promise<void>
  search: (query: string) => Promise<{ results: PagefindItem[] }>
  options: (options: {
    baseUrl: string
    ranking: { metaWeights: Record<string, number> }
  }) => Promise<void>
}

/** Focus and typing share one fully configured index. Nothing loads until called. */
export function createPagefindLoader(
  importModule: (url: string) => Promise<Pagefind>,
  basePath = ''
) {
  let pending: Promise<Pagefind> | null = null
  let attempt = 0

  return () => {
    if (!pending) {
      // Browsers cache failed module imports too. A new URL after failure lets
      // the reader retry without reloading the article or losing their query.
      const retry = attempt ? `?retry=${attempt}` : ''
      pending = importModule(`${basePath}/_pagefind/pagefind.js${retry}`)
        .then(async (pagefind) => {
          await pagefind.options({
            baseUrl: basePath || '/',
            // Translated titles remain aliases below the visible title's 5x lead.
            ranking: { metaWeights: { 'alternate-title': 4 } }
          })
          await pagefind.init()
          return pagefind
        })
        .catch((error) => {
          pending = null
          attempt += 1
          throw error
        })
    }
    return pending
  }
}
