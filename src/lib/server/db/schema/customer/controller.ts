/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  customerOrderTable,
  customerTable,
  addressTable,
  orderItemTable,
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
} from './index'
import { db } from '$db'
import { eq, ne, or, sql } from 'drizzle-orm'

import { stock, bugReport } from '$db/controller'

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
  insertOrder: async (input: {
    order_info: Omit<InsertCustomerOrder, 'status'>
    order_items: Omit<InsertOrderItem, 'order_id'>[]
  }) => {
    const { order_info, order_items } = input

    const resp = db.transaction(async tx => {
      if (order_info.customer_id && order_info.payment_method === 'fiado') {
        const [customer] = await tx
          .select()
          .from(customerTable)
          .where(eq(customerTable.id, order_info.customer_id))
        if (customer.max_credit < order_info.total + customer.used_credit) {
          await tx.rollback()
          return {
            error: `Customer ${customer.name} has no credit available`,
          }
        }
        await tx
          .update(customerTable)
          .set({
            // used_credit: sql`${customerTable.used_credit} + ${order_info.total}`,
            used_credit: customer.used_credit + order_info.total,
          })
          .where(eq(customerTable.id, order_info.customer_id))
      }

      const [order] = await tx
        .insert(customerOrderTable)
        .values({
          payment_method: order_info.payment_method,
          status: 'PENDING',
          total: order_info.total,
          customer_id: order_info.customer_id,
          address_id: order_info.address_id,
          distribuidora_id: order_info.distribuidora_id,
        })
        .returning()

      const items = order_items.map(item => ({
        ...item,
        order_id: order.id,
      }))
      await tx.insert(orderItemTable).values(items)
      return {
        order,
        items,
      }
    })
    return resp
  },

  getOrderByID: async (order_id: SelectCustomerOrder['id']) => {
    return db.query.customerOrderTable.findFirst({
      where: eq(customerOrderTable.id, order_id),
      with: {
        items: {
          with: {
            product: true,
          },
        },
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
      if (order?.distribuidora_id) {
        for (const item of order.items) {
          console.log('sku', item.product.sku)
          if (item.product.sku) {
            try {
              console.log('Processing stock transaction:', {
                distribuidora_id: order.distribuidora_id,
                sku_id: item.product.sku,
                quantity: -item.quantity * item.product.quantity,
                meta_data: {
                  order_id,
                  type: 'saida',
                },
              })
              await stock.processStockTransaction({
                distribuidora_id: order.distribuidora_id,
                sku_id: item.product.sku,
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
}

export type CurrentOrders = Awaited<
  ReturnType<typeof customer.getCurrentOrders>
>
