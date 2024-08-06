import type { PageServerLoad } from './$types'
import { product, customer, distribuidora } from '$db/controller'
export const load = (async ({ params }) => {
  const cachier_id = Number(params.id)

  const [products, customers, [caixa]] = await Promise.all([
    product.queryCategorysWithProducts(),
    customer.getCustomersWithAddress(),
    distribuidora.getCashierById(cachier_id),
  ])
  return {
    products,
    customers,
    caixa,
  }
}) satisfies PageServerLoad
