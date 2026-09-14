import { deriveContributableEntry } from './contributable-path.ts'
import type { ContributableEntry } from './contributable-path.ts'

export type ContributableMetadata = Record<string, [title: string, stub: 0 | 1]>

export interface ResolvedContributableEntry extends ContributableEntry {
  title: string
  stub: boolean
}

// The generated keys are the allowlist. Navigation descriptions and grouping
// metadata never enter the Worker bundle.
export function createContributableResolver(metadata: ContributableMetadata) {
  return (path: string): ResolvedContributableEntry | null => {
    if (!Object.hasOwn(metadata, path)) return null
    const derived = deriveContributableEntry(path)
    if (!derived) return null
    const [title, stub] = metadata[path]
    return { ...derived, title, stub: Boolean(stub) }
  }
}
