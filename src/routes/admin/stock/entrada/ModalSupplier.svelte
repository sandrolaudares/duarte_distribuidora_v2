<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import Cardapio from '$components/Cardapio.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'

  type Supplier = RouterOutputs['stock']['getSupplier']

  let suppliers: Supplier = []
  onMount(async () => {
    suppliers = await trpc($page).stock.getSupplier.query()
  })

  export let selectedSupplier: (client: Supplier[0]) => void

  let name_new_supplier: string = ''
  async function createSupplier() {
    if (!name_new_supplier) {
      return toast.error('Nome do fornecedor não pode ser vazio!')
    }
    try {
      const [resp] = await trpc($page).stock.insertSupplier.mutate({
        name: name_new_supplier,
      })

      suppliers = [...suppliers, resp]
    } catch (error) {
      toast.error('Erro ao criar fornecedor!')
    }
  }
</script>

<Modal title="Clientes">
  <div class="flex flex-col gap-4">
    {#each suppliers as cliente}
      <div class="flex items-center justify-between">
        <div>
          <p class="font-bold">{cliente.name}</p>
        </div>
        <button
          class="btn btn-primary"
          on:click={() => selectedSupplier(cliente)}
        >
          Selecionar
        </button>
      </div>
    {/each}

    <input
      type="text"
      bind:value={name_new_supplier}
      placeholder="Nome novo fornecedor"
    />

    {#if name_new_supplier}
      <button class="btn btn-primary" on:click={createSupplier}>
        Criar fornecedor
      </button>
    {/if}
  </div>
</Modal>
