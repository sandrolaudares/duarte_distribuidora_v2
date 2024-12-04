import { contasPagarTable } from '$lib/server/db/schema'
import {
  getSQLiteColumn,
  withOrderBy,
  withPagination,
} from '$lib/server/db/utils'
import type { PageServerLoad } from './$types'
import * as schema from '$lib/server/db/schema'
import { and, asc, count, eq, like, sql } from 'drizzle-orm'
import { stock } from '$lib/server/db/controller'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 100)

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const titulo = searchParams.get('titulo')
  const fornecedor = searchParams.get('supName')
  const categoria = searchParams.get('catName')

  const pagosParams = searchParams.get('isPaid')
  console.log(pagosParams)
  const pagos = pagosParams === 'paid' ? true : pagosParams === 'unpaid' ? false : pagosParams ==='todos'? undefined :undefined

  console.log(pagos)

  const condicoes = [
    titulo ? like(schema.contasPagarTable.titulo, `${titulo}%`) : undefined,
    pagos !== undefined ? eq(schema.contasPagarTable.isPaid, pagos) : undefined,
  ]

  const fornecedores = await stock(tenantDb!).getSupplier()
  const categorias = await tenantDb!.select().from(schema.categoriaConta)

  try {
    let query = tenantDb!
      .select({
        titulo: schema.contasPagarTable.titulo,
        id: schema.contasPagarTable.id,
        descricao: schema.contasPagarTable.descricao,
        isPaid: schema.contasPagarTable.isPaid,
        expire_at: schema.contasPagarTable.expire_at,
        valor_conta: schema.contasPagarTable.valor_conta,

        catName: schema.categoriaConta.nome,

        supName: schema.supplierTable.name,
      })
      .from(contasPagarTable)
      .innerJoin(
        schema.supplierTable,
        and(
          fornecedor
            ? like(schema.supplierTable.name, `${fornecedor}%`)
            : undefined,
          eq(schema.supplierTable.id, contasPagarTable.fornecedor_id),
        ),
      )
      .leftJoin(
        schema.categoriaConta,
        and(
          categoria
            ? like(schema.categoriaConta.nome, `${categoria}%`)
            : undefined,
          eq(schema.categoriaConta.id, contasPagarTable.categoria_id),
        ),
      )
      .$dynamic()
      .where(and(...condicoes))
      .orderBy(asc(schema.contasPagarTable.expire_at))

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

    return {
      rows: rows ?? [],
      count: total[0].count,
      totalSum,
      fornecedores,
      categorias,
    }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0, fornecedores: [], categorias: [] }
  }
}) satisfies PageServerLoad
