import type { PageServerLoad } from './$types';

import * as s from '$db/schema'
import { desc, eq, sql, and } from 'drizzle-orm'

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

  console.log(getTotalDelivered);
  
  return {
    totalDelivered : await getTotalDelivered,
    TotalDeliveryFees : 156894.00,
    cancelingOrders : 31,
    bestProduct : "Brahma Latão",
    
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

    areaHighestNumberDeliveries : [
      {
        endereco : "Caiçara",
        total : 78
      },
      {
        endereco : "Pedra azul",
        total : 55
      },
      {
        endereco : "Coracao Eucaristico",
        total : 43
      }
    ],

    

    startDate,
    endDate,
  };
}) satisfies PageServerLoad;