import { and, eq } from 'drizzle-orm'
import {
  type InsertUser,
  userTable,
  userVerificationCodeTable,
  passwordResetCodeTable,
  magicLinkTable,
  type UserMeta,
  type SelectUser,
  sessionTable,
  DEFAULT_PERMISSIONS,
  customerTable,
  type DatabaseUser,
} from '$db/schema'

import { TimeSpan, createDate, isWithinExpirationDate } from 'oslo'
import { generateRandomString, alphabet, sha256 } from 'oslo/crypto'
import { encodeHex } from 'oslo/encoding'
import type { TenantDbType, Transaction } from '../../tenant'
import { generateId } from '$lib/server/auth/utils'

export function isValidEmail(email: string): boolean {
  return /.+@.+/.test(email)
}

export const user = (db: TenantDbType | Transaction) => ({
  getUserByUsername: function (username: string) {
    return db
      .select()
      .from(userTable)
      .where(eq(userTable.username, username))
      .limit(1)
  },
  getUserByEmail: function getUserByEmail(email: string) {
    return db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1)
  },
  getUserById: function getUserById(userId: string) {
    return db.select().from(userTable).where(eq(userTable.id, userId)).limit(1)
  },
  getPublicUsersInfo: function getPublicUsersInfo() {
    return db
      .select({
        id: userTable.id,
        created_at: userTable.created_at,
        username: userTable.username,
        email: userTable.email,
        emailVerified: userTable.emailVerified,
        meta: userTable.meta,
        role: userTable.role,
      })
      .from(userTable)
      .leftJoin(customerTable, eq(customerTable.email, userTable.email))
  },
  insertUser: function insertUser(user: InsertUser) {
    return db.insert(userTable).values(user).run()
  },
  updateUser: function updateUser(
    userId: SelectUser['id'],
    user: Partial<SelectUser>,
  ) {
    return db.update(userTable).set(user).where(eq(userTable.id, userId)).run()
  },
  updateUserPermissions: function updateUserPermissions(
    userId: SelectUser['id'],
    meta: UserMeta,
  ) {
    return db
      .update(userTable)
      .set({
        meta,
      })
      .where(eq(userTable.id, userId))
      .run()
  },
  getSessions: function getSessions(userId: SelectUser['id']) {
    return db.select().from(sessionTable).where(eq(sessionTable.userId, userId))
  },
  generateEmailVerificationCode: async function generateEmailVerificationCode(
    userId: string,
    email: string,
  ): Promise<string> {
    await db
      .delete(userVerificationCodeTable)
      .where(eq(userVerificationCodeTable.userId, userId))
      .all()
    const code = generateRandomString(8, alphabet('0-9'))

    await db.insert(userVerificationCodeTable).values({
      userId,
      email,
      code,
      expiresAt: createDate(new TimeSpan(15, 'm')), // 15 minutes
    })
    return code
  },
  verifyVerificationCode: async function verifyVerificationCode(
    user: SelectUser,
    code: string,
  ): Promise<boolean> {
    const [databaseCode] = await db
      .select()
      .from(userVerificationCodeTable)
      .where(eq(userVerificationCodeTable.userId, user.id))
    if (!databaseCode || databaseCode.code !== code) {
      // await db.commit()
      return false
    }

    await db
      .delete(userVerificationCodeTable)
      .where(eq(userVerificationCodeTable.id, databaseCode.id))
      .run()

    if (!isWithinExpirationDate(databaseCode.expiresAt)) {
      return false
    }
    if (databaseCode.email !== user.email) {
      return false
    }
    return true
  },
  createPasswordResetToken: async function createPasswordResetToken(
    userId: string,
  ): Promise<string> {
    await db
      .delete(passwordResetCodeTable)
      .where(eq(passwordResetCodeTable.userId, userId))
      .all()
    const tokenId = generateId(40) // 40 character
    const tokenHash = encodeHex(await sha256(new TextEncoder().encode(tokenId)))
    await db.insert(passwordResetCodeTable).values({
      token_hash: tokenHash,
      userId,
      expiresAt: createDate(new TimeSpan(2, 'h')),
    })
    return tokenId
  },
  getPasswordResetToken: async function getPasswordResetToken(token: string) {
    return db
      .select()
      .from(passwordResetCodeTable)
      .where(eq(passwordResetCodeTable.token_hash, token))
      .limit(1)
  },
  deletePasswordResetToken: async function deletePasswordResetToken(
    token: string,
  ) {
    return db
      .delete(passwordResetCodeTable)
      .where(eq(passwordResetCodeTable.token_hash, token))
      .run()
  },
  createMagicLinkToken: async function createMagicLinkToken(
    userId: string,
    email: string,
  ): Promise<string> {
    await db
      .delete(magicLinkTable)
      .where(eq(magicLinkTable.userId, userId))
      .all()
    const tokenId = generateId(40) // 40 characters long
    await db.insert(magicLinkTable).values({
      id: tokenId,
      userId,
      email,
      expiresAt: createDate(new TimeSpan(2, 'h')),
    })
    return tokenId
  },
  getMagicLinkToken: async function getMagicLinkToken(token: string) {
    return db
      .select()
      .from(magicLinkTable)
      .where(eq(magicLinkTable.id, token))
      .limit(1)
  },
  deleteMagicLinkToken: async function deleteMagicLinkToken(token: string) {
    return db.delete(magicLinkTable).where(eq(magicLinkTable.id, token)).run()
  },
  DEFAULT_PERMISSIONS,
  getMotoboys: function getMotoboys() {
    return db.select().from(userTable).where(and(eq(userTable.role, 'motoboy'),eq(userTable.is_active,true)))
  },
  updateUserRole: function updateUserRole(
    userId: SelectUser['id'],
    role: DatabaseUser['role'],
  ) {
    return db
      .update(userTable)
      .set({
        role,
      })
      .where(eq(userTable.id, userId))
      .returning()
      // .run()
  },
  updateUserCashier:(caixa_id:UserMeta['caixa_id'],userId:SelectUser['id'])=>{
    return db.update(userTable).set({meta:{caixa_id:caixa_id}}).where(eq(userTable.id,userId))
  }
})
