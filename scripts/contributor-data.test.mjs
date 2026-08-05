import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  buildContributorSnapshot,
  fetchPaginated,
  parseInlineContributorName,
  refreshContributorFile,
  sizedAvatarUrl,
  validatePublicSnapshot
} from './contributor-data.mjs'

const policy = {
  schemaVersion: 1,
  repository: 'Deshi-Startup/deshistartup',
  coreTeam: ['shamirislam'],
  displayNameOverrides: { alice: 'Alice A.', shamirislam: 'Shamir Islam' },
  inlineAttributionLinks: {},
  exclusions: { githubLogins: ['excluded-user'], inlineNames: ['Hidden Person'] },
  optOuts: { githubLogins: ['private-user'], inlineNames: ['Private Person'] }
}

function pull(number, overrides = {}) {
  return {
    number,
    title: `Contribution ${number}`,
    body: '',
    html_url: `https://github.com/Deshi-Startup/deshistartup/pull/${number}`,
    merged_at: `2026-07-${String((number % 27) + 1).padStart(2, '0')}T10:00:00Z`,
    updated_at: `2026-07-${String((number % 27) + 1).padStart(2, '0')}T11:00:00Z`,
    user: {
      login: `user-${number}`,
      type: 'User',
      avatar_url: `https://avatars.githubusercontent.com/u/${number}?v=4`
    },
    ...overrides
  }
}

function response(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return data
    }
  }
}

function githubMock(pulls, calls = []) {
  return async (url, options) => {
    calls.push({ url, options })
    const parsed = new URL(url)
    const page = Number(parsed.searchParams.get('page') || 1)
    if (parsed.pathname.endsWith('/pulls')) {
      const start = (page - 1) * 100
      return response(pulls.slice(start, start + 100))
    }
    return response([], 404)
  }
}

test('paginates beyond 100 items and prevents duplicate PRs', async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => ({ number: index + 1 }))
  const requestedPages = []
  const result = await fetchPaginated(
    async (url) => {
      const page = Number(new URL(url).searchParams.get('page'))
      requestedPages.push(page)
      return response(page === 1 ? firstPage : [{ number: 100 }, { number: 101 }])
    },
    'https://api.github.com/repos/a/b/pulls?state=closed'
  )
  assert.deepEqual(requestedPages, [1, 2])
  assert.equal(result.length, 101)
  assert.equal(result.at(-1).number, 101)
})

test('keeps merged PRs only and applies bots, core, exclusions, opt-outs and overrides', async () => {
  const pulls = [
    pull(1, { user: { login: 'alice', type: 'User', avatar_url: null } }),
    pull(2, { merged_at: null }),
    pull(3, { user: { login: 'dependabot[bot]', type: 'Bot', avatar_url: null } }),
    pull(4, { user: { login: 'shamirislam', type: 'User', avatar_url: null } }),
    pull(5, { user: { login: 'excluded-user', type: 'User', avatar_url: null } }),
    pull(6, { user: { login: 'private-user', type: 'User', avatar_url: null } })
  ]
  const snapshot = await buildContributorSnapshot({
    policy,
    fetchImpl: githubMock(pulls),
    now: new Date('2026-08-05T12:00:00Z')
  })
  assert.deepEqual(snapshot.rankedProfiles.map((profile) => profile.displayName), ['Alice A.'])
  assert.deepEqual(snapshot.coreProfiles.map((profile) => profile.displayName), ['Shamir Islam'])
  assert.deepEqual(snapshot.totals, { contributors: 1, mergedPullRequests: 1 })
  assert.equal(snapshot.unattributedCount, 0)
})

test('reads the whole list with one request per page and never fetches PR files', async () => {
  const calls = []
  await buildContributorSnapshot({
    policy,
    fetchImpl: githubMock([pull(1), pull(2), pull(3)], calls),
    now: new Date('2026-08-05T12:00:00Z')
  })
  assert.equal(calls.length, 1)
  assert.equal(calls.some((call) => call.url.includes('/files')), false)
})

