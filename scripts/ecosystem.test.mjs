import test from 'node:test'
import { legacyIdeaDestination, ideaSlug, retiredIdeaSlugs } from '../app/lib/idea-routes.mjs'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { snapshotDigest, validateEcosystemSnapshot } from './lib/ecosystem-snapshot.mjs'
import { isNoindexPage } from './lib/page-indexability.mjs'

const snapshot = JSON.parse(fs.readFileSync(new URL('../data/ecosystem/public.json', import.meta.url), 'utf8'))
test('public snapshot rejects broken identities, relationships and incomplete translations', () => {
  assert.equal(validateEcosystemSnapshot(snapshot), snapshot)
  const broken = structuredClone(snapshot)
  broken.connections[0].organizationId = 'missing'
  assert.throws(() => validateEcosystemSnapshot(broken), /Dangling/)
  broken.connections = []
  broken.organizations[0].slug = 'review'
  assert.throws(() => validateEcosystemSnapshot(broken), /reserved/)
  broken.organizations = []
  delete broken.problems[0].bn
  assert.throws(() => validateEcosystemSnapshot(broken), /translation/)
})
test('snapshot rejects unknown public types before components can crash', () => {
  for (const [table, field, value] of [['approaches', 'kind', 'unknown'], ['organizations', 'roles', ['unknown']], ['connections', 'stage', 'unknown']]) {
    const broken = structuredClone(snapshot)
    broken[table][0][field] = value
    assert.throws(() => validateEcosystemSnapshot(broken), /Invalid/)
  }
})
test('editorial picks need matching bilingual reasons and voting allows only shipped ideas', () => {
  const broken = structuredClone(snapshot)
  broken.approaches[0].en.editorialNote = 'A clear customer and a practical first test.'
  broken.approaches[0].bn.editorialNote = ''
  assert.throws(() => validateEcosystemSnapshot(broken), /editorial selection/)
  const ids = JSON.parse(fs.readFileSync(new URL('../app/generated/idea-ids.json', import.meta.url), 'utf8'))
  assert.deepEqual(ids, snapshot.approaches.map(idea => idea.id))
})
test('public idea credit contains only short display names', () => {
  const credited = structuredClone(snapshot)
  credited.approaches[0].suggestedBy = ['Farhana Rahman', 'নুসরাত জাহান']
  assert.equal(validateEcosystemSnapshot(credited), credited)
  for (const names of [['person@example.com'], ['<script>'], ['One', 'One'], []]) {
    credited.approaches[0].suggestedBy = names
    assert.throws(() => validateEcosystemSnapshot(credited), /idea credit/)
  }
})
test('release marker pins exact data and all editorial references resolve', () => {
  const marker = JSON.parse(fs.readFileSync(new URL('../public/ecosystem-release.json', import.meta.url), 'utf8'))
  assert.equal(marker.digest, snapshotDigest(snapshot))
  assert.equal(marker.releaseId, snapshot.releaseId)
  const changed = structuredClone(snapshot)
  changed.problems[0].en.title += ' changed'
  assert.notEqual(snapshotDigest(changed), marker.digest)
  const ds50 = JSON.parse(fs.readFileSync(new URL('../data/startup-50.json', import.meta.url), 'utf8'))
  for (const org of snapshot.organizations) for (const ref of org.references) {
    if (ref.kind === 'startup-50') assert.ok(ds50.entries.some(e => e.slug === ref.target))
    else for (const locale of ['en', '(bn)']) {
      const source = fs.readFileSync(new URL(`../app/(contents)/${locale}/case-studies/${ref.target}/page.mdx`, import.meta.url), 'utf8')
      assert.doesNotMatch(source, /<StubNotice/)
    }
  }
})
test('transactional forms stay out of search while public profiles remain indexable', () => {
  for (const slug of ['startup-ideas/review', 'startup-ideas/add-company', 'startup-ideas/add', 'startup-ideas/submissions']) assert.equal(isNoindexPage({ slug, stub: false }), true)
  for (const slug of ['startup-ideas', 'companies/pathao', 'startup-ideas/courier-settlement']) assert.equal(isNoindexPage({ slug, stub: false }), false)
})


test('old preview routes preserve all idea choices and never redirect the canonical pages', () => {
  assert.equal(legacyIdeaDestination('/en/startup-ideas/courier-settlement'), '/en/startup-ideas')
  assert.equal(legacyIdeaDestination('/en/problems'), '/en/startup-ideas')
  assert.equal(legacyIdeaDestination('/problems/courier-settlement/'), '/startup-ideas?problem=courier-settlement')
  assert.equal(legacyIdeaDestination('/en/problems/contribute'), '/en/startup-ideas/add-company')
  assert.equal(legacyIdeaDestination('/problems/review'), '/startup-ideas/review')
  assert.equal(legacyIdeaDestination('/en/startup-ideas/add-startup'), '/en/startup-ideas/add-company')
  assert.equal(legacyIdeaDestination('/en/startup-ideas/contribute'), '/en/startup-ideas/add')
  assert.equal(legacyIdeaDestination('/en/startup-ideas/draft'), '/en/startup-ideas/add')
  assert.equal(legacyIdeaDestination('/problems/draft'), '/startup-ideas/add')
  for (const route of ['/startup-ideas', '/en/startup-ideas/harvest-cooling', '/companies/pathao', '/problems/a/b', '/ideas/finding-ideas']) assert.equal(legacyIdeaDestination(route), null)
  assert.equal(new Set(snapshot.approaches.map(idea => ideaSlug(idea.id))).size, snapshot.approaches.length)
})

// Static Assets only invokes redirects for paths explicitly delegated to the Worker.
test('all legacy idea navigation paths reach their Worker redirects', () => {
  const config = fs.readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8')
  for (const prefix of ['', '/en']) for (const slug of ['add-startup', 'contribute', 'draft', ...retiredIdeaSlugs]) {
    for (const suffix of ['', '/']) {
      const route = `${prefix}/startup-ideas/${slug}${suffix}`
      assert.ok(config.includes(JSON.stringify(route)), `Missing Worker route: ${route}`)
      assert.ok(legacyIdeaDestination(route))
    }
  }
})
