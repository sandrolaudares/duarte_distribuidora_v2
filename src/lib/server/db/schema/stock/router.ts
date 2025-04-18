/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import { stock as stockController } from '$db/schema/stock/controller'
import {
  insertSKUschema,
  insertSupplierSchema,
  supplierTable,
} from '$db/schema/stock'
import { cashierTable, cashierTransactionsT, logsTable, stockTransactionTable } from '$db/schema'

import { middleware } from '$trpc/middleware'
import { TRPCError } from '@trpc/server'

import { and, desc, eq, gte, lte } from 'drizzle-orm'

export const stock = router({
  getSKUs: publicProcedure.query(({ ctx: { tenantDb } }) => {
    return stockController(tenantDb).getSKU()
  }),
  insertSKU: publicProcedure
    .input(insertSKUschema)
    .use(middleware.auth)
    .use(middleware.logged)

    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return stockController(tenantDb).insertSKU(input).returning()
    }),

  // paginatedSKUs: publicProcedure
  //   .input(paramsSchema)
  //   .query(async ({ input }) => {
  //     return await tableHelper(
  //       stockController.getSKU().$dynamic(),
  //       stockController.tables.skuTable,
  //       'name',
  //       input,
  //     )
  //   }),

  // paginatedTransactions: publicProcedure
  //   .input(
  //     z.object({
  //       sku: z.string(),
  //       table_state: paramsSchema,
  //     }),
  //   )
  //   .query(async ({ input }) => {
  //     const { sku, table_state } = input
  //     return await tableHelper(
  //       stockController
  //         .getTransactionsFromProduto({
  //           sku,
  //         })
  //         .$dynamic(),
  //       stockTransactionTable,
  //       '',
  //       table_state,
  //     )
  //   }),

  getSupplier: publicProcedure.query(({ ctx: { tenantDb } }) => {
    return stockController(tenantDb).getSupplier()
  }),

  // paginatedSupplier: publicProcedure
  //   .input(paramsSchema)
  //   .query(async ({ input }) => {
  //     return await tableHelper(
  //       stockController.getSupplier().$dynamic(),
  //       supplierTable,
  //       'name',
  //       input,
  //     )
  //   }),

  insertSupplier: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(insertSupplierSchema)
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return stockController(tenantDb).insertSupplier(input).returning()
    }),

  updateSupplier: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        id: z.number(),
        supplier: z.object({
          name: z.string().optional(),
          cnpj_cpf: z.string().optional(),
          razao_social: z.string().optional(),
          phone_1: z.string().optional(),
          cep: z.string().optional(),
          ie_rg: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      const { id, supplier } = input
      return await stockController(tenantDb).updateSupplier(id, supplier)
    }),

  entradaEstoque: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        sku_items: z.array(
          z.object({
            sku_id: z.string(),
            quantity: z.number(),
            cost_price: z.number().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { sku_items } = input
      const { user, tenantDb } = ctx
      const arr = []
      for (const item of sku_items) {
        try {
          const resp = await stockController(tenantDb).insertStockTransaction({
            sku: item.sku_id,
            quantity: item.quantity,
            cost_price: item.cost_price,
            type: 'Entrada',
            meta_data: {
              type: 'entrada',
              nota_fiscal: '',
              user_id: user?.id,
            },
          })
          arr.push(resp)
          console.log(resp)
        } catch (error) {
          console.log('Failed to process stock transaction:', error)
        }
      }

      return arr
    }),

  getLastCostPrice: publicProcedure
    .input(
      z.object({
        sku: z.string(),
      }),
    )
    .query(async ({ input, ctx: { tenantDb } }) => {
      return await stockController(tenantDb).queryLastCostPrice(input.sku)
    }),

  getRecentTransaoEstoque: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx: { tenantDb } }) => {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      const startTimestamp = startOfDay.getTime()
      const endTimestamp = endOfDay.getTime()

      const transactions = await tenantDb
        .select()
        .from(cashierTransactionsT)
        .where(
          and(
            eq(cashierTransactionsT.cashier_id, input),
            gte(cashierTransactionsT.created_at, new Date(startTimestamp)),
            lte(cashierTransactionsT.created_at, new Date(endTimestamp)),
          ),
        ).orderBy(desc(cashierTransactionsT.created_at))

      return transactions
    }),

  getAllTransaoCaixa: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await tenantDb
      .select()
      .from(logsTable)
      .where(eq(logsTable.type, 'CAIXA'))
    // return stockController(tenantDb).getAllTransactionsCaixa()
  }),

  deleteItemStock: publicProcedure
    .input(z.string())
    .mutation(({ input, ctx: { tenantDb } }) => {
      return stockController(tenantDb).deleteItemStock(input)
    }),

  updateSku: publicProcedure
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        sku: z.string(),
        data: z.object({
          name: z.string(),
        }),
      }),
    )
    .mutation(({ input, ctx: { tenantDb } }) => {
      const { sku, data } = input
      return stockController(tenantDb).updateSKU(sku, data)
    }),
})
