import type { PageServerLoad } from './$types';

export const load = (async () => {
  
  return {
    // TODO: Relatório com todos os clientes com dívida ativa e o total de recebimentos atingido (ex: essa semana tem o total de 50 mil de fiados para receber e já recebemos 47 mil
    corporateClientsSortedDelayOrder : [
      {
        nomeDevedor : "Fulano de Tal",
        totalDivida : 100.00,
        totalPago : 70.00
      }
    ]
  };
}) satisfies PageServerLoad;