/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
} from '$lib/server/db/utils'
import { and, eq, SQL, count, like } from 'drizzle-orm'
import { centralDb } from '$lib/server/db/central'
import { stockTransference } from '$lib/server/db/central/schema'

export const load = (async ({ url, locals: { tenantDb, tenantInfo } }) => {
  const id = tenantInfo?.tenantId

  if (!id) {
    throw new Error('Id inválido')
  }
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 10)

  const name = searchParams.get('sku_name')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  const condicoes = [
    name
      ? like(stockTransference.sku_name, `${name}%`)
      : undefined,
  ]

  const baseConditions = and(
    eq(stockTransference.status, 'ACCEPTED'),
    eq(stockTransference.fromTenantId, id),
    ...condicoes
  )

  let query = centralDb!
    .select()
    .from(stockTransference)
    .where(
      baseConditions
    ).$dynamic()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(stockTransference, sortId),
      sortOrder,
    )
  }

  try {
    const rows = await withPagination(query, page, pageSize)
    console.log(rows)

    const total = await centralDb!
      .select({ count: count() })
      .from(stockTransference)
    .where(
      baseConditions
    ).$dynamic()

    return { rows: rows ?? [], count: total[0].count }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0 }
  }
}) satisfies PageServerLoad
