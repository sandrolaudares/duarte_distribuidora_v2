import type { PageServerLoad } from './$types'
import { centralDb as db } from '$db/central'

export const load = (async () => {
  const tenants = await db.query.tenants.findMany({
    columns: {
      tenantId: true,
      name: true,
      subdomain: true,
      address: true,
      phone: true,
      lat: true,
      lng: true,
    },
  })
  return {
    tenants,
  }
}) satisfies PageServerLoad
