/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
  innerJoinOnMany,
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
} from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { Monad } from '$lib/utils'
import { pageConfig } from '$lib/config'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const size = pageConfig.rowPages
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? size)

  const username = searchParams.get('username')
  const caixa = searchParams.get('cashier')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')
  
  console.log('username', username)
  console.log('caixa', caixa)
  
  try {
  let query = Monad.of(
    tenantDb!
      .select({
        id: schema.logsTable.id,
        created_at: schema.logsTable.created_at,
        text: schema.logsTable.text,
        metadata: schema.logsTable.metadata,
        error: schema.logsTable.error,
        type: schema.logsTable.type,
        pathname: schema.logsTable.pathname,
        routeName: schema.logsTable.routeName,
        currency: schema.logsTable.currency,
        total: schema.customerOrderTable.total,
        cashier: schema.cashierTable.name,
        order_id: schema.customerOrderTable.id,

        username: schema.userTable.username,
      })
      .from(schema.logsTable)
      .where(
        and(
          eq(schema.logsTable.type, 'CAIXA'),

          dateStart && dateEnd
            ? and(
                gte(schema.logsTable.created_at, new Date(Number(dateStart))),
                lte(schema.logsTable.created_at, new Date(Number(dateEnd))),
              )
            : undefined,
        ),
      )
      .leftJoin(
        schema.customerOrderTable,
        eq(schema.logsTable.order_id, schema.customerOrderTable.id),
      )

      .$dynamic(),
  )
    .map(q =>
      innerJoinOnMany(q, schema.userTable, [
        eq(schema.logsTable.created_by, schema.userTable.id),
        username ? like(schema.userTable.username, `%${username}%`) : undefined,
      ]),
    )
    .map(q =>
      innerJoinOnMany(q, schema.cashierTable, [
        eq(schema.logsTable.cashier_id, schema.cashierTable.id),
        caixa ? like(schema.cashierTable.name, `%${caixa}%`) : undefined,
      ]),
    )
    .get()
    .orderBy(desc(schema.logsTable.created_at))

    const cashier = await tenantDb!.select().from(schema.cashierTable)

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.logsTable, sortId),
      sortOrder,
    )
  }

    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!
      .select({ count: count() })
      .from(schema.logsTable)
      .where(
        and(
          eq(schema.logsTable.type, 'CAIXA'),
          // username
          //   ? like(schema.userTable.username, `${username}%`)
          //   : undefined,
        ),
      )
    // .catch(e => 0)
    // .then(res => (typeof res === 'number' ? [{ count: res }] : res))

    return { rows: rows ?? [], count: total[0].count, size,cashier }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(e)
    // return error(404, e.message ?? e)

    return { rows: [], count: 0, size: 0,cashier: [] }
  }
}) satisfies PageServerLoad
