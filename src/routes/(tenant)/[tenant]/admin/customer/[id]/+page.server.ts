import { customer } from '$lib/server/db/controller'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ params }) => {
  const customerID = Number(params.id)

  const [cliente, orders] = await Promise.all([
    customer.getCustomerById(customerID),
    customer.getCustomerOrders(customerID),
  ])

  if (!cliente) {
    error(404, 'Customer not found')
  }
  return { customer: cliente, orders }
}) satisfies PageServerLoad
