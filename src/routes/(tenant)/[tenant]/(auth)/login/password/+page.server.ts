import {
  setSessionTokenCookie,
} from '$lib/server/auth/cookies'
import {  verify } from '$db/schema/user/password'
import { fail, redirect } from '@sveltejs/kit'

import type { Actions, PageServerLoad } from './$types'

import { user } from '$db/controller'

export const load: PageServerLoad = async event => {
  if (event.locals.user) {
    return redirect(302, '/')
  }
  return {}
}

export const actions: Actions = {
  default: async event => {
    const { tenantDb , tenantAuthManager} = event.locals
    const formData = await event.request.formData()
    // const username = formData.get('username')
    const password = formData.get('password')
    const email = formData.get('email')

    if (
      typeof email !== 'string' ||
      email.length < 3 ||
      email.length > 255 ||
      !/.+@.+/.test(email)
    ) {
      return fail(400, {
        message: 'Invalid email',
      })
    }

    if (
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 255
    ) {
      return fail(400, {
        message: 'Invalid password',
      })
    }

    const [existingUser] = await user(tenantDb!).getUserByEmail(email)

    if(!existingUser.password_hash){
      return fail(400,{
        message: "Usuario nao tem uma senha tente recuperar ou magic link"
      })
    }

    if (!existingUser) {
      return fail(400, {
        message: 'Incorrect username',
      })
    }

    const validPassword = await verify(existingUser.password_hash, password)
    if (!validPassword) {
      // NOTE:
      // Returning immediately allows malicious actors to figure out valid usernames from response times,
      // allowing them to only focus on guessing passwords in brute-force attacks.
      // As a preventive measure, you may want to hash passwords even for invalid usernames.
      // However, valid usernames can be already be revealed with the signup page among other methods.
      // It will also be much more resource intensive.
      // Since protecting against this is non-trivial,
      // it is crucial your implementation is protected against brute-force attacks with login throttling, 2FA, etc.
      // If usernames are public, you can outright tell the user that the username is invalid.
      return fail(400, {
        message: 'Incorrect password',
      })
    }
    const token = tenantAuthManager!.generateSessionToken()
    const session = await tenantAuthManager!.createSession(token, existingUser.id)
setSessionTokenCookie(event, token, session.expiresAt)
    if (!existingUser.emailVerified) {
      return redirect(302, '/verify-email')
    }

    if (existingUser.meta.redirect) {
      return redirect(302, existingUser.meta.redirect)
    }

    return redirect(302, '/')
  },
}
