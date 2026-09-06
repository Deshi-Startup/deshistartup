import { SITE_NAME, SITE_NAME_BN } from '../seo.config.mjs'

// Next applies a layout's title template to child segments, not to a page in
// that same segment. Give each homepage an absolute title before Next creates
// its HTML and hydration payload, while keeping authored frontmatter a string.
export default function rehypeHomeTitle() {
  return (tree, file) => {
    const filePath = String(file.path || '').replaceAll('\\', '/')
    const match = filePath.match(/\/app\/\(contents\)\/(en|\(bn\))\/page\.mdx$/)
    if (!match) return

    for (const node of tree.children || []) {
      if (node.type !== 'mdxjsEsm') continue
      for (const statement of node.data?.estree?.body || []) {
        if (statement.type !== 'ExportNamedDeclaration') continue
        for (const declaration of statement.declaration?.declarations || []) {
          if (declaration.id?.name !== 'metadata') continue
          const title = declaration.init?.properties?.find(
            (property) => (property.key?.name || property.key?.value) === 'title'
          )
          if (title?.value?.type !== 'Literal' || typeof title.value.value !== 'string') continue
          const brand = match[1] === 'en' ? SITE_NAME : SITE_NAME_BN
          title.value = {
            type: 'ObjectExpression',
            properties: [{
              type: 'Property', kind: 'init', method: false, shorthand: false, computed: false,
              key: { type: 'Identifier', name: 'absolute' },
              value: { type: 'Literal', value: `${brand} – ${title.value.value}` }
            }]
          }
        }
      }
    }
  }
}
