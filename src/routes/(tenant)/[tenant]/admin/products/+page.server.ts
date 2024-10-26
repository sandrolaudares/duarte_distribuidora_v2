import type { PageServerLoad } from './$types'

import { product } from '$db/controller'
export const load = (async ({locals:{tenantDb}}) => {
  const products = await product(tenantDb!).queryCategorysWithProducts()
  console.log(products)

  return { products }
}) satisfies PageServerLoad
