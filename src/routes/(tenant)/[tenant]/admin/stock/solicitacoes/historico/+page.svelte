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
  import { format } from 'date-fns'

  import { toast } from 'svelte-sonner'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import { goto, invalidate, invalidateAll } from '$app/navigation'
  import Loading from '$lib/components/Loading.svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'

  let { data }: { data: PageData } = $props()

  let isOpenModal: HTMLDialogElement | null = null

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: data.size,
    totalRows: data.count,
    selectBy: 'id',
  })

  table.setPage(Number(filters.get('page')) || 1)
  table.load(async s => {
    try {
      console.log(s)
      filters.fromState(s)
      await $navigating?.complete
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

<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
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
              onchange={(start, end) => {
                if (start != null && end != null) {
                  let startDate = start.toString()
                  let endDate = end.toString()
                  filters.update({ startDate, endDate })
                }
              }}
            />
          </Th>
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr>
            <td>{row.id}</td>
            <td>{row.sku_name}</td>
            <td>{format(row.created_at!, 'dd/MM/yyyy')}</td>
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
