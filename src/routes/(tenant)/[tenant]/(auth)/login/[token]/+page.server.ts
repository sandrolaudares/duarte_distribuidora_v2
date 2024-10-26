import type { PageServerLoad } from './$types'
import {
  setSessionTokenCookie,
} from '$lib/server/auth/cookies'

import { user as userController } from '$db/controller'
import { isWithinExpirationDate } from 'oslo'
import { error, redirect } from '@sveltejs/kit'

export const load = (async event => {
  const { params, setHeaders, locals } = event
  const verificationToken = params.token
  const { tenantDb, tenantAuthManager } = locals
  setHeaders({
    'Referrer-Policy': 'strict-origin',
  })

  const [token] = await userController(tenantDb!).getMagicLinkToken(
    verificationToken,
  )
  if (token) {
    await userController(tenantDb!).deleteMagicLinkToken(verificationToken)
  }

  if (!token || !isWithinExpirationDate(token.expiresAt)) {
    return error(400, {
      message: 'Invalid or expired token',
    })
  }
  const [user] = await userController(tenantDb!).getUserById(token.userId)
  if (!user || user.email !== token.email) {
    return error(400, {
      message: 'Invalid or expired token',
    })
  }
  await tenantAuthManager!.invalidateUserSessions(user.id)

  await userController(tenantDb!).updateUser(user.id, {
    emailVerified: true,
  })
  const sessionId = tenantAuthManager!.generateSessionToken()
  const session = await tenantAuthManager!.createSession(sessionId, user.id)
  setSessionTokenCookie(event, sessionId, session.expiresAt)


  return redirect(302, '/')
}) satisfies PageServerLoad
