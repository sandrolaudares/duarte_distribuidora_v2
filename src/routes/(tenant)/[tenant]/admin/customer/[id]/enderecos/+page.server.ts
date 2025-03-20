import { customer } from '$lib/server/db/controller'
import type { PageServerLoad } from './$types'

export const load = (async ({ params, locals: { tenantDb } }) => {
  const customerID = Number(params.id)

  const [enderecos] = await Promise.all([
    customer(tenantDb!).getCustomerAddress(customerID),
  ])

  return { enderecos }
}) satisfies PageServerLoad
