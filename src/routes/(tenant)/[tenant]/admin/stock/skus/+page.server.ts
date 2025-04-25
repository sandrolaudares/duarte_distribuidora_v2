/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
  _withs,
} from '$lib/server/db/utils'
import { and, eq, getTableColumns, SQL, count, like } from 'drizzle-orm'
import { pageConfig } from '$lib/config'

export const load = (async ({ url, locals: { tenantDb } }) => {

  
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)
  
  const name = searchParams.get('name')
  
  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')
  
  const queryConditions = name ? like(schema.skuTable.name, `%${name}%`) : undefined

  const cte = tenantDb!.select().from(schema.skuTable).as('cteSkus')

  const skusSelectBuilder = () => _withs(tenantDb!, cte).select()

  const queryFiadoOrders = () =>
    skusSelectBuilder()
      .from(schema.skuTable)
      .$dynamic()
      .where(queryConditions)

  const _countSelectBuilder = () =>
    _withs(tenantDb!, cte).select({ count: count() })

  const queryCount = () => _countSelectBuilder().from(schema.skuTable)

  let query = queryFiadoOrders()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.skuTable, sortId),
      sortOrder,
    )
  }

  try {
    const [rows, total] = await Promise.all([
      withPagination(query, page, pageSize),
      queryCount().where(queryConditions),
    ])

    console.log(rows)

    return { rows, count: total[0].count }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0 }
  }
}) satisfies PageServerLoad
