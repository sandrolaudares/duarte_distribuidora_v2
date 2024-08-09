/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '../t'

import { z } from 'zod'
import { stock as stockController } from '$db/schema/stock/controller'
import { insertSKUschema, insertSupplierSchema } from '$db/schema/stock'
import {
  stockTransactionTable,
  insertTransferenceSKUSchema,
  insertStockTransferenceSchema,
} from '$db/schema'

import { paramsSchema } from '$lib/components/table'
import { tableHelper } from '$lib/server/db/utils'

import { middleware } from '../middleware'
import { TRPCError } from '@trpc/server'

export const stock = router({
  getSKUs: publicProcedure.query(() => {
    return stockController.getSKU()
  }),
  insertSKU: publicProcedure
    .input(insertSKUschema)
    .use(middleware.auth)
    .use(middleware.logged)

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

  paginatedTransactions: publicProcedure
    .input(
      z.object({
        distribuidora_id: z.number(),
        sku: z.number(),
        table_state: paramsSchema,
      }),
    )
    .query(async ({ input }) => {
      const { distribuidora_id, sku, table_state } = input
      return await tableHelper(
        stockController
          .getTransactionsFromProduto({
            distribuidora_id,
            sku,
          })
          .$dynamic(),
        stockTransactionTable,
        '',
        table_state,
      )
    }),

  getSupplier: publicProcedure.query(() => {
    return stockController.getSupplier()
  }),
  insertSupplier: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(insertSupplierSchema)
    .mutation(async ({ input }) => {
      return stockController.insertSupplier(input).returning()
    }),
  entradaEstoque: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
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

  createStockTranference: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        transference_data: insertStockTransferenceSchema,
        items: z.array(insertTransferenceSKUSchema),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { transference_data, items } = input
      const { user } = ctx.locals

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not found',
        })
      }
      return await stockController.createTransferenciaEstoque({
        transference_data: {
          created_by: user.username,
          ...transference_data,
        },
        items,
      })
    }),

  updateStockTranference: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        id: z.number(),
        data: insertStockTransferenceSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      return await stockController.updateTransference(id, data).returning()
    }),

  updateStockTranferenceItem: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        id: z.number(),
        data: insertTransferenceSKUSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      return await stockController.updateTransferenceSKU(id, data).returning()
    }),
})
