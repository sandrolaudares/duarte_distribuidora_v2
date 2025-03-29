import type { PageServerLoad } from './$types'

import * as s from '$db/schema'
import { eq, sql, and, gt, count, desc } from 'drizzle-orm'
import { withinDate2 } from '$lib/server/db/utils'

import { getLocalTimeZone, today } from '@internationalized/date'
import { redirect } from '@sveltejs/kit'

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
      `/admin/dashboard/delivery?startDate=${start}&endDate=${end}`,
    )
  }

  const startDate =
    typeof sp_start_date === 'string'
      ? new Date(Number(sp_start_date))
      : today('America/Sao_Paulo')
          .subtract({ days: 7 })
          .toDate('America/Sao_Paulo')

  const endDate =
    typeof sp_end_date === 'string' ? new Date(Number(sp_end_date)) : new Date()

  const getTotalDelivered = db!
    .select({
      total: count(s.customerOrderTable.id),
    })
    .from(s.customerOrderTable)
    .where(
      and(
        eq(s.customerOrderTable.status, 'DELIVERED'),
        gt(s.customerOrderTable.taxa_entrega, 0),
      ),
    )
    .$dynamic()

  const getTotalDeliveryFees = db!
    .select({
      total: sql<number>`SUM(${s.customerOrderTable.taxa_entrega})`,
    })
    .from(s.customerOrderTable)
    .where(
      and(
        eq(s.customerOrderTable.status, 'DELIVERED'),
        gt(s.customerOrderTable.taxa_entrega, 0),
      ),
    )
    .$dynamic()

  const getTotalCancelados = db!
    .select({
      total: count(s.customerOrderTable.id),
    })
    .from(s.customerOrderTable)
    .where(and(eq(s.customerOrderTable.status, 'CANCELED')))
    .$dynamic()

  const getMotoboyOverview = db!
    .select({
      name: s.userTable.username,
      numberDeliveries: count(s.customerOrderTable.id),
      totalAmountDeliveryFees: sql<number>`SUM(${s.customerOrderTable.taxa_entrega})`,
    })
    .from(s.customerOrderTable)
    .innerJoin(s.userTable, eq(s.customerOrderTable.motoboy_id, s.userTable.id))
    .where(
      and(
        eq(s.customerOrderTable.status, 'DELIVERED'),
        gt(s.customerOrderTable.taxa_entrega, 0),
      ),
    )
    .groupBy(s.userTable.id)
    .orderBy(desc(sql<number>`SUM(${s.customerOrderTable.taxa_entrega})`))
    .$dynamic()

  const getLast10Deliveries = db!
    .select({
      motoboyName: s.userTable.username,
      // distance: s.customerOrderTable,
      taxaEntrega: s.customerOrderTable.taxa_entrega,
      totalPedido: s.customerOrderTable.total,
    })
    .from(s.customerOrderTable)
    .innerJoin(s.userTable, eq(s.customerOrderTable.motoboy_id, s.userTable.id))
    .where(
      and(
        eq(s.customerOrderTable.status, 'DELIVERED'),
        gt(s.customerOrderTable.taxa_entrega, 0),
      ),
    )
    .orderBy(desc(s.customerOrderTable.created_at))
    .limit(10)
    .$dynamic()

  const getBestProduct = db!
    .select({
      sum: sql<number>`SUM(${s.orderItemTable.quantity})`,
      name: s.productTable.name,
      id: s.productTable.id,
    })
    .from(s.orderItemTable)
    .innerJoin(
      s.productTable,
      eq(s.orderItemTable.product_id, s.productTable.id),
    )
    .groupBy(s.productTable.id)
    .orderBy(desc(sql<number>`SUM(${s.orderItemTable.quantity})`))
    .limit(1)
    .$dynamic()

  const withinSearchDate = withinDate2(startDate, endDate)
  const [
    totalDeliveredCompleted,
    totalDeliveryFees,
    totalCancelados,
    motoboyOverview,
    Last10Deliveries,
    [bestProduct],
  ] = await Promise.all([
    withinSearchDate(getTotalDelivered, s.customerOrderTable.created_at),
    withinSearchDate(getTotalDeliveryFees, s.customerOrderTable.created_at),
    withinSearchDate(getTotalCancelados, s.customerOrderTable.created_at),
    withinSearchDate(getMotoboyOverview, s.customerOrderTable.created_at),
    getLast10Deliveries,
    withinSearchDate(getBestProduct, s.orderItemTable.created_at)
  ])
  console.log(Last10Deliveries)
  return {
    totalDeliveredCompleted: totalDeliveredCompleted[0].total,

    TotalDeliveryFees: totalDeliveryFees[0].total,

    cancelingOrders: totalCancelados[0].total,

    bestProduct: bestProduct?.name ?? "Nenhuma Venda no periodo",

    couriersHighestNumberDeliveries: motoboyOverview,

    last10Deliveries: Last10Deliveries,

    startDate,
    endDate,
  }
}) satisfies PageServerLoad