test('requests a small avatar instead of the full-size default', () => {
  assert.equal(
    sizedAvatarUrl('https://avatars.githubusercontent.com/u/42?v=4'),
    'https://avatars.githubusercontent.com/u/42?v=4&s=160'
  )
  assert.equal(sizedAvatarUrl('https://example.com/u/42.png'), null)
  assert.equal(sizedAvatarUrl(null), null)
})

test('attributes inline-editor PRs by public body name and reports ambiguous work', async () => {
  const inlineBody = [
    '**অবদানকারী / Contributor:** Tasnim Rahman',
    '_Created via the Deshi Startup inline editor._'
  ].join('\n')
  assert.equal(parseInlineContributorName(inlineBody), 'Tasnim Rahman')
  const snapshot = await buildContributorSnapshot({
    policy,
    fetchImpl: githubMock([
      pull(10, { body: inlineBody }),
      pull(11, { body: '_Created via the Deshi Startup inline editor._' })
    ]),
    now: new Date('2026-08-05T12:00:00Z')
  })
  assert.equal(snapshot.rankedProfiles[0].displayName, 'Tasnim Rahman')
  assert.equal(snapshot.rankedProfiles[0].avatarUrl, null)
  assert.equal(snapshot.unattributedCount, 1)
})

test('ranks by count, then freshness, then display name deterministically', async () => {
  const sameDate = '2026-08-01T10:00:00Z'
  const snapshot = await buildContributorSnapshot({
    policy: { ...policy, displayNameOverrides: { alpha: 'Alpha', beta: 'Beta', zed: 'Zed' } },
    fetchImpl: githubMock([
      pull(20, { merged_at: sameDate, user: { login: 'beta', type: 'User', avatar_url: null } }),
      pull(21, { merged_at: sameDate, user: { login: 'alpha', type: 'User', avatar_url: null } }),
      pull(22, { merged_at: '2026-08-02T10:00:00Z', user: { login: 'zed', type: 'User', avatar_url: null } })
    ]),
    now: new Date('2026-08-05T12:00:00Z')
  })
  assert.deepEqual(snapshot.rankedProfiles.map((profile) => profile.displayName), ['Zed', 'Alpha', 'Beta'])
  assert.deepEqual(snapshot.rankedProfiles.map((profile) => profile.rank), [1, 2, 3])
})

test('counts every merged PR by the same person once and keeps the latest merge date', async () => {
  const author = { login: 'alice', type: 'User', avatar_url: null }
  const snapshot = await buildContributorSnapshot({
    policy,
    fetchImpl: githubMock([
      pull(50, { merged_at: '2026-07-01T10:00:00Z', user: author }),
      pull(51, { merged_at: '2026-07-20T10:00:00Z', user: author }),
      pull(52, { merged_at: '2026-07-10T10:00:00Z', user: author })
    ]),
    now: new Date('2026-08-05T12:00:00Z')
  })
  assert.equal(snapshot.rankedProfiles.length, 1)
  assert.equal(snapshot.rankedProfiles[0].mergedPullRequestCount, 3)
  assert.equal(snapshot.rankedProfiles[0].lastMergedAt, '2026-07-20T10:00:00.000Z')
})

test('API failure preserves the last good snapshot', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-contributors-'))
  const outputPath = path.join(directory, 'contributors.json')
  const original = '{"lastGood":true}\n'
  await fs.writeFile(outputPath, original)
  try {
    await assert.rejects(
      refreshContributorFile({
        policy,
        outputPath,
        fetchImpl: async () => response({ message: 'rate limited' }, 403)
      }),
      /GitHub API 403/
    )
    assert.equal(await fs.readFile(outputPath, 'utf8'), original)
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})

test('output is secret-free even when authenticated', async () => {
  const secret = 'github_pat_never_publish_this'
  const calls = []
  const snapshot = await buildContributorSnapshot({
    policy,
    token: secret,
    fetchImpl: githubMock([pull(40)], calls),
    now: new Date('2026-08-05T12:00:00Z')
  })
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${secret}`)
  assert.equal(JSON.stringify(validatePublicSnapshot(snapshot)).includes(secret), false)
  assert.equal(JSON.stringify(snapshot).includes('email'), false)
})
