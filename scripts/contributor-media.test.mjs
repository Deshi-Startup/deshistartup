import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  classifyContributorMediaAvatars,
  contributorProfileWithdrawal
} from './lib/contributor-media.mjs'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const profile = {
  id: 'alice',
  githubLogin: 'Alice-GH',
  visibility: 'public',
  avatar: { kind: 'media', path: '/media/contributors/alice.webp' }
}

function policy(overrides = {}) {
  return {
    identityAliases: { githubLogins: {}, inlineNames: {} },
    exclusions: { githubLogins: [], inlineNames: [], profileIds: [] },
    optOuts: { githubLogins: [], inlineNames: [], profileIds: [] },
    ...overrides
  }
}

test('keeps a public media avatar live', () => {
  assert.deepEqual(classifyContributorMediaAvatars({ profiles: [profile] }, policy()), {
    active: [{ profileId: 'alice', path: '/media/contributors/alice.webp' }],
    withdrawn: []
  })
})

test('withdraws media selected by a non-public profile', () => {
  assert.deepEqual(
    contributorProfileWithdrawal({ ...profile, visibility: 'hidden' }, policy()),
    { kind: 'visibility' }
  )
})

for (const [label, overrides, expected] of [
  ['profile exclusion', { exclusions: { githubLogins: [], inlineNames: [], profileIds: ['ALICE'] } }, 'exclusion-profile'],
  ['profile opt-out', { optOuts: { githubLogins: [], inlineNames: [], profileIds: ['Alice'] } }, 'opt-out-profile'],
  ['GitHub exclusion', { exclusions: { githubLogins: ['alice-gh'], inlineNames: [], profileIds: [] } }, 'exclusion-github'],
  ['GitHub opt-out', { optOuts: { githubLogins: ['ALICE-GH'], inlineNames: [], profileIds: [] } }, 'opt-out-github']
]) {
  test(`withdraws media through a case-insensitive ${label}`, () => {
    assert.equal(contributorProfileWithdrawal(profile, policy(overrides))?.kind, expected)
  })
}

for (const [list, expected] of [
  ['exclusions', 'exclusion-inline'],
  ['optOuts', 'opt-out-inline']
]) {
  test(`withdraws media through an ${list === 'exclusions' ? 'excluded' : 'opted-out'} inline alias`, () => {
    const base = policy({
      identityAliases: { githubLogins: {}, inlineNames: { 'Alice Writer': 'alice' } }
    })
    base[list].inlineNames = ['ALICE WRITER']
    assert.deepEqual(contributorProfileWithdrawal(profile, base), {
      kind: expected,
      identity: 'Alice Writer'
    })
  })
}

for (const [list, expected] of [
  ['exclusions', 'exclusion-github'],
  ['optOuts', 'opt-out-github']
]) {
  test(`withdraws media through a case-insensitive historical GitHub alias ${list === 'exclusions' ? 'exclusion' : 'opt-out'}`, () => {
    const base = policy({
      identityAliases: {
        githubLogins: { 'old-alice': 'alice' },
        inlineNames: { 'Bob Writer': 'bob' }
      }
    })
    base[list].githubLogins = ['OLD-ALICE']
    assert.deepEqual(contributorProfileWithdrawal(profile, base), {
      kind: expected,
      identity: 'old-alice'
    })
  })
}

test('does not map another profile inline alias to this profile', () => {
  const base = policy({
    identityAliases: {
      githubLogins: {},
      inlineNames: { 'Bob Writer': 'bob' }
    },
    exclusions: {
      githubLogins: [],
      inlineNames: ['Bob Writer'],
      profileIds: []
    }
  })
  assert.equal(contributorProfileWithdrawal(profile, base), null)
})

