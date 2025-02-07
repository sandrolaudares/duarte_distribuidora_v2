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
    try {
      console.log(s)
      filters.fromState(s)
      await $navigating?.complete
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })
</script>

<main class="mx-4 h-full max-h-[calc(100vh-20vh)]">
  <Datatable {table} headless>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-zebra rounded-none border">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <Th>Usuário</Th>
          <Th>Logs</Th>
          <Th>Nome da rota</Th>
          <Th>Pathname</Th>
          <Th>Tipo</Th>
          <Th>Dinheiro</Th>
          <Th>Metadata</Th>
          <Th>Erro</Th>
          <Th>Data</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="user_name" />
          <ThFilter {table} field="text" />
          <Th />
          <Th />
          <Th />
          <Th />
          <Th />
          <Th />
          <Th />
          <!--FINALIZAR ESSA TABLE, FILTRO DE DATA E ETC-->
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr>
            <td>{row.id}</td>
            <td>{row.user_name}</td>
            <td>{row.text}</td>
            <td>{row.pathname}</td>
            <td>{row.routeName}</td>
            <td>{row.type}</td>
            <td>
              {row.currency
                ? 'R$' + (row.currency / 100).toFixed(2)
                : 'Não é transação'}
            </td>
            <td>{JSON.stringify(row.metadata)}</td>
            <td>{row.error ?? 'Não tem'}</td>
            <td>
              {row.created_at ? df.format(row.created_at) : ''}
            </td>
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
