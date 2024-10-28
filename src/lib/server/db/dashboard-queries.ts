import type { TenantDbType } from './tenant'

import * as s from './schema'
import { desc, eq, sql } from 'drizzle-orm'

export const dashboard = (db: TenantDbType) => ({

  weekly: {
    
  },


  getTopOrderedNProducts: async (n = 10) => {
    const resutl = await db
      .select({
        product_name: s.productItemTable.name,

        total_quantity_ordered: sql<number>`cast(sum(${s.orderItemTable.quantity}) as int)`,
      })
      .from(s.orderItemTable)
      .innerJoin(
        s.productItemTable,
        eq(s.orderItemTable.product_id, s.productItemTable.id),
      )
      .groupBy(s.orderItemTable.product_id)
      .orderBy(desc(sql`sum(${s.orderItemTable.quantity})`))
      .limit(n)

    return resutl
  },

  getTopRRevenueProducts: async (n = 10) => {
    const result = await db
      .select({
        product_name: s.productItemTable.name,
        total_quantity_ordered: sql<number>`cast( sum(${s.orderItemTable.quantity}) as int)`,
        total_revenue: sql<number>`cast(sum(${s.orderItemTable.quantity} * ${s.orderItemTable.price}) as int)`,
      })
      .from(s.orderItemTable)
      .innerJoin(
        s.productItemTable,
        eq(s.orderItemTable.product_id, s.productItemTable.id),
      )
      .groupBy(s.orderItemTable.product_id)
      .orderBy(
        desc(
          sql`sum(${s.orderItemTable.quantity} * ${s.orderItemTable.price})`,
        ),
      )
      .limit(n)
    return result
  },

  customerTotalSpend: async () => {
    const result = await db
      .select({
        customer_name: s.customerTable.name,
        customer_email: s.customerTable.email,
        customer_phone: s.customerTable.phone,
        total_spent: sql<number>`sum(${s.customerOrderTable.amount_paid})`,
      })
      .from(s.customerOrderTable)
      .innerJoin(
        s.customerTable,
        eq(s.customerOrderTable.customer_id, s.customerTable.id),
      )
      .groupBy(s.customerOrderTable.customer_id)
      .orderBy(desc(sql`sum(${s.customerOrderTable.amount_paid})`))
      .limit(10)
    return result
  },

  customerNumberOrders: async () => {
    const result = await db
      .select({
        customer_name: s.customerTable.name,
        customer_email: s.customerTable.email,
        total_orders: sql<number>`count(${s.customerOrderTable.id})`,
      })
      .from(s.customerOrderTable)
      .innerJoin(
        s.customerTable,
        eq(s.customerOrderTable.customer_id, s.customerTable.id),
      )
      .groupBy(s.customerOrderTable.customer_id)
      .orderBy(desc(sql`count(${s.customerOrderTable.id})`))
      .limit(10)
    return result
  },

  revenueByMonth: async () => {
    //     SELECT
    //     strftime('%Y-%m', created_at) AS month,
    //     SUM(amount_paid) AS total_revenue
    // FROM
    //     pedidos
    // GROUP BY
    //     month
    // ORDER BY
    //     month DESC;

    const result = await db
      .select({
        month: sql<string>`strftime('%Y-%m', ${s.customerOrderTable.created_at})`,
        total_revenue: sql<number>`sum(${s.customerOrderTable.amount_paid})`,
      })
      .from(s.customerOrderTable)
      .groupBy(sql`strftime('%Y-%m', ${s.customerOrderTable.created_at})`)
      .orderBy(desc(sql`strftime('%Y-%m', ${s.customerOrderTable.created_at})`))
    return result
  },
  avgOrderValue: async () => {
    //     SELECT
    //     AVG(amount_paid) AS average_order_value
    // FROM
    //     pedidos;

    const result = await db
      .select({
        average_order_value: sql<number>`avg(${s.customerOrderTable.amount_paid})`,
      })
      .from(s.customerOrderTable)
    return result
  },

  topSellingCategories: async (n = 10) => {
    //     SELECT
    //     pc.name AS category_name,
    //     SUM(ip.quantity * ip.price) AS total_revenue
    // FROM
    //     item_pedido AS ip
    // JOIN
    //     product_item AS pi ON ip.product_id = pi.id
    // JOIN
    //     product AS p ON pi.product_id = p.id
    // JOIN
    //     product_category AS pc ON p.category_id = pc.id
    // GROUP BY
    //     category_name
    // ORDER BY
    //     total_revenue DESC;

    const result = await db
      .select({
        category_name: s.productCategoryTable.name,
        total_revenue: sql<number>`sum(${s.orderItemTable.quantity} * ${s.orderItemTable.price})`,
      })
      .from(s.orderItemTable)
      .innerJoin(
        s.productItemTable,
        eq(s.orderItemTable.product_id, s.productItemTable.id),
      )
      .innerJoin(
        s.productTable,
        eq(s.productItemTable.product_id, s.productTable.id),
      )
      .innerJoin(
        s.productCategoryTable,
        eq(s.productTable.category_id, s.productCategoryTable.id),
      )
      .groupBy(s.productCategoryTable.name)
      .orderBy(
        desc(
          sql`sum(${s.orderItemTable.quantity} * ${s.orderItemTable.price})`,
        ),
      )
      .limit(n)
    return result
  },

  avgTimeBetweenOrders: async () => {
    //     SELECT
    //     c.name AS customer_name,
    //     AVG(julianday(p2.created_at) - julianday(p1.created_at)) AS avg_days_between_orders
    // FROM
    //     pedidos AS p1
    // JOIN
    //     pedidos AS p2 ON p1.customer_id = p2.customer_id AND p1.created_at < p2.created_at
    // JOIN
    //     cliente AS c ON p1.customer_id = c.id
    // GROUP BY
    //     c.id
    // ORDER BY
    //     avg_days_between_orders ASC;
    // const result = await db
    //   .select({
    //     customer_name: s.customerTable.name,
    //     avg_days_between_orders: sql<number>`avg(julianday(${s.customerOrderTable.created_at}) - julianday(${s.customerOrderTable.created_at}))`,
    //   })
    //   .from(s.customerOrderTable)
    //   .innerJoin(
    //     s.customerOrderTable.as('p2'),
    //     eq(
    //       s.customerOrderTable.customer_id,
    //       s.customerOrderTable.as('p2').customer_id,
    //     ),
    //     eq(
    //       s.customerOrderTable.created_at,
    //       s.customerOrderTable.as('p2').created_at,
    //     ),
    //     eq(s.customerOrderTable.id, s.customerOrderTable.as('p2').id, false),
    //   )
    //   .innerJoin(
    //     s.customerTable,
    //     eq(s.customerOrderTable.customer_id, s.customerTable.id),
    //   )
    //   .groupBy(s.customerTable.id)
    //   .orderBy(
    //     sql`avg(julianday(${s.customerOrderTable.created_at}) - julianday(${s.customerOrderTable.created_at}))`,
    //   )
    // return result
  },

  mostPopularPaymentMethods: async (n = 10) => {
    //     SELECT
    //     payment_method,
    //     COUNT(id) AS usage_count
    // FROM
    //     pagamentos
    // GROUP BY
    //     payment_method
    // ORDER BY
    //     usage_count DESC;

    const result = await db
      .select({
        payment_method: s.orderPaymentTable.payment_method,
        usage_count: sql<number>`count(${s.orderPaymentTable.id})`,
      })
      .from(s.orderPaymentTable)
      .groupBy(s.orderPaymentTable.payment_method)
      .orderBy(desc(sql`count(${s.orderPaymentTable.id})`))
      .limit(n)
    return result
  },
  topSupplierByQuantity: async (n = 10) => {
    //     SELECT
    //     f.name AS supplier_name,
    //     SUM(te.quantity) AS total_quantity_supplied
    // FROM
    //     transacao_estoque AS te
    // JOIN
    //     fornecedor AS f ON te.supplier_id = f.id
    // GROUP BY
    //     f.id
    // ORDER BY
    //     total_quantity_supplied DESC;

    const result = await db
      .select({
        supplier_name: s.supplierTable.name,
        total_quantity_supplied: sql<number>`sum(${s.stockTransactionTable.quantity})`,
      })
      .from(s.stockTransactionTable)
      .innerJoin(
        s.supplierTable,
        eq(s.stockTransactionTable.supplier_id, s.supplierTable.id),
      )
      .groupBy(s.supplierTable.id)
      .orderBy(desc(sql`sum(${s.stockTransactionTable.quantity})`))
      .limit(n)
    return result
  },
})
