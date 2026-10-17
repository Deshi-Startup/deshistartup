import { canonicalUrl } from '../../app/seo.config.mjs'

/** Validate graph identity and locale contracts in the actual exported HTML. */
export function inspectSchemaGraph(schema, { page, pageType, articleExpected, visibleItems = [], definedTerms = [] }) {
  const issues = []
  if (schema?.['@context'] !== 'https://schema.org') issues.push('JSON-LD must use the schema.org context')
  const graph = schema?.['@graph']
  if (!Array.isArray(graph)) return [...issues, 'JSON-LD graph is missing']
  const url = canonicalUrl(page.route)
  const locale = page.locale === 'en' ? 'en-BD' : 'bn-BD'
  const document = graph.find((node) => node['@id'] === `${url}#webpage`)
  if (document?.['@type'] !== pageType || document?.url !== url || document?.inLanguage !== locale) {
    issues.push('JSON-LD page type, canonical URL or language differs from its page')
  }

  const definitions = new Set()
  const references = new Set()
  function visit(value) {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) { value.forEach(visit); return }
    if (value['@id']) {
      try { if (!['https:', 'http:'].includes(new URL(value['@id']).protocol)) throw new Error() }
      catch { issues.push('JSON-LD entity ID must be an absolute HTTP URL') }
      if (value['@type']) {
        if (definitions.has(value['@id'])) issues.push(`Duplicate JSON-LD entity ID: ${value['@id']}`)
        definitions.add(value['@id'])
      } else references.add(value['@id'])
    }
    Object.values(value).forEach(visit)
  }
  graph.forEach(visit)
  for (const id of references) {
    if (!definitions.has(id)) issues.push(`Unresolved JSON-LD entity reference: ${id}`)
  }

  const articles = graph.filter((node) => node['@type'] === 'Article')
  if (articles.length !== (articleExpected ? 1 : 0)) issues.push('Article markup must describe an authored guide, not a lookup or utility page')
  for (const article of articles) {
    if (article.inLanguage !== locale || article.url !== url || article.mainEntityOfPage?.['@id'] !== document?.['@id']) {
      issues.push('Article language or page identity differs from its page')
    }
  }
  if (pageType === 'CollectionPage' && page.slug !== 'start-here/glossary') {
    const list = document?.mainEntity
    if (visibleItems.length > 0) {
      if (list?.['@type'] !== 'ItemList' || list.numberOfItems !== visibleItems.length ||
          JSON.stringify(list.itemListElement) !== JSON.stringify(visibleItems)) {
        issues.push('Collection ItemList must match visible names, URLs and display order')
      }
    } else if (list?.['@type'] === 'ItemList') issues.push('Empty rendered collection must not invent list entries')
  }
  if (page.slug === 'start-here/glossary') {
    const termSet = graph.find((node) => node['@id'] === `${url}#glossary`)
    if (!definedTerms.length || termSet?.['@type'] !== 'DefinedTermSet' || termSet.inLanguage !== locale ||
        document?.mainEntity?.['@id'] !== termSet?.['@id'] ||
        JSON.stringify(termSet.hasDefinedTerm) !== JSON.stringify(definedTerms)) {
      issues.push('Glossary DefinedTermSet must match the visible localized terms and definitions')
    }
  }
  for (const breadcrumb of graph.filter((node) => node['@type'] === 'BreadcrumbList')) {
    const items = breadcrumb.itemListElement
    if (!Array.isArray(items) || items.length < 2 || items.some((item, index) =>
      item['@type'] !== 'ListItem' || item.position !== index + 1 || !item.name?.trim() ||
      (item.item && !/^https?:\/\//.test(item.item)))) {
      issues.push('BreadcrumbList must have named, sequential items with absolute URLs')
    }
  }
  return issues
}
