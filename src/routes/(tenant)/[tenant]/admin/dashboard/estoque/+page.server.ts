/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'
import { asc, count, eq, lte } from 'drizzle-orm'
import * as s from '$db/schema'

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

  return {
    // TODO: Total de itens no estoque
    totalItemsStock: await getTotalItemsStock,
    // TODO: Entrada e saida naquele periodo
    stockInStockOut: 231321,
    quantSaida: (await getQuantSaida)[0].count,
    quantEntrada: (await getQuantEntrada)[0].count,
    // // TODO: Categoria com menor quantidade de produtos
    // lowestCategory: {
    //   name: 'Bebidas',
    //   amount: 231321,
    // },
    // // TODO: Produto que com menor quantidade
    // lowestProduct: {
    //   name: 'Cerveja',
    //   amount: 231321,
    // },

    // TODO: Produtos com estoque abaixo do mínimo, não foi especificado qual é esse minimo
    // não sei se é fixo ou se varia de cada produto e é definido no momento do cadastro

    skuLowStock: await getProductsWithLowestStock,
    stockBelowMinimumLevels: [
      {
        name: 'Brahma latão',
        minimium: 231321,
        are: 5415,
      },
      {
        name: 'Skol beats',
        amount: 7774,
        are: 5415,
      },
      {
        name: 'Carvão de 2 quilos',
        amount: 231321,
        are: 5415,
      },
    ],
  }
}) satisfies PageServerLoad
