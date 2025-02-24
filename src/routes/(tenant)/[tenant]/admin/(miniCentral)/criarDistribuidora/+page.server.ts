import type { PageServerLoad, Actions } from './$types'

import { createTenant } from '$lib/server/db/central/constroller'
import { geocodeAddress } from '$lib/utils/distance'
import { zod } from 'sveltekit-superforms/adapters'
import { superValidate, message } from 'sveltekit-superforms'
import { schemaStep2 } from './schema'

export const load = (async () => {
  const form = await superValidate(zod(schemaStep2))
  return { form }
}) satisfies PageServerLoad

export const actions: Actions = {
  create_tenant: async ({ request }) => {
    const form = await superValidate(request, zod(schemaStep2))
    const {
      tenantName,
      subdomain,
      name,
      email,
      password,
      phone,
      cep,
      street,
      neighborhood,
      number,
      city,
      state,
    } = form.data
    const address = `${street}, ${number}, ${city}, ${neighborhood},  ${state}, ${cep}, BR`

    if (!form.valid) {
      console.log(form.errors)
      return message(form, 'Formulario inválido')
    }
    const location = await geocodeAddress(address)

    const result = await createTenant({
      email,
      password,
      subdomain,
      tenantName,
      name: name,
      phone: phone,
      address,
      lat: location.lat,
      lon: location.lon,
    })

    if (!result.success || !result.data) {
      console.log(result)
      return message(form, result.message || 'Erro ao criar distribuidora')
    }
    console.log('Distribuidora criada!')
    return {
      success: true,
      message: 'Distribuidora criada!',
      result: result.data,
      form,
    }
    // return message(form, 'Distribuidora criada!')
  },
}

