/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  stockTransactionTable,
  supplierTable,
} from '$db/schema'

import type {
  SelectProductItem,
  InsertStockTransaction,
  SelectSku,
  InsertSku,
  SelectStockTransaction,
  SelectSupplier,
  InsertSupplier,
} from '$db/schema'

import { and, desc, eq, gt, ne, sql } from 'drizzle-orm'
import { LibsqlError } from '@libsql/client'
import type { TenantDbType } from '../../tenant'

export const stock = (db: TenantDbType) => ({
  insertSKU(data: InsertSku) {
    return db.insert(skuTable).values(data)
  },
  getSKU() {
    return db.select().from(skuTable)
  },
  getSKUWithStock() {
    return db.select().from(skuTable)
  },
  async getSKUByID(sku_id: SelectSku['sku']) {
    return await db.query.skuTable.findFirst({
      where: eq(skuTable.sku, sku_id),
    })
  },
  deleteItemStock(sku: SelectSku['sku']) {
    return db.delete(skuTable).where(eq(skuTable.sku, sku))
  },
  getTransactionsFromProduto(data: { sku: SelectSku['sku'] }) {
    const { sku } = data
    return db
      .select()
      .from(stockTransactionTable)
      .where(eq(stockTransactionTable.sku, sku))
  },
  async insertStockTransaction(
    data: Omit<InsertStockTransaction, 'total_log'>,
  ) {
    const { sku } = data
    const [resp] = await db
      .update(skuTable)
      .set({
        quantity: sql`${skuTable.quantity} + ${data.quantity}`,
      })
      .where(eq(skuTable.sku, sku))
      .returning()
    await db.insert(stockTransactionTable).values({
      ...data,
      total_log: resp.quantity,
    })
    return resp

  },
  insertSupplier(data: InsertSupplier) {
    return db.insert(supplierTable).values(data)
  },
  getSupplier() {
    return db.select().from(supplierTable)
  },
  updateSupplier(
    id: SelectSupplier['id'],
    supplier: Partial<SelectSupplier>,
  ) {
    return db
      .update(supplierTable)
      .set(supplier)
      .where(eq(supplierTable.id, id))
      .run()
  },
  queryLastCostPrice(sku: SelectSku['sku']) {
    return db.query.stockTransactionTable.findFirst({
      where: t => and(eq(t.sku, sku), eq(t.type, 'Entrada'), gt(t.cost_price, 0)),
      columns: {
        cost_price: true,
      },
      orderBy: [desc(stockTransactionTable.created_at)],
    })
  },
 
})
