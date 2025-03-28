import type { PageServerLoad } from './$types'

import { product } from '$db/controller'

export const load = (async ({locals: {tenantDb}}) => {
  const products = await product(tenantDb!).queryCategorysWithProducts()

  //TODO: selecionar apenasos produtos que tem items e esses items visiveis
  return { products }
}) satisfies PageServerLoad
