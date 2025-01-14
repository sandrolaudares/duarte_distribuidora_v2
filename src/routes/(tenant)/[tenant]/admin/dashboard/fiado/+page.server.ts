import type { PageServerLoad } from './$types';

export const load = (async () => {
  
  return {
    // TODO: Relatório com todos os clientes com dívida ativa e o total de recebimentos atingido (ex: essa semana tem o total de 50 mil de fiados para receber e já recebemos 47 mil
    corporateClientsSortedDelayOrder : [
      {
        debtorName : "Fulano de Tal",
        totalDebt : 100.00,
        totalPaid : 45.48
      },
      {
        debtorName : "Ciclano de Tal",
        totalDebt : 100.00,
        totalPaid : 99.00
      },
      {
        debtorName : "Beltrano de Tal",
        totalDebt : 100.00,
        totalPaid : 21.00
      }
    ]
  };
}) satisfies PageServerLoad;