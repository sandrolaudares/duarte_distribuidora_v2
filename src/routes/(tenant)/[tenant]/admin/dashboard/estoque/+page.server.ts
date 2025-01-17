/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'
import { and, asc, count, eq, gte, lte } from 'drizzle-orm'
import * as s from '$db/schema'
import { withinDate2 } from '$db/utils'
import { subDays } from 'date-fns'

export const load = (async ({ locals: { tenantDb: db }, url }) => {
  const searchParams = url.searchParams
  
  const sp_start_date = searchParams.get('startDate')
  const sp_end_date = searchParams.get('endDate')

  const startDate =
    typeof sp_start_date === 'string'
      ? new Date(Number(sp_start_date))
      : subDays(new Date(), 7)

  const endDate =
    typeof sp_end_date === 'string' ? new Date(Number(sp_end_date)) : new Date()
  
  const getTotalItemsStock = db!
    .select({ count: count(s.productItemTable.id) })
    .from(s.productItemTable)
    .where(
      and(gte(s.productItemTable.created_at, new Date(Number(startDate))), 
      lte(s.productItemTable.created_at, new Date(Number(endDate)))))
    .$dynamic()

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
    // TODO: Colocar o estoque mínimo daquele produto para passar pro front
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
