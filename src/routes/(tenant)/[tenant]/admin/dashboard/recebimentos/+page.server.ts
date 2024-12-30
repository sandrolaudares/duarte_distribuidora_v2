import type { PageServerLoad } from './$types';

import * as s from '$db/schema'
import { desc, eq, sql, and } from 'drizzle-orm'

const LIMIT = 10 as const;

export const load = (async ({ locals : { tenantDb : db }, url }) => {
  const searchParams = url.searchParams;
  const startDate = searchParams.get('startDate') ?? "timestanp";
  const endDate = searchParams.get('endDate') ?? "timestanp";

  

  return {
    // TODO: Relatório de recebimentos atingido (ex: essa semana tem o total de 50 mil de fiados para receber e já recebemos 25%). 
    // TODO: Mostrar todos os clientes PJ que tem dívida ativa, do maior para o menor 
    startDate,
    endDate,
  };
}) satisfies PageServerLoad;