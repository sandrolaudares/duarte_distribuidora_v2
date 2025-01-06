import { customer, product } from '$lib/server/db/controller'
import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ params, locals: { tenantDb } }) => {
  const orderID = Number(params.id)

  const order_details = await customer(tenantDb!).getOrderByID(orderID)
  const products = await product(tenantDb!).queryCategorysWithProductItems()

  if (!order_details) {
    return error(404, 'Order not found')
  }

  return {
    order_details,
    products,
  }
}) satisfies PageServerLoad
