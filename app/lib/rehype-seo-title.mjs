import { pageDocumentTitle } from '../seo.config.mjs'

// Set the document title before Next creates both HTML and its navigation /
// hydration payload. Nextra's separate metadata-only page-map compiler does not
// run rehype plugins, so its navigation labels keep the authored string title.
export default function rehypeSeoTitle() {
  return (tree, file) => {
    const filePath = String(file.path || '').replaceAll('\\', '/')
    const match = filePath.match(/\/app\/\(contents\)\/(en|\(bn\))\/(.*?)page\.mdx$/)
    if (!match) return

    for (const node of tree.children || []) {
      if (node.type !== 'mdxjsEsm') continue
      for (const statement of node.data?.estree?.body || []) {
        if (statement.type !== 'ExportNamedDeclaration') continue
        for (const declaration of statement.declaration?.declarations || []) {
          if (declaration.id?.name !== 'metadata') continue
          const properties = declaration.init?.properties || []
          const title = properties.find(
            (property) => (property.key?.name || property.key?.value) === 'title'
          )
          if (title?.value?.type !== 'Literal' || typeof title.value.value !== 'string') continue
          const seoTitle = properties.find(
            (property) => (property.key?.name || property.key?.value) === 'seoTitle'
          )
          if (seoTitle && (seoTitle.value?.type !== 'Literal' || typeof seoTitle.value.value !== 'string' || !seoTitle.value.value.trim())) {
            throw new Error(`${filePath}: seoTitle must be a non-empty string`)
          }
          const resolvedTitle = pageDocumentTitle({
            locale: match[1] === 'en' ? 'en' : 'bn',
            slug: match[2].replace(/\/$/, ''),
            fullTitle: title.value.value,
            seoTitle: seoTitle?.value.value
          })
          title.value = {
            type: 'ObjectExpression',
            properties: [{
              type: 'Property', kind: 'init', method: false, shorthand: false, computed: false,
              key: { type: 'Identifier', name: 'absolute' },
              value: { type: 'Literal', value: resolvedTitle }
            }]
          }
        }
      }
    }
  }
}
