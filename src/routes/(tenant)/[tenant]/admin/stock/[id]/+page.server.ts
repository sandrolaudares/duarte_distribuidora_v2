import type { PageServerLoad } from './$types'

import { stock } from '$db/controller'
import { error } from '@sveltejs/kit'

export const load = (async ({ params }) => {
  const skuID = params.id

  const estoque = await stock.getSKUByID(skuID)

  if(!estoque){
    return error(404, 'SKU não encontrado')
  }
  return { estoque }
}) satisfies PageServerLoad
