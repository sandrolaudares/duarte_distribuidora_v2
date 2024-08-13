<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import Cardapio from '$components/Cardapio.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import { toast } from 'svelte-sonner'
  import Loading from '$lib/components/Loading.svelte'

  type Distrib = RouterOutputs['distribuidora']['getDistribuidoras']

  let isLoading = true

  let suppliers: Distrib = []
  onMount(async () => {
    suppliers = await trpc($page).distribuidora.getDistribuidoras.query()
    isLoading = false
  })

  export let select: (client: Distrib[0]) => void
</script>

<Modal title="Selecione Distribuidora">
  <div class="flex flex-col gap-4">
    {#if isLoading}
      <div class="flex items-center justify-center">
        <Loading />
      </div>
    {/if}
    {#each suppliers as cliente}
      <div class="flex items-center justify-between">
        <div>
          <p class="font-bold">{cliente.name}</p>
        </div>
        <button
          class="btn btn-primary"
          on:click={() => select(cliente)}
        >
          Selecionar
        </button>
      </div>
    {/each}
  </div>
</Modal>
