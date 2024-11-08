/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  sqliteTable,
  text,
  integer,
  // customType,
} from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm'
import { imageTable } from '../image'

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { customerOrderTable } from '../customer'
import { userTable } from '../user'
import { timestamps } from '../../utils'

export const cashierTable = sqliteTable('caixas', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  ...timestamps,

  name: text('name').notNull(),
  status: text('status', { enum: ['Aberto', 'Fechado'] })
    .notNull()
    .default('Fechado'),
  currency: integer('currency').notNull().default(0),
})


export const insertCashierSchema = createInsertSchema(cashierTable)
export type InsertCashier = typeof cashierTable.$inferInsert
export type SelectCashier = typeof cashierTable.$inferSelect

export const cashierTransactionEnum = [
  'Entrada',
  'Saida',
  'Troco',
  'PAGAMENTO',
  "FECHAMENTO",
  "ABERTURA",
  "DEPOSITO",
  "SAQUE",
] as const


