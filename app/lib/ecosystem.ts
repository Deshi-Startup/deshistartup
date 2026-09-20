import published from '../../data/ecosystem/public.json'
import type { EcosystemSnapshot } from './ecosystem-types'

// Only this reviewed public artifact reaches the static site. D1 stays in the Worker.
export const ecosystem = published as EcosystemSnapshot
export { companyPath, organizationRoles } from './ecosystem-model'
