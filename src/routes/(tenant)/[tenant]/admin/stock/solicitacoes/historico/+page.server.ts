/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
} from '$lib/server/db/utils'
import { and, eq, SQL, count, like, gte, lte } from 'drizzle-orm'
import { centralDb } from '$lib/server/db/central'
import { stockTransference, tenants } from '$lib/server/db/central/schema'
import { getDistribuidoras } from '$lib/server/db/central/constroller'

import * as schema from '$lib/server/db/schema'

export const load = (async ({ url, locals: { tenantDb, tenantInfo },depends}) => {
  depends('tenant:solicitacoes')
  const id = tenantInfo?.tenantId

  if (!id) {
    throw new Error('Id inválido')
  }
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const size = 15
  const pageSize = Number(searchParams.get('pageSize') ?? size)

  const name = searchParams.get('sku_name')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  const condicoes = [
    name
      ? like(stockTransference.sku_name, `${name}%`)
      : undefined,
      dateStart && dateEnd
      ? and(
          gte(
            stockTransference.created_at,
            new Date(Number(dateStart)),
          ),
          lte(
            stockTransference.created_at,
            new Date(Number(dateEnd)),
          ),
        )
      : undefined,
  ]

  const baseConditions = and(
    eq(stockTransference.fromTenantId, id),
    ...condicoes
  )

  const distribuidoras = await getDistribuidoras()

  let query = centralDb!
    .select()
    .from(stockTransference)
    .where(
      baseConditions
    )
    .$dynamic()

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

    return { rows: rows ?? [], count: total[0].count ,size,distribuidoras}
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0,size ,distribuidoras:[]}
  }
}) satisfies PageServerLoad
