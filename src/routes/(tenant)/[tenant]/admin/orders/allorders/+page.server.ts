/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
  innerJoinOnMany,
  _withs,
  getDateRangeCondition,
} from '$lib/server/db/utils'
import {
  and,
  eq,
  getTableColumns,
  SQL,
  count,
  like,
  gt,
  lt,
  lte,
  sum,
  sql,
  asc,
  desc,
} from 'drizzle-orm'
import { customer } from '$lib/server/db/controller'
import { gte } from 'drizzle-orm'
import { Monad } from '$lib/utils'
import { pageConfig } from '$lib/config'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const name = searchParams.get('name')
  const cashier = searchParams.get('created_by')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const queryConditions = and(
    getDateRangeCondition(
      dateStart,
      dateEnd,
      schema.customerOrderTable.created_at,
    ),
  )

  const cte = tenantDb!
    .select()
    .from(schema.customerOrderTable)
    .as('cteAllOrders')

  const _joins = <T extends SQLiteSelect>(qb: T) => {
    return Monad.of(qb)
      .map(q =>
        innerJoinOnMany(q, schema.customerTable, [
          eq(schema.customerTable.id, schema.customerOrderTable.customer_id),
          name ? like(schema.customerTable.name, `${name}%`) : undefined,
        ]),
      )
      .map(q =>
        innerJoinOnMany(q, schema.userTable, [
          eq(schema.userTable.id, schema.customerOrderTable.created_by),
          cashier ? like(schema.userTable.username, `%${cashier}%`) : undefined,
        ]),
      )
      .get()
  }

  const _customerOrders = () =>
    _withs(tenantDb!, cte).select({
      //Order:
      id: schema.customerOrderTable.id,
      created_at: schema.customerOrderTable.created_at,
      updated_at: schema.customerOrderTable.updated_at,
      is_fiado: schema.customerOrderTable.is_fiado,
      observation: schema.customerOrderTable.observation,
      amount_paid: schema.customerOrderTable.amount_paid,
      total: schema.customerOrderTable.total,
      status: schema.customerOrderTable.status,
      type: schema.customerOrderTable.type,
      expire_at: schema.customerOrderTable.expire_at,

      //customer:
      name: schema.customerTable.name,
      email: schema.customerTable.email,
      cellphone: schema.customerTable.cellphone,

      //cashier
      // cashier: schema.cashierTable.name,
      created_by: schema.userTable.username,
    })

  const queryAllOrders = () =>
    _joins(_customerOrders().from(schema.customerOrderTable).$dynamic())
      .where(queryConditions)
      .orderBy(desc(schema.customerOrderTable.created_at))

  const _countSumBuilder = () =>
    _withs(tenantDb!, cte).select({
      totalSum: sql<number>`SUM(${schema.customerOrderTable.total})`,
    })

  const queryTotalSum = () =>
    _joins(_countSumBuilder().from(schema.customerOrderTable).$dynamic()).where(
      queryConditions,
    )

  const _countSelectBuilder = () =>
    _withs(tenantDb!, cte).select({ count: count() })

  const queryCount = () =>
    _joins(_countSelectBuilder().from(schema.customerOrderTable).$dynamic())

  let query = queryAllOrders()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.customerOrderTable, sortId),
      sortOrder,
    )
  }

  try {
    const [rows, [total], [totalSumResult]] = await Promise.all([
      withPagination(query, page, pageSize),
      queryCount(),
      queryTotalSum(),
    ])

    const totalSum = totalSumResult.totalSum

    return { rows: rows ?? [], count: total.count, totalSum }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0 }
  }
  return { rows: [], count: 0, totalSum: 0 }
}) satisfies PageServerLoad
