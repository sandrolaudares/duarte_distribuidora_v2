/* eslint-disable @typescript-eslint/no-unused-vars */
import { contasPagarTable } from '$lib/server/db/schema'
import {
  getSQLiteColumn,
  withOrderBy,
  withPagination,
  _withs,
  getDateRangeCondition
} from '$lib/server/db/utils'
import type { PageServerLoad } from './$types'
import * as schema from '$lib/server/db/schema'
import { and, asc, count, eq, gte, like, lte, sql } from 'drizzle-orm'
import { stock } from '$lib/server/db/controller'
import { pageConfig } from '$lib/config'
import { Monad } from '$lib/utils'
import { innerJoinOnMany } from '$lib/server/db/utils'
import type { SQLiteSelect } from 'drizzle-orm/sqlite-core'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const titulo = searchParams.get('titulo')

  const fornecedor = searchParams.get('supName')
  const fornId = Number(fornecedor)

  const categoria = searchParams.get('catName')
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
    getDateRangeCondition(dateStart, dateEnd,schema.contasPagarTable.paid_at),
  ]

  try {
    const cte = tenantDb!.select().from(contasPagarTable).as('cteContas')

    const _joins = <T extends SQLiteSelect>(qb: T) => {
      return Monad.of(qb)
        .map(query =>
          innerJoinOnMany(query, schema.supplierTable, [
            eq(schema.supplierTable.id, schema.contasPagarTable.fornecedor_id),
            fornId
              ? eq(schema.supplierTable.id, fornId)
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

    const _countSelectBuilder = () =>
      _withs(tenantDb!, cte).select({ count: count() })

    const queryCount = () =>
      _joins(_countSelectBuilder().from(schema.contasPagarTable).$dynamic())

    const _countSumBuilder = () =>
      _withs(tenantDb!, cte).select({
        sum: sql<number>`SUM(${schema.contasPagarTable.valor_conta})`,
      })

    const queryTotalSum = () =>
      _joins(_countSumBuilder().from(schema.contasPagarTable).$dynamic())

    const _itemsSelectBuilder = () =>
      _withs(tenantDb!, cte).select({
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

    const queryItems = () =>
      _joins(_itemsSelectBuilder().from(schema.contasPagarTable).$dynamic())

    let query = queryItems().where(and(...condicoes))

    if (sortId && sortOrder) {
      query = withOrderBy(
        query,
        getSQLiteColumn(schema.contasPagarTable, sortId),
        sortOrder,
      )
    }
    const rows = await withPagination(query, page, pageSize)
    const [total] = await queryCount().where(and(...condicoes))
    const [totalSum] = await queryTotalSum().where(and(...condicoes))

    return {
      rows: rows ?? [],
      count: total.count,
      totalSum: totalSum.sum,
    }
  } catch (error) {
    console.error(error)
    return {
      rows: [],
      count: 0,
      totalSum: 0,
    }
  }
}) satisfies PageServerLoad
