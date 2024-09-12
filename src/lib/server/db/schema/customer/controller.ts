/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  customerOrderTable,
  customerTable,
  addressTable,
  orderItemTable,
  orderPaymentTable,
} from './index'

import type {
  SelectCustomerOrder,
  InsertCustomerOrder,
  InsertAddress,
  InsertOrderItem,
  InsertCustomer,
  SelectAddress,
  SelectOrderItem,
  SelectCustomer,
  InsertOrderPayment,
} from './index'
import { db } from '$db'
import { eq, ne, or, sql } from 'drizzle-orm'

import { stock, bugReport } from '$db/controller'
import { cashierTransactionTable } from '../distribuidora'
import { TRPCError } from '@trpc/server'

export const customer = {
  tables: {
    customerTable,
    addressTable,
    customerOrderTable,
    orderItemTable,
  },
  insertCustomer: (input: InsertCustomer) => {
    return db.insert(customerTable).values(input)
  },
  updateCustomer: (
    id: SelectCustomer['id'],
    input: Partial<InsertCustomer>,
  ) => {
    return db.update(customerTable).set(input).where(eq(customerTable.id, id))
  },
  deleteCustomerById: (id: SelectCustomer['id']) => {
    return db.delete(customerTable).where(eq(customerTable.id, id))
  },
  getCustomerById: async (id: SelectCustomer['id']) => {
    return db.query.customerTable.findFirst({
      where: eq(customerTable.id, id),
      with: {
        adresses: true,
      },
    })
  },

  getCustomerByEmail: async (email: string) => {
    return db.query.customerTable.findFirst({
      where: eq(customerTable.email, email),
      with: {
        adresses: true,
      },
    })
  },
  getCustomersWithAddress: async () => {
    return db.query.customerTable.findMany({
      with: {
        adresses: true,
      },
    })
  },
  getCustomers: () => {
    return db.select().from(customerTable)
  },
  insertAddress: async (input: InsertAddress) => {
    return db.insert(addressTable).values(input)
  },
  getCustomerAddress: async (customerId: SelectCustomer['id']) => {
    return db
      .select()
      .from(addressTable)
      .where(eq(addressTable.customer_id, customerId))
  },
  // insertOrder: async (input: {
  //   order_info: Omit<
  //     InsertCustomerOrder,
  //     'status' | 'payment_method' | 'payment_status'
  //   >
  //   order_items: Omit<InsertOrderItem, 'order_id'>[]
  //   payment_info?: Omit<InsertOrderPayment, 'order_id'>[]
  //   is_order_delivery: boolean
  // }) => {
  //   const { order_info, order_items, payment_info } = input
  //   for (const payment of payment_info || []) {
  //     switch (payment.payment_method) {
  //       case 'dinheiro': {
  //         break
  //       }
  //       case 'fiado': {
  //         if (!order_info.customer_id) {
  //           throw new TRPCError({
  //             code: 'BAD_REQUEST',
  //             message: 'Customer ID is required for "fiado" payment',
  //           })
  //         }

  //         break
  //       }
  //       // case 'credit_card': {
  //       //   break
  //       // }
  //       // case 'debit_card': {
  //       //   break
  //       // }
  //       // case 'pix': {
  //       //   break
  //       // }

  //       default: {
         
  //         break
  //       }
  //     }
    

  //   const resp = await db.transaction(async tx => {
  //     const [order] = await tx
  //       .insert(customerOrderTable)
  //       .values({
  //         status: 'PENDING',
  //         total: order_info.total,
  //         customer_id: order_info.customer_id,
  //         address_id: order_info.address_id,
  //       })
  //       .returning()

  //     const items = order_items.map(item => ({
  //       ...item,
  //       order_id: order.id,
  //     }))

  //     const payments: InsertOrderPayment[] = []

  //     for (const payment of payment_info || []) {
  //       switch (payment.payment_method) {
  //         case 'dinheiro': {
  //           break
  //         }
  //         case 'fiado': {
  //           if (!order_info.customer_id) {
  //             tx.rollback()
  //           }

  //           break
  //         }
  //         // case 'credit_card': {
  //         //   break
  //         // }
  //         // case 'debit_card': {
  //         //   break
  //         // }
  //         // case 'pix': {
  //         //   break
  //         // }

  //         default: {
  //           if (order_info.cachier_id) {
  //             await tx.insert(cashierTransactionTable).values({
  //               cashier_id: order_info.cachier_id,
  //               amount: payment.amount_paid,
  //               observation: `Venda ${order.id}`,
  //               type: 'PAGAMENTO',
  //               meta_data: {
  //                 order_id: order.id,
  //                 payment_method: payment.payment_method,
  //               },
  //             })
  //           }
  //           await tx.insert(orderPaymentTable).values({
  //             ...payment,
  //             order_id: order.id,
  //           })
  //           break
  //         }
        
  //       }
  //       // payments.push({
  //       //   ...payment,
  //       //   order_id: order.id,
  //       // })
  //     }

  //     await tx.insert(orderItemTable).values(items)
  //     return {
  //       order,
  //       items,
  //     }
  //   })
  //   return resp
  // },

  getOrderByID: async (order_id: SelectCustomerOrder['id']) => {
    return db.query.customerOrderTable.findFirst({
      where: eq(customerOrderTable.id, order_id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
        address: true,
        customer: true,
        payments: true,
        transactions: true,
      },
    })
  },

  updateOrderStatus: async (
    order_id: SelectCustomerOrder['id'],
    new_status: SelectCustomerOrder['status'],
  ) => {
    console.log('Updating order status:', order_id, new_status)
    if (new_status === 'DELIVERED') {
      const order = await customer.getOrderByID(order_id)
      console.log('Order:', order)

      if (!order) {
        return {
          error: 'Order not found',
        }
      }

      for (const item of order.items) {
        console.log('sku', item.product.sku)
        if (item.product.sku) {
          try {
            console.log('Processing stock transaction:', {
              sku_id: item.product.sku,
              quantity: -item.quantity * item.product.quantity,
              meta_data: {
                order_id,
                type: 'saida',
              },
            })
            await stock.insertStockTransaction({
              sku: item.product.sku,
              type: 'Saida',
              quantity: -item.quantity * item.product.quantity,
              meta_data: {
                order_id,
                type: 'saida',
              },
            })
          } catch (error) {
            console.error('Failed to process stock transaction:', error)
          }
        }
      }
    }

    return await db
      .update(customerOrderTable)
      .set({ status: new_status })
      .where(eq(customerOrderTable.id, order_id))
  },

  getCustomerOrders: async (customerId: SelectCustomer['id']) => {
    return db.query.customerOrderTable.findMany({
      where: eq(customerOrderTable.customer_id, customerId),
      with: {
        address: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },

  getCurrentOrders: async () => {
    return db.query.customerOrderTable.findMany({
      where: or(
        ne(customerOrderTable.status, 'DELIVERED'),
        ne(customerOrderTable.status, 'CANCELED'),
        ne(customerOrderTable.status, 'ENDED'),
      ),
      with: {
        address: true,
        customer: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },
  getEndedOrders: async () => {
    return db.query.customerOrderTable.findMany({
      where: eq(customerOrderTable.status, 'ENDED'),
      with: {
        address: true,
        customer: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },
  getPendingOrders: async () => {
    return db.query.customerOrderTable.findMany({
      where: eq(customerOrderTable.status, 'DELIVERED'),
      with: {
        address: true,
        customer: true,
        items: {
          with: {
            product: true,
          },
        },
      },
    })
  },
  insertOrderPayment: (data: InsertOrderPayment) => {
    return db.insert(orderPaymentTable).values(data)
  },
  getOrderPayments:(id:number)=>{
    return db.select().from(orderPaymentTable)
  }
}

export type CurrentOrders = Awaited<
  ReturnType<typeof customer.getCurrentOrders>
>
