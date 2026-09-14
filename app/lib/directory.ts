type DirectoryCopy = {
  name: string
  notes?: string
  [field: string]: string | string[] | null | undefined
}

export interface DirectoryEntry {
  id: string
  website: string | { en: string; bn: string }
  sourceUrls: string[]
  lastVerified: string
  en: DirectoryCopy
  bn: DirectoryCopy
}

// Resolve on the server so the browser receives only the requested locale.
export function localizeDirectory(entries: DirectoryEntry[], locale: 'en' | 'bn') {
  return entries.map(({ id, website, sourceUrls, lastVerified, ...copy }) => ({
    ...copy[locale],
    id,
    website: typeof website === 'string' ? website : website[locale],
    sourceUrls,
    lastVerified
  }))
}
