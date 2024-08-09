/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '../t'

import { z } from 'zod'
import { distribuidora as distribuidoraController, stock } from '$db/controller'
import {
  insertDistribuidoraSchema,
  insertCashierSchema,
} from '$lib/server/db/schema'

import { paramsSchema } from '$lib/components/table'
import { tableHelper } from '$lib/server/db/utils'

import { middleware } from '../middleware'

export const distribuidora = router({
  insertDistribuidora: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(insertDistribuidoraSchema)
    .mutation(async ({ input }) => {
      return distribuidoraController.insertDistribuidora(input).returning()
    }),

  insertCashier: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)

    .input(insertCashierSchema)
    .mutation(async ({ input }) => {
      return distribuidoraController.insertCashier(input).returning()
    }),

  getDistribuidoras: publicProcedure.query(() => {
    return distribuidoraController.getDistribuidoras()
  }),
})
