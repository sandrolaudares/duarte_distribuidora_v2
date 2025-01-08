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
    typeof sPendDate === 'string' 
    ? new Date(Number(sPendDate)) 
    : new Date()

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

  // TODO: Clientes ociosos: Não compram a 2 semanas ou mais
  return {
    revenueByMonth: [
      {
        basePeriod : await withinDate(
          getRevenueByMonth,
          s.customerOrderTable.created_at,
          startDate,
          endDate,
        ),
        comparedPeriod : []
      }
    ],
    
    financialSummary: [
      {
        basePeriod : (await getTotalPaidOrders)[0].total_paid,
        comparedPeriod : 0
      }
    ],

    AvgOrderValue: {
      basePeriod : await getAvgOrderValue,
      comparedPeriod : 0
    },

    quantOrders: {
      basePeriod : await getQuantOrders,
      comparedPeriod : 0
    },

    topRevenueProducts: {
      basePeriod : await getTopRevenueProducts,
      comparedPeriodo : 0
    },
    
    topOrderedProducts: await withinDate(
      getTopOrderedNProducts,
      s.orderItemTable.created_at,
      startDate,
      endDate,
    ),

    mostPopularPaymentMethods : {
      basePeriod : await getMostPopularPaymentMethods,
      comparedPeriod : await getMostPopularPaymentMethods
    },
    
    topCustomers: {
      basePeriod : await getTopCustomers,
      comparedPeriod : await getTopCustomers
    },

    clientesOciosos: {
      basePeriod : [
        {
          name: 'Pedro',
          lastOrder: '2023-01-01',
          tempoQueNaoCompra: "Posso calcular no front"
        }
      ],
      comparedPeriod : [
        {
          name: 'Pedro',
          lastOrder: '2023-01-01',
          tempoQueNaoCompra: "Posso calcular no front"
        }
      ]
    },


    topSellingCategories: await getTopSellingCategories,
    topCustomerOrders: await getCustomerNumberOrders,
    

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
