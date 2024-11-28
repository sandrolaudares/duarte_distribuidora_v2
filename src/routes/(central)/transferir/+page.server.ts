import {
  acceptTransference,
  getCurrentTransfers,
  getDistribuidoras,
  refuseTransference,
} from '$lib/server/db/central/constroller'
import { fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

export const load = (async () => {
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
      return { success: true }
    } catch (err) {
      console.error(err)
      return fail(400, { success: false, message: 'Erro ao deletar item' })
    }
  },
  send: async ({ request }) => {
    const formData = await request.formData()
    console.log(formData)
    const id = Number(formData.get('id'))
    console.log(id)


    // if (!fromId) {
    //   return fail(400, { success: false, message: 'Selecione distribuidora' })
    // }

    try {

      return {success:true}
    } catch (error) {
      console.error(error)
      return fail(400, { success: false, message: 'Erro ao enviar' })
    }
  },
}
