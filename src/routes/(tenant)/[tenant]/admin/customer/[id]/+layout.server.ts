import { customer } from '$lib/server/db/controller'
import { error } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params, locals: { tenantDb } }) => {
  const customerID = Number(params.id)

  const [cliente] = await Promise.all([
    customer(tenantDb!).getCustomerById(customerID),
  ])

  if (!cliente) {
    error(404, 'Customer not found')
  }
  return { customer: cliente }
}) satisfies LayoutServerLoad
