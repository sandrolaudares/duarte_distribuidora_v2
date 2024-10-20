import type { PageServerLoad } from './$types'

import { customer } from '$db/controller'

export const load = (async () => {
  const last_orders = await customer.getCurrentOrders()
  return {
    last_orders,
  }
}) satisfies PageServerLoad
