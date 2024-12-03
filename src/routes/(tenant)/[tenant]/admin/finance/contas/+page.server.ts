import { contasPagarTable } from '$lib/server/db/schema'
import {
  getSQLiteColumn,
  withOrderBy,
  withPagination,
} from '$lib/server/db/utils'
import type { PageServerLoad } from './$types'
import * as schema from '$lib/server/db/schema'
import { and, count, like, sql } from 'drizzle-orm'
import { stock } from '$lib/server/db/controller'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 100)

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const titulo = searchParams.get('titulo')

  const condicoes = [
    titulo ? like(schema.contasPagarTable.titulo, `${titulo}%`) : undefined,
  ]

  const fornecedores = await stock(tenantDb!).getSupplier()

  try {
    let query = tenantDb!
      .select()
      .from(contasPagarTable)
      .where(and(...condicoes))
      .$dynamic()

    if (sortId && sortOrder) {
      query = withOrderBy(
        query,
        getSQLiteColumn(schema.contasPagarTable, sortId),
        sortOrder,
      )
    }
    const rows = await withPagination(query, page, pageSize)

    const total = await tenantDb!
      .select({ count: count() })
      .from(contasPagarTable)
      .where(and(...condicoes))
      .$dynamic()

    const totalSumResult = await tenantDb!
      .select({
        totalSum: sql<number>`SUM(${schema.contasPagarTable.valor_conta})`,
      })
      .from(contasPagarTable)
      .where(and(...condicoes))
      .$dynamic()

    const totalSum = totalSumResult[0]?.totalSum ?? 0

    return { rows: rows ?? [], count: total[0].count, totalSum,fornecedores }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0,fornecedores:[] }
  }
}) satisfies PageServerLoad
