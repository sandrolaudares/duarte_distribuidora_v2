import type { PageServerLoad } from './$types';
import { count } from 'drizzle-orm';
import * as s from '$db/schema'

export const load = (async ({ locals: { tenantDb : db }, url }) => {
  
  const getTotalItemsStock = db!
  .select({count : count(s.productItemTable.id)})
  .from(s.productItemTable)

  return {
    // TODO: Total de itens no estoque
    totalItemsStock : await getTotalItemsStock,
    // TODO: Entrada e saida naquele periodo
    stockInStockOut : 231321,
    // TODO: Categoria com menor quantidade de produtos
    lowestCategory : {
      name : 'Bebidas',
      amount : 231321
    },
    // TODO: Produto que com menor quantidade
    lowestProduct : {
      name : 'Cerveja',
      amount : 231321
    },

    // TODO: Produtos com estoque abaixo do mínimo, não foi especificado qual é esse minimo
    // não sei se é fixo ou se varia de cada produto e é definido no momento do cadastro
    stockBelowMinimumLevels : [
      {
        name : 'Brahma latão',
        minimium : 231321,
        are : 5415
      },
      {
        name : 'Skol beats',
        amount : 7774,
        are : 5415
      },
      {
        name : 'Carvão de 2 quilos',
        amount : 231321,
        are : 5415
      }
    ],
    


  };
}) satisfies PageServerLoad;