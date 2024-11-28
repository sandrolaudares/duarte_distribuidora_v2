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
  import type { ActionResult } from '@sveltejs/kit';
  import { invalidateAll, goto } from '$app/navigation';
	import { applyAction, deserialize } from '$app/forms'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let solicitacoes = data.solicitacoes
  let distribuidoras = data.distribuidoras

  const table = new TableHandler(solicitacoes, {
    rowsPerPage: solicitacoes.length,
    selectBy: 'id',
  })

  let isLoading = $state(false)

  let activeDist = $state(distribuidoras[0].subdomain)

  let isOpenModal: HTMLDialogElement | null = null

  let selectedRows = $derived(selectRows())

  function selectRows() {
    return table.rows.filter(row => table.selected.includes(row.id))
  }

  async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement}) {
  //   if (!selectedRows || selectedRows.length === 0) {
  //   toast.error("Nenhuma selecionada");
  //   return
  // }

  try {
    for (const row of selectedRows) {
      const data = new FormData(event.currentTarget)
      const formData = new FormData();
      formData.set("id", String(row.id));

      const response = await fetch(event.currentTarget.action, {
        method: "POST",
        body: formData,
        headers: {
          "x-sveltekit-action": "true",
        },
      });

      const result: ActionResult = deserialize(await response.text())
      console.log(result)

      if (!response.ok || result.type !== "success") {
        toast.error(`Failed to send row ID: ${row.id}`);
        console.error(`Failed to send row ID: ${row.id}`)
      } else {
        toast.success(`Row ID ${row.id} sent successfully!`);
        console.log(`Row ID ${row.id} sent successfully!`)
      }
    }
    await invalidateAll(); // Refresh data on success
  } catch (error) {
    console.error(error);
    toast.error("An error occurred while sending data.");
  // }

	// 	const data = new FormData(event.currentTarget);
    

	// 	const response = await fetch(event.currentTarget.action, {
	// 		method: 'POST',
	// 		body: data,
  //     headers: {
  //       'x-sveltekit-action': 'true'
  //     }
	// 	});

	// 	const result: ActionResult = deserialize(await response.text());

	// 	if (result.type === 'success') {
	// 		// rerun all `load` functions, following the successful update
	// 		await invalidateAll()
	// 	}

	// 	applyAction(result);
	}
}
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
        {#each distribuidoras as distribuidora}
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
    {#each distribuidoras as distribuidora}
      <Tabs.Content
        value={distribuidora.subdomain}
        class="border-none p-0 outline-none"
      >
        <div class="my-3 flex items-center justify-between">
          <h2 class="text-xl">
            Solicitações de <strong>{distribuidora.name}</strong>
          </h2>
          <button onclick={() => isOpenModal?.showModal()} class="btn">
            Transferir
          </button>
        </div>
        <Datatable {table} headless>
          <table class="table table-zebra">
            <thead>
              <tr>
                <Th></Th>
                <ThSort {table} field="sku">SKU</ThSort>
                <Th>Produto</Th>
                <ThSort {table} field="quantity">Quantidade</ThSort>
                <Th>Saindo de</Th>
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
                <Th>
                  <!-- <select name="" id="" class="select select-bordered">
                        {#each distribuidoras.filter(s=>s.tenantId != distribuidora.tenantId) as dis}
                        <option value="">{dis.name}</option>
                        {/each}
                      </select> -->
                </Th>
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
                  <td>A definir</td>
                  <td>
                    <form
                      action="?/refuse"
                      method="post"
                      use:enhance={({ formData }) => {
                        isLoading = true
                        formData.set('id', String(row.id))
                        return async ({ update, result }) => {
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
        {#if solicitacoes.filter(s => s.toTenantId === distribuidora.tenantId).length === 0}
          <NoResults />
        {/if}
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</main>

<dialog class="modal" bind:this={isOpenModal}>
  <div class="modal-box max-w-4xl">
    <h3 class="text-lg font-bold">Produtos selecionados</h3>
    <select name="" id="" class="select select-bordered">
      {#each distribuidoras.filter(s => s.subdomain != activeDist) as dis}
        <option value="">{dis.name}</option>
      {/each}
    </select>
    <table class="table table-zebra">
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
            <td>remover</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <form method="POST" onsubmit={handleSubmit} action="?/send" use:enhance={({formData})=>{
    }} >
      <button class="btn" type="submit">ENVIAR</button>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
