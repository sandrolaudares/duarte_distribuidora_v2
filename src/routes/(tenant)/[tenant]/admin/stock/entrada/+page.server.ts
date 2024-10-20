import type { PageServerLoad } from './$types'
import { stock,  } from '$db/controller'
export const load = (async () => {
  const skus = await stock.getSKU()

  
  return {
    skus,
    
  }
}) satisfies PageServerLoad
