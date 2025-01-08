import type { PageServerLoad } from './$types';

import * as s from '$db/schema'
import { eq, sql, and } from 'drizzle-orm'

const LIMIT = 10 as const;

export const load = (async ({ locals : { tenantDb : db }, url }) => {
  const searchParams = url.searchParams;
  const startDate = searchParams.get('startDate') ?? "timestanp";
  const endDate = searchParams.get('endDate') ?? "timestanp";
  
  return {
    // TODO: Total de corridas completas
    totalDeliveredCompleted : 150,

    // TODO: Distância total de corridas
    TotalDeliveryFees : 156894.00,

    // TODO: Pedidos deliveris cancelados
    cancelingOrders : 31,

    // TODO: Produtos que mais foram vendidos na modalidade delivery
    bestProduct : "Brahma Latão",
    
    // TODO: Relatório Motoboy (Soma a quantidade de entrega e o valor total das taxas de entrega) -> Solicitado pelo Marlon
    couriersHighestNumberDeliveries : [
      {
        name :  "Vitor",
        numberDeliveries : 78,
        totalAmountDeliveryFees : 200.54
      },
      {
        name :  "Gustavo",
        numberDeliveries : 55,
        totalAmountDeliveryFees : 123.00
      },
      {
        name :  "Pedro",
        numberDeliveries : 55,
        totalAmountDeliveryFees : 123.00
      },
    ],

    startDate,
    endDate,
  };
}) satisfies PageServerLoad;