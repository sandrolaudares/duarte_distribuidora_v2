import type { LayoutServerLoad } from './$types'
import { centralDb as db } from '$db/central'
import { eq } from 'drizzle-orm'
import { tenants } from '$lib/server/db/central/schema'

export const load = (async ({ locals, url }) => {
  const { session, user } = locals

  const tenantId = locals.tenantInfo?.tenantId

  if (!tenantId) return { session, user, transition_key: url.pathname }

  const tenant = await db.query.tenants.findMany({
    where: eq(tenants.tenantId, tenantId),
  })

  return { session, user, transition_key: url.pathname,tenant }
}) satisfies LayoutServerLoad
