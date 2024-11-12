/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  sqliteTable,
  text,
  integer,
  blob,
  // customType,
} from 'drizzle-orm/sqlite-core'
import { eq, relations, sql } from 'drizzle-orm'
import { userTable } from '../user'
import { createInsertSchema } from 'drizzle-zod'
import { customerOrderTable } from '../customer'
import { timestamps } from '../../utils'

export const bugReportTable = sqliteTable('bugReport', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  ...timestamps,
  created_by: text('created_by')
    .references(() => userTable.id, {
      onDelete: 'set null',
    })
    .default(''),
  status: text('status', { enum: ['DONE', 'IN_PROGRESS', 'TODO'] }).notNull(),
  text: text('name').notNull(),
  metadata: text('metadata', { mode: 'json' }),
})

// const bugReportRelations = relations(bugReportTable, ({ one }) => ({
//   reporter: one(userTable),
// }))

export type SelectBugReport = typeof bugReportTable.$inferSelect
export type InsertBugReport = typeof bugReportTable.$inferInsert

export const logsTable = sqliteTable('logs', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  ...timestamps,
  type: text('type', {
    enum: ['LOG', 'SYSTEM', 'ERROR', 'CAIXA'],
  }).notNull(),
  pathname: text('pathname'),
  created_by: text('created_by')
    .references(() => userTable.id, {
      onDelete: 'set null',
    })
    .default(''),
  text: text('text').notNull(),
  routeName: text('routeName'),
  metadata: text('metadata', { mode: 'json' }),
  error: text('error', { mode: 'json' }),
  currency: integer('currency'),
  order_id: integer('order_id').references(()=>customerOrderTable.id)
})

export const logRelations = relations(logsTable, ({ one }) => ({
  reporter: one(userTable, {
    fields: [logsTable.created_by],
    references: [userTable.id],
  }),
}))

export type SelectLogs = typeof logsTable.$inferSelect
export type InsertLogs = typeof logsTable.$inferInsert

export const insertLogsSchema = createInsertSchema(logsTable)
