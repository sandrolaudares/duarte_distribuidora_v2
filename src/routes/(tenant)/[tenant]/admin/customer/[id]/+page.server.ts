import { customer } from '$lib/server/db/controller'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { desc } from 'drizzle-orm'

import * as schema from '$lib/server/db/schema'

export const load = (async ({ params,locals:{tenantDb} }) => {
  const customerID = Number(params.id)

  const [cliente, orders] = await Promise.all([
    customer(tenantDb!).getCustomerById(customerID),
    customer(tenantDb!).getCustomerOrders(customerID).orderBy(desc(schema.customerOrderTable.created_at)),
  ])

  if (!cliente) {
    error(404, 'Customer not found')
  }
  return { customer: cliente, orders }
}) satisfies PageServerLoad
