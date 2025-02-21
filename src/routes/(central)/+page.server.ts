import type { PageServerLoad } from './$types'
import { centralDb as db } from '$db/central'

export const load = (async () => {
  const tenats = await db.query.tenants.findMany({
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
    tenats,
  }
}) satisfies PageServerLoad
