import type { PageServerLoad } from './$types'

import { customer } from '$db/controller'

export const load = (async ({locals:{tenantDb}}) => {
  const payments_with_orders = await customer(tenantDb!).getPendingFiadoTransactions()
  return {
    pending_orders: payments_with_orders,
  }
}) satisfies PageServerLoad