test('classifies withdrawn media separately from live references', () => {
  const hidden = { ...profile, visibility: 'hidden' }
  assert.deepEqual(classifyContributorMediaAvatars({ profiles: [hidden] }, policy()), {
    active: [],
    withdrawn: [
      {
        profileId: 'alice',
        path: '/media/contributors/alice.webp',
        withdrawal: { kind: 'visibility' }
      }
    ]
  })
})

test('lint rejects and prune retires a media avatar withdrawn through an inline opt-out', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'deshi-contributor-media-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))

  for (const directory of [
    'scripts/lib',
    'data/ecosystem',
    'app/generated',
    'app/(contents)'
  ]) {
    await mkdir(path.join(fixtureRoot, directory), { recursive: true })
  }
  for (const file of [
    'scripts/media-lint.mjs',
    'scripts/media-prune.mjs',
    'scripts/lib/media-lib.mjs',
    'scripts/lib/contributor-media.mjs',
    'scripts/lib/ecosystem-media.mjs'
  ]) {
    await copyFile(path.join(repositoryRoot, file), path.join(fixtureRoot, file))
  }

  await writeFile(
    path.join(fixtureRoot, 'data/contributor-ledger.json'),
    JSON.stringify({ profiles: [profile] })
  )
  await writeFile(
    path.join(fixtureRoot, 'data/contributors-policy.json'),
    JSON.stringify({
      ...policy(),
      identityAliases: { githubLogins: {}, inlineNames: { 'Alice Writer': 'alice' } },
      optOuts: { githubLogins: [], inlineNames: ['Alice Writer'], profileIds: [] }
    })
  )
  await writeFile(
    path.join(fixtureRoot, 'app/generated/media.json'),
    JSON.stringify({
      '/media/contributors/alice.webp': {
        remote: true,
        key: 'contributors/alice.aaaaaaaaaaaa.webp',
        sha: 'aaaaaaaaaaaa',
        bytes: 100,
        w: 160,
        h: 160
      }
    })
  )
  await writeFile(path.join(fixtureRoot, 'app/generated/media-retired.json'), '[]')
  await writeFile(path.join(fixtureRoot, 'data/ecosystem/public.json'), '{"organizations":[]}')

  const lint = spawnSync(process.execPath, ['scripts/media-lint.mjs'], {
    cwd: fixtureRoot,
    encoding: 'utf8'
  })
  const lintOutput = `${lint.stdout}${lint.stderr}`
  assert.equal(lint.status, 1, lintOutput)
  assert.match(lintOutput, /inline identity alias is opted out/)
  assert.match(lintOutput, /Change its avatar to.*monogram/s)
  assert.match(lintOutput, /media:prune -- --retire-unreferenced/)

  const prune = spawnSync(
    process.execPath,
    ['scripts/media-prune.mjs', '--retire-unreferenced'],
    { cwd: fixtureRoot, encoding: 'utf8' }
  )
  const pruneOutput = `${prune.stdout}${prune.stderr}`
  assert.equal(prune.status, 0, pruneOutput)
  assert.match(pruneOutput, /retired \/media\/contributors\/alice\.webp/)
  assert.deepEqual(
    JSON.parse(await readFile(path.join(fixtureRoot, 'app/generated/media.json'), 'utf8')),
    {}
  )
})

