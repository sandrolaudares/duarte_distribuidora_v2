import type { TenantDbType } from './tenant'

import * as s from './schema'
import { desc, eq, sql } from 'drizzle-orm'

export const dashboard = (db: TenantDbType) => ({

  weekly: {
    
  },
  //Total gasto por cliente
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
  //Valor médio do pedido (Ticket Médio)
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
  //Categorias mais vendidas
  //Tempo médio entre pedidos -> Não vai ser utilizado
  // avg = averege(média)
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
  // Fornecedor principal por quantidade -> Não vai ser utilizado
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
