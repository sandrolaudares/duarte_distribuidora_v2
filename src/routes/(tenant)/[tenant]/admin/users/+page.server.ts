/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
} from '$lib/server/db/utils'
import { and, eq, getTableColumns, SQL, count, like, asc } from 'drizzle-orm'
import { pageConfig } from '$lib/config'
import { desc } from 'drizzle-orm'

export const load = (async ({ url,locals:{tenantDb} }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const username = searchParams.get('username')
  const email = searchParams.get('email')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const queryConditions = and(
    username ? like(schema.userTable.username, `${username}%`) : undefined,
    email ? like(schema.userTable.email, `${email}%`) : undefined,
  )

  let query = tenantDb!
    .select()
    .from(schema.userTable)
    .where(queryConditions)
    .orderBy(asc(schema.userTable.created_at))
    .$dynamic()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.userTable, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!.select({ count: count(schema.userTable.id) }).from(schema.userTable).where(queryConditions)

    return { rows: rows ?? [], count: total[0].count }
    console.log('total',total)
    
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0 }
  }
}) satisfies PageServerLoad