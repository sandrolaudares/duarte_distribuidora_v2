import type { PageServerLoad } from './$types';

import * as s from '$db/schema'
import { eq, sql, and } from 'drizzle-orm'

const LIMIT = 10 as const;

export const load = (async ({ locals : { tenantDb : db }, url }) => {
  const searchParams = url.searchParams;
  const startDate = searchParams.get('startDate') ?? "timestanp";
  const endDate = searchParams.get('endDate') ?? "timestanp";

  const getTotalDelivered = db!
    .select({
      totalDelivered : sql<number>`${s.customerOrderTable.type}`
    })
    .from(s.customerOrderTable)
    .where(and(eq(s.customerOrderTable.type, "DELIVERY"), eq(s.customerOrderTable.status, "ENDED")))      
    .limit(LIMIT);
  
  return {
    // TODO: Conferir se está certo
    totalDelivered : await getTotalDelivered,
    // TODO: Distância total de corridas
    TotalDeliveryFees : 156894.00,
    // TODO: Pedidos deliveris cancelados
    cancelingOrders : 31,
    // TODO: Produtos que mais foram entregues
    bestProduct : "Brahma Latão",
    
    //TODO: Relatório Motoboy (Soma a quantidade de entrega e o valor total das taxas de entrega)
    couriersHighestNumberDeliveries : [
      {
        name :  "Vitor",
        numberDeliveries : 78
      },
      {
        name :  "Gustavo",
        numberDeliveries : 55
      }
    ],
    averageDeliveryTime : [
      {
        day : "Segunda",
        time : "11:12"
      },
      {
        day : "Terça",
        time : "11:12"
      },  
    ],

    startDate,
    endDate,
  };
}) satisfies PageServerLoad;