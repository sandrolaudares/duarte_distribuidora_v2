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
  import { tr } from 'date-fns/locale'
  import NoResults from '$lib/components/NoResults.svelte'
  import { format } from 'date-fns'
  import { goto } from '$app/navigation'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: 10,
    totalRows: data.count,
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
</script>

<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
  <div class="flex justify-between items-center">
    <h1 class="my-5 text-center text-2xl font-medium">Todos os pedidos:</h1>
    <button class="btn btn-primary" onclick={()=>filters.clear('name','created_by','startDate','endDate')}>Limpar filtros</button>
  </div>
  <Datatable {table} headless>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-zebra border">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <Th>Cliente</Th>
          <Th>Caixa</Th>
          <Th>Observações</Th>
          <ThSort {table} field="created_at">Data do pedido</ThSort>
          <ThSort {table} field="total">Valor do pedido</ThSort>

          <Th>Ver detalhes</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="name" />
          <ThFilter {table} field="created_by" />
          <Th />
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
            <td><b>{row.name}</b></td>
            <td><b>{row.created_by}</b></td>
            <td><b>{row.observation}</b></td>
            <td>
              <b>
                {row.created_at ? format(row.created_at, 'dd/MM/yyyy') : ''}
              </b>
            </td>
            <td><b class="text-xl text-success">R${row.total / 100}</b></td>

            <td>
              <a href="/admin/orders/{row.id}" class="badge badge-primary">
                Detalhes
              </a>
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
