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
  import NoResults from '$lib/components/NoResults.svelte'
  import DateFilter from '$lib/components/DateFilter.svelte'
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'
  import { DateFormatter } from '@internationalized/date'
  import { pageConfig } from '$lib/config'
  import LoadingBackground from '$lib/components/datatable/LoadingBackground.svelte'

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
      await filters.fromState(s)
      s.setTotalRows(data.count)
    } catch (error) {
      console.error(error)
    }
    return data.rows
  })

  const df = new DateFormatter('pt-BR', {
    dateStyle: 'medium',
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

  async function handleUpdateSku(value: string, key = '', row: any) {
    const last_val = row[key]
    try {
      await trpc($page).stock.updateSku.mutate({
        sku: row.sku,
        data: { name: value },
      })
      row[key] = value
      toast.success('Atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar')
      row[key] = last_val
    }
  }
</script>

<main class="m-4 h-full max-h-[calc(100vh-20vh)]">
  <div class="mb-2 flex items-center justify-between">
    <h1 class="text-2xl font-semibold">Estoque:</h1>
    <div>
      <button class="btn btn-primary" onclick={add}>Criar SKU</button>
      <a href="/admin/stock/entrada" class="btn btn-secondary">
        Entrada de estoque
      </a>
    </div>
  </div>
  <Datatable {table} >
    <!-- {#snippet header()}
      <Search {table} />
     
    {/snippet} -->
    {#if table.isLoading}
      <LoadingBackground />
    {/if}
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
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row (row.sku)}
          <tr>
            <td>{row.sku}</td>
            <td>
              <EditableCell
                value={row.name}
                onUpdateValue={async (newValue) => {
                  handleUpdateSku(newValue as string, 'name', row)
                }}
              />
            </td>
            <td>{row.quantity}</td>
            <td>{df.format(row.created_at!) ?? ''}</td>
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
