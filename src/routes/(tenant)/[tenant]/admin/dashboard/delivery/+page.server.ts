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
    // Texto que ele mandou: Relatório de entregas por motoboy, por período. Somando a quantidade de entregas e valor total das taxas de entregas. (Não faz muito sentido, mas foi o que ele pediu)
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

    // TODO: Ultimas dez corridas
    lastTenDeliveries : [
      {
        name :  "Vitor",
        distance : 2.8,
        value : 200.54
      },
      {
        name :  "Gustavo",
        distance : 1.8,
        value : 123.00
      },
      {
        name :  "Pedro",
        distance : 3.6,
        value : 123.00
      },
    ],

    startDate,
    endDate,
  };
}) satisfies PageServerLoad;