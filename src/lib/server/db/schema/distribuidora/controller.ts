/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  cashierTable,
  stockTransactionTable,
  userTable,
  logsTable,
} from '$db/schema'

import type {
  SelectCashier,
  InsertCashier,

  InsertLogs,
} from '$db/schema'

import { eq, sql } from 'drizzle-orm'
import type { TenantDbType } from '../../tenant'
import { centralDb } from '$db/central'
import { tenants } from '../../central/schema'

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

  getDistribuidoras: ()=>{
    return centralDb.select().from(tenants)
  }
})
