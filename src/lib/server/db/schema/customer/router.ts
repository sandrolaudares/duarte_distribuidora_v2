/* eslint-disable @typescript-eslint/no-unused-vars */
import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'
import {
  bugReport,
  customer as customerController,
  distribuidora,
  product,
} from '$db/controller'
import {
  insertCustomerSchema,
  insertAddressSchema,
  customerTable,
  paymentStatusEnum,
  insertOrderPaymentSchema,
  orderPaymentTable,
  customerOrderTable,
  type InsertOrderPayment,
  orderItemTable,
  orderTypeEnum,
  type InsertLogs,
  logsTable,
  cashierTransactionsT,
} from '$lib/server/db/schema'

import { distribuidora as distribuidoraController } from '$db/controller'

import { middleware } from '$trpc/middleware'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { geocodeAddress, getDistanceFromLatLonInKm } from '$lib/utils/distance'
import { env } from '$env/dynamic/private'
import { getDistribuidoraLatLong } from '../../central/constroller'
import { DateFormatter } from '@internationalized/date'
import { formatCurrency } from '$lib/utils'

const df = new DateFormatter('pt-BR', {
  dateStyle: 'medium',
})

export const customer = router({
  insertCustomer: publicProcedure
    .meta({
      routeName: 'Cadastrar Cliente',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(insertCustomerSchema)
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await customerController(tenantDb)
        .insertCustomer(input)
        .returning()
    }),
  updateCustomer: publicProcedure
    .meta({
      routeName: 'Atualizar Cliente',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.object({
        id: z.number(),
        customer: z.object({
          name: z.string().optional(),
          cellphone: z.string().optional(),
          phone: z.string().optional(),
          max_credit: z.number().optional(),
          used_credit: z.number().optional(),
          email: z.string().email().optional(),
          is_retail: z.boolean().optional(),
          cpf_cnpj: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      const { id, customer } = input
      return await customerController(tenantDb).updateCustomer(id, customer)
    }),

  deleteCustomer: publicProcedure
    .meta({
      routeName: 'Deletar Cliente',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(z.number())
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await customerController(tenantDb).deleteCustomerById(input)
    }),

  insertAddress: publicProcedure
    .meta({
      routeName: 'Adicionar Endereço',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(insertAddressSchema)
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      try {
        return await customerController(tenantDb).insertAddress(input)
      } catch (error) {
        console.error('Failed to insert address:', error)
      }
    }),
  updateAddress: publicProcedure
    .meta({
      routeName: 'Atualizar Endereço',
      permission: 'editar_clientes',
    })
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.object({
        id: z.number(),
        address: z.object({
          cep: z.string().optional(),
          street: z.string().optional(),
          number: z.string().optional(),
          complement: z.string().optional(),
          neighborhood: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          distance: z.number().optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      if (input.id) {
        const { id, address } = input
        try {
          return await customerController(tenantDb).updateAddress(id, address)
        } catch (error) {
          console.error('Failed to insert address:', error)
        }
      }
    }),

  getCustomers: publicProcedure
    .input(
      z.object({
        page: z.number(),
        pageSize: z.number(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx: { tenantDb }, input }) => {
      const offset = (input.page - 1) * input.pageSize
      const limit = input.pageSize

      return await customerController(tenantDb).getCustomersWithAddress(
        limit,
        offset,
        input.search,
      )
    }),
  order: router({
    verifyCredits: publicProcedure
      .meta({
        routeName: 'Verificar creditos',
        permission: 'receber_fiado',
      })
      .use(middleware.auth)
      .use(middleware.checkPermission)
      .use(middleware.logged)
      .input(
        z.object({
          customer_id: z.number(),
          total: z.number(),
        }),
      )
      .mutation(async ({ input, ctx: { tenantDb, locals } }) => {
        const { customer_id,total } = input

        return await customerController(tenantDb).validateFiadoTransaction(customer_id,total)
      }),

      insertFiado: publicProcedure
      .meta({
        routeName: 'Adicionar Pedido Fiado',
        permission: 'receber_fiado',
      })
      .use(middleware.auth)
      .use(middleware.checkPermission)
      .use(middleware.logged)
      .input(
        z.object({
          order_items: z.array(
            z.object({
              product_id: z.number(),
              quantity: z.number(),
              price: z.number(),
            }),
          ),
          order_info: z.object({
            customer_id: z.number(),
            address_id: z.number().optional(),
            total: z.number(),
            observation: z.string(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string().optional(),
            cachier_id: z.number().optional(),
            taxa_entrega: z.number().optional(),
          }),
        }),
      )
      .mutation(async ({ input, ctx: { tenantDb, locals } }) => {
        const userId = locals.user?.id
        const { order_items, order_info } = input
        
        return tenantDb.transaction(async trx => {
          const [order] = await trx
            .insert(customerOrderTable)
            .values({
              status: order_info.motoboy_id ? 'CONFIRMED' : 'DELIVERED',
              is_fiado: true,
              type: order_info.type,
              total: order_info.total + (order_info.taxa_entrega ?? 0),
              amount_paid: 0,
              motoboy_id: order_info.motoboy_id,
              customer_id: order_info.customer_id,
              address_id: order_info.address_id,
              cachier_id: order_info.cachier_id,
              observation: order_info.observation,
              taxa_entrega: order_info.taxa_entrega,
              created_by: userId,
            })
            .returning()

          const items = order_items.map(item => ({
            ...item,
            order_id: order.id,
          }))

          const order_items_db = await trx
            .insert(orderItemTable)
            .values(items)
            .returning()

          if (!order.motoboy_id) {
            customerController(trx).updateStockOnOrder(order.id)
          }

          return {
            order,
            order_items: order_items_db,
          }
        })
      }),
    insetPaidOrder: publicProcedure
      .use(middleware.logged)
      .use(middleware.auth)
      .input(
        z.object({
          order_items: z.array(
            z.object({
              product_id: z.number(),
              quantity: z.number(),
              price: z.number(),
            }),
          ),
          order_info: z.object({
            customer_id: z.number().optional(),
            address_id: z.number().optional(),
            total: z.number(),
            observation: z.string(),
            cashier_id: z.number(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string().optional(),
            taxa_entrega: z.number().optional(),

            payment_info: insertOrderPaymentSchema
              .omit({ order_id: true })
              .array(),
          }),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.locals.user?.id
        const { tenantDb } = ctx
        if (!userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Usuário não autorizado',
          })
        }

        const { order_items, order_info } = input

        const total_paid: number = order_info.payment_info.reduce(
          (acc, payment) => acc + payment.amount_paid,
          0,
        )

        if (total_paid < order_info.total) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Valor pago é menor que o total da compra, adicione mais pagamentos',
          })
        }

        return tenantDb.transaction(async trx => {
          const [order] = await trx
            .insert(customerOrderTable)
            .values({
              amount_paid: total_paid,
              is_fiado: false,
              type: order_info.type,
              motoboy_id: order_info.motoboy_id,
              status: order_info.motoboy_id ? 'CONFIRMED' : 'DELIVERED',
              total: order_info.total + (order_info.taxa_entrega ?? 0),
              customer_id: order_info.customer_id,
              address_id: order_info.address_id,
              cachier_id: order_info.cashier_id,
              observation: order_info.observation,
              created_by: userId,
              taxa_entrega: order_info.taxa_entrega,
            })
            .returning()

          const items = order_items.map(item => ({
            ...item,
            order_id: order.id,
          }))
          const order_items_db = await trx
            .insert(orderItemTable)
            .values(items)
            .returning()

          for (const payment of order_info.payment_info) {
            await trx.insert(cashierTransactionsT).values({
              amount: payment.amount_paid,
              type: 'Pagamento',
              metodo_pagamento: payment.payment_method,
              metadata: {
                troco: payment.troco ? payment.troco : undefined,
              },
              cashier_id: order_info.cashier_id,
              order_id: order.id,
              created_by: userId,
            })
          }

          if (!order.motoboy_id) {
            customerController(trx).updateStockOnOrder(order.id)
          }
          //TODO: se necessario inserir outro log só pro troco

          const payments = order_info.payment_info.map(payment => ({
            ...payment,
            cachier_id: order_info.cashier_id,
            created_by: userId,
            order_id: order.id,
          }))

          const payments_db = await trx
            .insert(orderPaymentTable)
            .values(payments)
            .returning()

          const [caixa] = await distribuidoraController(trx).getCashierById(
            order_info.cashier_id,
          )

          if (caixa) {
            await distribuidoraController(trx).updateCashier(caixa.id, {
              currency: caixa.currency + total_paid,
            })
          }

          return {
            order,
            order_items: order_items_db,
            payments: payments_db,
          }
        })
      }),
    insertOrderWaiting: publicProcedure
      .use(middleware.auth)
      .use(middleware.logged)
      .input(
        z.object({
          order_items: z.array(
            z.object({
              product_id: z.number(),
              quantity: z.number(),
              price: z.number(),
            }),
          ),
          order_info: z.object({
            customer_id: z.number(),
            address_id: z.number(),
            total: z.number(),
            observation: z.string(),
            type: z.enum(orderTypeEnum),
            motoboy_id: z.string(),
            cachier_id: z.number().optional(),
            taxa_entrega: z.number().optional(),
          }),
        }),
      )
      .mutation(async ({ input, ctx: { tenantDb, locals } }) => {
        const userId = locals.user?.id
        const { order_items, order_info } = input
        const customer = await customerController(tenantDb).getCustomerById(
          order_info.customer_id,
        )
        if (!customer) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cliente não encontrado',
          })
        }

        if (!order_info.motoboy_id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Sem motoboy selecionado',
          })
        }

        return tenantDb.transaction(async trx => {
          const [order] = await trx
            .insert(customerOrderTable)
            .values({
              status: 'CONFIRMED',
              is_fiado: false,
              type: order_info.type,
              total: order_info.total + (order_info.taxa_entrega ?? 0),
              amount_paid: 0,
              motoboy_id: order_info.motoboy_id,
              customer_id: order_info.customer_id,
              address_id: order_info.address_id,
              cachier_id: order_info.cachier_id,
              observation: order_info.observation,
              taxa_entrega: order_info.taxa_entrega,
              created_by: userId,
            })
            .returning()

          const items = order_items.map(item => ({
            ...item,
            order_id: order.id,
          }))

          await bugReport(trx).insertLogs({
            text: `Pedido delivery, EM ESPERA`,
            created_by: userId,
            metadata: {
              order_id: order.id,
              customer_id: order_info.customer_id,
              cashier_id: order_info.cachier_id,
            },
            cashier_id: order_info.cachier_id,
            order_id: order.id,
            type: 'CAIXA',
            pathname: '/TODO:ROUTE',
            routeName: 'Fiado',
          })

          const order_items_db = await trx
            .insert(orderItemTable)
            .values(items)
            .returning()

          return {
            order,
            order_items: order_items_db,
            // fiado_transaction,
          }
        })
      }),
    payments: router({
      getPendingFiadoTransactions: publicProcedure
        .use(middleware.logged)
        .use(middleware.auth)
        .query(async ({ ctx: { tenantDb } }) => {
          return await customerController(
            tenantDb,
          ).getPendingFiadoTransactions()
        }),
      getPayments: publicProcedure
        .use(middleware.logged)
        .use(middleware.auth)
        .input(z.number())
        .query(async ({ input, ctx: { tenantDb } }) => {
          return await customerController(tenantDb).getOrderPayments(input)
        }),
    }),
  }),

  updateOrderExpireDate: publicProcedure
    .meta({
      routeName: 'Atualizar Status do Pedido',
      permission: 'atualizar_pedidos',
    })
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        order_id: z.number(),
        expire_at: z.date(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { order_id, expire_at } = input
      const { tenantDb } = ctx
      const user = ctx.locals.user

      await tenantDb.transaction(async tx => {
        await tx.insert(logsTable).values({
          text: `${user?.username} atualizou a data de vencimento do pedido ${order_id} para ${df.format(expire_at)}`,
          created_by: user?.id,
          metadata: {
            order_id,
            expire_at,
          },
          order_id,
          type: 'SYSTEM',
          pathname: '',
          routeName: 'Atualizar Pedido',
        })

        return await tx
          .update(customerOrderTable)
          .set({ expire_at: expire_at })
          .where(eq(customerOrderTable.id, order_id))
      })
    }),

  updateOrderStatus: publicProcedure
    .meta({
      routeName: 'Atualizar Status do Pedido',
      permission: 'atualizar_pedidos',
    })
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        order_id: z.number(),
        status: z.enum([
          'PENDING',
          'CONFIRMED',
          'PREPARING',
          'ON THE WAY',
          'DELIVERED',
          'CANCELED',
          'ENDED',
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { order_id, status } = input
      const { tenantDb } = ctx
      const user = ctx.locals.user

      return tenantDb.transaction(async tx => {
        await bugReport(tx).insertLogs({
          text: `${user?.username} atualizou o status do pedido ${order_id} para ${status}`,
          created_by: user?.id,
          metadata: {
            order_id,
            status,
          },
          order_id,
          type: 'SYSTEM',
          pathname: '',
          routeName: 'Atualizar Pedido',
        })
        return await customerController(tx).updateOrderStatus(order_id, status)
      })
    }),

  updateOrder: publicProcedure
    .meta({
      routeName: 'Atualizar Pedido',
      permission: 'atualizar_pedidos',
    })
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        order_id: z.number(),
        data: z.object({
          total: z.number(),
          observation: z.string().optional(),
          motoboy_id: z.string().optional(),
          taxa_entrega: z.number().optional(),
        }),
        items: z.array(
          z.object({
            item_id: z.number(),
            quantity: z.number(),
            price: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { order_id, data, items } = input
      const { tenantDb } = ctx
      return await customerController(tenantDb).updateOrder(
        order_id,
        data,
        items,
      )
    }),

  updateMotoboyOrder: publicProcedure
    .meta({
      routeName: 'Atualizar Pedido',
      permission: 'atualizar_pedidos',
    })
    .use(middleware.logged)
    .use(middleware.auth)
    .input(
      z.object({
        order_id: z.number(),
        data: z.object({
          motoboy_id: z.string(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { order_id, data } = input
      const { tenantDb } = ctx
      const user = ctx.locals.user

      tenantDb.transaction(async tx => {
        await tx.insert(logsTable).values({
          text: `${user?.username} atualizou o motoboy do pedido ${order_id}`,
          created_by: user?.id,
          metadata: {
            order_id,
          },
          order_id,
          type: 'SYSTEM',
          pathname: '',
          routeName: 'Atualizar Pedido',
        })

        return await tx
          .update(customerOrderTable)
          .set(data)
          .where(eq(customerOrderTable.id, order_id))
      })
    }),

  cancelOrder: publicProcedure
    .meta({
      routeName: 'Deletar Pedido',
      permission: 'atualizar_pedidos',
    })
    .use(middleware.logged)
    .use(middleware.auth)
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      const { tenantDb } = ctx
      return await customerController(tenantDb).cancelOrder(input)
    }),

  // updateOrderPaymentStatus: publicProcedure
  //   .use(middleware.logged)
  //   .use(middleware.auth)
  //   .input(
  //     z.object({
  //       order_id: z.number(),
  //       payment_status: z.enum([
  //         'PENDING',
  //         'CONFIRMED',
  //         'CANCELED',
  //         'REFUNDED',
  //       ]),
  //     }),
  //   )
  //   .mutation(async ({ input }) => {
  //     const { order_id, payment_status } = input
  //     return await customerController.updateOrderPaymentStatus(
  //       order_id,
  //       payment_status,
  //     )
  //   }),

  insertOrderPayment: publicProcedure
    .meta({
      routeName: 'Adicionar Pagamento',
      permission: 'receber_fiado',
    })
    .use(middleware.logged)
    .input(
      insertOrderPaymentSchema.omit({
        created_by: true,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userID = ctx.locals.user?.id
      const { tenantDb } = ctx

      return await tenantDb.transaction(async trx => {
        await trx.insert(cashierTransactionsT).values({
          amount: input.amount_paid,
          type: 'Pagamento',
          metodo_pagamento: input.payment_method,
          metadata: {
            troco: input.troco ? input.troco : undefined,
          },
          cashier_id: input.cachier_id,
          order_id: input.order_id,
          created_by: userID,
        })

        if (input.cachier_id) {
          const [caixa] = await distribuidoraController(trx).getCashierById(
            input.cachier_id,
          )

          if (caixa) {
            await distribuidoraController(trx).updateCashier(caixa.id, {
              currency: caixa.currency + input.amount_paid,
            })
          }
        }

        await customerController(trx).insertOrderPayment({
          ...input,
          created_by: userID,
        })
      })
    }),

  getOrderPayments: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx: { tenantDb } }) => {
      return await customerController(tenantDb).getOrderPayments(input)
    }),

  getAllNotPaidOrders: publicProcedure.query(async ({ ctx: { tenantDb } }) => {
    return await customerController(tenantDb).getNotPaidOrders()
  }),

  getCustomerUsedCredits: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx: { tenantDb } }) => {
      const id = input
      return await customerController(tenantDb).getCustomerUsedCredit(id)
    }),

  getNotPaidOrdersById: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx: { tenantDb } }) => {
      const id = input
      return await customerController(tenantDb).getNotPaidOrdersById(id)
    }),

  updateOrderPayment: publicProcedure
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.object({
        id: z.number(),
        data: insertOrderPaymentSchema.partial(),
      }),
    )
    .mutation(({ input, ctx: { tenantDb } }) => {
      const { id, data } = input
      return customerController(tenantDb).updateOrderPayment(id, data)
    }),

  getCurrentOrders: publicProcedure
    .use(middleware.logged)
    .query(({ ctx: { tenantDb } }) => {
      return customerController(tenantDb).getCurrentOrders()
    }),

  calculateDistance: publicProcedure
    .input(
      z.object({
        cep: z.string(),
        state: z.string(),
        city: z.string(),
        bairro: z.string(),
        street: z.string(),
        number: z.string(),
        country: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const location = await geocodeAddress(
        `${input.street}, ${input.number}, ${input.bairro}, ${input.city}, ${input.state}, ${input.cep}, ${input.country}`,
      )

      if (!location) {
        throw new Error(
          'Endereço não encontrado para calcular taxa de entrega!',
        )
      }
      console.log(location)

      const customerPosition = {
        lat: location.lat,
        lon: location.lon,
      }

      if (location.lat === 0 && location.lon === 0) {
        throw new Error('Erro ao geocodificar endereço!')
      }
      const tenantId = ctx.tenantInfo.tenantId

      const distribuidora = await getDistribuidoraLatLong(tenantId)

      const distribuidoraLat = distribuidora[0].lat
      const distribuidoraLong = distribuidora[0].lng

      const distance = getDistanceFromLatLonInKm(
        { lat: distribuidoraLat!, lon: distribuidoraLong! },
        customerPosition,
      )
      console.log(distance)
      return distance
    }),

  getOrderById: publicProcedure
    .use(middleware.logged)
    .input(z.number())
    .query(({ input, ctx: { tenantDb } }) => {
      return customerController(tenantDb).getOrderByID(input)
    }),
})
