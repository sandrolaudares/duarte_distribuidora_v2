import type { PageServerLoad, Actions } from './$types'

import { createTenant } from '$lib/server/db/central/constroller'
import { fail } from '@sveltejs/kit'

export const load = (async () => {
  return {}
}) satisfies PageServerLoad

export const actions: Actions = {
  create_tenant: async ({ request }) => {
    const formData = await request.formData()
    const tenantName = formData.get('tenantName')
    const subdomain = formData.get('subdomain')
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    

    if (password !== confirmPassword) {
      return fail(400, {
        success: false,
        message: 'Passwords do not match',
        form: {
          email,
          subdomain,
          tenantName,
          name,
        },
      })
    }
    const result = await createTenant({
      email,
      password,
      subdomain,
      tenantName,
      name: name,
  
    })

    if (!result.success || !result.data) {
      return fail(400, {
        success: false,
        message: result.message,
        form: {
          email,
          subdomain,
          tenantName,
          name,
        },
      })
    }

    return {
      success: true,
      message: 'Tenant created',
      data: result.data,
    }
  },
}
