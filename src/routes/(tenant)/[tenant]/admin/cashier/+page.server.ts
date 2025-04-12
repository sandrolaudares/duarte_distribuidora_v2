import type { PageServerLoad } from './$types'

import { cashierTable, userTable } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

export const load = (async ({locals:{tenantDb}}) => {

  const distribuidoras = await tenantDb!.select({
    id: cashierTable.id,
    created_at: cashierTable.created_at,
    name: cashierTable.name,
    currency: cashierTable.currency,
    status: cashierTable.status,
    user_in: userTable.username,
  }).from(cashierTable).leftJoin(userTable, eq(cashierTable.user_in, userTable.id))

  return {
    distribuidoras,
  }
}) satisfies PageServerLoad
