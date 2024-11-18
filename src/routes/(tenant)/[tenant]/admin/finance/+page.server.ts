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

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const startExpireDate = searchParams.get('startExpireDate')
  const endExpireDate = searchParams.get('endExpireDate')

  const atrasados = Boolean(searchParams.get('atrasados'))

  console.log(name)

  const condicoes = [
    name ? like(schema.customerTable.name, `${name}%`) : undefined,
  //TODO: NAME NÃO FILTRA
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
  
            startExpireDate && endExpireDate
            ? and(
                gte(
                  schema.customerOrderTable.expire_at,
                  new Date(Number(startExpireDate)),
                ),
                lte(
                  schema.customerOrderTable.expire_at,
                  new Date(Number(endExpireDate)),
                ),
              )
            : undefined,
  
            atrasados ? lte(
              schema.customerOrderTable.expire_at,
              new Date()
            ) : undefined
  ]

  try {
    let query = customer(tenantDb!)
      .getAllOrderInfo().$dynamic()
      .where(
        and(
          gt(
            schema.customerOrderTable.total,
            schema.customerOrderTable.amount_paid,
          ),
          eq(schema.customerOrderTable.is_fiado, true),
          ...condicoes
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
    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!
      .select({ count: count() })
      .from(schema.customerOrderTable)
      .where(
        and(
          gt(
            schema.customerOrderTable.total,
            schema.customerOrderTable.amount_paid,
          ),
          eq(schema.customerOrderTable.is_fiado, true),
          ...condicoes
            
        ),
      )

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
          ...condicoes
        ),
      )

    const totalSum = totalSumResult[0]?.totalSum ?? 0

    return { rows: rows ?? [], count: total[0].count, totalSum }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0 }
  }
}) satisfies PageServerLoad
