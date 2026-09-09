/** A malformed pasted fragment must not take down the reader interface. */
export function decodeFragment(hash: string): string {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash
  try {
    return decodeURIComponent(fragment)
  } catch {
    return fragment
  }
}
