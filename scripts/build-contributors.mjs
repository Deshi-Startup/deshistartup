#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTargetCatalog, refreshContributorFile } from './contributor-data.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const policyPath = path.join(root, 'data', 'contributors-policy.json')
const ledgerPath = path.join(root, 'data', 'contributor-ledger.json')
const mediaManifestPath = path.join(root, 'app', 'generated', 'media.json')
const outputPath = path.join(root, 'app', 'generated', 'contributors.json')

async function main() {
  const [policy, ledger, mediaManifest, targetCatalog] = await Promise.all([
    fs.readFile(policyPath, 'utf8').then(JSON.parse),
    fs.readFile(ledgerPath, 'utf8').then(JSON.parse),
    fs.readFile(mediaManifestPath, 'utf8').then(JSON.parse),
    buildTargetCatalog(root)
  ])
  const snapshot = await refreshContributorFile({
    policy,
    ledger,
    mediaManifest,
    targetCatalog,
    outputPath,
    token: process.env.GITHUB_TOKEN
  })
  const { totals, unattributedCount, coreProfiles } = snapshot
  process.stdout.write(
    `Contributor snapshot: ${totals.contributors} ranked, ` +
    `${totals.acceptedEvents} accepted events, ` +
    `${totals.pagesImproved} pages improved, ` +
    `${coreProfiles.length} core, ` +
    `${unattributedCount} unattributed\n`
  )
  if (unattributedCount) {
    process.stdout.write(
      'Some merged work could not be tied to a person. Set `githubLogin` on the ledger profile, ' +
      'or add an `identityAliases` entry when the unmatched identity is historical.\n'
    )
  }
}

main().catch((error) => {
  process.stderr.write(`Contributor refresh failed; previous snapshot preserved. ${error.message}\n`)
  process.exitCode = 1
})
