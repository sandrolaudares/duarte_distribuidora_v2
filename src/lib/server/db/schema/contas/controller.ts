/* eslint-disable @typescript-eslint/no-unused-vars */
import { contasPagarTable, type InsertConta } from '.'
import type { TenantDbType } from '../../tenant'

export const contasController = (db: TenantDbType) => ({
  tables: {
    contasPagarTable
  },
  insertConta: (input: InsertConta) => {
    return db.insert(contasPagarTable).values(input)
  },
})
