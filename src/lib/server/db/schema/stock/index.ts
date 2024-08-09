/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  foreignKey,
  unique,
  // customType,
} from 'drizzle-orm/sqlite-core'
import { sql, relations } from 'drizzle-orm'
import { imageTable } from '../image'

import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import {
  distribuidoraTable,
  productItemTable,
  productTable,
  userTable,
} from '$db/schema'

export const skuTable = sqliteTable('sku', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  name: text('name').notNull(),
})

export const skuRelations = relations(skuTable, ({ many, one }) => ({
  product_stock: many(productStockTable),
  products: many(productItemTable),
}))

export const insertSKUschema = createInsertSchema(skuTable)
export type InsertSku = typeof skuTable.$inferInsert
export type SelectSku = typeof skuTable.$inferSelect

export const productStockTable = sqliteTable(
  'stock',
  {
    // id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    distribuidora_id: integer('distribuidora_id')
      .notNull()
      .references(() => distribuidoraTable.id),
    sku: integer('sku')
      .notNull()
      .references(() => skuTable.id),
    created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    quantity: integer('quantity').notNull().default(0),
  },
  table => ({
    pk: primaryKey({
      columns: [table.distribuidora_id, table.sku],
    }),
    // unq: unique().on(table.distribuidora_id, table.sku),
  }),
)

export const productStockRelations = relations(
  productStockTable,
  ({ one, many }) => ({
    distribuidora: one(distribuidoraTable, {
      fields: [productStockTable.distribuidora_id],
      references: [distribuidoraTable.id],
    }),
    sku: one(skuTable, {
      fields: [productStockTable.sku],
      references: [skuTable.id],
    }),
    transactions: many(stockTransactionTable),
  }),
)

export type InsertProductStock = typeof productStockTable.$inferInsert
export type SelectProductStock = typeof productStockTable.$inferSelect

export type metaEntrada = {
  type: 'entrada'
  nota_fiscal: string
  user_id: string | null | undefined
}

export type metaSaida = {
  type: 'saida'
  order_id: number
}

export type MetaUnion = metaEntrada | metaSaida
function isMetaEntrada(meta: MetaUnion): meta is metaEntrada {
  return meta.type === 'entrada'
}

function isMetaSaida(meta: MetaUnion): meta is metaSaida {
  return meta.type === 'saida'
}
export const stockTransactionTable = sqliteTable(
  'stock_transaction',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
      () => new Date(),
    ),
    // stock_id: integer('stock_id')
    //   .notNull()
    //   .references(() => productStockTable.id),
    distribuidora_id: integer('distribuidora_id').notNull(),
    sku: integer('sku').notNull(),
    quantity: integer('quantity').notNull(),
    type: text('type', { enum: ['Entrada', 'Saida'] }).notNull(),
    supplier_id: integer('supplier_id').references(() => supplierTable.id),
    cost_price: integer('cost_price'),
    meta_data: text('meta_data', { mode: 'json' }).notNull().$type<MetaUnion>(),
  },
  table => ({
    stockReference: foreignKey({
      columns: [table.distribuidora_id, table.sku],
      foreignColumns: [
        productStockTable.distribuidora_id,
        productStockTable.sku,
      ],
    }),
  }),
)

export const stockTransactionRelations = relations(
  stockTransactionTable,
  ({ one, many }) => ({
    distribuidora: one(distribuidoraTable, {
      fields: [stockTransactionTable.distribuidora_id],
      references: [distribuidoraTable.id],
    }),
    sku: one(skuTable, {
      fields: [stockTransactionTable.sku],
      references: [skuTable.id],
    }),
    stock: one(productStockTable, {
      fields: [
        stockTransactionTable.distribuidora_id,
        stockTransactionTable.sku,
      ],
      references: [productStockTable.distribuidora_id, productStockTable.sku],
    }),
  }),
)

export type InsertStockTransaction = typeof stockTransactionTable.$inferInsert
export type SelectStockTransaction = typeof stockTransactionTable.$inferSelect

export const supplierTable = sqliteTable('supplier', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
    () => new Date(),
  ),
})

export type InsertSupplier = typeof supplierTable.$inferInsert
export type SelectSupplier = typeof supplierTable.$inferSelect
export const insertSupplierSchema = createInsertSchema(supplierTable)

export const stockTransferenceTable = sqliteTable('stock_transferance', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  created_at: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).default(
    sql`(CURRENT_TIMESTAMP)`,
  ),
  created_by: text('created_by')
    .notNull()
    .references(() => userTable.username),
  from_distribuidora_id: integer('from_distribuidora_id')
    .notNull()
    .references(() => distribuidoraTable.id),
  to_distribuidora_id: integer('from_distribuidora_id')
    .notNull()
    .references(() => distribuidoraTable.id),

  status: text('status', {
    enum: ['CONFIRMED', 'CANCELED', 'PENDING'],
  }).default('PENDING'),
})

export const insertStockTransferenceSchema = createInsertSchema(
  stockTransferenceTable,
).omit({
  created_by: true,
})
export type InsertStockTransference = typeof stockTransferenceTable.$inferInsert
export type SelectStockTransference = typeof stockTransferenceTable.$inferSelect

export const stockTransferanceSKUTable = sqliteTable('tranferance_tem', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  sku: integer('sku')
    .notNull()
    .references(() => skuTable.id),
  quantity: integer('quantity').notNull(),
})

export const insertTransferenceSKUSchema = createInsertSchema(
  stockTransferanceSKUTable,
)
export type InsertTransferenceSKU =
  typeof stockTransferanceSKUTable.$inferInsert
export type SelectTransferenceSKU =
  typeof stockTransferanceSKUTable.$inferSelect
