#!/usr/bin/env node
/**
 * Uploads everything staged in media/ to the R2 bucket and records it in
 * app/generated/media.json.
 *
 *   media/registration/rjsc-search.png   ->   https://media.deshistartup.com/registration/rjsc-search.png
 *
 * Drop files into media/ (gitignored — the bytes are never committed), run this,
 * then commit the registry change alongside the page that uses the image.
 *
 *   npm run media:upload             # only what changed
 *   npm run media:upload -- --force  # re-upload everything
 *   npm run media:upload -- media/registration/rjsc-search.png
 */
import fs from 'node:fs'
import path from 'node:path'
import { BUCKET, root, stagingDir, uploadFiles, walkStaging } from './lib/media-lib.mjs'

const args = process.argv.slice(2)
const force = args.includes('--force')
const explicit = args.filter((arg) => !arg.startsWith('--'))

const files = explicit.length
  ? explicit.map((arg) => path.resolve(root, arg))
  : walkStaging()

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.error(`✖ ${path.relative(root, file)} does not exist`)
    process.exit(1)
  }
  if (!file.startsWith(stagingDir + path.sep)) {
    console.error(`✖ ${path.relative(root, file)} is outside media/. Stage it there first.`)
    process.exit(1)
  }
}

if (!files.length) {
  console.log(`media upload: nothing staged in media/ — drop images there first`)
  process.exit(0)
}

const { uploaded, skipped, failed } = uploadFiles(files, { force })

for (const key of uploaded) console.log(`  ↑ ${key}`)
console.log(
  `media upload: ${uploaded.length} uploaded to ${BUCKET}, ${skipped.length} unchanged` +
    (failed.length ? `, ${failed.length} failed` : '')
)

if (failed.length) {
  console.error('\n✖ failed:')
  for (const { key, error } of failed) console.error(`  ${key}\n    ${error.replace(/\n/g, '\n    ')}`)
  console.error(
    '\nIf wrangler reports that R2 is not enabled, enable R2 once in the Cloudflare\n' +
      'dashboard, then run `npx wrangler login` again so the token carries R2 scope.'
  )
  process.exit(1)
}

if (uploaded.length) {
  console.log('\nCommit app/generated/media.json with the page that uses these images.')
}
