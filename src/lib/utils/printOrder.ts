import type { SelectTenant } from '$lib/server/db/central/schema'
import { formatCurrency } from '$lib/utils'
import type { RouterOutputs } from '$trpc/router'
import { toast } from 'svelte-sonner'

type Order = RouterOutputs['customer']['getOrderById']

export async function printOrderReusable(tenant: SelectTenant, order: Order) {
  try {
    toast.info('Imprimindo pedido...')

    if (!order) {
      toast.error('Pedido não encontrado')
      return
    }

    const now = new Date()
    const date = now.toLocaleDateString('pt-BR')
    const time = now.toLocaleTimeString('pt-BR', { hour12: false })

    const info: string[] = []

    info.push('\x1B\x21\x00') // Reset
    info.push('\x1B\x61\x01') // Center
    info.push('\x1B\x45\x01') // Bold on
    info.push(`Duarte distribuidora ${tenant.name}\n\n`)
    info.push('\x1B\x45\x00') // Bold off
    info.push(`${tenant.address}\n`)
    info.push(`${tenant.phone}\n`)
    info.push('TODO: CNPJ\n\n')

    info.push('\x1B\x45\x01')
    info.push('----------------------------------------\n\n')
    info.push('\x1B\x45\x00')
    info.push(`IMPRESSO EM: ${date} ${time}\n\n`)
    info.push(`RELATÓRIO GERENCIAL\n\n`)
    info.push('\x1B\x61\x00') // Left

    if (order.customer) {
      info.push(`${order.customer.name}\n`)
      info.push(
        `${order.customer.phone ?? ''} - ${order.customer.cellphone ?? ''}\n`,
      )
    }

    if (order.address) {
      const addr = order.address
      info.push(
        `Endereço de entrega: ${addr.street}, ${addr.number}, ${addr.neighborhood}, ${addr.city}\n`,
      )
    }

    if (order.motoboy) {
      info.push(`Entregador: ${order.motoboy.username}\n\n`)
    }

    info.push('\x1B\x61\x01') // Center
    info.push(`(Pedido: N.:${order.id})\n`)

    if (order.observation) {
      info.push(`Observação: ${order.observation}\n\n`)
    }

    info.push('\x1B\x45\x01')
    info.push('----------------------------------------\n')
    info.push('ITEM                               PREÇO\n')
    info.push('----------------------------------------\n\n')
    info.push('\x1B\x45\x00')

    order.items.forEach(item => {
      let length = 33
      const priceLength = item.price.toString().length
      if (priceLength >= 7) {
        length = 29
      } else if (priceLength >= 6) {
        length = 30
      } else if (priceLength >= 5) {
        length = 31
      } else if (priceLength >= 4) {
        length = 32
      }

      console.log(item.price.toString().length, length)
      const left = `${item.quantity}x ${item.product.name}`.padEnd(length, ' ')
      const right = formatCurrency(item.price)
      info.push('\x1B\x61\x00')
      info.push(left)
      info.push('\x1B\x61\x02')
      info.push(right + '\n')
    })

    info.push('\x1B\x45\x01')
    info.push('\n----------------------------------------\n\n')
    info.push('\x1B\x45\x00')

    info.push('\x1B\x61\x02')
    info.push(
      `TOTAL: ${formatCurrency(order.total - (order.taxa_entrega ?? 0))}\n`,
    )
    info.push(`+ ENTREGA: ${formatCurrency(order.taxa_entrega ?? 0)}\n`)
    info.push(`= TOTAL A PAGAR: ${formatCurrency(order.total)}\n`)

    if (order.created_by) {
      info.push('\x1B\x61\x00')
      info.push(`Atendente: ${order.created_by.username}\n`)
    }

    info.push('\x1B\x61\x01')
    info.push('----------------------------------------\n\n')
    info.push('\x1D\x56\x01')

    return info
  } catch (error) {
    console.error(error)
    toast.error('Erro! Verifique se a impressora está conectada')
  }
}
