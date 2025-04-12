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
import { cashierTransactionEnum } from '$lib/utils/permissions'

export const cashierTable = sqliteTable('caixas', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  ...timestamps,

  name: text('name').notNull(),
  status: text('status', { enum: ['Aberto', 'Fechado'] })
    .notNull()
    .default('Fechado'),
  currency: integer('currency').notNull().default(0),
  user_in: text('user_in')
    .references(() => userTable.id, {
      onDelete: 'set null',
    })
    .default(''),
})

export const cashierRelations = relations(cashierTable, ({one})=> ({
  user_in : one(userTable, {
    fields: [cashierTable.user_in],
    references: [userTable.id],
  }),
}))

export const cashierTransactionsT = sqliteTable('cashierTransactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  ...timestamps,
  cashier_id: integer('cashier_id').references(() => cashierTable.id),
  order_id: integer('order_id').references(() => customerOrderTable.id),
  created_by: text('created_by')
    .references(() => userTable.id, {
      onDelete: 'set null',
    })
    .default(''),
  type: text('type', {
    enum: cashierTransactionEnum,
  }).notNull(),
  amount: integer('amount').notNull(),
  metadata: text('metadata', { mode: 'json' }),
})

export const cashierTransactionsRelations = relations(cashierTransactionsT, ({one})=> ({
  created_by : one(userTable, {
    fields: [cashierTransactionsT.created_by],
    references: [userTable.id],
  }),
  cashier : one(cashierTable, {
    fields: [cashierTransactionsT.cashier_id],
    references: [cashierTable.id],
  }),
  order : one(customerOrderTable, {
    fields: [cashierTransactionsT.order_id],
    references: [customerOrderTable.id],
  }),
}))


export const insertCashierSchema = createInsertSchema(cashierTable)
export type InsertCashier = typeof cashierTable.$inferInsert
export type SelectCashier = typeof cashierTable.$inferSelect



