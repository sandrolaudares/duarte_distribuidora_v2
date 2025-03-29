import type { PageServerLoad } from './$types'
import * as schema from '$lib/server/db/schema'
import { count, eq, sql, sum } from 'drizzle-orm'
import { stockTransference } from '$lib/server/db/central/schema'
import { and } from 'drizzle-orm'
import { centralDb } from '$lib/server/db/central'
import { lte } from 'drizzle-orm'

export const load = (async ({ locals: { tenantDb, tenantInfo } }) => {
  const logs = await tenantDb!
    .select()
    .from(schema.stockTransactionTable)
    .leftJoin(
      schema.skuTable,
      eq(schema.skuTable.sku, schema.stockTransactionTable.sku),
    )
    .limit(3)

  const [totalItemsStock] = await tenantDb!
    .select({ totalQuantity: sum(schema.skuTable.quantity) })
    .from(schema.skuTable)

  const [totalValueInStock] = await tenantDb!
    .select({
      totalValue: sum(
        sql`${schema.productItemTable.retail_price} * ${schema.skuTable.quantity}`,
      ),
    })
    .from(schema.productItemTable)
    .innerJoin(
      schema.skuTable,
      eq(schema.productItemTable.sku, schema.skuTable.sku),
    )

  const [totalPendingOrders] = await centralDb
    .select({
      orders: count(stockTransference),
    })
    .from(stockTransference)
    .where(
      and(
        eq(stockTransference.status, 'ACCEPTED'),
        eq(stockTransference.toTenantId, tenantInfo!.tenantId),
      ),
    )

  const [qntLowStock] = await tenantDb!
    .select({ qnt: count(schema.skuTable.sku) })
    .from(schema.skuTable)
    .where(lte(schema.skuTable.quantity, 15))

  return { logs, totalItemsStock, totalValueInStock, totalPendingOrders,qntLowStock }
}) satisfies PageServerLoad
