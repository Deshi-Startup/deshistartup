import contributableRoutes from '../generated/contributable.json'
import contentIndex from '../generated/content-index.json'
import { deriveContributableEntry } from './contributable-path'
import type { ContributableEntry } from './contributable-path'

const routes = new Set(contributableRoutes as string[])

type PageInfo = [
  route: string,
  title: string,
  stub: 0 | 1,
  description: string | null
]
type GroupInfo = [title: string, items: PageInfo[]]
type SectionInfo = [
  title: string,
  total: number,
  written: number,
  index: PageInfo | null,
  groups: GroupInfo[]
]
interface ContentIndexLocale {
  sections: Record<string, SectionInfo>
}

const pageMetadata = new Map<string, Pick<ResolvedContributableEntry, 'title' | 'stub'>>()
const typedContentIndex = contentIndex as unknown as Record<'bn' | 'en', ContentIndexLocale>
for (const locale of Object.values(typedContentIndex)) {
  for (const [, , , index, groups] of Object.values(locale.sections)) {
    const pages = [
      ...(index ? [index] : []),
      ...groups.flatMap(([, items]) => items)
    ]
    for (const [route, title, stub] of pages) {
      pageMetadata.set(route, { title, stub: Boolean(stub) })
    }
  }
}

export interface ResolvedContributableEntry extends ContributableEntry {
  title: string
  stub: boolean
}

export function resolveContributable(path: string): ResolvedContributableEntry | null {
  if (!routes.has(path)) return null
  const derived = deriveContributableEntry(path)
  const metadata = pageMetadata.get(path)
  if (!derived || !metadata) return null
  return { ...derived, ...metadata }
}
