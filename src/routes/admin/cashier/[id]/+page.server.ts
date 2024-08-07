import type { PageServerLoad } from './$types'
import { product, distribuidora } from '$db/controller'
export const load = (async ({ params }) => {
  const cachier_id = Number(params.id)

  const [products, [caixa]] = await Promise.all([
    product.queryCategorysWithProductItems(),

    distribuidora.getCashierById(cachier_id),
  ])
  return {
    products,

    caixa,
  }
}) satisfies PageServerLoad
