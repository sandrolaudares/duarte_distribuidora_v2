/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
} from '$lib/server/db/utils'
import { and, eq, getTableColumns, SQL, count, like } from 'drizzle-orm'
import { pageConfig } from '$lib/config'

export const load = (async ({ url,locals:{tenantDb} }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const name = searchParams.get('name')
  const razao_social = searchParams.get('razao_social')
  const telephone_1 = searchParams.get('telephone_1')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  let query = tenantDb!
    .select()
    .from(schema.supplierTable)
    .where(
      and(
        name ? like(schema.supplierTable.name, `${name}%`) : undefined,
        razao_social ? like(schema.supplierTable.razao_social, `${razao_social}%`) : undefined,
        telephone_1 ? like(schema.supplierTable.telephone_1, `${telephone_1}%`) : undefined,
      )
    )
    .$dynamic()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.supplierTable, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!.select({ count: count() }).from(schema.supplierTable)

    return { rows: rows ?? [], count: total[0].count }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0 }
  }
}) satisfies PageServerLoad