test('prune preserves company-only logos, Startup 50 logos and social images', async (t) => {
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'deshi-data-media-'))
  t.after(() => rm(fixtureRoot, { recursive: true, force: true }))

  for (const directory of ['scripts/lib', 'data/ecosystem', 'app/generated', 'app/(contents)']) {
    await mkdir(path.join(fixtureRoot, directory), { recursive: true })
  }
  for (const file of [
    'scripts/media-prune.mjs',
    'scripts/media-lint.mjs',
    'scripts/lib/media-lib.mjs',
    'scripts/lib/contributor-media.mjs',
    'scripts/lib/ecosystem-media.mjs'
  ]) {
    await copyFile(path.join(repositoryRoot, file), path.join(fixtureRoot, file))
  }

  await writeFile(path.join(fixtureRoot, 'data/contributor-ledger.json'), JSON.stringify({ profiles: [] }))
  await writeFile(path.join(fixtureRoot, 'data/contributors-policy.json'), JSON.stringify(policy()))
  await writeFile(path.join(fixtureRoot, 'data/ecosystem/public.json'), JSON.stringify({
    organizations: [{ id: 'company-only', logoPath: '/media/companies/only.webp' }, { id: 'no-logo', logoPath: null }],
    identities: { people: [{ id: 'person-only', avatarPath: '/media/people/only.webp' }] }
  }))
  await writeFile(
    path.join(fixtureRoot, 'data/startup-50-logos.json'),
    JSON.stringify({ entries: [{ slug: 'example', src: '/media/startup-50/example.webp' }] })
  )
  await writeFile(
    path.join(fixtureRoot, 'data/social-images.json'),
    JSON.stringify({ example: { locales: { en: { src: '/media/og/en/example.png' } } } })
  )
  await writeFile(
    path.join(fixtureRoot, 'app/generated/media.json'),
    JSON.stringify({
      '/media/companies/only.webp': {
        key: 'companies/only.dddddddddddd.webp', bytes: 100
      },
      '/media/people/only.webp': {
        key: 'people/only.eeeeeeeeeeee.webp', bytes: 100
      },
      '/media/startup-50/example.webp': {
        key: 'startup-50/example.aaaaaaaaaaaa.webp', bytes: 100
      },
      '/media/og/en/example.png': {
        key: 'og/en/example.bbbbbbbbbbbb.png', bytes: 100
      },
      '/media/startup-50/old.webp': {
        key: 'startup-50/old.cccccccccccc.webp', bytes: 100
      }
    })
  )
  await writeFile(path.join(fixtureRoot, 'app/generated/media-retired.json'), '[]')

  const prune = spawnSync(
    process.execPath,
    ['scripts/media-prune.mjs', '--retire-unreferenced'],
    { cwd: fixtureRoot, encoding: 'utf8' }
  )
  const pruneOutput = `${prune.stdout}${prune.stderr}`
  assert.equal(prune.status, 0, pruneOutput)
  assert.match(pruneOutput, /retired \/media\/startup-50\/old\.webp/)
  assert.doesNotMatch(pruneOutput, /retired \/media\/startup-50\/example\.webp/)
  assert.doesNotMatch(pruneOutput, /retired \/media\/og\/en\/example\.png/)

  const active = JSON.parse(await readFile(path.join(fixtureRoot, 'app/generated/media.json'), 'utf8'))
  assert.deepEqual(Object.keys(active).sort(), [
    '/media/companies/only.webp',
    '/media/og/en/example.png',
    '/media/people/only.webp',
    '/media/startup-50/example.webp'
  ])
  await writeFile(path.join(fixtureRoot, 'data/ecosystem/public.json'), JSON.stringify({
    organizations: [{ id: 'missing-logo', logoPath: '/media/companies/missing.webp' }]
  }))
  const lint = spawnSync(process.execPath, ['scripts/media-lint.mjs'], { cwd: fixtureRoot, encoding: 'utf8' })
  assert.equal(lint.status, 1)
  assert.match(`${lint.stdout}${lint.stderr}`, /missing-logo logo references .*missing.webp, which has not been uploaded/)

  await writeFile(path.join(fixtureRoot, 'data/ecosystem/public.json'), '{}')
  const unsafePrune = spawnSync(process.execPath, ['scripts/media-prune.mjs', '--retire-unreferenced'], { cwd: fixtureRoot, encoding: 'utf8' })
  assert.notEqual(unsafePrune.status, 0, 'Malformed snapshot must stop retirement')
  assert.deepEqual(JSON.parse(await readFile(path.join(fixtureRoot, 'app/generated/media.json'), 'utf8')), active)
})
