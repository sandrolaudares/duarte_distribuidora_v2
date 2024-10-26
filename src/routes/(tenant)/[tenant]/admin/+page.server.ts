import type { PageServerLoad } from './$types'
import { customerTable, productItemTable, customerOrderTable } from '$db/schema'

import { bugReport } from '$lib/server/db/controller'
import { error } from '@sveltejs/kit'
import { count } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'


export const load = (async ({locals:{tenantDb}}) => {

  function getRowCount(table:SQLiteTable){
    return tenantDb!.select({count: count()}).from(table)
  }

  try {
    const [
      [{ count: customerCount }],
      [{ count: productCount }],
      [{ count: orderCount }],
      recentActivity,
    ] = await Promise.all([
      getRowCount(customerTable),
      getRowCount(productItemTable),
      getRowCount(customerOrderTable),
      bugReport(tenantDb!).getLogs(),
    ])

    return {
      customerCount,
      productCount,
      orderCount,
      recentActivity,
    }
  } catch (e) {
    console.error(e)
    return error(500, "Couldn't load page")
  }
}) satisfies PageServerLoad
