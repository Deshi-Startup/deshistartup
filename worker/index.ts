import { GET as getContent } from './api/content'
import { POST as sendContactMessage } from './api/contact'
import { POST as createContribution } from './api/contribute'
import {
  DELETE as deleteContributionMedia,
  POST as uploadContributionMedia
} from './api/contribution-media'
import { GET as getContributionMedia } from './api/contribution-media-item'
import {
  GET as getContributionReview,
  POST as updateContributionReview
} from './api/contribution-review'

const OPAQUE_ID = /^[a-f0-9]{32}$/

function json(error: string, status: number, headers?: HeadersInit): Response {
  return Response.json(
    { error },
    {
      status,
      headers: {
        'Cache-Control': 'private, no-store',
        ...headers
      }
    }
  )
}

function methodNotAllowed(...allowed: string[]): Response {
  return json('method_not_allowed', 405, { Allow: allowed.join(', ') })
}

async function apiResponse(
  request: Request,
  env: CloudflareEnv,
  pathname: string
): Promise<Response> {
  if (pathname === '/api/content') {
    return request.method === 'GET'
      ? getContent(request, env)
      : methodNotAllowed('GET')
  }

  if (pathname === '/api/contact') {
    return request.method === 'POST'
      ? sendContactMessage(request, env)
      : methodNotAllowed('POST')
  }

  if (pathname === '/api/contribute') {
    return request.method === 'POST'
      ? createContribution(request, env)
      : methodNotAllowed('POST')
  }

  if (pathname === '/api/contribution-media') {
    if (request.method === 'POST') return uploadContributionMedia(request, env)
    if (request.method === 'DELETE') return deleteContributionMedia(request, env)
    return methodNotAllowed('POST', 'DELETE')
  }

  const mediaMatch = pathname.match(/^\/api\/contribution-media\/([^/]+)$/)
  if (mediaMatch) {
    if (!OPAQUE_ID.test(mediaMatch[1])) return json('media_expired', 404)
    return request.method === 'GET'
      ? getContributionMedia(request, env, mediaMatch[1])
      : methodNotAllowed('GET')
  }

  const reviewMatch = pathname.match(/^\/api\/contribution-review\/([^/]+)$/)
  if (reviewMatch) {
    if (!OPAQUE_ID.test(reviewMatch[1])) return json('review_expired', 404)
    if (request.method === 'GET') {
      return getContributionReview(request, env, reviewMatch[1])
    }
    if (request.method === 'POST') {
      return updateContributionReview(request, env, reviewMatch[1])
    }
    return methodNotAllowed('GET', 'POST')
  }

  return json('not_found', 404)
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url)

    try {
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        return await apiResponse(request, env, url.pathname.replace(/\/+$/, ''))
      }

      const legacyReview = url.pathname.match(/^\/contribute\/review\/([^/]+)\/?$/)
      if (legacyReview && OPAQUE_ID.test(legacyReview[1])) {
        const destination = new URL('/contribute/review', url)
        destination.searchParams.set('id', legacyReview[1])
        return Response.redirect(destination.toString(), 308)
      }

      return env.ASSETS.fetch(request)
    } catch (error) {
      console.error('[worker] Unhandled request failure', {
        method: request.method,
        pathname: url.pathname,
        error
      })
      return json('internal_error', 500)
    }
  }
} satisfies ExportedHandler<CloudflareEnv>
