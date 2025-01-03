import type { PageServerLoad } from './$types';

export const load = (async () => {
  
  return {
    // TODO: Relatório de recebimentos atingido (ex: essa semana tem o total de 50 mil de fiados para receber e já recebemos 25%
    // TODO: Relatório financeiro de fiados em atraso. Mostrando os clientes pessoa jurídica por ordem de atraso.
    totalOutstandingCreditArrears : 213213.123,
  };
}) satisfies PageServerLoad;