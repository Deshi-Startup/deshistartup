import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  buildContributorSnapshot,
  buildTargetCatalog,
  fetchPaginated,
  parseInlineContributorName,
  refreshContributorFile,
  sizedAvatarUrl,
  validateContributorLedger,
  validatePublicSnapshot
} from './contributor-data.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function profile(id, login = id, overrides = {}) {
  return {
    id,
    slug: id,
    displayName: id.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' '),
    headline: null,
    organizationId: null,
    githubLogin: login,
    links: [{ label: 'GitHub', url: `https://github.com/${login}` }],
    avatar: { kind: 'monogram' },
    confirmedAt: null,
    visibility: 'public',
    ...overrides
  }
}

function policy(profiles = [], overrides = {}) {
  return {
    schemaVersion: 2,
    repository: 'Deshi-Startup/deshistartup',
    coreTeam: ['shamirislam'],
    identityAliases: {
      githubLogins: {},
      inlineNames: {}
    },
    displayNameOverrides: { shamirislam: 'Shamir Islam' },
    legacyAvatarUrls: {},
    exclusions: { githubLogins: [], inlineNames: [], profileIds: [] },
    optOuts: { githubLogins: [], inlineNames: [], profileIds: [] },
    ...overrides
  }
}

function targetCatalog(...paths) {
  return new Map(paths.map((targetPath) => [targetPath, {
    bn: `বাংলা ${targetPath}`,
    en: `English ${targetPath}`
  }]))
}

function event(number, profileId, overrides = {}) {
  return {
    id: `github-pr-${number}`,
    acceptedAt: '2026-08-01',
    sourceType: 'github-pr',
    sourceRef: number,
    evidenceUrl: `https://github.com/Deshi-Startup/deshistartup/pull/${number}`,
    summary: { bn: `অবদান ${number}`, en: `Contribution ${number}` },
    targetPaths: ['/guides/example'],
    credits: [{ mode: 'person', profileId, roles: ['author'] }],
    ...overrides
  }
}

function editorialEvent(id, credits, overrides = {}) {
  return {
    id,
    acceptedAt: '2026-08-01',
    sourceType: 'editorial',
    sourceRef: id,
    evidenceUrl: `https://github.com/Deshi-Startup/deshistartup/issues/${id.replace(/\D/g, '') || 1}`,
    summary: { bn: 'সম্পাদকীয় অবদান', en: 'Editorial contribution' },
    targetPaths: ['/guides/example'],
    credits,
    ...overrides
  }
}

function ledger(profiles = [], events = [], organizations = []) {
  return { schemaVersion: 1, profiles, organizations, events }
}

