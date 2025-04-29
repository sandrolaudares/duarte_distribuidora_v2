<script lang="ts" generics="T">
  import { Modal } from '$lib/components/modal'
  import { modal } from '$lib/components/modal'
  import Cardapio from '$components/Cardapio.svelte'
  import { onMount } from 'svelte'
  import { trpc } from '$trpc/client'
  import { page } from '$app/stores'

  import type { RouterOutputs } from '$trpc/router'
  import type { SelectAddress } from '$lib/server/db/schema'
  import AddAdress from '$lib/components/AddAdress.svelte'
  import * as Alert from '$lib/components/ui/alert/index'
  import Loading from '../Loading.svelte'
  import { MapPinned } from 'lucide-svelte'
  import { formatAddress } from '$lib/utils/distance'

  export let addresses: SelectAddress[] = []
  export let selectedAddress: (address: SelectAddress) => void
  export let customer_id = 0

  function handleAddressAdded(newAddress:SelectAddress) {
    addresses = [...addresses, newAddress];
    criarEndereco=false
  }

  export let criarEndereco = false
  let isLoading = false
</script>

<Modal title="Enderecos">
  <div class="my-4 flex flex-col gap-4">
    {#if criarEndereco === true}
       <AddAdress customer_id={customer_id} invalidate={(newAddress)=>handleAddressAdded(newAddress)}/>
       {:else}

       <Alert.Root
            variant="secondary"
            class="border-secondary/30 bg-secondary/10"
          >
          <Alert.Description class="flex justify-start items-center gap-2">
              <MapPinned class="h-4 w-4" />
              <p>
                Adicionar um novo endereço para esse cliente?
              </p>

              <div class="flex items-center gap-2">
               <button class="btn btn-sm btn-secondary text-white" disabled={isLoading} on:click={()=> criarEndereco=true}>
                {#if isLoading}
                  <Loading/>
                {:else}
                Adicionar
                {/if}
               </button>
              </div>
            </Alert.Description>
          </Alert.Root>
    {/if}
    {#if addresses.length>0}
      {#each addresses as addres}
        <div
          class="flex flex-col gap-3 rounded-box bg-base-200 p-4 text-center"
        >
          {formatAddress(addres)}
          <button
            class="btn btn-primary"
            on:click={() => {
              selectedAddress(addres)
              modal.close()
            }}
          >
            selecione
          </button>
        </div>
      {/each}
    {:else}
      <h1 class="m-6 text-center">Nenhum endereco registrado para esse cliente</h1>
    {/if}
  </div>
</Modal>
