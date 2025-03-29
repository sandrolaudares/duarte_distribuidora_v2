/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  skuTable,
  cashierTable,
  stockTransactionTable,
  userTable,
  logsTable,
  customerOrderTable,
  customerTable,
  addressTable,
  orderItemTable,
} from '$db/schema'

import type {
  SelectCashier,
  InsertCashier,
  InsertLogs,
  SelectCustomerOrder,
} from '$db/schema'

import { eq, sql } from 'drizzle-orm'
import type { TenantDbType } from '../../tenant'
import { centralDb } from '$db/central'
import { tenants, type SelectTenant } from '../../central/schema'

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

  getDistribuidoras: () => {
    return centralDb.select().from(tenants)
  },
  getAdmins: () => {
    return db
      .select({
        id: userTable.id,
        name: userTable.username,
        email: userTable.email,
      })
      .from(userTable)
      .where(eq(userTable.role, 'admin'))
  },
  
  imprimirPedido: async (
    orderId: SelectCustomerOrder['id'],
    tenantId: SelectTenant['tenantId'],
  ) => {
    
    try {
      
      const [tenant] = await centralDb
        .select()
        .from(tenants)
        .where(eq(tenants.tenantId, tenantId))
        .limit(1)
  
      const order = await db.query.customerOrderTable.findFirst({
        where: eq(customerOrderTable.id, orderId),
        with: {
          customer: true,
          address: true,
          motoboy: true,
          created_by: true,
          items: {
            with: {
              product: true,
            },
          },
        },
      })
      if (!order) {
        throw new Error('Pedido não encontrado')
      }
  
      const data = new Date()
  
      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
      const horaFormatada = data.toLocaleTimeString('pt-BR', { hour12: false })
      //TODO: CNPJ
      //TODO: FULL ADDRESS
  
      // device.open(async (err) => {
      //   if (err) {
      //     console.error("Failed to open printer:", err);
      //     return;
      //   }
      //   printer
      //     .font('a')
      //     .align('ct')
      //     .style('bu')
      //     .size(1, 1)
      //     .text(`Duarte distribuidora ${tenant.name}`,)
      //     .text(`${tenant.address}`)
      //     .text(`${tenant.phone}`)
      //     .text('TODO: CNPJ')
      //     .text('--------------------------------')
      //     .text(`IMPRESSO EM: ${dataFormatada} ${horaFormatada}`)
      //     .text(`RELATÓRIO GERENCIAL`)
      //     .align('lt')
      //     .text(`${order.customer?.name}`)
      //     .text(`${order.customer?.phone} - ${order.customer?.cellphone}`)
      //     .text(
      //       `Endereço de entrega ${order.address?.street}, ${order.address?.number}, ${order.address?.neighborhood}, ${order.address?.city}`,
      //     )
      //     .text(`Entregador: ${order.motoboy?.username}`)
      //     .align('ct')
      //     .text(`(Pedido: N.:${order.id})`)
      //     .align('lt')
      //     .tableCustom([
      //       { text: 'Item', align: 'LEFT', width: 0.6 },
      //       { text: 'Preço', align: 'RIGHT', width: 0.2 },
      //     ])
      //   order.items.forEach(item => {
      //     printer.tableCustom([
      //       {
      //         text: `${item.quantity}x ${item.product.name}`,
      //         align: 'LEFT',
      //         width: 0.6,
      //       },
      //       { text: `R$ ${item.price.toFixed(2)}`, align: 'RIGHT', width: 0.2 },
      //     ])
      //   })
      //   printer.align('ct')
      //   .text('--------------------------------')
      //   .align('rt')
      //   .text(`TOTAL: R$${((order.total - (order.taxa_entrega ?? 0)).toFixed(2))}`)
      //   .text(`+ ENTREGA: R$${(order.taxa_entrega ?? 0).toFixed(2)}`)
      //   .text(`= TOTAL A PAGAR: R$${order.total.toFixed(2)}`)
      //   .align('lt')
      //   .text(`Atendente: ${order.created_by?.username}`)
      //   .text('--------------------------------')
      //   .cut()
      //   .close()
      // })
      // console.log('Pedido impresso')

    } catch (error:unknown) {
      // console.error(error.message)
    }
  },
})
