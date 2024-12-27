import type { PageServerLoad } from './$types';

import * as s from '$db/schema'
import { desc, eq, sql, and } from 'drizzle-orm'

const LIMIT = 10 as const;

export const load = (async ({ locals : { tenantDb : db }, url }) => {
  const searchParams = url.searchParams;
  const startDate = searchParams.get('startDate') ?? "timestanp";
  const endDate = searchParams.get('endDate') ?? "timestanp";

  console.log(getTotalDelivered);

  return {
    startDate,
    endDate,
  };
}) satisfies PageServerLoad;