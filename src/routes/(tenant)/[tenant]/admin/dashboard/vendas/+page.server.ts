/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as s from '$db/schema'
import { desc, eq, sql, gt, gte, and, type AnyColumn } from 'drizzle-orm'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'
import { format, formatDistance, formatRelative, subDays } from 'date-fns'

import { withinDate2 } from '$db/utils'
import { redirect } from '@sveltejs/kit'

import { getLocalTimeZone, today } from '@internationalized/date'

const LIMIT = 10 as const

export const load = (async ({ locals: { tenantDb: db }, url }) => {
  const searchParams = url.searchParams

  const sp_start_date = searchParams.get('startDate')
  const sp_end_date = searchParams.get('endDate')

  if (!sp_start_date || !sp_end_date) {
    const start = today('America/Sao_Paulo')
      .subtract({ days: 7 })
      .toDate(getLocalTimeZone())
      .getTime()
    const end = today('America/Sao_Paulo').toDate(getLocalTimeZone()).getTime()
    return redirect(
      303,
      `/admin/dashboard/vendas?startDate=${start}&endDate=${end}`,
    )
  }

  const startDate =
    typeof sp_start_date === 'string'
      ? new Date(Number(sp_start_date))
      : subDays(new Date(), 7)

  const endDate =
    typeof sp_end_date === 'string' ? new Date(Number(sp_end_date)) : new Date()

  const sp_compare_start_date = searchParams.get('compareStartDate')
  const sp_compare_end_date = searchParams.get('compareEndDate')

  const compareStartDate = sp_compare_start_date
    ? new Date(Number(sp_compare_start_date))
    : null

  const compareEndDate = sp_compare_end_date
    ? new Date(Number(sp_compare_end_date))
    : null

  console.log(compareEndDate, compareStartDate, startDate, endDate)

  const withinSelectedDate = withinDate2(startDate, endDate)
  const withinCompareDate =
    sp_compare_start_date && sp_compare_end_date
      ? withinDate2(compareStartDate!, compareEndDate!)
      : null

  const comparationQuery = async function <T extends SQLiteSelect>(
    qb: T,
    column: AnyColumn,
  ): Promise<{ basePeriod: Awaited<T>; comparedPeriod?: Awaited<T> }> {
    if (!withinCompareDate) {
      const basePeriod = await withinSelectedDate(qb, column)
      return { basePeriod, comparedPeriod: undefined }
    }

    // const [basePeriod, comparedPeriod] = await Promise.all([
    //   withinSelectedDate(qb, column),
    //   withinCompareDate(qb, column),
    // ])

    const basePeriod = await withinSelectedDate(qb, column)
    const comparedPeriod = await withinCompareDate(qb, column)

    return { basePeriod, comparedPeriod }
    // if (!withinCompareDate) {
    //   return Promise.all([withinSelectedDate(qb, column)]).then(
    //     ([basePeriod]) => ({
    //       basePeriod,
    //       comparedPeriod: undefined,
    //     }),
    //   )
    // }
    // return Promise.all([
    //   withinSelectedDate(qb, column),
    //   withinCompareDate(qb, column),
    // ]).then(([basePeriod, comparedPeriod]) => ({
    //   basePeriod,
    //   comparedPeriod: comparedPeriod,
    // }))
  }

  console.log('sPstartDate=', sp_start_date)
  console.log('sPendDate=', sp_end_date)
  console.log('sPstartDateC=', sp_compare_start_date)
  console.log('sPendDateC=', sp_compare_end_date)

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

  const getTopRevenueProducts = db!
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
    .$dynamic()

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


  // total in cents
  const getTotalPaidOrders = db!
    .select({
      total_paid: sql<number>`sum(${s.customerOrderTable.amount_paid})`,
    })
    .from(s.customerOrderTable)
    .where(gt(s.customerOrderTable.amount_paid, 1))
    .$dynamic()

  // TODO: Fazer querie clientes ociosos: Não compram a 2 semanas ou mais, não vai ter comparação
  const clientesOciosos = [
    {
      name: 'Matheus',
      ultimaCompra: '21/12/2024',
    },
    {
      name: 'Andre',
      ultimaCompra: '17/11/2024',
    },
  ]

  const [
    financialSummary,
    AvgOrderValue,
    quantOrders,
    topRevenueProducts,
    
    mostPopularPaymentMethods,
    topSellingCategories,
    topCustomerOrders,
    topOrderedProducts,
  ] = await Promise.all([
    comparationQuery(getTotalPaidOrders, s.customerOrderTable.created_at),
    comparationQuery(getAvgOrderValue, s.customerOrderTable.created_at),
    comparationQuery(getQuantOrders, s.customerOrderTable.created_at),
    comparationQuery(getTopRevenueProducts, s.orderItemTable.created_at),
    comparationQuery(
      getMostPopularPaymentMethods,
      s.orderPaymentTable.created_at,
    ),
    comparationQuery(getTopSellingCategories, s.orderItemTable.created_at),
    comparationQuery(getCustomerNumberOrders, s.customerOrderTable.created_at),
    comparationQuery(getTopOrderedNProducts, s.orderItemTable.created_at),
  ])

  return {
    financialSummary,

    AvgOrderValue,

    quantOrders,

    topRevenueProducts,

    topOrderedProducts,

    mostPopularPaymentMethods,

    clientesOciosos,

    topSellingCategories,
    topCustomerOrders,
  }
}) satisfies PageServerLoad
