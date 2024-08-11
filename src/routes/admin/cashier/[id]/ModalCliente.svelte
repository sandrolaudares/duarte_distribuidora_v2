<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import Cardapio from '$components/Cardapio.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import ModalEndereco from './ModalEndereco.svelte'
  import Loading from '$lib/components/Loading.svelte'

  type Clientes = RouterOutputs['customer']['getCustomers']

  let isLoading = true

  let clientes: Clientes = []
  onMount(async () => {
    clientes = await trpc($page).customer.getCustomers.query()
    console.log(clientes);
    
    isLoading = false
  })

  // TODO: Colocar um input para buscar
  export let selectedClient: (client: Clientes[0]) => void
</script>

<Modal title="Clientes">
  <div class="my-4 flex flex-col gap-4">
    {#if isLoading}
    <div class="flex justify-center items-center">
      <Loading/>
    </div>
    {/if}
    {#each clientes as cliente}
      <div class="flex items-center justify-between">
        <div>
          <p class="font-bold">{cliente.name}</p>
          <p>{cliente.phone}</p>
        </div>

        <button
          class="btn btn-primary"
          on:click={() => {
            selectedClient(cliente) 
          }}
        >

          Selecionar
        </button>
      </div>
    {/each}
  </div>
</Modal>
