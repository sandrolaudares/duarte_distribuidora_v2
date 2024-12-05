/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
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

export const load = (async ({ url, locals: { tenantDb } }) => {
  const size = 13
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? size)

  const username = searchParams.get('user_name')
  const caixa = searchParams.get('cashier')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  let query = tenantDb!
  // .query.logsTable.findMany({
  //   where: and(
  //     eq(schema.logsTable.type, 'CAIXA'),
  //     username ? like(schema.userTable.username, `${username}%`) : undefined,
  //     caixa ? like(schema.cashierTable.name, `${caixa}%`) : undefined,
  //     dateStart && dateEnd
  //       ? and(
  //           gte(schema.logsTable.created_at, new Date(Number(dateStart))),
  //           lte(schema.logsTable.created_at, new Date(Number(dateEnd))),
  //         )
  //       : undefined,
  //   ),
  //   with: {
  //     reporter: {
  //       with: {
  //         orders_made: {
  //           with: {
  //             cashier: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
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
    
    user_name: schema.userTable.username,
  })
  .from(schema.logsTable)
  .$dynamic()
  .where(
    and(
      eq(schema.logsTable.type, 'CAIXA'),
      // username ? like(schema.userTable.username, `${username}%`) : undefined,
      // caixa ? like(schema.cashierTable.name, `${caixa}%`) : undefined,
      dateStart && dateEnd
      ? and(
        gte(schema.logsTable.created_at, new Date(Number(dateStart))),
        lte(schema.logsTable.created_at, new Date(Number(dateEnd))),
        )
      : undefined,
    ),
  )
  .leftJoin(
    schema.userTable,
    eq(schema.logsTable.created_by, schema.userTable.id),
  )
  .where(username ? like(schema.userTable.username, `${username}%`) : undefined,)
  .leftJoin(
    schema.customerOrderTable,
    eq(schema.logsTable.order_id, schema.customerOrderTable.id),
  )
  .leftJoin(
    schema.cashierTable,
    eq(schema.logsTable.cashier_id, schema.cashierTable.id),
  )
  .where(caixa ? like(schema.cashierTable.name, `${caixa}%`) : undefined,)
  .orderBy(desc(schema.logsTable.created_at))

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.logsTable, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!
      .select({ count: count() })
      .from(schema.logsTable)
      .where(
        and(
          eq(schema.logsTable.type, 'CAIXA'),
          username
            ? like(schema.userTable.username, `${username}%`)
            : undefined,
        ),
      )

    return { rows: rows ?? [], count: total[0].count, size }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, size: 0 }
  }
}) satisfies PageServerLoad
