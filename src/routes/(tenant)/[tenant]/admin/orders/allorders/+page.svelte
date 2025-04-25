<script lang="ts">
  import { navigating } from '$app/state'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { page } from '$app/state'

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
  import { printOrderReusable } from '$lib/utils/printOrder'
  import { getPrinterContext } from './printerContext.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import ModalPrint from '$lib/components/cashierComponents/ModalPrint.svelte'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const prr = getPrinterContext()

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
      await navigating?.complete
    } catch (error) {
      console.log(error)
    }
    return data.rows
  })

  let isOpenModal: HTMLDialogElement | null = $state(null)
  let selectedOrder: number | null = $state(null)

  let isLoading = $state(false)

  let loadingPrinters = $state(false)

  async function handleOpenModal(orderId: number) {
    loadingPrinters = true

    await prr.connect()

    if (prr.getPrinter() && prr.getPrinters().length === 0) {
      prr.addPrinter(prr.getPrinter())
    } else if (!prr.getPrinter()) {
      await prr.listPrinters()
    }

    isOpenModal?.showModal()
    selectedOrder = orderId
    loadingPrinters = false
  }

</script>

{#if loadingPrinters}
  <LoadingBackground />
{/if}

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-2xl">
    <form method="dialog">
      <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">
        ✕
      </button>
    </form>
    <ModalPrint
      bind:loadingPrinters
      tenant={data.tenant!}
      bind:selectedOrder
      closeModal={() => {
        isOpenModal?.close()
      }}
    />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<main class="m-4 h-full max-h-[calc(100vh-20vh)]">
  <div class="flex items-center justify-between">
    <h1 class="my-5 text-center text-2xl font-medium">Todos os pedidos:</h1>
    <button
      class="btn btn-primary"
      onclick={() =>
        table.clearFilters()}
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
