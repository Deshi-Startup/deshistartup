#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildTargetCatalog, refreshContributorFile } from './contributor-data.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const policyPath = path.join(root, 'data', 'contributors-policy.json')
const ledgerPath = path.join(root, 'data', 'contributor-ledger.json')
const outputPath = path.join(root, 'app', 'generated', 'contributors.json')

async function main() {
  const policy = JSON.parse(await fs.readFile(policyPath, 'utf8'))
  const ledger = JSON.parse(await fs.readFile(ledgerPath, 'utf8'))
  const targetCatalog = await buildTargetCatalog(root)
  const snapshot = await refreshContributorFile({
    policy,
    ledger,
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
      'Some merged work could not be tied to a person. Add a stable entry to ' +
      '`identityAliases` in data/contributors-policy.json before crediting it.\n'
    )
  }
}

main().catch((error) => {
  process.stderr.write(`Contributor refresh failed; previous snapshot preserved. ${error.message}\n`)
  process.exitCode = 1
})
