import assert from 'node:assert/strict'
import test from 'node:test'
import { mergedPullsUrl, monogramForName, prepareContributorSnapshot } from './contributor-leaderboard.mjs'

function profile(index, overrides = {}) {
  return {
    rank: index + 1,
    displayName: `Contributor ${index + 1}`,
    githubLogin: `person-${index + 1}`,
    profileUrl: `https://github.com/person-${index + 1}`,
    mergedPullRequestCount: index + 1,
    lastMergedAt: '2026-08-01T10:00:00.000Z',
    ...overrides
  }
}

test('prepares empty, one-person and large lists', () => {
  for (const count of [0, 1, 2, 250]) {
    const view = prepareContributorSnapshot({
      repository: 'Deshi-Startup/deshistartup',
      rankedProfiles: Array.from({ length: count }, profile)
    })
    assert.equal(view.rankedProfiles.length, count)
    assert.equal(view.hasContributors, count > 0)
  }
})

test('links every count to the GitHub search that reproduces it', () => {
  assert.equal(
    mergedPullsUrl('Deshi-Startup/deshistartup', 'niloy-biswas'),
    'https://github.com/Deshi-Startup/deshistartup/pulls?q=is%3Apr%20is%3Amerged%20author%3Aniloy-biswas'
  )
  assert.equal(mergedPullsUrl('Deshi-Startup/deshistartup', null), null)
  assert.equal(mergedPullsUrl('not a repo', 'someone'), null)
})

test('handles long names, missing avatars and malformed data safely', () => {
  const longName = 'A Contributor With An Intentionally Very Long Public Display Name'
  const view = prepareContributorSnapshot({
    repository: 'Deshi-Startup/deshistartup',
    totals: { contributors: 'broken', mergedPullRequests: -4 },
    rankedProfiles: [profile(0, {
      displayName: longName,
      githubLogin: null,
      avatarUrl: 'javascript:alert(1)',
      profileUrl: 'https://example.com/not-github',
      mergedPullRequestCount: 'nonsense'
    })]
  })
  const [entry] = view.rankedProfiles
  assert.equal(entry.displayName, longName)
  assert.equal(entry.monogram, 'AC')
  assert.equal(entry.avatarUrl, null)
  assert.equal(entry.profileUrl, null)
  assert.equal(entry.pullsUrl, null)
  assert.equal(entry.mergedPullRequestCount, 0)
  assert.deepEqual(view.totals, { contributors: 0, mergedPullRequests: 0 })
  assert.deepEqual(prepareContributorSnapshot(null).rankedProfiles, [])
})

test('numbers ranked entries but leaves the core team unranked', () => {
  const view = prepareContributorSnapshot({
    repository: 'Deshi-Startup/deshistartup',
    rankedProfiles: [profile(0), profile(1, { rank: undefined })],
    coreProfiles: [{ displayName: 'Shamir Islam', mergedPullRequestCount: 3 }]
  })
  assert.deepEqual(view.rankedProfiles.map((entry) => entry.rank), [1, 2])
  assert.equal(view.coreProfiles[0].rank, null)
  assert.equal(view.coreProfiles[0].mergedPullRequestCount, 3)
})

test('creates Unicode-safe monograms', () => {
  assert.equal(monogramForName('শারমিন আক্তার'), 'শআ')
  assert.equal(monogramForName('Niloy Biswas'), 'NB')
  assert.equal(monogramForName(''), '?')
})
