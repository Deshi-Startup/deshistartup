import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { startupCaseStudyRoutes } from './startup-case-studies.mjs'

const localeIndex = (pages) => ({ sections: { 'case-studies': ['Cases', 0, 0, null, [['Companies', pages]]] } })

test('links only written case studies in the requested locale, using registry routes', () => {
  const index = {
    en: localeIndex([
      ['/en/case-studies/pathao', 'An editable title', 0, null],
      ['/en/case-studies/shikho', 'Shikho', 1, null],
      ['/case-studies/bkash', 'Wrong locale', 0, null]
    ]),
    bn: localeIndex([['/case-studies/pathao', 'পাঠাও', 0, null]])
  }
  assert.deepEqual([...startupCaseStudyRoutes(index, 'en')], [['pathao', '/en/case-studies/pathao']])
  assert.deepEqual([...startupCaseStudyRoutes(index, 'bn')], [['pathao', '/case-studies/pathao']])
  assert.equal(startupCaseStudyRoutes({}, 'en').size, 0)
})

test('renamed profiles keep permanent routes and aliases never expose a stub', () => {
  const index = { en: localeIndex([
    ['/en/case-studies/myalice', 'Revora', 0, null],
    ['/en/case-studies/shopup-silq', 'ShopUp (SILQ)', 0, null]
  ]) }
  const routes = startupCaseStudyRoutes(index, 'en')
  assert.equal(routes.get('revora'), '/en/case-studies/myalice')
  assert.equal(routes.get('shopup-silq'), '/en/case-studies/shopup-silq')
  index.en.sections['case-studies'][4][0][1][0][2] = 1
  assert.equal(startupCaseStudyRoutes(index, 'en').has('revora'), false)
})

test('current profile links all resolve to written, indexable generated pages', () => {
  const readJson = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'))
  const index = readJson('../generated/content-index.json')
  const seoPages = readJson('../generated/seo-pages.json')
  const startups = readJson('../../data/startup-50.json').entries
  for (const locale of ['en', 'bn']) {
    const routes = startupCaseStudyRoutes(index, locale)
    const linked = startups.flatMap(({ slug }) => routes.has(slug) ? [routes.get(slug)] : [])
    assert.ok(linked.length > 0, 'Completed company case studies must be reachable')
    for (const route of linked) {
      const page = seoPages.find((item) => item.route === route)
      assert.ok(page && page.locale === locale && page.stub === false, route)
    }
  }
})
