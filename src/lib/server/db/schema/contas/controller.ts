import { eq } from 'drizzle-orm'
import {
  categoriaConta,
  contasPagarTable,
  tipoPagamentoConta,
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
  insertTipoPagamento: (input: InsertCategoria) => {
    return db.insert(tipoPagamentoConta).values(input)
  },
  pagarConta: (id: number) => {
    return db
      .update(contasPagarTable)
      .set({ isPaid: true, paid_at: new Date() })
      .where(eq(contasPagarTable.id, id))
  },
  deletarConta: (id:number) => {
    return db.delete(contasPagarTable).where(eq(contasPagarTable.id, id))
  }
})
