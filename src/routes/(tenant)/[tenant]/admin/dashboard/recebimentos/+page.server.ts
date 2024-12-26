import type { PageServerLoad } from './$types';

export const load = (async ({ locals : { tenantDb : db }, url }) => {
  const searchParams = url.searchParams;
  const startDate = searchParams.get('startDate') ?? "timestanp";
  const endDate = searchParams.get('endDate') ?? "timestanp";


  return {
    
  };
}) satisfies PageServerLoad;