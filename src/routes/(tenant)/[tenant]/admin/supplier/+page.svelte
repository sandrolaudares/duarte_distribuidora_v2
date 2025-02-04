<script lang="ts">
  import { navigating } from '$app/stores'
  import { SSRFilters } from '$lib/components/datatable/filter.svelte'
  import { modal, FormModal } from '$lib/components/modal'
  import ModalSupplierComplete from './ModalSupplierComplete.svelte'
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
  import { pageConfig } from '$lib/config'

  let { data }: { data: PageData } = $props()

  const filters = new SSRFilters()

  const table = new TableHandler(data.rows, {
    rowsPerPage: pageConfig.rowPages,
    totalRows: data.count,
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

  function add() {
    modal.open(ModalSupplierComplete, {})
  }
</script>

<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
  <section class="container mx-auto mb-4 px-4">
    <div class="mt-2 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Fornecedores:</h1>
      <button class="btn btn-primary min-w-96" onclick={add}>
        Criar fornecedor
      </button>
    </div>
  </section>
  <Datatable {table}>
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    <table class="table table-zebra">
      <thead>
        <tr>
          <ThSort {table} field="id">ID</ThSort>
          <ThSort {table} field="name">Nome</ThSort>
          <Th>Razão social</Th>
          <Th>CPF/CNPJ</Th>
          <Th>RG/IE</Th>
          <Th>Telefone</Th>
          <Th>CEP</Th>
        </tr>
        <tr>
          <Th />
          <ThFilter {table} field="name" />
          <ThFilter {table} field="razao_social" />
          <Th />
          <Th />
          <ThFilter {table} field="telephone_1" />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row}
          <tr>
            <td>{row.id}</td>
            <td><b>{row.name}</b></td>
            <td><b>{row.razao_social}</b></td>
            <td><b>{row.cnpj_cpf}</b></td>
            <td><b>{row.ie_rg}</b></td>
            <td><b>{row.telephone_1}</b></td>
            <td><b>{row.cep}</b></td>
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
