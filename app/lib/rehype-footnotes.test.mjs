import assert from 'node:assert/strict'
import test from 'node:test'
import { transformFootnotes } from './rehype-footnotes.mjs'

const fixture = () => ({
  type: 'root',
  children: [
    {
      type: 'element',
      tagName: 'sup',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: {
            href: '#user-content-fn-source',
            id: 'user-content-fnref-source',
            dataFootnoteRef: true,
            ariaDescribedBy: ['footnote-label']
          },
          children: [{ type: 'text', value: '1' }]
        }
      ]
    },
    {
      type: 'element',
      tagName: 'section',
      properties: { dataFootnotes: true, className: ['footnotes'] },
      children: [
        {
          type: 'element',
          tagName: 'h2',
          properties: { className: ['sr-only'], id: 'footnote-label' },
          children: [{ type: 'text', value: 'Footnotes' }]
        },
        {
          type: 'element',
          tagName: 'ol',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'li',
              properties: { id: 'user-content-fn-source' },
              children: [
                {
                  type: 'element',
                  tagName: 'a',
                  properties: {
                    href: '#user-content-fnref-source-2',
                    dataFootnoteBackref: '',
                    ariaLabel: 'Back to reference 1-2',
                    className: ['data-footnote-backref']
                  },
                  children: [
                    { type: 'text', value: '↩' },
                    {
                      type: 'element',
                      tagName: 'sup',
                      properties: {},
                      children: [{ type: 'text', value: '2' }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})

const find = (node, predicate) => {
  if (predicate(node)) return node
  for (const child of node.children || []) {
    const match = find(child, predicate)
    if (match) return match
  }
  return null
}

test('localizes Bengali footnote numbers, labels and backlink text', () => {
  const tree = transformFootnotes(fixture())
  const citation = find(tree, (node) => node.properties?.dataFootnoteRef)
  const heading = find(tree, (node) => node.properties?.id === 'footnote-label')
  const backlink = find(tree, (node) => node.properties?.dataFootnoteBackref === '')
  const list = find(tree, (node) => node.tagName === 'ol')
  const item = find(tree, (node) => node.tagName === 'li')

  assert.equal(citation.children[0].value, '১')
  assert.deepEqual(citation.properties.className, ['cite-link'])
  assert.deepEqual(tree.children[0].properties.className, ['cite-footnote'])
  assert.equal(heading.tagName, 'span')
  assert.equal(heading.children[0].value, 'সূত্র')
  assert.equal(backlink.properties.ariaLabel, 'লেখায় ১ নম্বর সূত্রের ২ নম্বর উল্লেখে ফিরুন')
  assert.equal(backlink.children[1].children[0].value, '২')
  assert.ok(backlink.properties.className.includes('reference-backlink'))
  assert.deepEqual(list.properties.className, ['reference-list'])
  assert.deepEqual(item.properties.className, ['reference-item'])
})

test('keeps English numerals and provides English accessible labels', () => {
  const tree = transformFootnotes(fixture(), { isEnglish: true })
  const citation = find(tree, (node) => node.properties?.dataFootnoteRef)
  const heading = find(tree, (node) => node.properties?.id === 'footnote-label')
  const backlink = find(tree, (node) => node.properties?.dataFootnoteBackref === '')

  assert.equal(citation.children[0].value, '1')
  assert.equal(heading.tagName, 'span')
  assert.equal(heading.children[0].value, 'References')
  assert.equal(backlink.properties.ariaLabel, 'Back to citation 1, occurrence 2')
  assert.equal(backlink.children[1].children[0].value, '2')
})
