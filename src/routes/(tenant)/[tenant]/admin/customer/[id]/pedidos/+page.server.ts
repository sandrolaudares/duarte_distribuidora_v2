import { customer } from '$lib/server/db/controller'
import type { PageServerLoad } from './$types'
import { desc } from 'drizzle-orm'

import * as schema from '$lib/server/db/schema'

export const load = (async ({ params,locals:{tenantDb} }) => {
  const customerID = Number(params.id)

  const [orders] = await Promise.all([
    customer(tenantDb!).getCustomerOrders(customerID).orderBy(desc(schema.customerOrderTable.created_at)),
  ])

  return { orders }
}) satisfies PageServerLoad
