import type { PageServerLoad } from './$types'
import { product, distribuidora } from '$db/controller'
import { error } from '@sveltejs/kit'
export const load = (async ({ params }) => {
  try {
    const cachier_id = Number(params.id)

    const [products, [caixa]] = await Promise.all([
      product.queryCategorysWithProductItems(),

      distribuidora.getCashierById(cachier_id),
    ])
    return {
      products,

      caixa,
    }
  } catch (e) {
    return error(500, JSON.stringify(e))
  }
}) satisfies PageServerLoad
