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
  import CurrencyInput from '$lib/components/input/CurrencyInput.svelte'

  let isLoading = false

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
      isLoading = true
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
    isLoading = false
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
    if (quantity === 0) {
      removeSku(sku)
      return
    }

    produtosEntrada[sku.id] = {
      sku,
      quantity,
      cost_price: 0,
    }
  }

  function removeSku(sku: SelectSku) {
    delete produtosEntrada[sku.id]
    produtosEntrada = produtosEntrada
  }
</script>

<div class="mx-auto p-3">
  <div class="mb-4 flex justify-end gap-2">
    <input type="text" placeholder="Nota Fiscal" class="input input-bordered" />
    <div>
      {#if selectedSupplier}
        <button class="rounded-lg bg-base-300 p-3 shadow-md" on:click={openModalSupplier}>
          {selectedSupplier.name}
        </button>
      {:else}
        <button class="btn btn-primary w-full" on:click={openModalSupplier}>
          Selecionar fornecedor
        </button>
      {/if}
    </div>

    <div>
      {#if selectedDistribuidora}
        <button class="rounded-lg bg-base-300 p-3 shadow-md" on:click={openModalDistribuidora}>
          {selectedDistribuidora.name}
        </button>
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
          placeholder="Quantidade"
          
          on:input={e =>
            setSku(item, Number((e.target as HTMLInputElement).value))}
        />
        <!-- <button
          class="btn btn-primary mt-2 w-full"
          on:click={() => addSku(item, 1)}
        >
          Adicionar
        </button> -->
      </div>
    {/each}
  </div>

  <h1 class="mb-4 text-xl font-bold">Produtos de entrada</h1>

  <div class="grid grid-cols-4 gap-4">
    {#each Object.values(produtosEntrada) as item}
      <div class="flex flex-col rounded-lg bg-base-200 p-4 shadow-md">
        <div class="flex w-full flex-col">
          <div class="label text-xl">
            <p class="label-text font-bold">{item.sku.name}</p>
            <p class="label-text">Quantidade: {item.quantity}</p>
          </div>
          <CurrencyInput bind:value={produtosEntrada[item.sku.id].cost_price} />
          <div class="label">
            <span class="label-text-alt">(Preco de custo)</span>
          </div>
          <button
            class="btn btn-error w-full"
            on:click={() => removeSku(item.sku)}
          >
            <!--TODO: Ta demorando muito pra remover por algum motivo-->
            Remover
          </button>
        </div>
      </div>
    {/each}
  </div>

  <div class="flex justify-center">
    <button
      class="btn btn-success mt-6 w-96"
      on:click={entradaEstoque}
      disabled={isLoading}
    >
      {#if isLoading}
        Loading...
      {:else}
        Entrada estoque
      {/if}
    </button>
  </div>
</div>
