/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PageServerLoad } from './$types'
import { product } from '$db/controller'
import { error, fail } from '@sveltejs/kit'
import type { Actions } from '@sveltejs/kit'
// import type { InsertStockTransference } from '$lib/server/db/central/schema'
import { solicitarTransference } from '$lib/server/db/central/constroller'
import type { InsertStockTransference } from '$lib/server/db/central/schema'
export const load = (async ({ locals: { tenantDb } }) => {
  try {
    const products = await product(tenantDb!).queryProductItemsWhere()

    return {
      products,
    }
  } catch (e) {
    console.error(e)
    return error(500, JSON.stringify(e))
  }
}) satisfies PageServerLoad
