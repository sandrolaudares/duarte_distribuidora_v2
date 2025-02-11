/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
  innerJoinOnMany,
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
  type AnyColumn,
} from 'drizzle-orm'
import { customer } from '$lib/server/db/controller'
import { gte } from 'drizzle-orm'
import { Monad } from '$lib/utils'
import { pageConfig } from '$lib/config'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

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
    //TODO: Filtro nao fnciona legal, ao deletar nao reseta
    dateStart && dateEnd
      ? and(
          gte(
            schema.customerOrderTable.created_at,
            new Date(Number(dateStart)),
          ),
          lte(schema.customerOrderTable.created_at, new Date(Number(dateEnd))),
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

    atrasados
      ? lte(schema.customerOrderTable.expire_at, new Date())
      : undefined,
  ]

  try {
    let query = Monad.of(
      tenantDb!
        .select({
          //Order:
          id: schema.customerOrderTable.id,
          created_at: schema.customerOrderTable.created_at,
          updated_at: schema.customerOrderTable.updated_at,
          is_fiado: schema.customerOrderTable.is_fiado,
          observation: schema.customerOrderTable.observation,
          amount_paid: schema.customerOrderTable.amount_paid,
          total: schema.customerOrderTable.total,
          status: schema.customerOrderTable.status,
          type: schema.customerOrderTable.type,
          expire_at: schema.customerOrderTable.expire_at,

          //customer:
          name: schema.customerTable.name,
          email: schema.customerTable.email,
          cellphone: schema.customerTable.cellphone,

          //cashier
          cashier: schema.cashierTable.name,
        })
        .from(schema.customerOrderTable)
        .where(
          and(
            gt(
              schema.customerOrderTable.total,
              schema.customerOrderTable.amount_paid,
            ),
            eq(schema.customerOrderTable.is_fiado, true),
            ...condicoes,
          ),
        )
        .$dynamic(),
    )
      .map(query =>
        innerJoinOnMany(query, schema.customerTable, [
          eq(schema.customerTable.id, schema.customerOrderTable.customer_id),
          name ? like(schema.customerTable.name, `%${name}%`) : undefined,
        ]),
      )
      .map(query =>
        innerJoinOnMany(query, schema.cashierTable, [
          eq(schema.cashierTable.id, schema.customerOrderTable.cachier_id),
        ]),
      )
      .get()

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

    const [totalSumResult] = await tenantDb!
      .select({
        totalSum: sql<number>`SUM(${schema.customerOrderTable.total})`,
      })
      .from(schema.customerOrderTable)
      .innerJoin(
        schema.customerTable,
        and(
          name ? like(schema.customerTable.name, `%${name}%`) : undefined,
          eq(schema.customerTable.id, schema.customerOrderTable.customer_id),
        ),
      )
      .leftJoin(
        schema.cashierTable,
        eq(schema.cashierTable.id, schema.customerOrderTable.cachier_id),
      )
      .where(
        and(
          gt(
            schema.customerOrderTable.total,
            schema.customerOrderTable.amount_paid,
          ),
          eq(schema.customerOrderTable.is_fiado, true),
          ...condicoes,
          name ? like(schema.customerTable.name, `%${name}%`) : undefined,
        ),
      )
      .$dynamic()

    const totalSum = totalSumResult?.totalSum ?? 0

    return { rows: rows ?? [], count: total[0].count, totalSum }
  } catch (error) {
    console.error(error)
    return { rows: [], count: 0, totalSum: 0 }
  }
}) satisfies PageServerLoad
