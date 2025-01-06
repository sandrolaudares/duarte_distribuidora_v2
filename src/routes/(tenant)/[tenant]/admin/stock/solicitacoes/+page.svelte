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

  let selectedRows = $derived(selectRows())

  function selectRows() {
    return table.rows.filter(row => table.selected.includes(row.id))
  }
  let isLoading = $state(false)
  async function handleComplete() {
    isLoading = true
    try {
      for (const row of selectedRows) {
        const resp = await trpc(
          $page,
        ).distribuidora.completeTransference.mutate(row.id)
        toast.success(resp)
      }
      invalidateAll()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      isLoading = false
      isOpenModal?.close()
    }
  }
</script>

{#if isLoading}
  <div class="absolute left-1/2 top-1/2 z-50">
    <Loading />
  </div>
{/if}

<main class="container mx-auto h-full max-h-[calc(100vh-20vh)]">
  <div class="flex items-center justify-between">
    <h1 class="my-5 text-center text-2xl font-medium">
      Solicitações de transferencia:
    </h1>
    <button
      onclick={() => isOpenModal?.showModal()}
      class="btn btn-primary"
      disabled={selectedRows.length === 0}
    >
      Aceitar transferencia
    </button>
  </div>
  <Datatable {table} headless>
    <!-- svelte-ignore component_name_lowercase -->
    <table class="table table-zebra rounded-none border">
      <thead>
        <tr>
          <Th></Th>
          <ThSort {table} field="id">ID</ThSort>
          <Th>Produto</Th>
          <Th>Indo para</Th>
          <Th>Quantidade</Th>
          <Th>Data</Th>
        </tr>
        <tr>
          <Th>
            <input
              type="checkbox"
              checked={table.isAllSelected}
              onclick={() => table.selectAll()}
            />
          </Th>
          <Th />
          <ThFilter {table} field="sku_name" />
          <Th />
          <Th />
          <Th />
        </tr>
      </thead>
      <tbody>
        {#each data.rows as row}
          <tr class:active={table.selected.includes(row.id)}>
            <td>
              <input
                type="checkbox"
                checked={table.selected.includes(row.id)}
                onclick={() => table.select(row.id)}
              />
            </td>
            <td>{row.id}</td>
            <td>{row.sku_name}</td>
            <td>
              {data.distribuidoras.find(
                distribuidora => distribuidora.tenantId === row.toTenantId,
              )?.name}
            </td>
            <td>{row.quantity}</td>
            <td>{format(row.created_at!, 'dd/MM/yyyy')}</td>
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

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-bold">Produtos selecionados:</h3>
    </div>
    <table class="table table-zebra mb-3 max-h-[50vh] overflow-auto border">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Produto</th>
          <th>Quantidade</th>
          <th>Indo para</th>
        </tr>
      </thead>
      <tbody>
        {#each selectedRows as row}
          <tr>
            <td>{row.sku}</td>
            <td>{row.sku_name}</td>
            <td>{row.quantity}</td>
            <td>
              {data.distribuidoras.find(
                distribuidora => distribuidora.tenantId === row.toTenantId,
              )?.name}
            </td>
            <td>
              <button
                class="btn btn-primary btn-sm"
                onclick={() => {
                  if (selectedRows.length <= 1) {
                    isOpenModal?.close()
                  }
                  table.select(row.id)
                  console.log(selectedRows)
                }}
              >
                Remover
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div>
      <button
        class="btn btn-primary w-full"
        type="submit"
        disabled={selectRows.length === 0 && isLoading}
        onclick={handleComplete}
      >
        {isLoading ? 'Aceitando transferencia...' : 'Confirmar transferencia'}
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<style>
  thead {
    background-color: oklch(var(--b1)) !important;
  }
</style>
