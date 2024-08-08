<script lang="ts">
  import type { PageData } from './$types'

  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import { toast } from 'svelte-sonner'

  import type { SelectSku, SelectDistribuidora } from '$db/schema'

  import type { RouterOutputs } from '$trpc/router'
  export let data: PageData

  let selectedSupplier: RouterOutputs['stock']['getSupplier'][0] | null = null

  let selectedDistribuidora: SelectDistribuidora | null = null

  import { modal } from '$lib/components/modal'
  import ModalSupplier from './ModalSupplier.svelte'
  import ModalDistribuidora from './ModalDistribuidora.svelte'

  function openModalSupplier() {
    modal.open(ModalSupplier, {
      selectedSupplier: supplier => {
        selectedSupplier = supplier
        modal.close()
      },
    })
  }
  function openModalDistribuidora() {
    modal.open(ModalDistribuidora, {
      select: distribuidora => {
        selectedDistribuidora = distribuidora
        modal.close()
      },
    })
  }

  let produtosEntrada: Record<
    SelectSku['id'],
    {
      sku: SelectSku
      quantity: number
      cost_price: number
    }
  > = {}

  async function entradaEstoque() {
    if (!selectedDistribuidora) {
      return toast.error('Selecione uma distribuidora')
    }

    if (Object.keys(produtosEntrada).length === 0) {
      return toast.error('Adicione produtos para entrada')
    }

    try {
      await trpc($page).stock.entradaEstoque.mutate({
        distribuidora_id: selectedDistribuidora.id,
        sku_items: Object.values(produtosEntrada).map(item => ({
          sku_id: item.sku.id,
          quantity: item.quantity,
        })),
      })

      toast.success('Entrada de estoque realizada com sucesso!')
    } catch (error) {
      toast.error('Erro ao realizar entrada de estoque')
    }
  }

  function addSku(sku: SelectSku, quantity: number) {
    if (produtosEntrada[sku.id]) {
      produtosEntrada[sku.id].quantity += quantity
    } else {
      produtosEntrada[sku.id] = {
        sku,
        quantity,
        cost_price: 0,
      }
    }
  }

  function setSku(sku: SelectSku, quantity: number) {
    produtosEntrada[sku.id] = {
      sku,
      quantity,
      cost_price: 0,
    }
  }

  function removeSku(sku: SelectSku) {
    delete produtosEntrada[sku.id]
  }
</script>

<div class="mx-auto p-3">
  <div class="mb-4 flex justify-end gap-2">
    <input type="text" placeholder="Nota Fiscal" class="input input-bordered" />
    <div>
      {#if selectedSupplier}
        <p class="rounded-lg bg-base-300 p-3 shadow-md">
          {selectedSupplier.name}
        </p>
      {:else}
        <button class="btn btn-primary w-full" on:click={openModalSupplier}>
          Selecionar fornecedor
        </button>
      {/if}
    </div>

    <div>
      {#if selectedDistribuidora}
        <p class="rounded-lg bg-base-300 p-3 shadow-md">
          {selectedDistribuidora.name}
        </p>
      {:else}
        <button
          class="btn btn-primary w-full"
          on:click={openModalDistribuidora}
        >
          Selecionar distribuidora
        </button>
      {/if}
    </div>
  </div>

  <div class="mb-6 grid grid-cols-6 gap-3">
    {#each data.skus as item}
      <div
        class="flex flex-col items-start rounded-lg bg-base-200 p-4 shadow-md"
      >
        <span class="font-semibold">{item.name}</span>

        <input
          type="number"
          class="input input-primary mt-2 w-full"
          on:input={e =>
            setSku(item, Number((e.target as HTMLInputElement).value))}
        />
        <button
          class="btn btn-primary mt-2 w-full"
          on:click={() => addSku(item, 1)}
        >
          Adicionar
        </button>
      </div>
    {/each}
  </div>

  <h1 class="mb-4 text-xl font-bold">Produtos de entrada</h1>

  <div class="grid grid-cols-4 gap-4">
    {#each Object.values(produtosEntrada) as item}
      <div class="flex flex-col rounded-lg bg-base-200 p-4 shadow-md">
        <div class="flex justify-between">
          <p>{item.sku.name}</p>
          <p class="font-semibold">Quantidade: {item.quantity}</p>
        </div>
        <div class="flex w-full flex-col gap-2">
          <input
            type="number"
            class="input input-primary mt-2 w-full"
            placeholder="Preço de custo"
            bind:value={produtosEntrada[item.sku.id].cost_price}
          />
          <button
            class="btn btn-error w-full"
            on:click={() => removeSku(item.sku)}
          >
            Remover
          </button>
        </div>
      </div>
    {/each}
  </div>

  <div class="flex justify-center">
    <button class="btn btn-success mt-6 w-96" on:click={entradaEstoque}>
      Entrada estoque
    </button>
  </div>
</div>
