/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import { user as userController } from '$db/controller'
import {
  bugReport,
  distribuidora as distribuidoraController,
  stock,
  user,
} from '$db/controller'
import {
  insertCashierSchema,
  logsTable,
  userTable,
  cashierTable,
  cashierTransactionsT,
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
import { eq } from 'drizzle-orm'
import { cashierTransactionEnum } from '$lib/utils/enums'

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
          phone: z.string().optional(),
          // image: z.number().optional(),
          funcionamento: z
            .object({
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
            })
            .optional(),
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
          status: z.enum(['Aberto', 'Fechado']),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, data } = input
      const { tenantDb, user } = ctx

      if (data.status !== 'Fechado') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Caixa já está aberto, recarregue a página',
        })
      }

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
      }

      return tenantDb.transaction(async trx => {
        await trx.insert(cashierTransactionsT).values({
          amount: data.amount,
          type: 'Abertura',
          metadata: {
            observacoes: 'Abertura com ' + formatCurrency(data.amount),
          },
          cashier_id: id,
          order_id: null,
          created_by: user.id,
        })

        if (user) {
          await trx
            .update(userTable)
            .set({ meta: { caixa_id: id } })
            .where(eq(userTable.id, user.id))
        }

        return await trx
          .update(cashierTable)
          .set({ status: 'Aberto', currency: data.amount, user_in: user.id })
          .where(eq(cashierTable.id, id))
          .returning()
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

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
      }

      return tenantDb.transaction(async trx => {
        await trx.insert(cashierTransactionsT).values({
          amount: info.currency,
          type: 'Fechamento',
          cashier_id: id,
          order_id: null,
          created_by: user.id,
        })

        await trx
          .update(userTable)
          .set({ meta: { caixa_id: undefined } })
          .where(eq(userTable.id, user.id))

        return await trx
          .update(cashierTable)
          .set({ status: 'Fechado', currency: 0, user_in: null })
          .where(eq(cashierTable.id, id))
      })
    }),

  inserirTransacao: publicProcedure
    .input(
      z.object({
        caixa_id: z.number(),
        amount: z.number(),
        type: z.enum(cashierTransactionEnum),
        motivo: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user, tenantDb } = ctx

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        })
      }

      return tenantDb.transaction(async trx => {
        await trx.insert(cashierTransactionsT).values({
          amount: input.amount,
          type: input.type,
          metadata: {
            observacoes: input.motivo,
          },
          cashier_id: input.caixa_id,
          order_id: null,
          created_by: user.id,
        })

        const [caixa] = await trx
          .select({ currency: cashierTable.currency })
          .from(cashierTable)
          .where(eq(cashierTable.id, input.caixa_id))
          .limit(1)

        let novoValor = 0

        if (input.type === 'Deposito') {
          novoValor = caixa.currency + input.amount
        } else {
          if (caixa.currency < input.amount) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Valor maior que o saldo do caixa',
            })
          } else {
            novoValor = caixa.currency - input.amount
          }
        }

        return await trx
          .update(cashierTable)
          .set({ currency: novoValor })
          .where(eq(cashierTable.id, input.caixa_id))
          .returning()
      })
    }),

  getCashierById: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx: { tenantDb } }) => {
      const id = input

      const [caixa] = await distribuidoraController(tenantDb).getCashierById(id)
      return caixa
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
