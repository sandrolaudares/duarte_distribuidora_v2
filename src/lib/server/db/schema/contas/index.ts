import {
  sqliteTable,
  text,
  integer,
  // customType,
} from 'drizzle-orm/sqlite-core'

import { timestamps } from '../../utils'
import { supplierTable } from '../stock'
import { relations } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'

export const contasPagarTable = sqliteTable('contas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ...timestamps,
  fornecedor_id: integer('fornecedor_id').references(() => supplierTable.id),
  descricao: text('descricao'),
  expire_at: integer('expire_at', {
    mode: 'timestamp',
  }),
  titulo:text('titulo'),
  status:text('status').default('PENDENTE'),
  isPaid:integer('isPaid',{mode:'boolean'}),
  valor_conta: integer('valor_conta').notNull(),
})

export const contasPagarRelations = relations(contasPagarTable, ({ one }) => ({
  fornecedor: one(supplierTable, {
    fields: [contasPagarTable.fornecedor_id],
    references: [supplierTable.id],
  }),
}))


export type SelectConta = typeof contasPagarTable.$inferSelect
export type InsertConta = typeof contasPagarTable.$inferInsert


export const insertContaSchema = createInsertSchema(contasPagarTable, {})
