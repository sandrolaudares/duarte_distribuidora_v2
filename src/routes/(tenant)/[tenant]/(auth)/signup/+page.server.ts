import { fail, redirect } from '@sveltejs/kit'
import { generateId } from '$lib/server/auth/utils'
import { hash } from '$lib/server/db/schema/user/password'
import { LibsqlError } from '@libsql/client'

import type { Actions, PageServerLoad } from './$types'
import { emailTemplate, sendMail } from '$lib/server/email'

import { bugReport, user } from '$db/controller'
import { setSessionTokenCookie } from '$lib/server/auth/cookies'

export const load: PageServerLoad = async event => {
  if (event.locals.user) {
    return redirect(302, '/')
  }
  return {}
}

export const actions: Actions = {
  default: async event => {
    const { tenantAuthManager, tenantDb } = event.locals
    const formData = await event.request.formData()
    const username = formData.get('username')
    const password = formData.get('password')
    const email = formData.get('email')
    if (
      typeof username !== 'string' ||
      username.length < 3 ||
      username.length > 31 ||
      !/^[a-z0-9_-]+$/.test(username)
    ) {
      return fail(400, {
        message: 'Invalid username',
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
    if (
      typeof email !== 'string' ||
      email.length < 3 ||
      email.length > 255 ||
      !email.includes('@')
    ) {
      return fail(400, {
        message: 'Invalid email',
      })
    }

    try {
      const passwordHash = await hash(password)
      const userId = generateId(15)
      user(tenantDb!).insertUser({
        id: userId,
        username,
        email,
        emailVerified: false,
        password_hash: passwordHash,
        role: username === 'administrador' ? 'admin' : 'customer',
      })

      const verificationCode = await user(
        tenantDb!,
      ).generateEmailVerificationCode(userId, email)
      await bugReport(tenantDb!).insertLogs({
        type: 'LOG',
        created_by: userId,
        text: `${username} se cadastrou`,
        error: '',
      })
      await sendMail(email, emailTemplate.verificationCode(verificationCode))
      const token = tenantAuthManager!.generateSessionToken()
      const session = await tenantAuthManager!.createSession(token, userId)
      setSessionTokenCookie(event, token, session.expiresAt)
    } catch (e) {
      if (e instanceof LibsqlError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return fail(400, {
          message: 'Username or Email already used',
        })
      }
      console.error(e)
      return fail(500, {
        message: 'An unknown error occurred',
      })
    }
    return redirect(302, '/verify-email')
  },
}
