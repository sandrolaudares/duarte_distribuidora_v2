/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'

import * as schema from '$lib/server/db/schema'
import {
  withPagination,
  withOrderBy,
  getSQLiteColumn,
  getOrderBy,
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
  asc,
  desc,
} from 'drizzle-orm'
import { bugReport, customer, stock } from '$lib/server/db/controller'
import { gte } from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { pageConfig } from '$lib/config'

export const load = (async ({ params,url, locals: { tenantDb } }) => {
  const skuID = params.id
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_order')

  const sku = await stock(tenantDb!).getSKUByID(skuID)

  if (!sku) {
    throw new Error("SKU not found");
}

  let query = stock(tenantDb!).getTransactionsFromProduto({sku:skuID}).$dynamic()

  if (sortId && sortOrder) {
    query = withOrderBy(
      query,
      getSQLiteColumn(schema.logsTable, sortId),
      sortOrder,
    )
  }

  // try {
  const rows = await withPagination(query, page, pageSize)

  const total = await tenantDb!
    .select({ count: count() })
    .from(schema.stockTransactionTable)
    .where(eq(schema.stockTransactionTable.sku, skuID))

  return { rows: rows ?? [], count: total[0].count,sku }
  // } catch (err) {
  //   console.error(err)
  //   return { rows: [], count: 0, totalSum: 0 }
  // }

  //TODO: Com trycatch ta dando de tipo na page, arrumar o TRY CATCH
}) satisfies PageServerLoad
