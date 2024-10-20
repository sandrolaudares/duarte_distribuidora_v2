// lib/trpc/context.ts
import type { RequestEvent } from '@sveltejs/kit'
import { TRPCError, type inferAsyncReturnType } from '@trpc/server'

export async function createContext(event: RequestEvent) {
  const { user, session, tenantAuthManager, tenantDb, tenantInfo } =
    event.locals

  if (!tenantDb || !tenantInfo || !tenantAuthManager) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Tenant not found',
    })
  }

  return { ...event, user, session, tenantAuthManager, tenantDb, tenantInfo }
}

export type Context = inferAsyncReturnType<typeof createContext>
