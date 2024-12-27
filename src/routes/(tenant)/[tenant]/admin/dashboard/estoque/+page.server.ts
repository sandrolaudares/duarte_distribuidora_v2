import type { PageServerLoad } from './$types';

export const load = (async () => {
  
  return {
    totalItemsStock : 0,
    stockInStockOut : 231321,
    highestCategory : {
      name : 'Bebidas',
      amount : 231321
    },
    highestProduct : {
      name : 'Cerveja',
      amount : 231321
    },

    // 
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
    highestTurnoverCategory : [
      {
        category : 'Destilados',
        product : 'Whisky white horse 1 litro',
        amount : 231321
      },
      {
        category : 'Cevada',
        product : 'Heiniken long neck',
        amount : 54564 
      },
      {
        category : 'Agua',
        product : 'Agua mineral',
        amount : 45665
      }
    ],
    stockDistributionByCategory : [
      {
        category : 'Destilados',
        amount : '25%'
      },
      {
        category : 'Fermentados',
        amount : '33%'
      },
      {
        category : 'Churrasco',
        amount : '33%'
      },
      {
        category : 'Whisky',
        amount : '9%'
      }
    ],

    productsWithLowStock : [

    ]
  };
}) satisfies PageServerLoad;