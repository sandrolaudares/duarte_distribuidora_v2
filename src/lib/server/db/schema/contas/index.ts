import {
  sqliteTable,
  text,
  integer,
  // customType,
} from 'drizzle-orm/sqlite-core'

import { timestamps } from '../../utils'
import { supplierTable } from '../stock'
import { relations } from 'drizzle-orm'

export const contasPagarTable = sqliteTable('contas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ...timestamps,
  fornecedor_id: integer('fornecedor_id').references(() => supplierTable.id),
  descricao: text('descricao'),
  expire_at: integer('updated_at', {
    mode: 'timestamp',
  }),
  valor_conta: integer('valor_conta').notNull(),
})

export const contasPagarRelations = relations(contasPagarTable, ({ one }) => ({
  fornecedor: one(supplierTable, {
    fields: [contasPagarTable.fornecedor_id],
    references: [supplierTable.id],
  }),
}))
