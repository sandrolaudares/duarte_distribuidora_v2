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
  import NoResults from '$lib/components/NoResults.svelte'
  import { pageConfig } from '$lib/config'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'

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

  async function handleUpdateSup(value: string, key = '', row: any) {
    const last_val = row[key]
    if(!value) {
      toast.error('Valor inválido')
      return
    }
    try {
      await trpc($page).stock.updateSupplier.mutate({
        id: row.id,
        supplier: { [key]: value },
      })
      row[key] = value
      toast.success('Atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar')
      row[key] = last_val
    }
  }
</script>

<main class="h-full max-h-[calc(100vh-20vh)]">
  <section class="mb-4 px-4">
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
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
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
        </tr>
      </thead>
      <tbody>
        {#each table.rows as row (row.id)}
          <tr>
            <td>{row.id}</td>
            <td>
              <EditableCell
                value={row.name}
                onUpdateValue={async (newValue) => {
                  handleUpdateSup(newValue as string, 'name', row)
                }}
              /></td>
            <td><EditableCell
              value={row.razao_social}
              onUpdateValue={async (newValue) => {
                handleUpdateSup(newValue as string, 'razao_social', row)
              }}
            /></td>
            <td><EditableCell
              value={row.cnpj_cpf}
              onUpdateValue={async (newValue) => {
                handleUpdateSup(newValue as string, 'cnpj_cpf', row)
              }}
            /></td>
            <td><EditableCell
              value={row.ie_rg}
              onUpdateValue={async (newValue) => {
                handleUpdateSup(newValue as string, 'ie_rg', row)
              }}
            /></td>
            <td><EditableCell
              value={row.telephone_1}
              onUpdateValue={async (newValue) => {
                handleUpdateSup(newValue as string, 'telephone_1', row)
              }}
            /></td>
            <td><EditableCell
              value={row.cep}
              onUpdateValue={async (newValue) => {
                handleUpdateSup(newValue as string, 'cep', row)
              }}
            /></td>
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
