import type { PageServerLoad } from './$types'

import { customer } from '$db/controller'

export const load = (async ({locals:{tenantDb}}) => {
  const delivery_orders = await customer(tenantDb!).getDeliveryOrders()
  return {
    delivery_orders,
  }
}) satisfies PageServerLoad
