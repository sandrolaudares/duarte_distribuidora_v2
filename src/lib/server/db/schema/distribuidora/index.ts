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

export const distribuidoraTable = sqliteTable('distribuidora', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  name: text('name').notNull(),
})

export const distribuidoraRelations = relations(
  distribuidoraTable,
  ({ one, many }) => ({
    cashiers: many(cashierTable),
  }),
)
export const insertDistribuidoraSchema = createInsertSchema(distribuidoraTable)
export type InsertDistribuidora = typeof distribuidoraTable.$inferInsert
export type SelectDistribuidora = typeof distribuidoraTable.$inferSelect

export const cashierTable = sqliteTable('cashier', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  distribuidora_id: integer('distribuidora_id')
    .notNull()
    .references(() => distribuidoraTable.id),
  name: text('name').notNull(),
  status: text('status', { enum: ['Aberto', 'Fechado'] })
    .notNull()
    .default('Fechado'),
  currency: integer('currency').notNull().default(0),
})

export const cachierRelations = relations(cashierTable, ({ one, many }) => ({
  distribuidora: one(distribuidoraTable, {
    fields: [cashierTable.distribuidora_id],
    references: [distribuidoraTable.id],
  }),
  transactions: many(cashierTransactionTable),
}))
export const insertCashierSchema = createInsertSchema(cashierTable)
export type InsertCashier = typeof cashierTable.$inferInsert
export type SelectCashier = typeof cashierTable.$inferSelect

export const cashierTransactionTable = sqliteTable('cashier_transaction', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
  cashier_id: integer('cashier_id')
    .notNull()
    .references(() => cashierTable.id),
  amount: integer('amount').notNull().default(0),
  type: text('type', { enum: ['Entrada', 'Saida'] }).notNull(),
  meta_data: text('meta_data', { mode: 'json' }).notNull(),
})

export const cashierTransactionRelations = relations(
  cashierTransactionTable,
  ({ one, many }) => ({
    cashier: one(cashierTable, {
      fields: [cashierTransactionTable.cashier_id],
      references: [cashierTable.id],
    }),
  }),
)

export type InsertCashierTransaction =
  typeof cashierTransactionTable.$inferInsert
export type SelectCashierTransaction =
  typeof cashierTransactionTable.$inferSelect
