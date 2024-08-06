import type { PageServerLoad } from './$types'

import { distribuidora } from '$db/controller'

export const load = (async () => {
  const distribuidoras = await distribuidora.queryCashierByDistribuidora()
  return {
    distribuidoras,
  }
}) satisfies PageServerLoad
