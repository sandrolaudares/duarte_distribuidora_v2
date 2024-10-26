import type { PageServerLoad } from './$types'

import { product } from '$db/controller'
import { error } from '@sveltejs/kit'

export const load = (async ({ params,locals:{tenantDb} }) => {
  const id = Number(params.id)

  const prod = await product(tenantDb!).getProductByID(id)
  console.log(prod)

  if (!prod) {
    error(404, 'Product not found')
  }

  return {
    prod,
  }
}) satisfies PageServerLoad
