/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '../t'

import { z } from 'zod'
import { stock as stockController } from '$db/schema/stock/controller'
import { insertSKUschema } from '$db/schema/stock'

import { paramsSchema } from '$lib/components/table'
import { tableHelper } from '$lib/server/db/utils'

import { middleware } from '../middleware'

export const stock = router({
  getSKUs: publicProcedure.query(() => {
    return stockController.getSKU()
  }),
  insertSKU: publicProcedure
    .input(insertSKUschema)
    .use(middleware.auth)
    .mutation(async ({ input }) => {
      return stockController.insertSKU(input).returning()
    }),

  paginatedSKUs: publicProcedure
    .input(paramsSchema)
    .query(async ({ input }) => {
      return await tableHelper(
        stockController.getSKU().$dynamic(),
        stockController.tables.skuTable,
        'name',
        input,
      )
    }),
})
