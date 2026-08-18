import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import {
  contributorProfilePath,
  mergedPullsUrl,
  monogramForName,
  prepareContributorSnapshot,
  profileFromSnapshot,
  safePublicUrl
} from './contributor-leaderboard.mjs'

function profile(index, overrides = {}) {
  return {
    id: `person-${index + 1}`,
    slug: `person-${index + 1}`,
    displayName: `Contributor ${index + 1}`,
    headline: null,
    organizationId: null,
    githubLogin: `person-${index + 1}`,
    links: [{ label: 'GitHub', url: `https://github.com/person-${index + 1}` }],
    avatarUrl: null,
    proofCardImage: 'monogram',
    ...overrides
  }
}

function event(index, profileId, overrides = {}) {
  return {
    id: `event-${index + 1}`,
    acceptedAt: `2026-08-${String((index % 27) + 1).padStart(2, '0')}`,
    sourceType: 'editorial',
    evidenceUrl: `https://github.com/Deshi-Startup/deshistartup/issues/${index + 1}`,
    summary: { bn: `অবদান ${index + 1}`, en: `Contribution ${index + 1}` },
    targets: [{
      path: `/guides/example-${index + 1}`,
      title: { bn: `উদাহরণ ${index + 1}`, en: `Example ${index + 1}` }
    }],
    credits: [{
      mode: 'person',
      profileId,
      organizationId: null,
      roles: ['author'],
      review: null
    }],
    ...overrides
  }
}

function snapshot(count, overrides = {}) {
  const profiles = Array.from({ length: count }, (_, index) => profile(index))
  return {
    schemaVersion: 3,
    repository: 'Deshi-Startup/deshistartup',
    refreshedAt: '2026-08-17T10:00:00.000Z',
    organizations: [],
    rankedProfiles: profiles,
    coreProfiles: [],
    events: profiles.map((entry, index) => event(index, entry.id)),
    ...overrides
  }
}

test('prepares empty, one-person, two-person and 250-person snapshots', () => {
  for (const count of [0, 1, 2, 250]) {
    const view = prepareContributorSnapshot(snapshot(count))
    assert.equal(view.rankedProfiles.length, count)
    assert.equal(view.hasContributors, count > 0)
    assert.equal(view.totals.contributors, count)
    assert.equal(view.totals.acceptedEvents, count)
  }
})

test('prepares the committed four-person, thirteen-event baseline', () => {
  const current = JSON.parse(fs.readFileSync(new URL('../generated/contributors.json', import.meta.url), 'utf8'))
  const view = prepareContributorSnapshot(current)
  assert.deepEqual(view.totals, {
    contributors: 4,
    acceptedEvents: 13,
    pagesImproved: 37,
    roleCategories: {
      author: 11,
      editor: 1,
      translator: 0,
      researcher: 0,
      'operational-insight': 0,
      reviewer: 0,
      product: 1
    }
  })
  assert.deepEqual(view.rankedProfiles.map((entry) => entry.displayName), [
    'Shoumik Shahriar',
    'Niloy Biswas',
    'Uttam Deb',
    'Muhaiminul Islam Khan'
  ])
})

test('derives accepted-event counts, roles, pages and deterministic ranks from events', () => {
  const source = snapshot(3)
  source.rankedProfiles[0].displayName = 'Zed'
  source.rankedProfiles[1].displayName = 'Beta'
  source.rankedProfiles[2].displayName = 'Alpha'
  source.events.push(event(10, 'person-2', {
    id: 'event-extra-beta',
    acceptedAt: '2026-08-20',
    targets: source.events[1].targets,
    credits: [{
      mode: 'person',
      profileId: 'person-2',
      organizationId: null,
      roles: ['editor', 'researcher'],
      review: null
    }]
  }))
  const view = prepareContributorSnapshot(source)
  assert.deepEqual(view.rankedProfiles.map((entry) => entry.displayName), ['Beta', 'Alpha', 'Zed'])
  assert.deepEqual(view.rankedProfiles.map((entry) => entry.rank), [1, 2, 3])
  assert.equal(view.rankedProfiles[0].acceptedEventCount, 2)
  assert.deepEqual(view.rankedProfiles[0].roles, ['author', 'editor', 'researcher'])
  assert.equal(view.totals.acceptedEvents, 4)
  assert.equal(view.totals.pagesImproved, 3)
  assert.equal(view.totals.roleCategories.editor, 1)
})

