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
  import type { SelectCustomerOrder } from '$lib/server/db/schema'
  import Print from 'lucide-svelte/icons/printer'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import { formatCurrency } from '$lib/utils'
  import qz from 'qz-tray'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
    i18n: {
      show: 'Mostrar',
      entries: 'entradas',
      previous: 'Anterior',
      next: 'Próximo',
      noRows: 'Nenhum encontrado',
      filter: 'Filtrar',
    },
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

  async function printOrder(order_id: SelectCustomerOrder['id']) {
    isLoading = true
    var config = qz.configs.create(usingPrinter,{
      encoding: 'CP850'
    })

    toast.info('Imprimindo pedido...')

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

      const info = []

      info.push('\x1B\x21\x00') // Reset
      info.push('\x1B\x61\x01') // Justify center
      // info.push('\x1B' + '\x4D' + '\x31')

      info.push('\x1B\x45\x01') // Bold on
      info.push(`Duarte distribuidora ${data.tenant?.name}\n\n`)
      info.push('\x1B\x45\x00') // Bold off

      info.push(`${data.tenant?.address}\n`)
      info.push(`${data.tenant?.phone}\n`)
      info.push('TODO: CNPJ\n\n')

      info.push('\x1B\x45\x01')
      info.push('----------------------------------------\n\n')
      info.push('\x1B\x45\x00')

      info.push(`IMPRESSO EM: ${dataFormatada} ${horaFormatada}\n\n`)
      info.push(`RELATÓRIO GERENCIAL\n\n`)

      info.push('\x1B\x61\x00') // Justify left
      if(order.customer) {
        info.push(`${order.customer.name}\n`)
        info.push(
          `${order.customer.phone ?? ''} - ${order.customer.cellphone ?? ''}\n`,
        )
      }
      if(order.address) {
        info.push(
          `Endereço de entrega: ${order.address.street}, ${order.address.number}, ${order.address.neighborhood}, ${order.address.city}\n`,
        )
      }
      if(order.motoboy) {
        info.push(`Entregador: ${order.motoboy.username}\n\n`)
      }

      info.push('\x1B\x61\x01') // Justify center
      info.push(`(Pedido: N.:${order.id})\n`)

      if(order.observation) {
        info.push(`Observação: ${order.observation}\n\n`)
      }

      info.push('\x1B\x45\x01')
      info.push('----------------------------------------\n')
      info.push('ITEM                               PREÇO\n')
      info.push('----------------------------------------\n\n')
      info.push('\x1B\x45\x00')

      order.items.forEach(item => {
        const itemText = `${item.quantity}x ${item.product.name}`.padEnd(
          34,
          ' ',
        )
        const price = `${formatCurrency(item.price)}`

        info.push('\x1B\x61\x00') // Left
        info.push(itemText)

        info.push('\x1B\x61\x02') // Right
        info.push(price + '\n')
      })

      info.push('\x1B\x45\x01')
      info.push('\n----------------------------------------\n\n')
      info.push('\x1B\x45\x00')

      info.push('\x1B\x61\x02') // Right
      info.push(
        `TOTAL: ${formatCurrency(order.total - (order.taxa_entrega ?? 0))}\n`,
      )
      info.push(`+ ENTREGA: ${formatCurrency(order.taxa_entrega ?? 0)}\n`)

      info.push('\x1B\x45\x01')
      info.push(`= TOTAL A PAGAR: ${formatCurrency(order.total)}\n`)
      info.push('\x1B\x45\x00')

      if ( order.created_by) {
        info.push('\x1B\x61\x00') // Left
        info.push(`Atendente: ${order.created_by.username}\n`)
      }

      info.push('\x1B\x61\x01') // Center
      info.push('----------------------------------------\n')

      info.push('\n\n')
      info.push('\x1D\x56\x01')

      qz.print(config, info).catch(function (e) {
        console.error(e)
      })

      toast.success('Pedido impresso com sucesso!')
      isOpenModal?.close()
    } catch (error) {
      console.log(error)
      toast.error('Erro! Verifique se a impressora está conectada')
    } finally {
      isLoading = false
    }
  }

  let printers: string[] | string | undefined = $state()
  let usingPrinter = $state('')

  let isOpenModal: HTMLDialogElement | null = $state(null)
  let selectedOrder: number | null = $state(null)

  let isLoading = $state(false)

  async function listPrinters() {
    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect()
      }
      printers = await qz.printers.find()

      if (printers.length === 0) {
        toast.error('Nenhuma impressora encontrada')
        return
      }

      if (printers.length === 1) {
        usingPrinter = printers[0]
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao conectar à impressora')
      return 'error'
    }
  }

  async function handleOpenModal(orderId: number) {
    const resp = await listPrinters()
    if (resp === 'error') {
      return
    }
    isOpenModal?.showModal()
    selectedOrder = orderId
  }
</script>

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-2xl">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>
    <h2 class="text-lg font-bold">Imprimir pedido</h2>
    <p class="py-4">Selecione a impressora e clique em imprimir</p>
    <div class="flex flex-col gap-4">
      <select bind:value={usingPrinter} class="select select-bordered w-full">
        {#if printers && typeof printers === 'object'}
          {#each printers as printer}
            <option value={printer}>
              {printer}
            </option>
          {/each}
        {:else if printers && printers.length > 0}
          {usingPrinter}
        {/if}
      </select>
      <button
        class="btn btn-primary"
        disabled={isLoading}
        onclick={() => {
          if (selectedOrder != null) {
            printOrder(selectedOrder)
          }
        }}
      >
        Imprimir
      </button>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </div>
</dialog>

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
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
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
              {filters}
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
        {#each data.rows as row (row.id)}
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
            <td>
              <b class="text-lg text-success">
                {(row.total / 100).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </b>
            </td>

            <td>
              <a href="/admin/orders/{row.id}" class="badge badge-primary">
                Detalhes
              </a>
            </td>
            <td>
              <button onclick={() => handleOpenModal(row.id)}><Print /></button>
            </td>
          </tr>
        {/each}
        <tr class="bg-colorr sticky bottom-0">
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td class="text-xl font-bold">
            Total: <span class="text-secondary">
              {formatCurrency(data.totalSum)}
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
  .bg-colorr {
    background-color: oklch(var(--b1)) !important;
  }
</style>
