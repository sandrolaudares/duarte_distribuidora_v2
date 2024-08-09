<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import Cardapio from '$components/Cardapio.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import type { SelectAddress } from '$lib/server/db/schema'

  export let addresses: SelectAddress[] = []

  // TODO: selecionar endereço do cliente
  // TODO: Colocar um input para buscar
  export let selectedAddress: (address: SelectAddress) => void
</script>

<Modal title="Clientes">
  <div class="my-4 flex flex-col gap-4">

    {#each addresses as addres}
      {addres.cep} -
      {addres.city}
      <button
      class="btn btn-primary"
        on:click={() => {
          selectedAddress(addres)
        }}
      >
        selecione
      </button>
    {/each}
    <!-- <button
        class="btn btn-primary"
        on:click={() => {
          selectedAddress(cliente)
          modal.close()
        }}
      >
        Selecionar
      </button> -->
  </div>
</Modal>