test('counts an anonymous multi-person event once while preserving each public credit', () => {
  const source = snapshot(2)
  source.events = [event(0, 'person-1', {
    credits: [
      { mode: 'person', profileId: 'person-1', organizationId: null, roles: ['author'], review: null },
      { mode: 'person', profileId: 'person-2', organizationId: null, roles: ['researcher'], review: null },
      { mode: 'anonymous', profileId: null, organizationId: null, roles: ['reviewer'], review: {
        scope: { bn: 'সংখ্যাগুলো যাচাই', en: 'Checked the figures' },
        reviewedAt: '2026-08-01'
      } }
    ]
  })]
  const view = prepareContributorSnapshot(source)
  assert.equal(view.totals.acceptedEvents, 1)
  assert.deepEqual(view.rankedProfiles.map((entry) => entry.acceptedEventCount), [1, 1])
  assert.equal(view.events[0].credits.length, 3)
  assert.equal(view.totals.roleCategories.reviewer, 1)
})

test('supports person-plus-organization credit and affiliation at contribution time', () => {
  const source = snapshot(1, {
    organizations: [{ id: 'example-lab', name: 'Example Lab', url: 'https://example.org/' }]
  })
  source.rankedProfiles[0].organizationId = 'example-lab'
  source.events[0].credits[0].mode = 'person+organization'
  source.events[0].credits[0].organizationId = 'example-lab'
  const view = prepareContributorSnapshot(source)
  assert.equal(view.rankedProfiles[0].organization.name, 'Example Lab')
  assert.equal(view.rankedProfiles[0].contributions[0].credit.organizationId, 'example-lab')
})

test('handles long Bangla, English and mixed-script names without unsafe fields', () => {
  const longName = `শারমিন Akter With Control\u0000${' Very Long'.repeat(30)}`
  const source = snapshot(1)
  source.rankedProfiles[0] = profile(0, {
    displayName: longName,
    githubLogin: 'not valid login',
    avatarUrl: 'javascript:alert(1)',
    links: [{ label: 'Unsafe', url: 'https://github.com.evil.example/person' }]
  })
  const view = prepareContributorSnapshot(source)
  const [entry] = view.rankedProfiles
  assert.equal([...entry.displayName].length, 180)
  assert.doesNotMatch(entry.displayName, /[\u0000-\u001f\u007f]/)
  assert.equal(entry.monogram, 'শA')
  assert.equal(entry.githubLogin, null)
  assert.equal(entry.avatarUrl, null)
  assert.equal(entry.links[0].url, 'https://github.com.evil.example/person')
})

test('rejects private URLs and validates reproducible GitHub pull searches', () => {
  assert.equal(safePublicUrl('http://example.com'), null)
  assert.equal(safePublicUrl('https://127.0.0.1/evidence'), null)
  assert.equal(safePublicUrl('https://example.local/evidence'), null)
  assert.equal(
    mergedPullsUrl('Deshi-Startup/deshistartup', 'niloy-biswas'),
    'https://github.com/Deshi-Startup/deshistartup/pulls?q=is%3Apr%20is%3Amerged%20author%3Aniloy-biswas'
  )
  assert.equal(mergedPullsUrl('not a repo', 'someone'), null)
})

test('creates stable locale-aware profile routes and returns null for unknown profiles', () => {
  const source = snapshot(1)
  assert.equal(contributorProfilePath('person-1', 'bn'), '/contributors/person-1')
  assert.equal(contributorProfilePath('person-1', 'en'), '/en/contributors/person-1')
  assert.equal(contributorProfilePath('../escape', 'en'), null)
  assert.equal(profileFromSnapshot(source, 'person-1').displayName, 'Contributor 1')
  assert.equal(profileFromSnapshot(source, 'missing'), null)
})

test('numbers ranked entries but leaves the core team unranked', () => {
  const view = prepareContributorSnapshot(snapshot(2, {
    coreProfiles: [{
      displayName: 'Shamir Islam',
      githubLogin: 'shamirislam',
      avatarUrl: null,
      mergedPullRequestCount: 3,
      lastMergedAt: '2026-08-01T10:00:00.000Z'
    }]
  }))
  assert.deepEqual(view.rankedProfiles.map((entry) => entry.rank), [1, 2])
  assert.equal(view.coreProfiles[0].rank, null)
  assert.equal(view.coreProfiles[0].mergedPullRequestCount, 3)
})

test('creates Unicode-safe monograms', () => {
  assert.equal(monogramForName('শারমিন আক্তার'), 'শআ')
  assert.equal(monogramForName('Niloy Biswas'), 'NB')
  assert.equal(monogramForName(''), '?')
})
