/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as s from '$db/schema'
import { desc, eq, sql, gt, gte, and, type AnyColumn } from 'drizzle-orm'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'
import { format, formatDistance, formatRelative, subDays } from 'date-fns'

import { withinDate } from '$db/utils'

const LIMIT = 10 as const

export const load = (async ({ locals: { tenantDb: db }, url }) => {
  const searchParams = url.searchParams

  const sPstartDate = searchParams.get('startDate')
  const sPendDate = searchParams.get('endDate')

  const startDate =
    typeof sPstartDate === 'string'
      ? new Date(Number(sPstartDate))
      : subDays(new Date(), 7)
  const endDate =
    typeof sPendDate === 'string' ? new Date(Number(sPendDate)) : new Date()
  const compareStartDate = 'compareStartDate'
  const compareEndDate = 'compareEndDate'

  console.log('sPstartDate', sPstartDate)
  console.log('sPendDate', sPendDate)
  console.log('startDate', startDate.toLocaleDateString())
  console.log('endDate', endDate.toLocaleDateString())

  const getTopOrderedNProducts = db!
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
    .limit(LIMIT)
    .$dynamic()

  const getTopRRevenueProducts = db!
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
      desc(sql`sum(${s.orderItemTable.quantity} * ${s.orderItemTable.price})`),
    )
    .limit(LIMIT)
    .$dynamic()

  const getMostPopularPaymentMethods = db!
    .select({
      payment_method: s.orderPaymentTable.payment_method,
      usage_count: sql<number>`count(${s.orderPaymentTable.id})`,
    })
    .from(s.orderPaymentTable)
    .groupBy(s.orderPaymentTable.payment_method)
    .orderBy(desc(sql`count(${s.orderPaymentTable.id})`))
    .limit(LIMIT)
    .$dynamic()

  const getRevenueByMonth = db!
    .select({
      month: sql<string>`strftime('%Y-%m', ${s.customerOrderTable.created_at})`,
      total_revenue: sql<number>`sum(${s.customerOrderTable.amount_paid})`,
    })
    .from(s.customerOrderTable)
    .groupBy(sql`strftime('%Y-%m', ${s.customerOrderTable.created_at})`)
    .orderBy(desc(sql`strftime('%Y-%m', ${s.customerOrderTable.created_at})`))
    .$dynamic()

  const getTopSellingCategories = db!
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
      desc(sql`sum(${s.orderItemTable.quantity} * ${s.orderItemTable.price})`),
    )
    .limit(LIMIT)
    .$dynamic()

  const getCustomerNumberOrders = db!
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
    .limit(LIMIT)

  const getAvgOrderValue = db!
    .select({
      average_order_value: sql<number>`avg(${s.customerOrderTable.amount_paid})`,
    })
    .from(s.customerOrderTable)
    .$dynamic()

  const getQuantOrders = db!
    .select({
      total_orders: sql<number>`count(${s.customerOrderTable.id})`,
    })
    .from(s.customerOrderTable)
    .$dynamic()

  const getTopCustomers = db!
    .select({
      customer_name: s.customerTable.name,
      pedidos: sql<number>`count(${s.customerOrderTable.id})`,
    })
    .from(s.customerOrderTable)
    .innerJoin(
      s.customerTable,
      eq(s.customerOrderTable.customer_id, s.customerTable.id),
    )
    .groupBy(s.customerOrderTable.customer_id)
    .orderBy(desc(sql`count(${s.customerOrderTable.id})`))
    .limit(LIMIT)
  // total in cents
  const getTotalPaidOrders = db!
    .select({
      total_paid: sql<number>`sum(${s.customerOrderTable.amount_paid})`,
    })
    .from(s.customerOrderTable)
    .where(gt(s.customerOrderTable.amount_paid, 1))

  return {
    topOrderedProducts: await withinDate(
      getTopOrderedNProducts,
      s.orderItemTable.created_at,
      startDate,
      endDate,
    ),

    topRevenueProducts: await getTopRRevenueProducts,
    mostPopularPaymentMethods: await getMostPopularPaymentMethods,
    revenueByMonth: await getRevenueByMonth,
    topSellingCategories: await getTopSellingCategories,
    topCustomerOrders: await getCustomerNumberOrders,
    AvgOrderValue: await getAvgOrderValue,
    quantOrders: await getQuantOrders,

    // TODO: Subtrair (vendas a vista + recebimentos de fiado) - Contas pagas
    financialSummary: (await getTotalPaidOrders)[0].total_paid,
    // TODO: Query to get top 10 customers
    topCustomers: await getTopCustomers,

    teste: {
      startDate,
      endDate,

      dated: await withinDate(
        getTopOrderedNProducts,
        s.orderItemTable.created_at,
        startDate,
        endDate,
      ),
    },
  }
}) satisfies PageServerLoad
