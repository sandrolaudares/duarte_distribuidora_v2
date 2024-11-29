<script lang="ts">
  import type { ActionData, PageData } from './$types'
  import * as Tabs from '$lib/components/ui/tabs/index.js'
  import { Button } from '$lib/components/ui/button/index.js'
  import Separator from '$lib/components/ui/separator/separator.svelte'
  import { TableHandler, Th, ThFilter, ThSort } from '@vincjo/datatables'
  import {
    Datatable,
    Search,
    RowsPerPage,
    RowCount,
    Pagination,
  } from '@vincjo/datatables'
  import NoResults from '$lib/components/NoResults.svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'
  import type { SelectStockTransference } from '$lib/server/db/central/schema'
  import { enhance } from '$app/forms'
  import { toast } from 'svelte-sonner'
  import EditableCell from '$lib/components/editableCells/EditableCell.svelte'
  import type { ActionResult } from '@sveltejs/kit'
  import { invalidateAll, goto } from '$app/navigation'
  import { applyAction, deserialize } from '$app/forms'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  const table = new TableHandler(data.solicitacoes, {
    rowsPerPage: data.solicitacoes.length,
    selectBy: 'id',
  })

  let isLoading = $state(false)

  let activeDist = $state(data.distribuidoras[0].subdomain)

  let isOpenModal: HTMLDialogElement | null = null

  let selectedRows = $derived(selectRows())

  function selectRows() {
    return table.rows.filter(row => table.selected.includes(row.id))
  }

  let fromTenant = $state(0)

  type update = (options?: {
    reset?: boolean
    invalidateAll?: boolean
  }) => Promise<void>

  async function handleRefuse(
    update: update,
    result: ActionResult,
    row: SelectStockTransference,
  ) {
    await update()
    isLoading = false
    console.log(result)
    if (result.type === 'success') {
      toast.success(`Sucesso ao remover ${row.sku_name}`)
      await invalidateAll()
    } else {
      toast.error(`Erro ao remover ${row.sku_name}`)
    }
  }

  async function handleSubmit() {
    try {
      for (const row of selectedRows) {
        const formData = new FormData()
        formData.set('id', String(row.id))
        formData.set('fromId', String(fromTenant))

        const response = await fetch('/transferir?/send', {
          method: 'POST',
          body: formData,
          headers: {
            'x-sveltekit-action': 'true',
          },
        })

        const result: ActionResult = deserialize(await response.text())

        if (!response.ok || result.type !== 'success') {
          toast.error(`Falha ao transferir ${row.sku_name}`)
        } else {
          toast.success(`Sucesso ao transferir ${row.sku_name}`)
          isOpenModal?.close()
        }
      }
      await invalidateAll()
    } catch (error) {
      console.error(error)
      toast.error('Erro')
    }
  }

  $effect(() => {
    table.setRows(data.solicitacoes)
  })
</script>

<main class="container mx-auto mt-10">
  <Tabs.Root
    value={activeDist}
    onValueChange={v => {
      activeDist = v
    }}
    class="h-full space-y-6"
  >
    <div class="flex items-center justify-center">
      <Tabs.List>
        {#each data.distribuidoras as distribuidora}
          <Tabs.Trigger
            value={distribuidora.subdomain}
            class="relative"
            disabled={selectedRows.length > 0}
          >
            {distribuidora.name}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
    </div>
    {#each data.distribuidoras as distribuidora}
      <Tabs.Content
        value={distribuidora.subdomain}
        class="border-none p-0 outline-none"
      >
        <div class="my-3 flex items-center justify-between">
          <h2 class="text-xl">
            Solicitações de <strong>{distribuidora.name}</strong>
          </h2>
          <button
            onclick={() => isOpenModal?.showModal()}
            class="btn"
            disabled={selectedRows.length === 0}
          >
            Transferir
          </button>
        </div>
        <Datatable {table} headless>
          <table class="table table-zebra rounded border">
            <thead>
              <tr>
                <Th></Th>
                <ThSort {table} field="sku">SKU</ThSort>
                <Th>Produto</Th>
                <ThSort {table} field="quantity">Quantidade</ThSort>
                <Th>Deletar</Th>
              </tr>
              <tr>
                <Th>
                  {#if table.rows.filter(s => s.toTenantId === distribuidora.tenantId).length > 0}
                    <input
                      type="checkbox"
                      checked={table.isAllSelected}
                      onclick={() => table.selectAll()}
                    />
                  {/if}
                </Th>
                <ThFilter {table} field="sku_name" />
                <Th />
                <Th></Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {#each table.rows.filter(s => s.toTenantId === distribuidora.tenantId) as row}
                <tr class:active={table.selected.includes(row.id)}>
                  <td>
                    <input
                      type="checkbox"
                      checked={table.selected.includes(row.id)}
                      onclick={() => table.select(row.id)}
                    />
                  </td>
                  <td>{row.sku}</td>

                  <td>{row.sku_name}</td>
                  <td>
                    <EditableCell
                      value={row.quantity}
                      onUpdateValue={async newValue => {}}
                    />
                  </td>
                  <td>
                    <form
                      action="?/refuse"
                      method="post"
                      use:enhance={({ formData }) => {
                        isLoading = true
                        formData.set('id', String(row.id))
                        return async ({ update, result,  }) => {
                          handleRefuse(update, result, row)
                        }
                      }}
                    >
                      <button
                        class="badge link badge-error bg-opacity-30"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Tirando...' : 'Cancelar'}
                      </button>
                    </form>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </Datatable>
        {#if data.solicitacoes.filter(s => s.toTenantId === distribuidora.tenantId).length === 0}
          <NoResults />
        {/if}
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</main>

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-lg font-bold">Produtos selecionados:</h3>
      <div class="flex items-center gap-2">
        <h1>Selecione distribuidora de onde produtos vão sair:</h1>
        <select
          name=""
          id=""
          class="select select-bordered"
          bind:value={fromTenant}
        >
          {#each data.distribuidoras.filter(s => s.subdomain != activeDist) as dis}
            <option value={dis.tenantId}>{dis.name}</option>
          {/each}
        </select>
      </div>
    </div>
    <table class="table table-zebra mb-3 border">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Produto</th>
          <th>Quantidade</th>
        </tr>
      </thead>
      <tbody>
        {#each selectedRows as row}
          <tr>
            <td>{row.sku}</td>
            <td>{row.sku_name}</td>
            <td>{row.quantity}</td>
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
        onclick={handleSubmit}
      >
        ENVIAR
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
