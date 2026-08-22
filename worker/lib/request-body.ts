/**
 * Bounded readers for request and upstream response bodies.
 *
 * `Request.json()` and `Response.json()` buffer before callers can enforce a
 * field limit. These helpers enforce the byte ceiling while the stream is
 * consumed, so a missing or dishonest Content-Length header cannot bypass it.
 */

export const SMALL_JSON_BODY_MAX_BYTES = 8 * 1024
export const CONTRIBUTION_JSON_BODY_MAX_BYTES = 2 * 1024 * 1024
export const GITHUB_JSON_BODY_MAX_BYTES = 4 * 1024 * 1024
export const UPSTREAM_ERROR_BODY_MAX_BYTES = 16 * 1024

type BodySource = Pick<Request, 'body' | 'headers'>

export type BodyReadError = 'body_too_large' | 'invalid_body'

export type BodyReadResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: BodyReadError }

function declaredLength(source: BodySource): number | null {
  const value = source.headers.get('Content-Length')
  if (value === null) return null
  const bytes = Number(value)
  return Number.isFinite(bytes) && bytes >= 0 ? bytes : Number.NaN
}

export async function readBoundedBytes(
  source: BodySource,
  maxBytes: number
): Promise<BodyReadResult<Uint8Array>> {
  const declaredBytes = declaredLength(source)
  if (Number.isNaN(declaredBytes)) return { ok: false, error: 'invalid_body' }
  if (declaredBytes !== null && declaredBytes > maxBytes) {
    return { ok: false, error: 'body_too_large' }
  }
  if (!source.body) return { ok: true, value: new Uint8Array() }

  let reader: ReadableStreamDefaultReader<Uint8Array>
  try {
    reader = source.body.getReader()
  } catch {
    return { ok: false, error: 'invalid_body' }
  }

  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        try {
          await reader.cancel()
        } catch {
          // The limit has already decided the response; cancellation is cleanup.
        }
        return { ok: false, error: 'body_too_large' }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, error: 'invalid_body' }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return { ok: true, value: bytes }
}

export async function readBoundedText(
  source: BodySource,
  maxBytes: number
): Promise<BodyReadResult<string>> {
  const body = await readBoundedBytes(source, maxBytes)
  if (!body.ok) return body
  try {
    return {
      ok: true,
      value: new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(body.value)
    }
  } catch {
    return { ok: false, error: 'invalid_body' }
  }
}

export async function readBoundedJson(
  source: BodySource,
  maxBytes: number
): Promise<BodyReadResult<unknown>> {
  const body = await readBoundedText(source, maxBytes)
  if (!body.ok) return body
  try {
    const value: unknown = JSON.parse(body.value)
    return { ok: true, value }
  } catch {
    return { ok: false, error: 'invalid_body' }
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
