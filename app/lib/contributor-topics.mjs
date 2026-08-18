/**
 * Where a contributor's accepted work landed in the guide.
 *
 * The chronology answers "when, and with what proof". It cannot answer "which
 * parts of the guide exist because of this person" without the reader counting
 * rows by hand. This groups the published target paths by their topic section
 * once, at build time, from the snapshot the profile already has.
 *
 * A page is counted once however many accepted events touched it, because the
 * count means "pages this person's work reached", not "times it was edited".
 */

/**
 * @param {Array<{ event: { targets?: Array<{ path: string }> } }>} contributions
 * @returns {{ pageCount: number, topics: Array<{ slug: string, count: number }> }}
 */
export function contributorTopics(contributions) {
  const seenPaths = new Set()
  const bySlug = new Map()

  for (const entry of contributions || []) {
    for (const target of entry?.event?.targets || []) {
      const path = typeof target?.path === 'string' ? target.path : ''
      if (!path.startsWith('/') || seenPaths.has(path)) continue
      seenPaths.add(path)

      const slug = path.split('/')[1] || ''
      if (!slug) continue
      bySlug.set(slug, (bySlug.get(slug) || 0) + 1)
    }
  }

  const topics = [...bySlug.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))

  return { pageCount: seenPaths.size, topics }
}
