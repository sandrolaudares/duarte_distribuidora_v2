import { deleteSessionTokenCookie } from '$lib/server/auth/cookies'

import { fail, redirect } from '@sveltejs/kit'

import type { Actions, PageServerLoad } from './$types'

export const load = (async () => {
  return {}
}) satisfies PageServerLoad

export const actions: Actions = {
  signout: async event => {
    if (!event.locals.session) {
      return fail(401)
    }

    const authManager = event.locals.tenantAuthManager
    await authManager?.invalidateSession(event.locals.session.id)
    deleteSessionTokenCookie(event)
    return redirect(302, '/login')
  },
}
