import type { Context } from '$trpc/context'
import { initTRPC } from '@trpc/server'
// import transformer from 'trpc-transformer';
import superjson from 'superjson'

export const t = initTRPC.context<Context>().create(
  // { transformer }
  { transformer: superjson },
)

export const router = t.router
export const publicProcedure = t.procedure
