import type { PageServerLoad } from './$types'

import { user } from '$db/controller'

export const load = (async ({locals:{tenantDb}}) => {
  // const last_orders = await customer(tenantDb!).getCurrentOrders()
  const motoboys = await user(tenantDb!).getMotoboys()
  return {
    // last_orders,
    motoboys
  }
}) satisfies PageServerLoad
