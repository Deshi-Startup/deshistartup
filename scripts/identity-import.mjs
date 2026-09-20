#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { validateContributorLedger, buildTargetCatalog } from './contributor-data.mjs'
import { contributorIdentityImport } from './lib/identity-import.mjs'

const root = path.resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
if (args.some(arg => !['--apply', '--remote'].includes(arg))) throw new Error('Usage: node scripts/identity-import.mjs [--apply] [--remote]')
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))
const ledger = read('data/contributor-ledger.json'), policy = read('data/contributors-policy.json')
validateContributorLedger({ ledger, policy, targetCatalog: await buildTargetCatalog(root), mediaManifest: read('app/generated/media.json') })
const plan = contributorIdentityImport(ledger, policy, new Date().toISOString())
const remote = args.includes('--remote')
console.log(`Identity import: ${plan.people.length} confirmed legacy people; ${remote ? 'REMOTE' : 'LOCAL'} target. New identities remain private; existing D1 fields are never overwritten.`)
console.log(`People: ${plan.people.join(', ') || '(none)'}`)
if (plan.unresolvedOrganizations.length) console.log(`Affiliations need separate identity/role review: ${plan.unresolvedOrganizations.join(', ')}`)
if (!args.includes('--apply')) {
  console.log('Dry run only. Apply migration 0012 before importing. Pass --apply to import; --remote is a separate explicit choice.')
} else if (plan.statements.length) {
  // Wrangler file execution runs the SQL atomically; a conflicting crosswalk
  // fails its guard rather than silently linking someone else's record.
  const directory = path.join(root, '.wrangler', 'identity-import')
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  const file = path.join(directory, `${crypto.randomUUID()}.sql`)
  fs.writeFileSync(file, plan.statements.join(';\n') + ';\n', { mode: 0o600, flag: 'wx' })
  try {
    const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute',
      remote ? 'deshistartup-ecosystem' : 'deshi-ecosystem-local', remote ? '--remote' : '--local',
      '--config', remote ? 'wrangler.jsonc' : 'wrangler.ecosystem-local.jsonc', '--file', file],
    { cwd: root, stdio: 'inherit', env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false' } })
    if (result.error) throw result.error
    if (result.status !== 0) throw new Error('Identity import failed; inspect the D1 error above.')
  } finally { fs.rmSync(file, { force: true }) }
}
