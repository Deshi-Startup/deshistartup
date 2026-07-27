import assert from 'node:assert/strict'
import test from 'node:test'
import {
  approvePendingMediaInMarkdown,
  contributionMediaLogicalPath,
  countPendingMediaUses,
  extractPendingMediaIds,
  MAX_IMAGES_PER_CONTRIBUTION,
  MAX_IMAGES_PER_USER_PER_DAY,
  normalizeContributionMediaInput,
  pendingMediaSrc,
  rejectPendingMediaInMarkdown,
  uncontrolledImageSources,
  validateContributionImage
} from './contribution-media.ts'

const ID = '0123456789abcdef0123456789abcdef'

test('keeps the contributor image-count allowances intentional', () => {
  assert.equal(MAX_IMAGES_PER_CONTRIBUTION, 5)
  assert.equal(MAX_IMAGES_PER_USER_PER_DAY, 15)
})

function png(width = 800, height = 600) {
  const bytes = new Uint8Array(24)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  bytes.set([0x49, 0x48, 0x44, 0x52], 12)
  const view = new DataView(bytes.buffer)
  view.setUint32(16, width)
  view.setUint32(20, height)
  return bytes
}

test('validates the bytes, declared MIME type, dimensions and filename together', () => {
  const valid = validateContributionImage(png(), 'screenshot.png', 'image/png')
  assert.deepEqual(valid.errors, [])
  assert.deepEqual(valid.size, { w: 800, h: 600 })

  assert.deepEqual(
    validateContributionImage(png(), 'screenshot.jpg', 'image/jpeg').errors.sort(),
    ['extension_mismatch', 'type_mismatch']
  )
  assert.ok(validateContributionImage(png(4000, 100), 'wide.png', 'image/png').errors.includes('image_too_wide'))
})

test('pending markers are stable and uncontrolled image URLs are rejected', () => {
  const pending = pendingMediaSrc(ID)
  const source = `![1.00](${pending} "Portal screen")\n\n![old](/media/old.png)\n\n![bad](https://tracker.test/x.png)`
  assert.deepEqual(extractPendingMediaIds(source), [ID])
  assert.equal(countPendingMediaUses(source, ID), 1)
  assert.deepEqual(uncontrolledImageSources(source), ['https://tracker.test/x.png'])
})

test('approval turns exactly one private marker into a reviewed Figure', () => {
  const source = `Before\n\n![1.00](${pendingMediaSrc(ID)} "RJSC search")\n\nAfter`
  const next = approvePendingMediaInMarkdown(
    source,
    ID,
    '/media/contributions/registration/test.png',
    {
      id: ID,
      alt: 'RJSC search form with the company-name field',
      source: 'RJSC portal',
      checked: '2026-07-27'
    },
    'en'
  )
  assert.match(next, /<Figure src="\/media\/contributions\/registration\/test\.png"/)
  assert.match(next, /alt="RJSC search form with the company-name field"/)
  assert.match(next, /caption="RJSC search"/)
  assert.match(next, /locale="en"/)
  assert.equal(extractPendingMediaIds(next).length, 0)
})

test('rejection removes exactly the proposed image without touching surrounding copy', () => {
  const source = `Before\n\n![1.00](${pendingMediaSrc(ID)} "No")\n\nAfter`
  assert.equal(rejectPendingMediaInMarkdown(source, ID), 'Before\n\nAfter')
})

test('metadata and generated logical paths are bounded', () => {
  assert.deepEqual(normalizeContributionMediaInput({ id: ID, alt: '  useful alt  ' }), {
    id: ID,
    alt: 'useful alt'
  })
  assert.equal(normalizeContributionMediaInput({ id: ID, alt: '' }), null)
  assert.equal(
    contributionMediaLogicalPath('/en/registration/private-limited', ID, '.png'),
    '/media/contributions/registration/private-limited/0123456789ab.png'
  )
})
