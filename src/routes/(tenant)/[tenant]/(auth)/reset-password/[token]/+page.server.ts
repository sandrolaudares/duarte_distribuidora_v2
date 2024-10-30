import { fail, redirect } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

import { isWithinExpirationDate } from 'oslo'
import { hash } from '$lib/server/db/schema/user/password'
import { sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'

import { user } from '$db/controller'
import { setSessionTokenCookie } from '$lib/server/auth/cookies'

export const load = (async event => {
  const {
    params,
    setHeaders,
    locals: { tenantDb },
  } = event
  const verificationToken = params.token
  console.log(verificationToken)

  setHeaders({
    'Referrer-Policy': 'strict-origin',
  })

  const tokenHash = encodeHex(
    await sha256(new TextEncoder().encode(verificationToken)),
  )

  const [token] = await user(tenantDb!).getPasswordResetToken(tokenHash)

  const [resetUser] = await user(tenantDb!).getUserById(token.userId)

  return {
    email: resetUser.email,
    username: resetUser.username,
  }
}) satisfies PageServerLoad

export const actions: Actions = {
  default: async event => {
    const {
      request,
      params,

      setHeaders,
      locals: { tenantAuthManager, tenantDb },
    } = event

    const formData = await request.formData()
    const password = formData.get('password')

    setHeaders({
      'Referrer-Policy': 'strict-origin',
    })
    console.log(formData)

    if (
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 255
    ) {
      return fail(400, {
        message: 'Invalid password',
      })
    }

    const verificationToken = params.token

    const tokenHash = encodeHex(
      await sha256(new TextEncoder().encode(verificationToken)),
    )
    // const token = await db
    //   .table('password_reset_token')
    //   .where('token_hash', '=', tokenHash)
    //   .get()

    const [token] = await user(tenantDb!).getPasswordResetToken(tokenHash)

    if (token) {
      // await db
      //   .table('password_reset_token')
      //   .where('token_hash', '=', tokenHash)
      //   .delete()
      await user(tenantDb!).deletePasswordResetToken(tokenHash)
    }

    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      return fail(400, {
        message: 'Invalid or expired token',
      })
    }

    await tenantAuthManager!.invalidateUserSessions(token.userId)
    const passwordHash = await hash(password)
    // await db.table('user').where('id', '=', token.user).update({
    //   password_hash: passwordHash,
    // })
    await user(tenantDb!).updateUser(token.userId, {
      password_hash: passwordHash,
    })

    const sessionToken = tenantAuthManager!.generateSessionToken()
    const session = await tenantAuthManager?.createSession(
      sessionToken,
      token.userId,
    )
    setSessionTokenCookie(event, sessionToken, session!.expiresAt)

    // const session = await tenantAuthManager!.createSession(token.userId, {})
    // const sessionCookie = tenantAuthManager!.createSessionCookie(session.id)
    // cookies.set(sessionCookie.name, sessionCookie.value, {
    //   path: '.',
    //   ...sessionCookie.attributes,
    // })

    return redirect(302, '/myprofile')
  },
}
