import type { PageServerLoad } from './$types'
import { stock,  } from '$db/controller'
export const load = (async ({locals:{tenantDb}}) => {
  const skus = await stock(tenantDb!).getSKU()

  
  return {
    skus,
    
  }
}) satisfies PageServerLoad
