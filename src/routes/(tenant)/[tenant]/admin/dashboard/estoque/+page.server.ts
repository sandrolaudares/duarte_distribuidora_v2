/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'
import { asc, count, eq, lte } from 'drizzle-orm'
import * as s from '$db/schema'
import { withinDate } from '$db/utils'

export const load = (async ({ locals: { tenantDb: db }, url }) => {
  const getTotalItemsStock = db!
    .select({ count: count(s.productItemTable.id) })
    .from(s.productItemTable)

  const getQuantEntrada = db!
    .select({ count: count(s.stockTransactionTable.quantity) })
    .from(s.stockTransactionTable)
    .where(eq(s.stockTransactionTable.type, 'Entrada'))
  const getQuantSaida = db!
    .select({ count: count(s.stockTransactionTable.quantity) })
    .from(s.stockTransactionTable)
    .where(eq(s.stockTransactionTable.type, 'Saida'))

  const getProductsWithLowestStock = db!
    .select()
    .from(s.skuTable)
    .where(lte(s.skuTable.quantity, 20))
    // .where(lte(s.skuTable.quantity, s.skuTable.minimium))
    .orderBy(asc(s.skuTable.quantity))
    .limit(50)
  const [totalItemsStock, quantSaida, quantEntrada, skuLowStock] =
    await Promise.all([
      getTotalItemsStock,
      getQuantEntrada,
      getQuantSaida,
      getProductsWithLowestStock,
    ])
  return {
    totalItemsStock,
    quantSaida: quantSaida[0].count,
    quantEntrada: quantEntrada[0].count,
    skuLowStock: skuLowStock,
  }
}) satisfies PageServerLoad
