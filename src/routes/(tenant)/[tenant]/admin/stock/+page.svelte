<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
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
  import DateFilter from '../../../../../lib/components/DateFilter.svelte'
  import { format } from 'date-fns'

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

  function add() {
    modal.open(FormModal, {
      title: 'Create',
      fields: [
        {
          label: 'Name',
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          label: 'codigo',
          name: 'sku',
          type: 'text',
          required: true,
        },
      ],
      save: async toSave => {
        try {
          const resp = await trpc($page).stock.insertSKU.mutate(toSave)
          console.log(resp)

          if (resp) {
            toast.success('SKU Created')
          }
          window.location.reload()
        } catch (error: any) {
          toast.error(error.message)
          return error.message
        }
      },
    })
  }
</script>

<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
  <div class="mt-2 flex items-center justify-between">
    <h1 class="text-2xl font-semibold">Estoque:</h1>
    <div>
      <button class="btn btn-primary" onclick={add}>Criar SKU</button>
      <a href="/admin/stock/entrada" class="btn btn-secondary">
        Entrada de estoque
      </a>
    </div>
  </div>
  <Datatable {table} headless={true}>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <div class="spinner" class:active={table.isLoading}></div>
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table">
      <thead>
        <tr>
          <ThSort {table} field="sku">SKU</ThSort>
          <Th>Name</Th>
          <Th>Quantidade</Th>
          <Th>Criado em</Th>
          <Th>Ver detalhes</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="name"></ThFilter>
          <Th />
          <Th/>
          <Th/>
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row}
          <tr
          >
            <td>{row.sku}</td>
            <td>{row.name}</td>
            <td>{row.quantity}</td>
            <td>{row.created_at}</td>
            <!--TODO: Change created at in DB to timestamp-->
            <td>
              <a href="/admin/stock/{row.sku}" class="badge badge-primary">
                Detalhes
              </a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if table.rows.length === 0}
      <NoResults />
    {/if}
    {#snippet footer()}
      <RowsPerPage {table} />
      <div></div>
      <Pagination {table} />
    {/snippet}
  </Datatable>
</main>
