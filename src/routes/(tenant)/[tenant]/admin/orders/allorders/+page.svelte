<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { page } from '$app/stores'

  import {
    TableHandler,
    Datatable,
    ThSort,
    ThFilter,
    Pagination,
    RowsPerPage,
    Th,
    Search,
    type State,
  } from '@vincjo/datatables/server'

  import type { PageData } from './$types'
  import { toast } from 'svelte-sonner'
  import { trpc } from '$trpc/client'
  import NoResults from '$lib/components/NoResults.svelte'
  import { goto } from '$app/navigation'
  import { pageConfig } from '$lib/config'
  import { DateFormatter } from '@internationalized/date'
  import Printer, { JustifyModes, PrinterModes } from 'esc-pos-printer'
  import type { SelectCustomerOrder } from '$lib/server/db/schema'
  import Print from 'lucide-svelte/icons/printer';


  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    console.log(s)
    try {
      filters.fromState(s)
      await $navigating?.complete
    } catch (error) {
      console.log(error)
    }
    return data.rows
  })

  function printEmphasis(printer: Printer,text:string) {
    printer.setEmphasis(true)
    printer.text(text)
    printer.setEmphasis(false)
  }

  async function printOrder(order_id: SelectCustomerOrder['id']) {
    toast.info('Imprimindo pedido...')
    console.log('IMPRIMINDO PEDIDO')
    const datt = new Date()

    const dataFormatada = datt.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const horaFormatada = datt.toLocaleTimeString('pt-BR', { hour12: false })
    try {
      const order = await trpc($page).customer.getOrderById.query(order_id)

      if (order === undefined || order === null) {
        toast.error('Pedido não encontrado')
        console.error('Pedido não encontrado')
        return
      }
      const printer = new Printer()

      const printerList = await printer.getPrinters()
      printer.setPrinterName(printerList[0])
      console.log(printerList)
      printer.selectPrintMode(PrinterModes.MODE_FONT_A)
      printer.justify(JustifyModes.justifyCenter)
      printEmphasis(printer,`Duarte distribuidora ${data.tenant?.name}\n\n`)
      printer.text(`${data.tenant?.address}\n`)
      printer.text(`${data.tenant?.phone}\n`)
      printer.text('TODO: CNPJ\n\n')
      printEmphasis(printer,'----------------------------------------\n\n')
      printer.text(`IMPRESSO EM: ${dataFormatada} ${horaFormatada}\n\n`)
      printer.text(`RELATÓRIO GERENCIAL\n\n`)
      printer.justify(JustifyModes.justifyLeft)
      printer.text(`${order.customer?.name}\n`)
      printer.text(
        `${order.customer?.phone ? order.customer?.phone : ''} - ${order.customer?.cellphone ? order.customer?.cellphone : ''}\n`,
      )
      printer.text(
        `Endereço de entrega: ${order.address?.street}, ${order.address?.number}, ${order.address?.neighborhood}, ${order.address?.city}\n`,
      )
      printer.text(`Entregador: ${order.motoboy?.username}\n\n`)
      printer.justify(JustifyModes.justifyCenter)
      printer.text(`(Pedido: N.:${order.id})\n`)
      printer.justify(JustifyModes.justifyCenter)
      printEmphasis(printer,'----------------------------------------\n')
      printer.text('ITEM                               PREÇO\n')
      printEmphasis(printer,'----------------------------------------\n\n')

      order.items.forEach(item => {
        const itemText = `${item.quantity}x ${item.product.name}`.padEnd(
          35,
          ' ',
        ) 
        const price = `R$${(item.price / 100).toFixed(2)}`

        printer.justify(JustifyModes.justifyLeft)
        printer.text(itemText)
        printer.justify(JustifyModes.justifyRight)
        printer.text(price + '\n')
      })
      printEmphasis(printer,'\n----------------------------------------\n\n')
      printer.justify(JustifyModes.justifyRight)
      printer.text(
        `TOTAL: R$${((order.total - (order.taxa_entrega ?? 0)) / 100).toFixed(2)}\n`,
      )
      printer.text(
        `+ ENTREGA: R$${((order.taxa_entrega ?? 0) / 100).toFixed(2)}\n`,
      )
      printEmphasis(printer,`= TOTAL A PAGAR: R$${(order.total / 100).toFixed(2)}\n`)
      printer.justify(JustifyModes.justifyLeft)
      printer.text(`Atendente: ${order.created_by?.username}\n`)
      printer.justify(JustifyModes.justifyCenter)
      printEmphasis(printer,'----------------------------------------\n')
      printer.feed(2)
      printer.cut()
      printer.close()
      await printer.print()
    } catch (error) {
      console.log(error)
      toast.error('Erro! Verifique se a impressora está conectada')
    }
  }
</script>

<main class="m-4 h-full max-h-[calc(100vh-20vh)]">
  <div class="flex items-center justify-between">
    <h1 class="my-5 text-center text-2xl font-medium">Todos os pedidos:</h1>
    <button
      class="btn btn-primary"
      onclick={() =>
        filters.clear('name', 'created_by', 'startDate', 'endDate')}
    >
      Limpar filtros
    </button>
  </div>
  <Datatable {table}>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-sm">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <Th>Cliente</Th>
          <Th>Caixa</Th>
          <Th>Observações</Th>
          <ThSort {table} field="created_at">Data do pedido</ThSort>
          <ThSort {table} field="total">Valor do pedido</ThSort>

          <Th>Ver detalhes</Th>
          <Th>Imprimir</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="name" />
          <ThFilter {table} field="created_by" />
          <Th />
          <Th>
            <DateFilter
              onChange={(startDate, endDate) => {
                if (!startDate || !endDate) return

                filters.update({
                  startDate: String(startDate),
                  endDate: String(endDate),
                })
              }}
            />
          </Th>
          <Th />

          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr>
            <td>{row.id}</td>
            <td class:text-error={!row.name}>
                {row.name ? row.name : 'Não vinculado'}
            </td>
            <td>{row.created_by}</td>
            <td class:text-error={!row.observation}>
                {row.observation ? row.observation : 'N/A'}
            </td>
            <td>
                {row.created_at ? df.format(row.created_at) : ''}
            </td>
            <td><b class="text-lg text-success">R${row.total / 100}</b></td>

            <td>
              <a href="/admin/orders/{row.id}" class="badge badge-primary">
                Detalhes
              </a>
            </td>
            <td>
              <button onclick={() => printOrder(row.id)}><Print />
              </button>
            </td>
          </tr>
        {/each}
        <tr>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="text-xl font-bold">
            Total: <span class="text-secondary">
              R${(data.totalSum / 100).toFixed(2)}
            </span>
          </td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    {#if data.rows.length === 0}
      <NoResults />
    {/if}
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</main>

<style>
  thead {
    background-color: oklch(var(--b1)) !important;
  }
</style>
