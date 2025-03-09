import { contasPagarTable } from '$lib/server/db/schema'
import {
  getSQLiteColumn,
  withOrderBy,
  withPagination,
} from '$lib/server/db/utils'
import type { PageServerLoad } from './$types'
import * as schema from '$lib/server/db/schema'
import { and, asc, count, eq, gte, like, lte, sql } from 'drizzle-orm'
import { stock } from '$lib/server/db/controller'
import { pageConfig } from '$lib/config'
import { Monad } from '$lib/utils'
import { innerJoinOnMany } from '$lib/server/db/utils'
import type { TenantDbType } from '$lib/server/db/tenant'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const titulo = searchParams.get('titulo')
  const fornecedor = searchParams.get('supName')
  const categoria = searchParams.get('catId')
  const catId = Number(categoria)

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  const pagosParams = searchParams.get('isPaid')
  const pagos =
    pagosParams === 'paid'
      ? true
      : pagosParams === 'unpaid'
        ? false
        : pagosParams === 'todos'
          ? undefined
          : undefined

  const condicoes = [
    titulo ? like(schema.contasPagarTable.titulo, `%${titulo}%`) : undefined,
    pagos !== undefined ? eq(schema.contasPagarTable.isPaid, pagos) : undefined,
    dateStart && dateEnd
      ? and(
          gte(schema.contasPagarTable.paid_at, new Date(Number(dateStart))),
          lte(schema.contasPagarTable.paid_at, new Date(Number(dateEnd))),
        )
      : undefined,
  ]

  const fornecedores = await stock(tenantDb!).getSupplier()
  const categorias = await tenantDb!.select().from(schema.categoriaConta)
  const tipoPagamentoConta = await tenantDb!
    .select()
    .from(schema.tipoPagamentoConta)

  try {
    const cte = tenantDb!.select().from(contasPagarTable).as('cte')

    const _withs = (drizzle: TenantDbType) => drizzle.with(cte)

    const _joins = <T extends SQLiteSelect>(qb: T) => {
      return Monad.of(qb)
        .map(query =>
          innerJoinOnMany(query, schema.supplierTable, [
            eq(schema.supplierTable.id, schema.contasPagarTable.fornecedor_id),
            fornecedor
              ? like(schema.supplierTable.name, `%${fornecedor}%`)
              : undefined,
          ]),
        )
        .map(query =>
          innerJoinOnMany(query, schema.categoriaConta, [
            eq(schema.categoriaConta.id, schema.contasPagarTable.categoria_id),
            categoria ? eq(schema.categoriaConta.id, catId) : undefined,
          ]),
        )
        .map(query =>
          innerJoinOnMany(query, schema.tipoPagamentoConta, [
            eq(
              schema.tipoPagamentoConta.id,
              schema.contasPagarTable.pagamento_id,
            ),
          ]),
        )
        .get()
        .orderBy(
          sql`CASE WHEN ${schema.contasPagarTable.isPaid} = false THEN 0 ELSE 1 END`,
          asc(schema.contasPagarTable.expire_at),
        )
    }

    const _countSelectBuilder = (drizzle: TenantDbType) =>
      _withs(drizzle).select({ count: count() })

    const queryCount = (drizzle: TenantDbType) =>
      _joins(
        _countSelectBuilder(drizzle).from(schema.contasPagarTable).$dynamic(),
      )

    const _tontalSumSelectBuilder = (drizzle: TenantDbType) =>
      _withs(drizzle).select({
        sum: sql<number>`SUM(${schema.contasPagarTable.valor_conta})`,
      })

    const queryTotalSum = (drizzle: TenantDbType) =>
      _joins(
        _tontalSumSelectBuilder(drizzle)
          .from(schema.contasPagarTable)
          .$dynamic(),
      )

    const _itemsSelectBuilder = (drizzle: TenantDbType) =>
      _withs(drizzle).select({
        titulo: schema.contasPagarTable.titulo,
        id: schema.contasPagarTable.id,
        descricao: schema.contasPagarTable.descricao,
        isPaid: schema.contasPagarTable.isPaid,
        expire_at: schema.contasPagarTable.expire_at,
        valor_conta: schema.contasPagarTable.valor_conta,
        paid_at: schema.contasPagarTable.paid_at,

        catName: schema.categoriaConta.nome,

        supName: schema.supplierTable.name,

        pagName: schema.tipoPagamentoConta.nome,
      })

    const queryItems = (drizzle: TenantDbType) =>
      _joins(
        _itemsSelectBuilder(drizzle).from(schema.contasPagarTable).$dynamic(),
      )

    let query = queryItems(tenantDb!).where(and(...condicoes))

    if (sortId && sortOrder) {
      query = withOrderBy(
        query,
        getSQLiteColumn(schema.contasPagarTable, sortId),
        sortOrder,
      )
    }
    const rows = await withPagination(query, page, pageSize)
    const [total] = await queryCount(tenantDb!).where(and(...condicoes))
    const [totalSum] = await queryTotalSum(tenantDb!).where(and(...condicoes))

    return {
      rows: rows ?? [],
      count: total.count,
      totalSum: totalSum.sum,
      fornecedores,
      categorias,
      tipoPagamentoConta,
    }
  } catch (error) {
    console.error(error)
    return {
      rows: [],
      count: 0,
      totalSum: 0,
      fornecedores: [],
      categorias: [],
      tipoPagamentoConta: [],
    }
  }
}) satisfies PageServerLoad
