import type { PageServerLoad } from './$types'
import { getRowCount } from '$db/utils'
import { customerTable, productItemTable, customerOrderTable } from '$db/schema'

import { bugReport } from '$lib/server/db/controller'
export const load = (async () => {
  const [
    [{ count: customerCount }],
    [{ count: productCount }],
    [{ count: orderCount }],
    recentActivity,
  ] = await Promise.all([
    getRowCount(customerTable),
    getRowCount(productItemTable),
    getRowCount(customerOrderTable),
    bugReport.getLogs(),
  ])

  console.log(recentActivity)

  return {
    customerCount,
    productCount,
    orderCount,
    recentActivity,
  }
}) satisfies PageServerLoad
