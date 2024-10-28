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
  gt,
  lt,
  lte,
  sum,
  sql,
} from 'drizzle-orm'
import { customer } from '$lib/server/db/controller'
import { gte } from 'drizzle-orm'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 10)

  const name = searchParams.get('name')
  const expire_at = searchParams.get('expire_at')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')
  

  let query = customer(tenantDb!)
    .getAllOrderInfo()
    .where(
      and(
        gt(
          schema.customerOrderTable.total,
          schema.customerOrderTable.amount_paid,
        ),
        eq(schema.customerOrderTable.is_fiado, true),
        name ? like(schema.customerTable.name, `${name}%`) : undefined,

        dateStart && dateEnd
          ? and(
              gte(
                schema.customerOrderTable.created_at,
                new Date(Number(dateStart)),
              ),
              lte(
                schema.customerOrderTable.created_at,
                new Date(Number(dateEnd)),
              ),
            )
          : undefined,
      ),
    )
    .$dynamic()

  console.log('Date Start:', dateStart, 'Date End:', dateEnd)
  console.log(sortId, sortOrder)

  if (sortId && sortOrder) {

    query = withOrderBy(
      query,
      getSQLiteColumn(schema.customerOrderTable, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!
      .select({ count: count() })
      .from(schema.customerOrderTable)

    const totalSumResult = await tenantDb!
      .select({
        totalSum: sql<number>`SUM(${schema.customerOrderTable.total})`,
      })
      .from(schema.customerOrderTable)
      .leftJoin(
        schema.customerTable,
        eq(schema.customerTable.id, schema.customerOrderTable.customer_id),
      )
      .where(
        and(
          gt(
            schema.customerOrderTable.total,
            schema.customerOrderTable.amount_paid,
          ),
          eq(schema.customerOrderTable.is_fiado, true),
          name ? like(schema.customerTable.name, `${name}%`) : undefined,
          dateStart && dateEnd
            ? and(
                gte(
                  schema.customerOrderTable.created_at,
                  new Date(Number(dateStart)),
                ),
                lte(
                  schema.customerOrderTable.created_at,
                  new Date(Number(dateEnd)),
                ),
              )
            : undefined,
        ),
      )

    const totalSum = totalSumResult[0]?.totalSum ?? 0

    return { rows: rows ?? [], count: total[0].count, totalSum }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0 }
  }
}) satisfies PageServerLoad
