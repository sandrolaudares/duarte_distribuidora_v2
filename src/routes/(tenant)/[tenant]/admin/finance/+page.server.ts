/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  _withs,
  getDateRangeCondition
} from '$lib/server/db/utils'

import {
  and,
  eq,
  count,
  like,
  gt,
  lte,
  sql,
  asc,
} from 'drizzle-orm'
import { pageConfig } from '$lib/config'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const name = searchParams.get('name')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const startExpireDate = searchParams.get('startExpireDate')
  const endExpireDate = searchParams.get('endExpireDate')

  const atrasados = Boolean(searchParams.get('atrasados'))

  //TODO: Filtro nao fnciona legal, ao deletar nao reseta
  const queryConditions = and(
    gt(
      schema.customerOrderTable.total,
      schema.customerOrderTable.amount_paid,
    ),
    eq(schema.customerOrderTable.is_fiado, true),
    getDateRangeCondition(dateStart, dateEnd, schema.customerOrderTable.created_at),
    getDateRangeCondition(startExpireDate, endExpireDate, schema.customerOrderTable.expire_at),
    atrasados ? lte(schema.customerOrderTable.expire_at, new Date()) : undefined,
    name ? like(schema.customerTable.name, `%${name}%`) : undefined,
  )

  try {
    const customers = await tenantDb!
      .select({ id: schema.customerTable.id, name: schema.customerTable.name })
      .from(schema.customerTable)

    const cte = tenantDb!
      .select()
      .from(schema.customerOrderTable)
      .as('cteFiado')


    const _joins = <T extends SQLiteSelect>(qb: T) => {
      return qb.innerJoin(
        schema.customerTable,
        eq(schema.customerTable.id, schema.customerOrderTable.customer_id),
      )
    }

    const _fiadoOrdersSelectBuilder = () =>
      _withs(tenantDb!, cte).select({
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
        pending_amount: sql<number>`${schema.customerOrderTable.total} - ${schema.customerOrderTable.amount_paid}`,

        name: schema.customerTable.name,
        email: schema.customerTable.email,
        cellphone: schema.customerTable.cellphone,
      })

    const queryFiadoOrders = () =>
      _joins(_fiadoOrdersSelectBuilder().from(schema.customerOrderTable).$dynamic()).where(queryConditions).orderBy(asc(schema.customerOrderTable.expire_at))

    const _countSumBuilder = () =>
      _withs(tenantDb!, cte).select({
        totalSum: sql<number>`SUM(${schema.customerOrderTable.total})`,
      })

    const queryTotalSum = () =>
      _joins(_countSumBuilder().from(schema.customerOrderTable).$dynamic())

    const _countSelectBuilder = () =>
      _withs(tenantDb!, cte).select({ count: count() })

    const queryCount = () =>
      _joins(
        _countSelectBuilder()
          .from(schema.customerOrderTable)
          .where(
            and(
              gt(
                schema.customerOrderTable.total,
                schema.customerOrderTable.amount_paid,
              ),
              eq(schema.customerOrderTable.is_fiado, true),
            ),
          )
          .$dynamic(),
      )

    let query = queryFiadoOrders()

    if (sortId && sortOrder) {
      query = withOrderBy(
        query,
        getSQLiteColumn(schema.customerOrderTable, sortId),
        sortOrder,
      )
    }
    
    const [rows, [total], [totalSumResult]] = await Promise.all([
      withPagination(query, page, pageSize),
      queryCount().where(queryConditions),
      queryTotalSum().where(queryConditions),
    ])

    return {
      rows: rows ?? [],
      count: total.count,
      totalSum: totalSumResult.totalSum,
      customers,
    }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0, customers: [] }
  }
}) satisfies PageServerLoad
