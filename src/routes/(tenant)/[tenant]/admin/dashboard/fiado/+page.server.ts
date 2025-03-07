/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as s from '$db/schema'
import {
  desc,
  eq,
  sql,
  gt,
  gte,
  lt,
  and,
  type AnyColumn,
  sum,
} from 'drizzle-orm'

import { getLocalTimeZone, today } from '@internationalized/date'
import { redirect } from '@sveltejs/kit'

import { withinDate2 } from '$db/utils'

export const load = (async ({ locals: { tenantDb: db }, url }) => {
  const searchParams = url.searchParams

  const sp_start_date = searchParams.get('startDate')
  const sp_end_date = searchParams.get('endDate')

  // if (!sp_start_date || !sp_end_date) {
  //   const start = today('America/Sao_Paulo')
  //     .subtract({ days: 7 })
  //     .toDate(getLocalTimeZone())
  //     .getTime()
  //   const end = today('America/Sao_Paulo').toDate(getLocalTimeZone()).getTime()
  //   return redirect(
  //     303,
  //     `/admin/dashboard/fiado?startDate=${start}&endDate=${end}`,
  //   )
  // }

  const startDate =
    typeof sp_start_date === 'string'
      ? new Date(Number(sp_start_date))
      : undefined

  const endDate =
    typeof sp_end_date === 'string' ? new Date(Number(sp_end_date)) : undefined

  const debt = sql<number>`CAST(SUM(${s.customerOrderTable.total} - ${s.customerOrderTable.amount_paid}) as integer)`

  let getinDeptClients = db!
    .select({
      debtorName: s.customerTable.name,
      debtorEmail: s.customerTable.email,
      debtorPhone: s.customerTable.phone,
      cellphone: s.customerTable.cellphone,
      totalOrders: sql<number>`CAST(SUM(${s.customerOrderTable.total}) as integer)`,
      totalPaid: sql<number>`CAST(SUM(${s.customerOrderTable.amount_paid}) as integer)`,
      totalDebt: debt,
    })
    .from(s.customerOrderTable)
    .where(
      and(gt(s.customerOrderTable.total, s.customerOrderTable.amount_paid)),
    )
    .groupBy(s.customerOrderTable.customer_id)
    .innerJoin(
      s.customerTable,
      eq(s.customerOrderTable.customer_id, s.customerTable.id),
    )
    .orderBy(desc(debt))
    .$dynamic()

  if (startDate && endDate) {
    getinDeptClients = withinDate2(startDate, endDate)(
      getinDeptClients,
      s.customerOrderTable.created_at,
    )
  }

  return {
    // TODO: Relatório com todos os clientes com dívida ativa e o total de recebimentos atingido (ex: essa semana tem o total de 50 mil de fiados para receber e já recebemos 47 mil
    corporateClientsSortedDelayOrder: await getinDeptClients,
  }
}) satisfies PageServerLoad
