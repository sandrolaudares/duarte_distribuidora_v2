import {
  categoriaConta,
  contasPagarTable,
  type InsertCategoria,
  type InsertConta,
} from '.'
import type { TenantDbType } from '../../tenant'

export const contasController = (db: TenantDbType) => ({
  tables: {
    contasPagarTable,
    categoriaConta,
  },
  insertConta: (input: InsertConta) => {
    return db.insert(contasPagarTable).values(input)
  },
  insertCategoria: (input: InsertCategoria) => {
    return db.insert(categoriaConta).values(input)
  },
})
