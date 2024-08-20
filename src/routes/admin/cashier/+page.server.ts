import type { PageServerLoad } from './$types'

import { distribuidora } from '$db/controller'

export const load = (async () => {
  const distribuidoras = await distribuidora.getCashier()
  return {
    distribuidoras,
  }
}) satisfies PageServerLoad
