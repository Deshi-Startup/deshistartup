/** Walk through component wrappers so empty sections cannot hide in nested DOM. */
function inspectHeadingStructure($, article) {
  const errors = []
  let pending = null
  const visit = (node) => {
    if (node.type === 'text') {
      if (node.data.trim()) pending = null
      return
    }
    if (!node.tagName) return
    const element = $(node)
    if (element.is('[hidden], [aria-hidden="true"], .sr-only, script, style')) return
    if (/^h[1-6]$/.test(node.tagName)) {
      const level = Number(node.tagName[1])
      if (pending && level <= pending.level) {
        errors.push(`empty section before next heading: ${pending.text}`)
      }
      // A lower-level heading starts a legitimate subsection of its parent.
      pending = { level, text: element.text().trim() }
      return
    }
    if (element.is('img, svg, video, audio, iframe, canvas, input, select, textarea')) {
      pending = null
      return
    }
    for (const child of node.children || []) visit(child)
  }
  for (const node of article.toArray()) {
    pending = null
    visit(node)
    if (pending) errors.push(`empty section at end of article: ${pending.text}`)
  }
  return errors
}

/** Structural checks on rendered articles, beyond source citation syntax. */
export function inspectRenderedContent($, { route = '/' } = {}) {
  const errors = []
  const article = $('.article')
  const headings = article.find('h2').filter((_, heading) =>
    /^(Relevant Sources|প্রাসঙ্গিক সোর্স)$/.test($(heading).text().trim())
  )
  if (article.find('[data-footnotes]').length) {
    if (headings.length !== 1) errors.push('footnotes require one visible sources heading')
    headings.each((_, heading) => {
      if (!$(heading).next().is('[data-footnotes]')) {
        errors.push('footnotes are separated from the sources heading')
      }
    })
  }
  const ids = new Set($('[id]').map((_, element) => $(element).attr('id')).get())
  article.find('a[href]').each((_, link) => {
    const href = $(link).attr('href')
    let target
    try { target = new URL(href, `https://deshistartup.com${route}`) } catch { return }
    if (target.origin !== 'https://deshistartup.com') return
    const targetRoute = target.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/'
    if (targetRoute !== route) return
    const hash = target.hash.slice(1)
    if (!hash) return
    let id
    try { id = decodeURIComponent(hash) } catch {
      errors.push(`malformed fragment: #${hash}`)
      return
    }
    if (!ids.has(id)) errors.push(`missing fragment target: #${id}`)
  })
  errors.push(...inspectHeadingStructure($, article))
  return [...new Set(errors)]
}
