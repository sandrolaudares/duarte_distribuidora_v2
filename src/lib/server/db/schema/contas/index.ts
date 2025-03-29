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
  categoria_id: integer('categoria_id').references(() => categoriaConta.id),
  pagamento_id: integer('pagamento_id').references(() => tipoPagamentoConta.id),
  descricao: text('descricao'),
  expire_at: integer('expire_at', {
    mode: 'timestamp',
  }),
  paid_at: integer('paid_at', {
    mode: 'timestamp',
  }),
  titulo: text('titulo'),
  status: text('status').default('PENDENTE'),
  isPaid: integer('isPaid', { mode: 'boolean' }),
  valor_conta: integer('valor_conta').notNull(),
})

export const contasPagarRelations = relations(contasPagarTable, ({ one }) => ({
  fornecedor: one(supplierTable, {
    fields: [contasPagarTable.fornecedor_id],
    references: [supplierTable.id],
  }),
  categoria: one(categoriaConta, {
    fields: [contasPagarTable.categoria_id],
    references: [categoriaConta.id],
  }),
  pagamento: one(tipoPagamentoConta, {
    fields:[contasPagarTable.pagamento_id],
    references:[tipoPagamentoConta.id]
  })
}))

export const categoriaConta = sqliteTable('categoria', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull().unique(),
})

export const tipoPagamentoConta = sqliteTable('tipo_pagamento', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull().unique(),
})

export type SelectConta = typeof contasPagarTable.$inferSelect
export type InsertConta = typeof contasPagarTable.$inferInsert

export type SelectCategoria = typeof categoriaConta.$inferSelect
export type InsertCategoria = typeof categoriaConta.$inferInsert

export type SelectTipoPagamento = typeof tipoPagamentoConta.$inferSelect
export type insertTipoPagamento = typeof tipoPagamentoConta.$inferInsert

export const insertContaSchema = createInsertSchema(contasPagarTable, {})
export const insertCategoriaSchema = createInsertSchema(categoriaConta, {})
