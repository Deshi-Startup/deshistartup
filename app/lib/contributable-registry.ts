import metadata from '../generated/contributable.json'
import { createContributableResolver } from './contributable-resolver'
import type { ContributableMetadata } from './contributable-resolver'

export type { ResolvedContributableEntry } from './contributable-resolver'

export const resolveContributable = createContributableResolver(
  metadata as unknown as ContributableMetadata
)
