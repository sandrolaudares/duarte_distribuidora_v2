import type { TenantDbType } from '$db/tenant'
import {
  sessionTable as sessionT,
  userTable as userT,
  type SelectUser,
  type SelectSession,
} from '$db/schema'
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding'
import { encodeHexLowerCase } from '@oslojs/encoding'
import { sha256 } from '@oslojs/crypto/sha2'
import { eq } from 'drizzle-orm'

export type SessionValidationResult =
  | { session: SelectSession; user: SelectUser }
  | { session: null; user: null }

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  const token = encodeBase32LowerCaseNoPadding(bytes)
  return token
}

export function createTenantAuthManager(db: TenantDbType) {
  return {
    generateSessionToken,
    createSession: async function (
      token: string,
      userId: string,
    ): Promise<SelectSession> {
      const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
      )
      const session: SelectSession = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      }
      await db.insert(sessionT).values(session)
      return session
    },
    validateSessionToken: async function (
      token: string,
    ): Promise<SessionValidationResult> {
      const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token)),
      )
      const result = await db
        .select({ user: userT, session: sessionT })
        .from(sessionT)
        .innerJoin(userT, eq(sessionT.userId, userT.id))
        .where(eq(sessionT.id, sessionId))
      if (result.length < 1) {
        return { session: null, user: null }
      }
      const { user, session } = result[0]
      if (Date.now() >= session.expiresAt.getTime()) {
        await db.delete(sessionT).where(eq(sessionT.id, session.id))
        return { session: null, user: null }
      }
      if (
        Date.now() >=
        session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15
      ) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        await db
          .update(sessionT)
          .set({
            expiresAt: session.expiresAt,
          })
          .where(eq(sessionT.id, session.id))
      }
      return { session, user }
    },

    invalidateSession: async function (sessionId: string): Promise<void> {
      await db.delete(sessionT).where(eq(sessionT.id, sessionId))
    },

    invalidateUserSessions: async function (userId: string): Promise<void> {
      await db.delete(sessionT).where(eq(sessionT.userId, userId))
    },
  }
}

export type TenantAuthManagerType = ReturnType<typeof createTenantAuthManager>
