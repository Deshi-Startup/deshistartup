/** JSON for bearer-authenticated endpoints must never enter a shared cache. */
export function authenticatedJson(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      Vary: 'Authorization'
    }
  })
}
