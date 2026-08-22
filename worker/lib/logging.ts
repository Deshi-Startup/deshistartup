/** Emit one searchable JSON record without serializing request bodies or secrets. */
export function logError(
  scope: string,
  message: string,
  error?: unknown,
  context: Record<string, unknown> = {}
): void {
  let errorValue: unknown
  if (error instanceof Error) {
    errorValue = { name: error.name, message: error.message }
  } else if (error !== undefined) {
    errorValue = String(error)
  }

  console.error(JSON.stringify({
    level: 'error',
    scope,
    message,
    ...context,
    ...(errorValue === undefined ? {} : { error: errorValue })
  }))
}
