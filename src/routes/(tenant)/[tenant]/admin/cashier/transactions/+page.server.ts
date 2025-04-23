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
  desc,
  gte,
  lte,
  sql,
} from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { Monad } from '$lib/utils'
import { pageConfig } from '$lib/config'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'
import { asc } from 'drizzle-orm'

export const load = (async ({ url, locals: { tenantDb, user } }) => {
  const size = pageConfig.rowPages
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? size)

  const username = searchParams.get('username')
  const caixa = searchParams.get('cashier')
  const caixaId = Number(caixa)
  const tipo = searchParams.get('type')
  const metodo_pagamento = searchParams.get('metodo_pagamento')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  console.log('username', username)
  console.log('caixa', caixa)

  const queryConditions = and(
    tipo ? like(schema.cashierTransactionsT.type, `${tipo}%`) : undefined,
    getDateRangeCondition(
      dateStart,
      dateEnd,
      schema.cashierTransactionsT.created_at,
    ),
    user?.role === 'caixa' ? eq(schema.cashierTransactionsT.created_by, user.id) : undefined,
    metodo_pagamento ? eq(schema.cashierTransactionsT.metodo_pagamento, metodo_pagamento as 'credit_card' | 'debit_card' | 'pix' | 'dinheiro') : undefined,
  )

  const cte = tenantDb!
    .select()
    .from(schema.cashierTransactionsT)
    .as('cteCashierTransactions')

  const _joins = <T extends SQLiteSelect>(qb: T) => {
    return Monad.of(qb)
      .map(query =>
        innerJoinOnMany(query, schema.userTable, [
          eq(schema.cashierTransactionsT.created_by, schema.userTable.id),
          username
            ? like(schema.userTable.username, `%${username}%`)
            : undefined,
        ]),
      )
      .map(query =>
        innerJoinOnMany(query, schema.cashierTable, [
          eq(schema.cashierTransactionsT.cashier_id, schema.cashierTable.id),
          caixa ? eq(schema.cashierTable.id, caixaId) : undefined,
        ]),
      )
      .map(query =>
        innerJoinOnMany(query, schema.customerOrderTable, [
          eq(
            schema.cashierTransactionsT.order_id,
            schema.customerOrderTable.id,
          ),
        ]),
      )
      .get()
  }

  const _cashierTransactionsSelectBuilder = () =>
    _withs(tenantDb!, cte).select({
      id: schema.cashierTransactionsT.id,
      created_at: schema.cashierTransactionsT.created_at,
      metadata: schema.cashierTransactionsT.metadata,
      type: schema.cashierTransactionsT.type,
      amount: schema.cashierTransactionsT.amount,
      metodo_pagamento: schema.cashierTransactionsT.metodo_pagamento,

      cashier: schema.cashierTable.name,
      
      order_id: schema.customerOrderTable.id,

      username: schema.userTable.username,
    })

  const queryCashierTransactions = () =>
    _joins(
      _cashierTransactionsSelectBuilder()
        .from(schema.cashierTransactionsT)
        .$dynamic(),
    )
      .where(queryConditions)
      .orderBy(desc(schema.cashierTransactionsT.created_at))

  const _countSumBuilder = () =>
    _withs(tenantDb!, cte).select({
      totalSum: sql<number>`SUM(
        CASE
          WHEN ${schema.cashierTransactionsT.type} = 'Fechamento' THEN 0
          WHEN ${schema.cashierTransactionsT.type} IN ('Sangria', 'Retirada') THEN -${schema.cashierTransactionsT.amount}
          WHEN ${schema.cashierTransactionsT.metodo_pagamento} = 'dinheiro'
            AND ${schema.cashierTransactionsT.metadata} ->> 'troco' IS NOT NULL
            THEN ${schema.cashierTransactionsT.amount} - CAST(${schema.cashierTransactionsT.metadata} ->> 'troco' AS numeric)
          ELSE ${schema.cashierTransactionsT.amount}
        END
      ) AS totalSum`,
    })

  const queryTotalSum = () =>
    _joins(
      _countSumBuilder().from(schema.cashierTransactionsT).$dynamic(),
    ).where(queryConditions)

  const _countSelectBuilder = () =>
    _withs(tenantDb!, cte).select({ count: count() })

  const queryCount = () =>
    _joins(_countSelectBuilder().from(schema.cashierTransactionsT).$dynamic())

  // try {
  let query = queryCashierTransactions()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.cashierTransactionsT, sortId),
      sortOrder,
    )
  }

  const [rows, [total], [totalSumResult]] = await Promise.all([
    withPagination(query, page, pageSize),
    queryCount(),
    queryTotalSum(),
  ])

  console.log(rows)

  return {
    rows,
    count: total.count,
    size,
    totalSum: totalSumResult.totalSum,
  }
  // } catch (e: any) {
  //   console.error(e)
  //   // return error(404, e.message ?? e)

  //   return { rows: [], count: 0, size: 0,cashier: [] }
  // }
}) satisfies PageServerLoad
