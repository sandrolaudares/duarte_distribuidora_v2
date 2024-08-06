/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  distribuidoraTable,
  productStockTable,
  stockTransactionTable,
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
} from '$db/schema'

import { db } from '$db'
import { and, eq, sql } from 'drizzle-orm'
import { LibsqlError } from '@libsql/client'

function insertSKU(data: InsertSku) {
  return db.insert(skuTable).values(data)
}
function getSKU() {
  return db.select().from(skuTable)
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

async function processStockTransaction(transaction: {
  distribuidora_id: SelectDistribuidora['id']
  sku_id: SelectSku['id']
  quantity: number
  meta_data: SelectStockTransaction['meta_data']
}) {
  const { distribuidora_id, sku_id, quantity, meta_data } = transaction
  try {
    await insertProductStock({
      distribuidora_id,
      sku: sku_id,
    })
  } catch (e) {
    if (e instanceof LibsqlError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      //  expected error
    } else {
      console.log(e)
    }
  }

  await insertStockTransaction({
    meta_data: meta_data,
    quantity,
    distribuidora_id,
    sku: sku_id,
    type: quantity > 0 ? 'Entrada' : 'Saida',
  })
}

export const stock = {
  tables: {
    skuTable,
    productStockTable,
  },
  insertSKU,
  getSKU,
  insertProductStock,
  // insertStockTransaction,
  processStockTransaction,
  getProductStock,
  getDistributionStock,
}
