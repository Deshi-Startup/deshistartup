#!/usr/bin/env node
// Local by default. Remote D1 requires --remote; this tool never deploys the website.
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { ideaSlug } from '../app/lib/idea-routes.mjs'
import { readEcosystemSnapshot, snapshotDigest, snapshotRowsSql, validateEcosystemSnapshot } from './lib/ecosystem-snapshot.mjs'

const root = path.resolve(import.meta.dirname, '..')
const remote = process.argv.includes('--remote')
const args = process.argv.slice(2).filter(arg => arg !== '--remote')
const config = remote ? 'wrangler.jsonc' : 'wrangler.ecosystem-local.jsonc'
const dbName = remote ? 'deshistartup-ecosystem' : 'deshi-ecosystem-local'
const target = remote ? '--remote' : '--local'
const quote = x => "'" + String(x).replaceAll("'", "''") + "'"
function wrangler(args) {
  const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', ...args, '--config', config], {
    cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_WRITE_LOGS: 'false' }
  })
  if (result.status !== 0) throw new Error(`D1 command failed: ${result.stderr || result.stdout}`)
  return result.stdout
}
function query(sql) {
  const data = JSON.parse(wrangler(['d1', 'execute', dbName, target, '--command', sql, '--json']))
  if (data.some(r => !r.success)) throw new Error('D1 query failed')
  return data[0]?.results || []
}
const action = args[0]
if (action === 'prepare-restore') {
  const [, input, output] = args
  if (!input || !output || path.resolve(input) === path.resolve(output)) throw new Error('Pass a backup SQL file and a different output path.')
  const { unstable_splitSqlQuery } = await import('wrangler')
  const statements = unstable_splitSqlQuery(fs.readFileSync(input, 'utf8'))
  // D1 exports insert rows before some referenced tables exist. Deferred foreign
  // keys permit missing rows, but not missing tables. Create all tables first.
  const tables = statements.filter(sql => /^\s*CREATE TABLE\b/i.test(sql))
  const rest = statements.filter(sql => !/^\s*(?:CREATE TABLE\b|PRAGMA defer_foreign_keys\b)/i.test(sql))
  if (!tables.length) throw new Error('No table definitions found in the backup.')
  fs.writeFileSync(output, ['PRAGMA defer_foreign_keys=ON', ...tables, ...rest].map(sql => sql.replace(/;\s*$/, '') + ';').join('\n') + '\n', { mode: 0o600, flag: 'wx' })
  console.log('Prepared restore SQL with table definitions before data. No database was changed.')
} else if (action === 'init') {
  console.log(wrangler(['d1', 'migrations', 'apply', dbName, target]))
} else if (action === 'prepare') {
  const rows = JSON.parse(query(snapshotRowsSql)[0].snapshot_rows)
  const id = `release_${crypto.randomUUID()}`
  const now = new Date().toISOString()
  const snapshot = await readEcosystemSnapshot(sql => Promise.resolve(rows[sql.match(/FROM (\w+)/)[1]]), id, now)
  const json = JSON.stringify(snapshot)
  const digest = snapshotDigest(snapshot)
  query(`INSERT INTO releases (id, snapshot_json, digest, created_at) VALUES (${quote(id)}, ${quote(json)}, ${quote(digest)}, ${quote(now)})`)
  fs.mkdirSync(path.join(root, 'data/ecosystem'), { recursive: true })
  fs.writeFileSync(path.join(root, 'data/ecosystem/public.json'), JSON.stringify(snapshot, null, 2) + '\n')
  fs.writeFileSync(path.join(root, 'public/ecosystem-release.json'), JSON.stringify({ releaseId: id, digest }) + '\n')
  console.log(`Prepared ${id}: ${snapshot.problems.length} problems, ${snapshot.approaches.length} approaches, ${snapshot.organizations.length} organizations. Not published.`)
} else if (action === 'verify-build') {
  const built = JSON.parse(fs.readFileSync(path.join(root, 'out/ecosystem-release.json'), 'utf8'))
  const snapshot = validateEcosystemSnapshot(JSON.parse(fs.readFileSync(path.join(root, 'data/ecosystem/public.json'), 'utf8')))
  if (built.releaseId !== snapshot.releaseId || built.digest !== snapshotDigest(snapshot)) throw new Error('Built release marker does not match the public snapshot.')
  for (const prefix of ['', 'en/']) for (const [family, records] of [['startup-ideas', snapshot.approaches], ['companies', snapshot.organizations]]) {
    for (const record of records) {
      const destination = path.join(root, 'out', prefix, family, family === 'startup-ideas' ? ideaSlug(record.id) : record.slug)
      if (![`${destination}.html`, path.join(destination, 'index.html')].some(file => fs.existsSync(file))) throw new Error(`Missing built profile: ${destination}`)
    }
  }
  fs.writeFileSync(path.join(root, 'out/ecosystem-verified.json'), JSON.stringify(built) + '\n')
  console.log(`Verified built ecosystem release ${built.releaseId}.`)
} else if (action === 'publish') {
  const requested = args[1]
  const source = JSON.parse(fs.readFileSync(path.join(root, 'public/ecosystem-release.json'), 'utf8'))
  const built = JSON.parse(fs.readFileSync(path.join(root, 'out/ecosystem-release.json'), 'utf8'))
  const verified = JSON.parse(fs.readFileSync(path.join(root, 'out/ecosystem-verified.json'), 'utf8'))
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data/ecosystem/public.json'), 'utf8'))
  if (!requested || requested !== source.releaseId || JSON.stringify(source) !== JSON.stringify(built) || JSON.stringify(source) !== JSON.stringify(verified) || source.digest !== snapshotDigest(snapshot)) throw new Error('Pass the prepared release ID after a successful build of that exact snapshot.')
  if (remote) {
    const response = await fetch('https://deshistartup.com/ecosystem-release.json', { cache: 'no-store', signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error('The release is not deployed to deshistartup.com yet.')
    const live = await response.json()
    if (live.releaseId !== source.releaseId || live.digest !== source.digest) throw new Error('Deploy this exact release before marking it published.')
  }
  const release = query(`SELECT digest FROM releases WHERE id = ${quote(requested)}`)[0]
  if (!release || release.digest !== source.digest) throw new Error('The release does not match the selected D1 database.')
  query(`UPDATE releases SET published_at = ${quote(new Date().toISOString())} WHERE id = ${quote(requested)}`)
  // The visible pointer changes in one atomic statement, after all validation.
  query(`INSERT INTO publication (singleton, release_id) VALUES (1, ${quote(requested)}) ON CONFLICT(singleton) DO UPDATE SET release_id = excluded.release_id`)
  console.log(`Marked ${requested} published in ${remote ? 'REMOTE' : 'LOCAL'} D1. No remote deployment occurred.`)
} else {
  throw new Error('Usage: node scripts/ecosystem.mjs init | prepare | verify-build | publish <release-id> [--remote], or prepare-restore <backup.sql> <restore.sql>')
}