function pull(number, login, overrides = {}) {
  return {
    number,
    title: `Contribution ${number}`,
    body: '',
    html_url: `https://github.com/Deshi-Startup/deshistartup/pull/${number}`,
    merged_at: '2026-08-01T10:00:00Z',
    user: {
      login,
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
    const start = (page - 1) * 100
    return response(pulls.slice(start, start + 100))
  }
}

function githubUsersMock(pulls, users, calls = []) {
  return async (url, options) => {
    calls.push({ url, options })
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/users/')) {
      const login = decodeURIComponent(parsed.pathname.slice('/users/'.length)).toLocaleLowerCase('en-US')
      const user = users[login]
      return user ? response(user) : response({ message: 'Not Found' }, 404)
    }
    const page = Number(parsed.searchParams.get('page') || 1)
    const start = (page - 1) * 100
    return response(pulls.slice(start, start + 100))
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

test('validates controlled roles and reviewer evidence', () => {
  const alice = profile('alice')
  const basePolicy = policy([alice])
  const catalog = targetCatalog('/guides/example')
  const unknownRole = ledger([alice], [editorialEvent('event-1', [
    { mode: 'person', profileId: 'alice', roles: ['celebrity'] }
  ])])
  assert.throws(
    () => validateContributorLedger({ ledger: unknownRole, policy: basePolicy, targetCatalog: catalog }),
    /unknown role/
  )

  const reviewerWithoutScope = ledger([alice], [editorialEvent('event-2', [
    { mode: 'person', profileId: 'alice', roles: ['reviewer'] }
  ])])
  assert.throws(
    () => validateContributorLedger({ ledger: reviewerWithoutScope, policy: basePolicy, targetCatalog: catalog }),
    /review scope/
  )
})

test('one accepted event can credit multiple people and multiple roles without extra points', async () => {
  const alice = profile('alice')
  const bob = profile('bob')
  const sourceLedger = ledger([alice, bob], [event(1, 'alice', {
    credits: [
      { mode: 'person', profileId: 'alice', roles: ['author', 'researcher'] },
      { mode: 'person', profileId: 'bob', roles: ['editor'] }
    ]
  })])
  const snapshot = await buildContributorSnapshot({
    policy: policy([alice, bob]),
    ledger: sourceLedger,
    targetCatalog: targetCatalog('/guides/example'),
    fetchImpl: githubMock([pull(1, 'alice')]),
    now: new Date('2026-08-05T12:00:00Z')
  })
  assert.equal(snapshot.totals.acceptedEvents, 1)
  assert.deepEqual(snapshot.rankedProfiles.map((item) => item.acceptedEventCount), [1, 1])
  assert.deepEqual(snapshot.totals.roleCategories, {
    author: 1,
    editor: 1,
    translator: 0,
    researcher: 1,
    'operational-insight': 0,
    reviewer: 0,
    product: 0
  })
})

test('rejects duplicate target paths so bilingual mirrors and micro-edits stay bundled', () => {
  const alice = profile('alice')
  const sourceLedger = ledger([alice], [event(1, 'alice', {
    targetPaths: ['/guides/example', '/guides/example']
  })])
  assert.throws(
    () => validateContributorLedger({
      ledger: sourceLedger,
      policy: policy([alice]),
      targetCatalog: targetCatalog('/guides/example')
    }),
    /duplicate or invalid target path/
  )
})

test('supports anonymous editorial contributions without creating profiles', async () => {
  const sourceLedger = ledger([], [editorialEvent('event-3', [
    { mode: 'anonymous', roles: ['operational-insight'] }
  ])])
  const snapshot = await buildContributorSnapshot({
    policy: policy([]),
    ledger: sourceLedger,
    targetCatalog: targetCatalog('/guides/example'),
    fetchImpl: githubMock([])
  })
  assert.equal(snapshot.totals.acceptedEvents, 1)
  assert.equal(snapshot.totals.contributors, 0)
  assert.equal(snapshot.events[0].credits[0].mode, 'anonymous')
})

test('reconciles an accepted GitHub PR anonymously while naming permission is unresolved', async () => {
  const sourceLedger = ledger([], [event(79, null, {
    acceptedAt: '2026-08-18',
    targetPaths: [],
    credits: [{ mode: 'anonymous', roles: ['product'] }]
  })])
  const snapshot = await buildContributorSnapshot({
    policy: policy([]),
    ledger: sourceLedger,
    targetCatalog: targetCatalog(),
    fetchImpl: githubMock([pull(79, 'new-contributor', {
      merged_at: '2026-08-18T12:00:00Z'
    })])
  })
  assert.equal(snapshot.totals.acceptedEvents, 1)
  assert.equal(snapshot.totals.contributors, 0)
  assert.equal(snapshot.events[0].credits[0].mode, 'anonymous')
  assert.equal(snapshot.totals.roleCategories.product, 1)
})

test('reconciles an unattributed inline-editor PR when its accepted credit is anonymous', async () => {
  const sourceLedger = ledger([], [event(99, null, {
    targetPaths: [],
    credits: [{ mode: 'anonymous', roles: ['editor'] }]
  })])
  const snapshot = await buildContributorSnapshot({
    policy: policy([]),
    ledger: sourceLedger,
    targetCatalog: targetCatalog(),
    fetchImpl: githubMock([pull(99, 'app/deshistartup', {
      body: [
        '**অবদানকারী / Contributor:** Anonymous contributor',
        '_Created via the Deshi Startup inline editor._'
      ].join('\n'),
      user: { login: 'app/deshistartup', type: 'Bot', avatar_url: null }
    })])
  })
  assert.equal(snapshot.totals.acceptedEvents, 1)
  assert.equal(snapshot.unattributedCount, 0)
  assert.equal(snapshot.events[0].credits[0].mode, 'anonymous')
})

test('supports person-plus-organization credit only with valid references and confirmation', async () => {
  const organization = { id: 'example-lab', name: 'Example Lab', url: 'https://example.org/' }
  const alice = profile('alice', 'alice', {
    organizationId: 'example-lab',
    confirmedAt: '2026-08-01'
  })
  const sourceLedger = ledger([alice], [event(1, 'alice', {
    credits: [{ mode: 'person+organization', profileId: 'alice', organizationId: 'example-lab', roles: ['researcher'] }]
  })], [organization])
  const snapshot = await buildContributorSnapshot({
    policy: policy([alice]),
    ledger: sourceLedger,
    targetCatalog: targetCatalog('/guides/example'),
    fetchImpl: githubMock([pull(1, 'alice')])
  })
  assert.equal(snapshot.organizations[0].name, 'Example Lab')
  assert.equal(snapshot.events[0].credits[0].organizationId, 'example-lab')
})

test('converts opted-out people to anonymous credit and removes their route identity', async () => {
  const alice = profile('alice')
  const basePolicy = policy([alice])
  basePolicy.optOuts.profileIds = ['alice']
  const snapshot = await buildContributorSnapshot({
    policy: basePolicy,
    ledger: ledger([alice], [event(1, 'alice')]),
    targetCatalog: targetCatalog('/guides/example'),
    fetchImpl: githubMock([pull(1, 'alice')])
  })
  assert.equal(snapshot.rankedProfiles.length, 0)
  assert.equal(snapshot.events[0].credits[0].mode, 'anonymous')
  assert.equal(JSON.stringify(snapshot).includes('Alice'), false)
})

test('enforces stable unique slugs and referential integrity', () => {
  const alice = profile('alice')
  const duplicate = profile('bob', 'bob', { slug: 'alice' })
  assert.throws(
    () => validateContributorLedger({
      ledger: ledger([alice, duplicate], []),
      policy: policy([alice, duplicate]),
      targetCatalog: new Map()
    }),
    /Duplicate or invalid contributor slug/
  )

  const missingProfile = ledger([alice], [event(1, 'missing')])
  assert.throws(
    () => validateContributorLedger({
      ledger: missingProfile,
      policy: policy([alice]),
      targetCatalog: targetCatalog('/guides/example')
    }),
    /unknown credited profile/
  )
})

test('rejects unsafe URLs, emails, tokens, private evidence and raw consent fields', () => {
  const alice = profile('alice')
  const catalog = targetCatalog('/guides/example')
  const cases = [
    ledger([{ ...alice, links: [{ label: 'Email', url: 'mailto:alice@example.com' }] }], []),
    ledger([{ ...alice, links: [{ label: 'WhatsApp', url: 'https://wa.me/8801712345678' }] }], []),
    ledger([{ ...alice, headline: 'Call +880 1712 345678' }], []),
    ledger([alice], [editorialEvent('event-4', [{ mode: 'person', profileId: 'alice', roles: ['author'] }], {
      evidenceUrl: 'https://127.0.0.1/private'
    })]),
    { ...ledger([alice], []), consentRecord: 'yes' },
    { ...ledger([alice], []), note: 'github_pat_do_not_publish' }
  ]
  for (const candidate of cases) {
    assert.throws(() => validateContributorLedger({ ledger: candidate, policy: policy([alice]), targetCatalog: catalog }))
  }
})

test('rejects unconfirmed external profile links and profile text that the public reader would truncate', () => {
  const alice = profile('alice')
  const catalog = targetCatalog('/guides/example')
  const unconfirmedLink = ledger([{
    ...alice,
    links: [{ label: 'Newsletter', url: 'https://example.org/alice' }]
  }], [])
  assert.throws(
    () => validateContributorLedger({
      ledger: unconfirmedLink,
      policy: policy([alice]),
      targetCatalog: catalog
    }),
    /unconfirmed public details/
  )

  const oversizedName = ledger([{
    ...alice,
    displayName: 'A'.repeat(181)
  }], [])
  assert.throws(
    () => validateContributorLedger({
      ledger: oversizedName,
      policy: policy([alice]),
      targetCatalog: catalog
    }),
    /oversized text/
  )
})

test('ranks by lifetime accepted events, then recency, then display name', async () => {
  const alpha = profile('alpha')
  const beta = profile('beta')
  const zed = profile('zed')
  const events = [
    event(1, 'beta', { acceptedAt: '2026-08-01' }),
    event(2, 'alpha', { acceptedAt: '2026-08-01' }),
    event(3, 'zed', { acceptedAt: '2026-08-02' }),
    event(4, 'zed', { acceptedAt: '2026-08-03' })
  ]
  const pulls = [
    pull(1, 'beta'),
    pull(2, 'alpha'),
    pull(3, 'zed', { merged_at: '2026-08-02T10:00:00Z' }),
    pull(4, 'zed', { merged_at: '2026-08-03T10:00:00Z' })
  ]
  const snapshot = await buildContributorSnapshot({
    policy: policy([alpha, beta, zed]),
    ledger: ledger([alpha, beta, zed], events),
    targetCatalog: targetCatalog('/guides/example'),
    fetchImpl: githubMock(pulls)
  })
  assert.deepEqual(snapshot.rankedProfiles.map((item) => item.displayName), ['Zed', 'Alpha', 'Beta'])
  assert.deepEqual(snapshot.rankedProfiles.map((item) => item.rank), [1, 2, 3])
})

test('detects merged community pull requests missing from the ledger', async () => {
  const alice = profile('alice')
  await assert.rejects(
    buildContributorSnapshot({
      policy: policy([alice]),
      ledger: ledger([alice], []),
      targetCatalog: new Map(),
      fetchImpl: githubMock([pull(99, 'alice')])
    }),
    /missing from contributor ledger: #99/
  )
})

test('rejects ledger entries for unmerged or missing pull requests', async () => {
  const alice = profile('alice')
  await assert.rejects(
    buildContributorSnapshot({
      policy: policy([alice]),
      ledger: ledger([alice], [event(1, 'alice')]),
      targetCatalog: targetCatalog('/guides/example'),
      fetchImpl: githubMock([])
    }),
    /unmerged or missing PRs: #1/
  )
})

test('attributes inline-editor pull requests through a stable identity alias', async () => {
  const muhaimin = profile('muhaimin', 'muhaiminulfahim')
  const basePolicy = policy([muhaimin])
  basePolicy.identityAliases.inlineNames['Muhaiminul Islam Khan'] = 'muhaimin'
  const inlineBody = [
    '**অবদানকারী / Contributor:** Muhaiminul Islam Khan',
    '_Created via the Deshi Startup inline editor._'
  ].join('\n')
  assert.equal(parseInlineContributorName(inlineBody), 'Muhaiminul Islam Khan')
  const snapshot = await buildContributorSnapshot({
    policy: basePolicy,
    ledger: ledger([muhaimin], [event(57, 'muhaimin')]),
    targetCatalog: targetCatalog('/guides/example'),
    fetchImpl: githubMock([pull(57, 'app/deshistartup', {
      body: inlineBody,
      user: { login: 'app/deshistartup', type: 'Bot', avatar_url: null }
    })])
  })
  assert.equal(snapshot.rankedProfiles[0].id, 'muhaimin')
})

test('resolves a confirmed GitHub avatar separately from an inline-editor bot identity', async () => {
  const muhaimin = profile('muhaimin', 'muhaiminulfahim', {
    avatar: { kind: 'github' },
    confirmedAt: '2026-08-01'
  })
  const basePolicy = policy([muhaimin])
  basePolicy.identityAliases.inlineNames['Muhaiminul Islam Khan'] = 'muhaimin'
  const inlineBody = [
    '**অবদানকারী / Contributor:** Muhaiminul Islam Khan',
    '_Created via the Deshi Startup inline editor._'
  ].join('\n')
  const calls = []
  const snapshot = await buildContributorSnapshot({
    policy: basePolicy,
    ledger: ledger([muhaimin], [event(57, 'muhaimin')]),
    targetCatalog: targetCatalog('/guides/example'),
    fetchImpl: githubUsersMock([
      pull(57, 'app/deshistartup', {
        body: inlineBody,
        user: { login: 'app/deshistartup', type: 'Bot', avatar_url: null }
      })
    ], {
      muhaiminulfahim: {
        login: 'MuhaiminulFahim',
        avatar_url: 'https://avatars.githubusercontent.com/u/57?v=4'
      }
    }, calls)
  })
  assert.equal(snapshot.rankedProfiles[0].avatarUrl, 'https://avatars.githubusercontent.com/u/57?v=4&s=160')
  assert.ok(calls.some(({ url }) => new URL(url).pathname === '/users/muhaiminulfahim'))
})

test('requires confirmation and a login before resolving a GitHub avatar', () => {
  const catalog = targetCatalog()
  const withoutConfirmation = profile('alice', 'alice', { avatar: { kind: 'github' } })
  assert.throws(
    () => validateContributorLedger({
      ledger: ledger([withoutConfirmation]),
      policy: policy([withoutConfirmation]),
      targetCatalog: catalog
    }),
    /GitHub avatar requires confirmation/
  )

  const withoutLogin = profile('alice', null, {
    githubLogin: null,
    links: [],
    avatar: { kind: 'github' },
    confirmedAt: '2026-08-01'
  })
  assert.throws(
    () => validateContributorLedger({
      ledger: ledger([withoutLogin]),
      policy: policy([withoutLogin]),
      targetCatalog: catalog
    }),
    /GitHub avatar requires a GitHub login/
  )
})

test('permits only exact migration-allowlisted legacy URL avatars', () => {
  const legacyUrl = 'https://avatars.githubusercontent.com/u/42?v=4&s=160'
  const alice = profile('alice', 'alice', {
    avatar: { kind: 'url', url: legacyUrl }
  })
  const allowedPolicy = policy([alice], {
    legacyAvatarUrls: { alice: legacyUrl }
  })
  assert.doesNotThrow(() => validateContributorLedger({
    ledger: ledger([alice]),
    policy: allowedPolicy
  }))

  const newlyConfirmed = profile('bob', 'bob', {
    avatar: { kind: 'url', url: 'https://avatars.githubusercontent.com/u/43?v=4&s=160' },
    confirmedAt: '2026-08-01'
  })
  assert.throws(
    () => validateContributorLedger({
      ledger: ledger([newlyConfirmed]),
      policy: policy([newlyConfirmed])
    }),
    /not in the migration allowlist/
  )
})

test('rejects mismatched identities and unsafe URLs from GitHub avatar lookup', async () => {
  const alice = profile('alice', 'alice', {
    avatar: { kind: 'github' },
    confirmedAt: '2026-08-01'
  })
  const options = {
    policy: policy([alice]),
    ledger: ledger([alice], [event(1, 'alice')]),
    targetCatalog: targetCatalog('/guides/example')
  }
  await assert.rejects(
    buildContributorSnapshot({
      ...options,
      fetchImpl: githubUsersMock([pull(1, 'alice')], {
        alice: {
          login: 'mallory',
          avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4'
        }
      })
    }),
    /different public identity/
  )
  await assert.rejects(
    buildContributorSnapshot({
      ...options,
      fetchImpl: githubUsersMock([pull(1, 'alice')], {
        alice: { login: 'alice', avatar_url: 'https://example.com/alice.webp' }
      })
    }),
    /unsafe avatar URL/
  )
})

test('requires confirmed, registered media avatars and keeps their logical path in the snapshot', async () => {
  const logicalPath = '/media/contributors/alice.webp'
  const sha = '0123456789ab'
  const mediaManifest = {
    [logicalPath]: {
      key: `contributors/alice.${sha}.webp`,
      sha,
      remote: true
    }
  }
  const unconfirmed = profile('alice', null, {
    githubLogin: null,
    links: [],
    avatar: { kind: 'media', path: logicalPath }
  })
  assert.throws(
    () => validateContributorLedger({
      ledger: ledger([unconfirmed]),
      policy: policy([unconfirmed]),
      mediaManifest
    }),
    /media avatar requires confirmation/
  )

  const alice = profile('alice', null, {
    githubLogin: null,
    links: [],
    avatar: { kind: 'media', path: logicalPath },
    confirmedAt: '2026-08-01'
  })
  assert.throws(
    () => validateContributorLedger({ ledger: ledger([alice]), policy: policy([alice]) }),
    /missing a remote content-addressed registry entry/
  )
  const snapshot = await buildContributorSnapshot({
    policy: policy([alice]),
    ledger: ledger([alice], [editorialEvent('event-8', [
      { mode: 'person', profileId: 'alice', roles: ['author'] }
    ])]),
    targetCatalog: targetCatalog('/guides/example'),
    mediaManifest,
    fetchImpl: githubMock([])
  })
  assert.equal(
    snapshot.rankedProfiles[0].avatarUrl,
    logicalPath
  )
})

test('keeps bots out and core maintainers separate and unranked', async () => {
  const snapshot = await buildContributorSnapshot({
    policy: policy([]),
    ledger: ledger([], []),
    targetCatalog: new Map(),
    fetchImpl: githubMock([
      pull(1, 'dependabot[bot]', { user: { login: 'dependabot[bot]', type: 'Bot', avatar_url: null } }),
      pull(2, 'shamirislam')
    ])
  })
  assert.equal(snapshot.rankedProfiles.length, 0)
  assert.equal(snapshot.coreProfiles.length, 1)
  assert.equal(snapshot.coreProfiles[0].displayName, 'Shamir Islam')
})

test('requests a small avatar instead of the full-size default', () => {
  assert.equal(
    sizedAvatarUrl('https://avatars.githubusercontent.com/u/42?v=4'),
    'https://avatars.githubusercontent.com/u/42?v=4&s=160'
  )
  assert.equal(sizedAvatarUrl('https://example.com/u/42.png'), null)
  assert.equal(sizedAvatarUrl(null), null)
})

test('API failure preserves the last good snapshot', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-contributors-'))
  const outputPath = path.join(directory, 'contributors.json')
  const original = '{"lastGood":true}\n'
  const alice = profile('alice')
  await fs.writeFile(outputPath, original)
  try {
    await assert.rejects(
      refreshContributorFile({
        policy: policy([alice]),
        ledger: ledger([alice], [event(1, 'alice')]),
        targetCatalog: targetCatalog('/guides/example'),
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

test('a failed GitHub avatar lookup preserves the last good snapshot', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'deshi-contributor-avatar-'))
  const outputPath = path.join(directory, 'contributors.json')
  const original = '{"lastGood":"avatar"}\n'
  const alice = profile('alice', 'alice', {
    avatar: { kind: 'github' },
    confirmedAt: '2026-08-01'
  })
  await fs.writeFile(outputPath, original)
  try {
    await assert.rejects(
      refreshContributorFile({
        policy: policy([alice]),
        ledger: ledger([alice], [event(1, 'alice')]),
        targetCatalog: targetCatalog('/guides/example'),
        outputPath,
        fetchImpl: githubUsersMock([pull(1, 'alice')], {
          alice: { login: 'alice', avatar_url: 'https://example.com/alice.webp' }
        })
      }),
      /unsafe avatar URL/
    )
    assert.equal(await fs.readFile(outputPath, 'utf8'), original)
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
})

test('output is secret-free even when GitHub refresh is authenticated', async () => {
  const secret = 'github_pat_never_publish_this'
  const calls = []
  const alice = profile('alice')
  const snapshot = await buildContributorSnapshot({
    policy: policy([alice]),
    ledger: ledger([alice], [event(1, 'alice')]),
    targetCatalog: targetCatalog('/guides/example'),
    token: secret,
    fetchImpl: githubMock([pull(1, 'alice')], calls)
  })
  assert.equal(calls[0].options.headers.Authorization, `Bearer ${secret}`)
  assert.equal(JSON.stringify(validatePublicSnapshot(snapshot)).includes(secret), false)
  assert.equal(JSON.stringify(snapshot).includes('email'), false)
})

test('public snapshot validation rejects a profile value that would be silently normalized', async () => {
  const current = JSON.parse(await fs.readFile(
    path.join(root, 'app', 'generated', 'contributors.json'),
    'utf8'
  ))
  current.rankedProfiles[0].displayName = 'A'.repeat(181)
  assert.throws(
    () => validatePublicSnapshot(current),
    /normalized or truncated profile data/
  )
})

test('the authored current ledger reconciles to four contributors and thirteen community events', async () => {
  const [currentLedger, currentPolicy, catalog] = await Promise.all([
    fs.readFile(path.join(root, 'data', 'contributor-ledger.json'), 'utf8').then(JSON.parse),
    fs.readFile(path.join(root, 'data', 'contributors-policy.json'), 'utf8').then(JSON.parse),
    buildTargetCatalog(root)
  ])
  const inlineBody = [
    '**অবদানকারী / Contributor:** Muhaiminul Islam Khan',
    '_Created via the Deshi Startup inline editor._'
  ].join('\n')
  const pulls = [
    pull(7, 'niloy-biswas', { merged_at: '2026-07-09T12:30:21Z' }),
    pull(32, 'niloy-biswas', { merged_at: '2026-07-16T12:14:18Z' }),
    pull(41, 'niloy-biswas'),
    pull(39, 'uttamdeb'),
    pull(40, 'uttamdeb'),
    pull(79, 'M9S4K', {
      merged_at: '2026-08-18T13:07:32Z'
    }),
    pull(57, 'app/deshistartup', {
      merged_at: '2026-08-10T21:59:38Z',
      body: inlineBody,
      user: { login: 'app/deshistartup', type: 'Bot', avatar_url: null }
    })
  ]
  const shoumikMedia = {
    '/media/contributors/shoumik-shahriar.webp': {
      key: 'contributors/shoumik-shahriar.860da7a3d696.webp',
      w: 384,
      h: 384,
      bytes: 9344,
      sha: '860da7a3d696',
      remote: true,
      uploadedAt: '2026-08-18T21:34:09.801Z'
    }
  }
  const snapshot = await buildContributorSnapshot({
    policy: currentPolicy,
    ledger: currentLedger,
    targetCatalog: catalog,
    mediaManifest: shoumikMedia,
    fetchImpl: githubUsersMock(pulls, {
      muhaiminulfahim: {
        login: 'MuhaiminulFahim',
        avatar_url: 'https://avatars.githubusercontent.com/u/57?v=4'
      }
    })
  })
  assert.equal(snapshot.totals.contributors, 4)
  assert.equal(snapshot.totals.acceptedEvents, 13)
  assert.equal(snapshot.totals.pagesImproved, 37)
  const muhaimin = snapshot.rankedProfiles.find((profile) => profile.id === 'muhaiminul-islam-khan')
  const niloy = snapshot.rankedProfiles.find((profile) => profile.id === 'niloy-biswas')
  const shoumik = snapshot.rankedProfiles.find((profile) => profile.id === 'shoumik-shahriar')
  const uttam = snapshot.rankedProfiles.find((profile) => profile.id === 'uttam-deb')
  assert.equal(muhaimin.avatarUrl, 'https://avatars.githubusercontent.com/u/57?v=4&s=160')
  assert.equal(niloy.headline, 'Data & AI Professional')
  assert.equal(shoumik.headline, 'Management Consultant')
  assert.equal(shoumik.organizationId, 'lightcastle-partners')
  assert.equal(shoumik.avatarUrl, '/media/contributors/shoumik-shahriar.webp')
  assert.equal(uttam.headline, 'Data & AI Professional')
  assert.deepEqual(snapshot.coreProfiles, [{
    displayName: 'Mohammad Sultan Khaja',
    githubLogin: 'M9S4K',
    profileUrl: 'https://github.com/M9S4K',
    avatarUrl: 'https://avatars.githubusercontent.com/u/79?v=4&s=160',
    mergedPullRequestCount: 1,
    lastMergedAt: '2026-08-18T13:07:32.000Z'
  }])
  assert.deepEqual(snapshot.organizations, [{
    id: 'lightcastle-partners',
    name: 'LightCastle Partners',
    url: 'https://lightcastlepartners.com/'
  }])
})
