/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import { distribuidora as distribuidoraController, stock } from '$db/controller'
import {
  insertCashierSchema,
  cashierTransactionEnum,
} from '$lib/server/db/schema'


import { middleware } from '$trpc/middleware'

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
      await distribuidoraController(tenantDb).insertCashierTransaction({
        cachier_id: id,
        meta_data: {
          user,
        },
        type: 'Entrada',
        amount: data.amount,
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

      await distribuidoraController(tenantDb).justInsertCashierTransaction({
        cachier_id: id,
        meta_data: {
          user,
        },
        type: 'Saida',
        amount: info.currency,
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
      await distribuidoraController(tenantDb).insertCashierTransaction({
        cachier_id: id,
        meta_data: {
          user,
        },
        type: data.type,
        amount: data.amount,
      })
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
  updateAllKm: publicProcedure
    .input(z.number())
    .mutation(({ input, ctx: { tenantDb } }) => {
      return distribuidoraController(tenantDb).updateKmForAllCaixas(input)
    }),

  getFee: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await distribuidoraController(tenantDb).getFee()
  }),
  getDistribuidoras: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await distribuidoraController(tenantDb).getDistribuidoras()
  }),

  getCaixas: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await distribuidoraController(tenantDb).getCashier()
  }),
})
