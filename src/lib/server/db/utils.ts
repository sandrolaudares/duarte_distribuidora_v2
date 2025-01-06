/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  and,
  asc,
  count,
  desc,
  gte,
  gt,
  lt,
  like,
  lte,
  SQL,
  sql,
  type AnyColumn,
} from 'drizzle-orm'
import {
  SQLiteTable,
  getTableConfig,
  integer,
  type SQLiteSelect,
} from 'drizzle-orm/sqlite-core'

// export async function tableHelper<T extends SQLiteSelect>(
//   qb: T,
//   table: SQLiteTable,
//   seach_column: string,
//   state: TableState,
// ) {
//   const { page = 1, pageSize = 15, sort: order, search } = state
//   if (order) {
//     qb = withOrderBy2(qb, table, order.field, order.direction)
//   }
//   if (search) {
//     qb = withSearch(qb, table, search, seach_column)
//   }
//   const [rows, total] = await Promise.all([
//     await withPagination(qb, page, pageSize),
//     await getRowCount(table),
//   ])
//   return {
//     rows,
//     total: total[0].count,
//   }
// }

export function withPagination<T extends SQLiteSelect>(
  qb: T,
  page: number = 1,
  pageSize: number = 10,
) {
  return qb.limit(pageSize).offset((page - 1) * pageSize)
}

export function getSQLiteColumn<T extends SQLiteTable>(
  table: T,
  column_name: string,
) {
  const { columns } = getTableConfig(table)
  const column = columns.find(c => c.name == column_name)
  return column
}

export function getOrderBy(column: AnyColumn, order?: string) {
  return order === 'asc' ? asc(column) : desc(column)
}

export function withOrderBy<T extends SQLiteSelect>(
  qb: T,
  column?: AnyColumn,
  order?: string | 'asc' | 'desc',
) {
  if (column) {
    return qb.orderBy(getOrderBy(column, order))
  }
  return qb
}

export function withSearch<T extends SQLiteSelect>(
  qb: T,
  table: SQLiteTable,
  search: string,
  seach_colum: string,
) {
  const column = getSQLiteColumn(table, seach_colum)
  if (column) {
    return qb.where(like(column, `%${search}%`))
  }
  return qb
}

export const timestamps = {
  created_at: integer('created_at', {
    mode: 'timestamp',
  }).default(sql`(unixepoch())`),
  updated_at: integer('updated_at', {
    mode: 'timestamp',
  }).$onUpdate(() => new Date()),
  deleted_at: integer('deleted_at', {
    mode: 'timestamp',
  }),
}

export function innerJoinOnMany<T extends SQLiteSelect>(
  qb: T,
  table: SQLiteTable,
  filters: (SQL | undefined)[],
) {
  const fFilters = filters.filter(f => f !== undefined)

  if (fFilters.length === 0) {
    // console.log('No join');

    return qb
  }
  if (fFilters.length > 1) {
    // console.log('Maior que um join',fFilters);

    return qb.innerJoin(table, and(...filters))
  }
  // console.log('Um join só',filters)
  return qb.leftJoin(table, filters[0])
}

export function withinDate<T extends SQLiteSelect>(
  qb: T,
  column: AnyColumn,
  startDate: Date,
  endDate: Date,
): T {
  return qb.where(and(gte(column, startDate), lte(column, endDate)))
}
