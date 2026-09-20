import fs from 'node:fs'
import path from 'node:path'
import { root, validLogicalPath } from './media-lib.mjs'

// Both lint and retirement must see logos used only by static company profiles.
// Fail closed on missing/malformed input rather than declaring those bytes unused.
export function ecosystemLogos() {
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data/ecosystem/public.json'), 'utf8'))
  if (!Array.isArray(snapshot.organizations)) throw new Error('Ecosystem organizations must be an array')
  return snapshot.organizations.flatMap(company => {
    if (company.logoPath === null) return []
    if (!validLogicalPath(company.logoPath || '')) throw new Error(`Invalid ecosystem logo: ${company.id}`)
    return [{ id: company.id, src: company.logoPath }]
  })
}
