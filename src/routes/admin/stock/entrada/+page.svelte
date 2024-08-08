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

<input type="text" placeholder="Nota Fiscal" />
<div>
  {#if selectedSupplier}
    <pre>
  {JSON.stringify(selectedSupplier)}
</pre>
  {:else}
    <button class="btn btn-primary" on:click={openModalSupplier}>
      Selecionar fornecedor
    </button>
  {/if}
</div>

{#if selectedDistribuidora}
  <pre>
  {JSON.stringify(selectedDistribuidora)}
</pre>
{:else}
  <button class="btn btn-primary" on:click={openModalDistribuidora}>
    Selecionar distribuidora
  </button>
{/if}

<div class="flex gap-3">
  {#each data.skus as item}
    <div class="bg-base-100">
      {item.name}

      <input
        type="number"
        class="input input-primary"
        on:input={e =>
          setSku(item, Number((e.target as HTMLInputElement).value))}
      />
      <button class="btn" on:click={() => addSku(item, 1)}>Adicionar</button>
    </div>
  {/each}
</div>

<h1>Produtos de entrada</h1>
<div>
  {#each Object.values(produtosEntrada) as item}
    <div class="bg-base-100">
      {item.sku.name} - {item.quantity}
      <button class="btn" on:click={() => removeSku(item.sku)}>Remover</button>

      <input
        class="input input-primary"
        type="number"
        placeholder="Preço de custo"
        bind:value={produtosEntrada[item.sku.id].cost_price}
      />
    </div>
  {/each}
</div>

<button class="btn btn-secondary" on:click={entradaEstoque}>
  Entrada estoque
</button>
