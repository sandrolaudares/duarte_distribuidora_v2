import type { PageServerLoad } from './$types'

import { customer } from '$db/controller'

export const load = (async () => {
  const pending_orders = await customer.getPendingOrders()
  return {
    pending_orders,
  }
}) satisfies PageServerLoad
