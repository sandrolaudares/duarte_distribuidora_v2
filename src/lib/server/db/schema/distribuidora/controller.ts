/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  cashierTable,
  cashierTransactionTable,
  stockTransactionTable,
  userTable,
  deliveryFeeTable,
} from '$db/schema'

import type {
  SelectCashier,
  InsertCashier,
  SelectCashierTransaction,
  InsertCashierTransaction,
} from '$db/schema'

import { eq, sql } from 'drizzle-orm'
import type { TenantDbType } from '../../tenant'

export const distribuidora = (db: TenantDbType) => ({
  insertCashier: function insertCashier(data: InsertCashier) {
    return db.insert(cashierTable).values(data)
  },
  getCashier: function getCashier() {
    return db.select().from(cashierTable)
  },
  getCashierById: function getCashierById(id: SelectCashier['id']) {
    return db
      .select()
      .from(cashierTable)
      .where(eq(cashierTable.id, id))
      .limit(1)
  },
  insertCashierTransaction: function insertCashierTransaction(
    data: InsertCashierTransaction | InsertCashierTransaction[],
    subtract = false,
  ) {
    if (Array.isArray(data)) {
      return db.transaction(async trx => {
        const total = data.reduce((acc, curr) => acc + curr.amount, 0)
        await trx.insert(cashierTransactionTable).values(data)
        if (subtract) {
          await trx
            .update(cashierTable)
            .set({
              currency: sql`${cashierTable.currency} + ${total}`,
            })
            .where(eq(cashierTable.id, data[0].cachier_id))
        }
      })
    } else {
      return db.transaction(async trx => {
        await trx.insert(cashierTransactionTable).values(data)
        if (subtract) {
          await trx
            .update(cashierTable)
            .set({
              currency: sql`${cashierTable.currency} - ${data.amount}`,
            })
            .where(eq(cashierTable.id, data.cachier_id))
        } else {
          await trx
            .update(cashierTable)
            .set({
              currency: sql`${cashierTable.currency} + ${data.amount}`,
            })
            .where(eq(cashierTable.id, data.cachier_id))
        }
      })
    }
  },
  justInsertCashierTransaction: function justInsertCashierTransaction(
    data: InsertCashierTransaction,
  ) {
    return db.insert(cashierTransactionTable).values(data)
  },
  getCashierTransactions: function getCashierTransactions(
    cachier_id: SelectCashier['id'],
  ) {
    return db
      .select()
      .from(cashierTransactionTable)
      .where(eq(cashierTransactionTable.cachier_id, cachier_id))
  },
  updateCashier: function updateCashier(
    id: SelectCashier['id'],
    data: Partial<SelectCashier>,
  ) {
    return db.update(cashierTable).set(data).where(eq(cashierTable.id, id))
  },
  deleteCashierById: function deleteCashierById(id: SelectCashier['id']) {
    return db.delete(cashierTable).where(eq(cashierTable.id, id))
  },
  getMotoboys: () => {
    return db.select().from(userTable).where(eq(userTable.role, 'motoboy'))
  },
  updateKmForAllCaixas: async function updateKmForAllCaixas(
    newTaxaPorKm: number,
  ) {
    return db.update(deliveryFeeTable).set({ taxa_por_km: newTaxaPorKm })
  },
  getFee: function getFee() {
    return db.select().from(deliveryFeeTable)
  },
})
