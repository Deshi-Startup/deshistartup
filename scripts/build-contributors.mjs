#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { refreshContributorFile } from './contributor-data.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const policyPath = path.join(root, 'data', 'contributors-policy.json')
const outputPath = path.join(root, 'app', 'generated', 'contributors.json')

async function main() {
  const policy = JSON.parse(await fs.readFile(policyPath, 'utf8'))
  const snapshot = await refreshContributorFile({
    policy,
    outputPath,
    token: process.env.GITHUB_TOKEN
  })
  const { totals, unattributedCount, coreProfiles } = snapshot
  process.stdout.write(
    `Contributor snapshot: ${totals.contributors} ranked, ` +
    `${totals.mergedPullRequests} merged PRs, ` +
    `${coreProfiles.length} core, ` +
    `${unattributedCount} unattributed\n`
  )
  if (unattributedCount) {
    process.stdout.write(
      'Some merged work could not be tied to a person. Add an entry to ' +
      '`inlineAttributionLinks` in data/contributors-policy.json to credit it.\n'
    )
  }
}

main().catch((error) => {
  process.stderr.write(`Contributor refresh failed; previous snapshot preserved. ${error.message}\n`)
  process.exitCode = 1
})
