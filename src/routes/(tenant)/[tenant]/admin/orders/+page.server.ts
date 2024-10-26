import type { PageServerLoad } from './$types'

import { customer } from '$db/controller'

export const load = (async ({locals:{tenantDb}}) => {
  const last_orders = await customer(tenantDb!).getCurrentOrders()
  return {
    last_orders,
  }
}) satisfies PageServerLoad
