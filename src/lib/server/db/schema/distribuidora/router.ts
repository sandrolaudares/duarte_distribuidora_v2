/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import {
  bugReport,
  distribuidora as distribuidoraController,
  stock,
  user,
} from '$db/controller'
import {
  insertCashierSchema,
  cashierTransactionEnum,
} from '$lib/server/db/schema'

import { middleware } from '$trpc/middleware'
import {
  completeTransference,
  refuseTransference,
  solicitarTransference,
  updateDistribuidora,
} from '../../central/constroller'
import {
  stockTransference,
  stockTransferenceStatus,
  type InsertStockTransference,
} from '../../central/schema'
import { createInsertSchema } from 'drizzle-zod'
import { TRPCError } from '@trpc/server'
import { verify } from '../user/password'
import { formatCurrency } from '$lib/utils'

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

  updateDistribuidora: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          taxa_por_km: z.number().optional(),
          name: z.string().optional(),
          address: z.string().optional(),
          lat: z.number().optional(),
          lng: z.number().optional(),
          subdomain: z.string().optional(),
          funcionamento : z.object({
            segunda: z.object({
              start: z.number(),
              end: z.number(),
            }),
            terca: z.object({
              start: z.number(),
              end: z.number(),
            }),
            quarta: z.object({
              start: z.number(),
              end: z.number(),
            }),
            quinta: z.object({
              start: z.number(),
              end: z.number(),
            }),
            sexta: z.object({
              start: z.number(),
              end: z.number(),
            }),
            sabado: z.object({
              start: z.number(),
              end: z.number(),
            }),
            domingo: z.object({
              start: z.number(),
              end: z.number(),
            }),
            feriado: z.object({
              start: z.number(),
              end: z.number(),
            }),
          }).optional()
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input
      return updateDistribuidora(id, data)
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
        text: `Abertura de caixa com ${formatCurrency(data.amount)}`,
        created_by: user?.id,
        metadata: {
          cashier_id: id,
        },
        cashier_id: id,
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
        text: `Fechamento de caixa com ${formatCurrency(info.currency)}`,
        created_by: user?.id,
        metadata: {
          cashier_id: id,
        },
        cashier_id: id,
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
    .input(
      createInsertSchema(stockTransference, {
        status: z.enum(stockTransferenceStatus),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = input
      console.log(data)

      await solicitarTransference({
        ...data,
        meta_data: {},
      })
    }),

  refuseTransference: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const id = input
      await refuseTransference(id)
    }),

  completeTransference: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const id = input
      const resp = await completeTransference(id)

      if (!resp.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: resp.message,
        })
      }

      return resp.message
    }),

  getAdmins: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await distribuidoraController(tenantDb).getAdmins()
  }),

  realizarImpressao: publicProcedure
    .input(
      z.object({
        order_id: z.number(),
        tenant_id: z.number(),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      const { order_id, tenant_id } = input
      console.log(input)
      return await distribuidoraController(tenantDb).imprimirPedido(
        order_id,
        tenant_id,
      )
    }),

  validateAdminPassword: publicProcedure
    .input(
      z.object({
        admin_id: z.string(),
        password: z.string(),
        reason: z.string(),
      }),
    )
    .use(middleware.logged)
    .query(async ({ input, ctx: { tenantDb } }) => {
      const [adminUser] = await user(tenantDb).getUserById(input.admin_id)

      if (!input.reason) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Motivo é obrigatório',
        })
      }

      if (!adminUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        })
      }

      if (adminUser.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Usuário não é um admin',
        })
      }

      const isValid = await verify(
        adminUser.password_hash ?? '',
        input.password,
      )
      if (isValid) {
        await bugReport(tenantDb).insertLogs({
          text: `${adminUser.username} validou ${input.reason}`,
          created_by: adminUser.id,
          metadata: {
            reason: input.reason,
          },
          type: 'LOG',
          pathname: '',
          routeName: 'Validação de admin',
        })
        return {
          success: true,
          message: `${adminUser.username} validou ${input.reason}`,
        }
      } else {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: `Senha inválida para ${adminUser.username}`,
        })
      }
    }),
})
