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
    import { goto } from '$app/navigation';
  
    let { data }: { data: PageData } = $props()
  
    const filters = new SSRFilters()
  
    const table = new TableHandler(data.rows, {
      rowsPerPage: 10,
      totalRows: data.count,
    })
  
    table.setPage(Number(filters.get('page')) || 1)
    table.load(async s => {
      console.log(s)
      filters.fromState(s)
      await $navigating?.complete
      return data.rows
    })
  
  </script>
  
  <h1 class="my-5 text-center text-2xl font-medium">Solicitações de transferencia:</h1>
  <main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
    <Datatable {table} headless>
      <!-- {#snippet header()}
        <Search {table} />
       
      {/snippet} -->
      <!-- svelte-ignore component_name_lowercase -->
      <table class="table table-zebra border">
        <thead>
          <tr>
            <ThSort {table} field="id">ID</ThSort>
            <Th></Th>
          </tr>
          <tr>
            <Th />
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {#each data.rows as row}
            <tr>
              <td>{row.id}</td>
              <td class="py-2 px-4 border-b">
                <span class="px-2 py-1 rounded-full text-xs font-semibold
                  {row.status === 'ACCEPTED' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}">
                  {row.status}
                </span>
              </td>
              <td>{row.sku_name}</td>
              <td>{row.quantity}</td>
              <td>{row.created_at}</td>
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