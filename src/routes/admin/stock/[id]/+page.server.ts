import type { PageServerLoad } from './$types'

import { stock } from '$db/controller'
import { error } from '@sveltejs/kit'

export const load = (async ({ params }) => {
  const skuID = Number(params.id)

  const estoque = await stock.getInfoSKU(skuID)

  if(!estoque){
    return error(404, 'SKU não encontrado')
  }
  return { estoque }
}) satisfies PageServerLoad
