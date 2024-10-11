/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy2,
  getSQLiteColumn,
  getOrderBy,
} from '$lib/server/db/utils'
import { db } from '$lib/server/db'
import { and, eq, getTableColumns, SQL, count, like, gt, lt, lte } from 'drizzle-orm'
import { customer } from '$lib/server/db/controller'
import { gte } from 'drizzle-orm'

export const load = (async ({ url }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 10)

  const name = searchParams.get('name')
  const dateStart = searchParams.get('start')
  const dateEnd = searchParams.get('end')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  let query = customer.getAllOrderInfo().where(
    and(
      name ? like(schema.customerTable.name, `${name}%`) : undefined,

      dateStart && dateEnd
        ? and(
            gte(schema.customerTable.created_at, dateStart),
            lte(schema.customerTable.created_at, dateEnd),
          )
        : undefined,
    ),
  ).$dynamic()

  console.log("Date Start:", dateStart, "Date End:", dateEnd);

  if (sortId && sortOrder) {
    query = withOrderBy2(
      query,
      getSQLiteColumn(schema.customerOrderTable, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await db
      .select({ count: count() })
      .from(schema.customerOrderTable)

    return { rows: rows ?? [], count: total[0].count }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0 }
  }
}) satisfies PageServerLoad
