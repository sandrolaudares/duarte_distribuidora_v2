<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'

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
  import NoResults from '$lib/components/NoResults.svelte'

  import { toast } from 'svelte-sonner'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { goto, invalidate, invalidateAll } from '$app/navigation'
  import Loading from '$lib/components/Loading.svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import { DateFormatter } from '@internationalized/date'

  let { data }: { data: PageData } = $props()

  let isOpenModal: HTMLDialogElement | null = null

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: data.size,
    totalRows: data.count,
    selectBy: 'id',
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
    try {
      await filters.fromState(s)
      s.setTotalRows(data.count)
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  let isLoading = $state(false)
</script>

{#if isLoading}
  <div class="absolute left-1/2 top-1/2 z-50">
    <Loading />
  </div>
{/if}

<main class="mx-4 h-full max-h-[calc(100vh-20vh)]">
  <div class="flex items-center justify-between">
    <h1 class="my-5 text-center text-2xl font-medium">
      Historico de transferências:
    </h1>
  </div>
  <Datatable {table} headless>
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-zebra rounded-none border">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <Th>Produto</Th>
          <Th>Data</Th>
          <Th>Saiu de</Th>
          <Th>Quantidade</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="sku_name" />
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
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row (row.id)}
          <tr>
            <td>{row.id}</td>
            <td>{row.sku_name}</td>
            <td>{df.format(row.created_at!)}</td>
            <td>
              {data.distribuidoras.find(
                distribuidora => distribuidora.tenantId === row.toTenantId,
              )?.name}
            </td>
            <td>{row.quantity}</td>
          </tr>
        {/each}
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
