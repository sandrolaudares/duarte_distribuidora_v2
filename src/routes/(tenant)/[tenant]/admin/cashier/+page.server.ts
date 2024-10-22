import type { PageServerLoad } from './$types'

import { distribuidora } from '$db/controller'
import { deliveryFeeTable } from '$lib/server/db/schema'

export const load = (async ({locals:{tenantDb}}) => {
  const distribuidoras = await distribuidora(tenantDb!).getCashier()
  const taxa = await tenantDb!.select().from(deliveryFeeTable)
  return {
    distribuidoras,
    taxa
  }
}) satisfies PageServerLoad
