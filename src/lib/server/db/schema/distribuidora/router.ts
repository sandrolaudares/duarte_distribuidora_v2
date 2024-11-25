/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import { bugReport, distribuidora as distribuidoraController, stock } from '$db/controller'
import {
  insertCashierSchema,
  cashierTransactionEnum,
} from '$lib/server/db/schema'


import { middleware } from '$trpc/middleware'
import { solicitarTransference, updateDistribuidora } from '../../central/constroller'
import { stockTransference, stockTransferenceStatus, type InsertStockTransference } from '../../central/schema'
import { createInsertSchema } from 'drizzle-zod'

export const distribuidora = router({
  insertCashier: publicProcedure
    .meta({
      routeName: 'Criar Caixa',
      permission: 'editar_caixas',
    })
    .use(middleware.checkPermission)
    .use(middleware.logged)

    .input(insertCashierSchema)
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return distribuidoraController(tenantDb).insertCashier(input).returning()
    }),

  updateCashier: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: insertCashierSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      const { id, data } = input
      return distribuidoraController(tenantDb).updateCashier(id, data)
    }),

    updateDistribuidora:publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          taxa_por_km:z.number()
        }),
      })
    ).mutation(async({input})=>{
      const {id,data}= input
      return updateDistribuidora(id,data)
    }),

  abrirCaixa: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          amount: z.number(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input
      const { tenantDb, user } = ctx

      await bugReport(tenantDb).insertLogs({
        text: `Abertura de caixa com R$${(data.amount/100).toFixed(2)}`,
        created_by: user?.id,
        metadata:{
          cashier_id:id
        },
        type: 'CAIXA',
        pathname: '',
        routeName: 'Abrir caixa',
        currency: data.amount,
      })

      return await distribuidoraController(tenantDb).updateCashier(id, {
        status: 'Aberto',
      })
    }),
  fecharCaixa: publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input
      const { tenantDb, user } = ctx

      const [info] = await distribuidoraController(tenantDb).getCashierById(id)

      await bugReport(tenantDb).insertLogs({
        text: `Fechamento de caixa com R$${(info.currency/100).toFixed(2)}`,
        created_by: user?.id,
        metadata:{
          cashier_id:id
        },
        type: 'CAIXA',
        pathname: '',
        routeName: 'Fechar caixa',
        currency: info.currency,
      })

      return await distribuidoraController(tenantDb).updateCashier(id, {
        status: 'Fechado',
        currency: 0,
      })
    }),

  inserirTransacao: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          amount: z.number(),
          type: z.enum(cashierTransactionEnum),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input
      const { user, tenantDb } = ctx
      // await distribuidoraController(tenantDb).insertCashierTransaction({
      //   cachier_id: id,
      //   meta_data: {
      //     user,
      //   },
      //   type: data.type,
      //   amount: data.amount,
      // })
    }),

  getCashierById: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx: { tenantDb } }) => {
      const id = input
      return await distribuidoraController(tenantDb).getCashierById(id)
    }),

  deleteCashierById: publicProcedure
    .input(z.number())
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await distribuidoraController(tenantDb).deleteCashierById(input)
    }),

  getDistribuidoras: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await distribuidoraController(tenantDb).getDistribuidoras()
  }),

  getCaixas: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await distribuidoraController(tenantDb).getCashier()
  }),

  solicitarTransference: publicProcedure
  .input(createInsertSchema(stockTransference,{
    status: z.enum(stockTransferenceStatus)
  }))
  .mutation(async ({ input, ctx }) => {
    const data = input
    console.log(data)
    await solicitarTransference(data)
  }),
})