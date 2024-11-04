import { publicProcedure, router } from '$trpc/t'

import { z } from 'zod'

import { user as userController } from '$db/controller'
import { redirect } from '@sveltejs/kit'
// import { hash, verify } from '@node-rs/argon2'

// import { generateId } from 'lucia'
// import { LibsqlError } from '@libsql/client'
import { middleware } from '$trpc/middleware'

import { emailTemplate, sendMail } from '$lib/server/email'
// import { tableHelper } from '$lib/server/db/utils'
import { generateId } from '$lib/server/auth/utils'
import { permissionsEnum, roleEnum } from '$lib/utils/permissions'
import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
} from '$lib/server/auth/cookies'

export const auth = router({
  logOut: publicProcedure.query(async ({ ctx }) => {
    const { tenantAuthManager } = ctx
    const { session } = ctx.locals
    if (!session) {
      return {
        error: 'Not authenticated',
      }
    }
    await tenantAuthManager.invalidateSession(session.id)
    deleteSessionTokenCookie(ctx)
    return redirect(302, '/login')
  }),

  resendEmailVerification: publicProcedure.query(async ({ ctx }) => {
    const { locals, tenantDb } = ctx

    const localUser = locals.user

    if (!localUser) {
      return {
        message: 'Not authenticated',
      }
    }

    const verificationCode = await userController(
      tenantDb,
    ).generateEmailVerificationCode(localUser.id, localUser.email)
    await sendMail(
      localUser.email,
      emailTemplate.verificationCode(verificationCode),
    )

    return {
      message: 'Verification email sent',
    }
  }),

  verifyEmail: publicProcedure
    .use(middleware.logged)

    .input(
      z.object({
        code: z.string().length(8),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {  locals, tenantDb, tenantAuthManager } = ctx
      const sessionId = locals.session?.id
      const { code } = input

      if (!sessionId) {
        return {
          error: 'Not authenticated',
          data: null,
        }
      }

      const { user } = await tenantAuthManager.validateSessionToken(sessionId)
      if (!user) {
        return {
          error: 'Not authenticated',
          data: null,
        }
      }

      const validCode = await userController(tenantDb).verifyVerificationCode(
        user,
        code,
      )

      if (!validCode) {
        return {
          error: 'Invalid code',
          data: null,
        }
      }

      await tenantAuthManager.invalidateUserSessions(user.id)
      await userController(tenantDb).updateUser(user.id, {
        emailVerified: true,
      })
      const token = tenantAuthManager.generateSessionToken()
      const session = await tenantAuthManager.createSession(token, user.id)
      setSessionTokenCookie(ctx, token, session.expiresAt)
      return {
        data: {
          message: 'Email verified',
          success: true,
        },
        error: null,
      }
    }),
  resetPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const { email } = input
      const { url, tenantDb } = ctx

      // const user = await db.table('user').where('email', '=', email).get()
      const [{ id: userID }] =
        await userController(tenantDb).getUserByEmail(email)
      if (!userID) {
        // If you want to avoid disclosing valid emails,
        // this can be a normal 200 response.
        return {
          error: 'Invalid email',
          data: null,
        }
      }

      const verificationToken =
        await userController(tenantDb).createPasswordResetToken(userID)
      // const verificationLink =
      //   'http://localhost:3000/reset-password/' + verificationToken
      const verificationLink = `${url.origin}/reset-password/${verificationToken}`

      // await sendPasswordResetToken(email, verificationLink)
      await sendMail(email, emailTemplate.resetPassword(verificationLink))
      return {
        data: 'Password reset email sent, Check your email',
        error: null,
      }
    }),
  sendMagicLink: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input, ctx }) => {
      const { email } = input
      const { url, tenantDb } = ctx

      const [{ id: userId }] =
        await userController(tenantDb).getUserByEmail(email)

      if (!userId) {
        return {
          message: 'Invalid email',
          success: false,
        }
      }

      const verificationToken = await userController(
        tenantDb,
      ).createMagicLinkToken(userId, email)
      const verificationLink = `${url.origin}/login/${verificationToken}`
      await sendMail(email, emailTemplate.magicLink(verificationLink))
      return {
        message: 'Magic link sent, Check your email',
        success: true,
      }
    }),

  // paginatedUsers: publicProcedure
  //   .use(middleware.admin)
  //   .input(paramsSchema)
  //   .query(async ({ input }) => {
  //     return await tableHelper(
  //       userController.getPublicUsersInfo().$dynamic(),
  //       userTable,
  //       'username',
  //       input,
  //     )
  //   }),

  updateUserPermissions: publicProcedure
    .use(middleware.admin)
    .input(
      z.object({
        userId: z.string(),
        meta: z.object({
          redirect: z.string().optional(),
          permissions: z.array(z.enum(permissionsEnum)),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, meta } = input
      const { tenantDb } = ctx
      return await userController(tenantDb).updateUserPermissions(userId, meta)
    }),

  updateUserRole: publicProcedure
    .use(middleware.admin)
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(roleEnum),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      const { userId, role } = input
      return await userController(tenantDb).updateUserRole(userId, role)
    }),

    updateUserCashier: publicProcedure
    .use(middleware.admin)
    .input(
      z.object({
        userId: z.string(),
        meta: z.object(
          {caixa_id:z.number(),}
        ),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      const { userId, meta } = input
      return await userController(tenantDb).updateUserCashier(meta.caixa_id, userId)
    }),

  getMotoboys: publicProcedure.query(({ ctx: { tenantDb } }) => {
    return userController(tenantDb).getMotoboys()
  }),

  insertUser: publicProcedure
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.object({
        username: z.string(),
        email: z.string(),
        role: z.enum(roleEnum),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      return await userController(tenantDb).insertUser({
        ...input,
        id: generateId(15),
      })
    }),
  updateUser: publicProcedure
    .use(middleware.auth)
    .use(middleware.logged)
    .input(
      z.object({
        userId: z.string(),
        user: z.object({
          username: z.string().optional(),
          email: z.string().optional(),
          role: z.enum(roleEnum).optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx: { tenantDb } }) => {
      const { userId, user } = input
      return await userController(tenantDb).updateUser(userId, user)
    }),
})
