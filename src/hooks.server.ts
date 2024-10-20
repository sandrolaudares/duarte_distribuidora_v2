/* eslint-disable @typescript-eslint/no-unused-vars */
import { createTenantAuthManager } from '$lib/server/auth/tenant/sessions'
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from '$lib/server/auth/cookies'

import { error, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

import { bugReport } from '$db/controller'

const handleSession: Handle = async ({ event, resolve }) => {
  /* disallow access to PUBLIC_DOMAIN/tenant, this is optional */
  const { host, pathname } = event.url

  if (host === PUBLIC_DOMAIN) {
    if (pathname.startsWith('/tenant')) {
      error(404, { message: 'Not Found' })
    } else {
      return resolve(event)
    }
  }

  /* if no database returned for given subdomain or custom domain then the tenant does not exist */
  const tenant = await getTenant(host)
  if (!tenant) {
    error(404, { message: 'Not Found' })
  }

  event.locals.tenantDb = tenant.tenantDb
  event.locals.tenantInfo = tenant.tenantInfo!

  /* authenticate users of tenants with lucia */
  const tenantAuthManager = createTenantAuthManager(tenant.tenantDb)
  event.locals.tenantAuthManager = tenantAuthManager

  const sessionId = event.cookies.get('session')
  if (!sessionId) {
    event.locals.user = null
    event.locals.session = null
    return resolve(event)
  }

  const { session, user } =
    await tenantAuthManager.validateSessionToken(sessionId)

  if (session !== null) {
    setSessionTokenCookie(event, sessionId, session.expiresAt)
  } else {
    deleteSessionTokenCookie(event)
  }
  event.locals.user = user
  event.locals.session = session
  return resolve(event)
}

import { createContext } from '$trpc/context'
import { router } from '$trpc/router'
import { createTRPCHandle } from 'trpc-sveltekit'
import { PUBLIC_DOMAIN } from '$env/static/public'
import { getTenant } from '$lib/server/utils/getTenantInformation'

const handleTRPC = createTRPCHandle({
  router,
  createContext,

  onError: ({ error, type, path, input, ctx, req }) => {
    console.error(
      `Encountered error while trying to process ${type} @ ${path}:`,
      error,
    )
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // TODO: send to bug reporting
      // const userId = ctx?.locals.user?.id
      // bugReport.insertBugReport({
      //   status: 'TODO',
      //   text: 'Internal server error',
      //   created_by: userId,
      //   metadata: {
      //     path,
      //     type,
      //     error,
      //     input,
      //     req,
      //   },
      // })
    }
  },
})

export const handle: Handle = sequence(handleSession, handleTRPC)
