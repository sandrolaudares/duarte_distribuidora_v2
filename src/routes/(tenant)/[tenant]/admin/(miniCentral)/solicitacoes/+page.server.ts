import {
  acceptTransference,
  getCurrentTransfers,
  getDistribuidoras,
  refuseTransference,
} from '$lib/server/db/central/constroller'
import { fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { stockTransference } from '$lib/server/db/central/schema'
import { centralDb } from '$lib/server/db/central'
import { eq } from 'drizzle-orm'

export const load = (async ({ depends }) => {
  depends('central:transferir')
  try {
    const solicitacoes = await getCurrentTransfers()
    const distribuidoras = await getDistribuidoras()

    return { solicitacoes, distribuidoras }
  } catch (error) {
    console.error(error)
    return { solicitacoes: [], distribuidoras: [] }
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  refuse: async ({ request }) => {
    const formData = await request.formData()
    const id = Number(formData.get('id'))

    if (!id) {
      return fail(400, { success: false, message: 'Item é obrigatório' })
    }

    try {
      await refuseTransference(id)
      return { success: true, message: 'Recusado com sucesso' }
    } catch (err) {
      console.error(err)
      return fail(400, { success: false, message: 'Erro ao deletar item' })
    }
  },
  send: async ({ request }) => {
    const formData = await request.formData()
    console.log(formData)
    const id = Number(formData.get('id'))
    const fromId = Number(formData.get('fromId'))

    console.log(formData)

    try {
      await centralDb
        .update(stockTransference)
        .set({ fromTenantId: fromId })
        .where(eq(stockTransference.id, id))

      const resp = await acceptTransference(id)

      console.log(resp)

      return resp
    } catch (error) {
      console.error(error)
      return fail(400, { success: false, message: 'Erro ao enviar' })
    }
  },
  update: async ({ request }) => {
    const formData = await request.formData()
    const quantity = await Number(formData.get('quantity'))
    const id = Number(formData.get('id'))

    if (isNaN(quantity)) {
      return fail(400, {
        success: false,
        message: 'Quantidade não é um número',
      })
    }

    try {
      await centralDb
        .update(stockTransference)
        .set({ quantity: quantity })
        .where(eq(stockTransference.id, id))
      return { success: true, message: 'Sucesso ao editar quantidade' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  },
}
