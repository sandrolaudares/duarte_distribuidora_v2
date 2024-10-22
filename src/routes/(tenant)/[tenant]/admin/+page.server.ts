import type { PageServerLoad } from './$types'
import { getRowCount } from '$db/utils'
import { customerTable, productItemTable, customerOrderTable } from '$db/schema'

import { bugReport } from '$lib/server/db/controller'
import { error } from '@sveltejs/kit'
export const load = (async ({locals:{tenantDb}}) => {
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

    console.log(recentActivity)

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
