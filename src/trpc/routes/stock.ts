/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '../t'

import { z } from 'zod'
import { stock as stockController } from '$db/schema/stock/controller'
import { insertSKUschema, insertSupplierSchema } from '$db/schema/stock'

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

  getSupplier: publicProcedure.query(() => {
    return stockController.getSupplier()
  }),
  insertSupplier: publicProcedure
    .input(insertSupplierSchema)
    .mutation(async ({ input }) => {
      return stockController.insertSupplier(input).returning()
    }),
  entradaEstoque: publicProcedure
    .input(
      z.object({
        sku_items: z.array(
          z.object({
            sku_id: z.number(),
            quantity: z.number(),
          }),
        ),
        distribuidora_id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { sku_items, distribuidora_id } = input
      const { user } = ctx.locals
      for (const item of sku_items) {
        try {
          await stockController.processStockTransaction({
            distribuidora_id,
            sku_id: item.sku_id,
            quantity: item.quantity,
            meta_data: {
              type: 'entrada',
              nota_fiscal: '',
              user_id: user?.id,
            },
          })
        } catch (error) {
          console.log('Failed to process stock transaction:', error)
        }
      }
    }),
})
