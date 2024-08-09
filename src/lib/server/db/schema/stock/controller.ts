/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  distribuidoraTable,
  productStockTable,
  stockTransactionTable,
  supplierTable,
  stockTransferanceSKUTable,
  stockTransferenceTable,
} from '$db/schema'

import type {
  SelectProductStock,
  InsertProductStock,
  SelectProductItem,
  SelectDistribuidora,
  InsertDistribuidora,
  InsertStockTransaction,
  SelectSku,
  InsertSku,
  SelectStockTransaction,
  SelectSupplier,
  InsertSupplier,
  InsertStockTransference,
  InsertTransferenceSKU,
  SelectTransferenceSKU,
  SelectStockTransference,
} from '$db/schema'

import { db } from '$db'
import { and, desc, eq, gt, ne, sql } from 'drizzle-orm'
import { LibsqlError } from '@libsql/client'

function insertSKU(data: InsertSku) {
  return db.insert(skuTable).values(data)
}
function getSKU() {
  return db.select().from(skuTable)
}

function getSKUWithStock() {
  return db
    .select()
    .from(skuTable)
    .leftJoin(productStockTable, eq(skuTable.id, productStockTable.sku))
}

function getInfoSKU(sku_id: SelectSku['id']) {
  return db.query.skuTable.findFirst({
    where: eq(skuTable.id, sku_id),
    with: {
      product_stock: {
        with: {
          distribuidora: true,
        },
      },
    },
  })
}

function insertProductStock(data: InsertProductStock) {
  return db.insert(productStockTable).values(data)
}

function getProductStock(
  distribuidora_id: SelectDistribuidora['id'],
  sku_id: SelectSku['id'],
) {
  return db
    .select()
    .from(productStockTable)
    .where(
      and(
        eq(productStockTable.distribuidora_id, distribuidora_id),
        eq(productStockTable.sku, sku_id),
      ),
    )
}

function getTransactionsFromProduto(data: {
  distribuidora_id: SelectDistribuidora['id']
  sku: SelectSku['id']
}) {
  const { distribuidora_id, sku } = data
  return db
    .select()
    .from(stockTransactionTable)
    .where(
      and(
        eq(stockTransactionTable.distribuidora_id, distribuidora_id),
        eq(stockTransactionTable.sku, sku),
      ),
    )
}

function getDistributionStock(distribuidora_id: SelectDistribuidora['id']) {
  return db
    .select()
    .from(productStockTable)
    .where(eq(productStockTable.distribuidora_id, distribuidora_id))
}

async function insertStockTransaction(data: InsertStockTransaction) {
  const { sku, distribuidora_id } = data
  return await db.transaction(async trx => {
    await trx.insert(stockTransactionTable).values(data)
    await trx
      .update(productStockTable)
      .set({
        quantity: sql`${productStockTable.quantity} + ${data.quantity}`,
      })
      .where(
        and(
          eq(productStockTable.distribuidora_id, distribuidora_id),
          eq(productStockTable.sku, sku),
        ),
      )
  })
}

async function processStockTransaction(transaction: InsertStockTransaction) {
  const { distribuidora_id, sku, quantity, meta_data } = transaction
  try {
    await insertProductStock({
      distribuidora_id,
      sku,
    })
  } catch (e) {
    if (e instanceof LibsqlError && e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      //  expected error
    } else {
      console.log(e)
    }
  }

  await insertStockTransaction(transaction)
}

function insertSupplier(data: InsertSupplier) {
  return db.insert(supplierTable).values(data)
}

function getSupplier() {
  return db.select().from(supplierTable)
}

async function createTransferenciaEstoque(data: {
  transference_data: InsertStockTransference
  items: InsertTransferenceSKU[]
}) {
  const { items, transference_data } = data
  const [transference] = await db
    .insert(stockTransferenceTable)
    .values(transference_data)
    .returning()

  const tranferance_Item = await db
    .insert(stockTransferanceSKUTable)
    .values(items)

  return { transference, tranferance_Item }
}

function updateTransference(
  id: SelectStockTransference['id'],
  data: Partial<SelectStockTransference>,
) {
  return db
    .update(stockTransferenceTable)
    .set(data)
    .where(eq(stockTransferenceTable.id, id))
}

function updateTransferenceSKU(
  id: SelectTransferenceSKU['id'],
  data: Partial<SelectTransferenceSKU>,
) {
  return db
    .update(stockTransferanceSKUTable)
    .set(data)
    .where(eq(stockTransferanceSKUTable.id, id))
}

function queryLastCostPrice(sky: SelectSku['id']) {
  return db.query.stockTransactionTable.findFirst({
    where: t => and(eq(t.sku, sky), eq(t.type, 'Entrada'), gt(t.cost_price, 0)),
    columns: {
      cost_price: true,
    },
    orderBy: [desc(stockTransactionTable.created_at)],
  })
}

export const stock = {
  tables: {
    skuTable,
    productStockTable,
  },
  insertSKU,
  getSKU,
  getInfoSKU,
  getSKUWithStock,
  getTransactionsFromProduto,
  insertProductStock,
  // insertStockTransaction,
  processStockTransaction,
  getProductStock,
  getDistributionStock,
  insertSupplier,
  getSupplier,
  createTransferenciaEstoque,
  updateTransferenceSKU,
  updateTransference,
  queryLastCostPrice,
}
