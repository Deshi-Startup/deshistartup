import fs from 'node:fs'
import path from 'node:path'
import { root, validLogicalPath } from './media-lib.mjs'

// Both lint and retirement must see images used only by public identity records.
// Fail closed on missing/malformed input rather than declaring those bytes unused.
export function ecosystemMediaReferences() {
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data/ecosystem/public.json'), 'utf8'))
  if (!Array.isArray(snapshot.organizations)) throw new Error('Ecosystem organizations must be an array')
  const logos = snapshot.organizations.flatMap(company => {
    if (company.logoPath === null) return []
    if (!validLogicalPath(company.logoPath || '')) throw new Error(`Invalid ecosystem logo: ${company.id}`)
    return [{ id: company.id, src: company.logoPath, kind: 'logo' }]
  })
  if (snapshot.identities !== undefined && !Array.isArray(snapshot.identities.people)) throw new Error('Identity people must be an array')
  const avatars = (snapshot.identities?.people || []).flatMap(person => {
    if (person.avatarPath === null) return []
    if (!validLogicalPath(person.avatarPath || '')) throw new Error(`Invalid identity avatar: ${person.id}`)
    return [{ id: person.id, src: person.avatarPath, kind: 'avatar' }]
  })
  return [...logos, ...avatars]
}
