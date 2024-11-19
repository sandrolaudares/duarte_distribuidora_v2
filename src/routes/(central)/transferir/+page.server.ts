import {
  getCurrentTransfers,
  getDistribuidoras,
} from '$lib/server/db/central/constroller'
import type { PageServerLoad } from './$types'

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
