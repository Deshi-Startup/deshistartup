import assert from 'node:assert/strict'
import test from 'node:test'
import {
  readBoundedBytes,
  readBoundedJson,
  readBoundedText
} from './request-body.ts'

function streamedBody(chunks, headers = {}) {
  return {
    headers: new Headers(headers),
    body: new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      }
    })
  }
}

test('rejects a declared oversized body without consuming its stream', async () => {
  let opened = false
  const source = {
    headers: new Headers({ 'Content-Length': '9' }),
    body: {
      getReader() {
        opened = true
        throw new Error('reader should not be opened')
      }
    }
  }

  assert.deepEqual(await readBoundedBytes(source, 8), {
    ok: false,
    error: 'body_too_large'
  })
  assert.equal(opened, false)
})

test('enforces the byte ceiling when Content-Length is missing', async () => {
  const source = streamedBody([
    new Uint8Array([1, 2]),
    new Uint8Array([3, 4, 5])
  ])
  assert.deepEqual(await readBoundedBytes(source, 4), {
    ok: false,
    error: 'body_too_large'
  })
})

test('counts UTF-8 bytes rather than JavaScript characters', async () => {
  const source = streamedBody([new TextEncoder().encode('é')])
  assert.deepEqual(await readBoundedText(source, 1), {
    ok: false,
    error: 'body_too_large'
  })
})

test('rejects invalid UTF-8 and invalid JSON', async () => {
  const invalidUtf8 = streamedBody([new Uint8Array([0xff])])
  assert.deepEqual(await readBoundedText(invalidUtf8, 8), {
    ok: false,
    error: 'invalid_body'
  })

  const invalidJson = streamedBody([new TextEncoder().encode('{')])
  assert.deepEqual(await readBoundedJson(invalidJson, 8), {
    ok: false,
    error: 'invalid_body'
  })
})

test('returns valid JSON as unknown for the caller to validate', async () => {
  const source = streamedBody([new TextEncoder().encode('{"id":"abc"}')])
  assert.deepEqual(await readBoundedJson(source, 32), {
    ok: true,
    value: { id: 'abc' }
  })
})
