import type { PageServerLoad } from './$types'

import { distribuidora } from '$db/controller'

export const load = (async ({locals:{tenantDb}}) => {
  const distribuidoras = await distribuidora(tenantDb!).getCashier()
  return {
    distribuidoras,
  }
}) satisfies PageServerLoad
