import type { PageServerLoad } from './$types'
import { product } from '$db/controller'
import { error } from '@sveltejs/kit'
export const load = (async ({ locals:{tenantDb} }) => {
  try {
    const products = await product(tenantDb!).queryProductItemsWhere()
    
    return {
      products,
    }
  } catch (e) {
    console.error(e)
    return error(500, JSON.stringify(e))
  }
}) satisfies PageServerLoad
