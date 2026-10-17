import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectSchemaGraph } from './schema-graph-audit.mjs'

const url = 'https://deshistartup.com/en/funding'
const page = { route: '/en/funding', slug: 'funding', locale: 'en' }
const items = [
  { '@type': 'ListItem', position: 1, name: 'Pitch', url: `${url}/pitch-deck` },
  { '@type': 'ListItem', position: 2, name: 'Cap table', url: `${url}/cap-table` }
]
function fixture() {
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebSite', '@id': 'https://deshistartup.com/#website' },
    { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, inLanguage: 'en-BD',
      isPartOf: { '@id': 'https://deshistartup.com/#website' },
      mainEntity: { '@type': 'ItemList', numberOfItems: 2, itemListElement: structuredClone(items) } }
  ] }
}
const inspect = (schema) => inspectSchemaGraph(schema, { page, pageType: 'CollectionPage', articleExpected: false, visibleItems: items })

test('accepts a connected graph whose list matches the displayed collection', () => {
  assert.deepEqual(inspect(fixture()), [])
})

test('rejects a valid-JSON list that reverses the visible order or invents an entry', () => {
  const schema = fixture()
  schema['@graph'][1].mainEntity.itemListElement.reverse()
  assert.ok(inspect(schema).some((x) => x.includes('display order')))
  schema['@graph'][1].mainEntity.itemListElement = [...items, { name: 'Not visible' }]
  assert.ok(inspect(schema).some((x) => x.includes('display order')))
})

test('rejects wrong-locale markup, duplicate IDs and unresolved entity references', () => {
  const schema = fixture()
  schema['@graph'][1].inLanguage = 'bn-BD'
  schema['@graph'].push({ '@type': 'Organization', '@id': 'https://deshistartup.com/#website' })
  schema['@graph'][1].publisher = { '@id': 'https://deshistartup.com/#missing' }
  const issues = inspect(schema)
  assert.ok(issues.some((x) => x.includes('language')))
  assert.ok(issues.some((x) => x.includes('Duplicate')))
  assert.ok(issues.some((x) => x.includes('Unresolved')))
})

test('rejects articles on lookup/utility pages and malformed breadcrumb positions', () => {
  const schema = fixture()
  schema['@graph'].push({ '@type': 'Article', url, inLanguage: 'en-BD' })
  schema['@graph'].push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 2, name: 'Home', item: 'https://deshistartup.com/en' },
    { '@type': 'ListItem', position: 2, name: 'Funding', item: url }
  ] })
  const issues = inspect(schema)
  assert.ok(issues.some((x) => x.includes('authored guide')))
  assert.ok(issues.some((x) => x.includes('BreadcrumbList')))
})

test('rejects missing graphs and a glossary whose definitions differ from visible text', () => {
  assert.ok(inspect(null).some((x) => x.includes('graph is missing')))
  const glossaryPage = { route: '/start-here/glossary', slug: 'start-here/glossary', locale: 'bn' }
  const glossaryUrl = 'https://deshistartup.com/start-here/glossary'
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${glossaryUrl}#webpage`, url: glossaryUrl, inLanguage: 'bn-BD', mainEntity: { '@id': `${glossaryUrl}#glossary` } },
    { '@type': 'DefinedTermSet', '@id': `${glossaryUrl}#glossary`, inLanguage: 'bn-BD', hasDefinedTerm: [] }
  ] }
  const issues = inspectSchemaGraph(schema, { page: glossaryPage, pageType: 'CollectionPage', articleExpected: false,
    definedTerms: [{ '@type': 'DefinedTerm', name: 'MRR', description: 'Visible definition.' }] })
  assert.ok(issues.some((x) => x.includes('visible localized terms')))
})
