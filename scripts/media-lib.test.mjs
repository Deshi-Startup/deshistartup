import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_FILE_BYTES,
  MAX_IMAGE_HEIGHT,
  MAX_IMAGE_WIDTH,
  objectKeyMatchesLogicalPath,
  validLogicalPath,
  validateImageBuffer
} from './lib/media-lib.mjs'

function png(width = 800, height = 600, bytes = 24) {
  const buffer = Buffer.alloc(bytes)
  buffer.writeUInt32BE(0x89504e47, 0)
  buffer.writeUInt32BE(width, 16)
  buffer.writeUInt32BE(height, 20)
  return buffer
}

test('accepts a bounded raster image with a safe logical path', () => {
  const result = validateImageBuffer(png(), 'registration/rjsc-search.png')
  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.size, { w: 800, h: 600 })
})

test('rejects unsupported formats and unsafe paths', () => {
  assert.match(
    validateImageBuffer(Buffer.from('<svg/>'), 'diagram.svg').errors.join(' '),
    /not allowed/
  )
  assert.match(validateImageBuffer(png(), 'folder/a file.png').errors.join(' '), /path must use/)
})

test('rejects extension spoofing before upload', () => {
  assert.match(
    validateImageBuffer(png(), 'registration/screenshot.jpg').errors.join(' '),
    /does not match/
  )
})

test('rejects files over the byte, dimension, and pixel ceilings', () => {
  assert.match(
    validateImageBuffer(png(800, 600, MAX_FILE_BYTES + 1), 'large.png').errors.join(' '),
    /per-file limit/
  )
  assert.match(
    validateImageBuffer(png(MAX_IMAGE_WIDTH + 1, 600), 'wide.png').errors.join(' '),
    /width exceeds/
  )
  assert.match(
    validateImageBuffer(png(800, MAX_IMAGE_HEIGHT + 1), 'tall.png').errors.join(' '),
    /height exceeds/
  )
  assert.match(
    validateImageBuffer(png(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT), 'pixels.png').errors.join(' '),
    /pixel limit/
  )
})

test('only accepts content-addressed keys for their exact logical path', () => {
  assert.equal(validLogicalPath('/media/registration/rjsc-search.png'), true)
  assert.equal(validLogicalPath('/media/../secret.png'), false)
  assert.equal(
    objectKeyMatchesLogicalPath(
      '/media/registration/rjsc-search.png',
      'registration/rjsc-search.4a5afeaff848.png'
    ),
    true
  )
  assert.equal(
    objectKeyMatchesLogicalPath('/media/registration/rjsc-search.png', 'other.4a5afeaff848.png'),
    false
  )
})
