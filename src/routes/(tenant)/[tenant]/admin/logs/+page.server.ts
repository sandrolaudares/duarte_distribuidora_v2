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
import { bugReport, customer } from '$lib/server/db/controller'
import { gte } from 'drizzle-orm'
import { error } from '@sveltejs/kit'
import { pageConfig } from '$lib/config'

export const load = (async ({ url, locals: { tenantDb } }) => {
  const { searchParams } = url
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? pageConfig.rowPages)

  const name = searchParams.get('user_name')
  const text = searchParams.get('text')
  const type = searchParams.get('type')

  const sortId = searchParams.get('sort_id')
  const sortOrder = searchParams.get('sort_direction')

  const dateStart = searchParams.get('startDate')
  const dateEnd = searchParams.get('endDate')

  let query = bugReport(tenantDb!)
    .allLogs()
    .orderBy(desc(schema.logsTable.created_at))
    .$dynamic()
    .where(
      and(
        name ? like(schema.userTable.username, `${name}%`) : undefined,
        text ? like(schema.logsTable.text, `${text}%`) : undefined,
        type ? like(schema.logsTable.type, `${type}%`) : undefined,
        dateStart && dateEnd
          ? and(
              gte(schema.logsTable.created_at, new Date(Number(dateStart))),
              lte(schema.logsTable.created_at, new Date(Number(dateEnd))),
            )
          : undefined,
      ),
    )

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
    .from(schema.logsTable)

  return { rows: rows ?? [], count: total[0].count }
  // } catch (err) {
  //   return error(404, err.message ?? "unknow error")
  //   console.error(err)
  //   return { rows: [], count: 0, totalSum: 0 }
  // }

  //TODO: Com trycatch ta dando de tipo na page, arrumar o TRY CATCH
}) satisfies PageServerLoad
