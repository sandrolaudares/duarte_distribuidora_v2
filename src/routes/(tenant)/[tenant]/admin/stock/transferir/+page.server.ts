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

export const actions: Actions = {
  default: async ({ request }) => {
    try {
      const formData = await request.formData()
      const data: InsertStockTransference[] = JSON.parse(formData.get('data') as string) 
      console.log(data)
      
      const result = await solicitarTransference(data)

      console.log(result)

      return {
        success: true,
        result,
      }
    } catch (error) {
      console.error('Erro ao solicitar', error)
      return fail(500, { message: 'Erro interno no servidor' })
    }
  },
}
