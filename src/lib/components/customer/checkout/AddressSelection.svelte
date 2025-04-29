<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import * as RadioGroup from '$lib/components/ui/radio-group/index'
  import { Label } from '$lib/components/ui/label'
  import { PlusIcon, BlindsIcon, MapPinHouse } from 'lucide-svelte'
  import type { SelectAddress } from '$lib/server/db/schema'
  import { onMount } from 'svelte'
  import AddAdress from '$lib/components/AddAdress.svelte'
  import { getCartContext } from '../../../state/contextCustomerOrder/cartContext'
  import { formatAddress, getDistance } from '$lib/utils/distance'
  import type { SelectTenant } from '$lib/server/db/central/schema'
  import { toast } from 'svelte-sonner'
  import Loading from '$lib/components/Loading.svelte'

  const cart = getCartContext()

  type Props = {
    onConfirm: () => void
    addresses: SelectAddress[]
    customer_id: number
    tenant: SelectTenant
  }

  let { onConfirm, addresses, customer_id,tenant }: Props = $props()

  let isOpenModal:HTMLDialogElement | null = $state(null)
  let isLoading = $state(false)

</script>

<dialog class="modal" bind:this={isOpenModal}>
	<div class="modal-box max-w-2xl max-h-[90vh]">
	  <AddAdress {customer_id} invalidate={(newAddress)=>{
      addresses = [...addresses, newAddress]
      cart.meta.enderecoSelecionado = newAddress
      cart.meta.taxaEntrega = cart.meta.enderecoSelecionado?.distance ?? 0
      isOpenModal?.close()
	  }} />
	</div>
	<form method="dialog" class="modal-backdrop">
	  <button>close</button>
	</form>
  </dialog>

<div class="space-y-6">
  <div class="space-y-4">
    {#if addresses.length === 0}
      <div
        class="flex flex-col items-center space-x-4 rounded-lg border p-4 lg:flex-row"
      >
        <BlindsIcon class="h-4 w-4" />
        <span class="font-medium">Nenhum endereço encontrado</span>
        <p class="text-sm text-gray-600">Por favor adicione um novo endereço</p>
      </div>
    {:else}
      <RadioGroup.Root value={String(cart.meta.enderecoSelecionado?.id ?? undefined) } 
      onValueChange={async(value) => {
        isLoading = true
        cart.meta.taxaEntrega = undefined
        cart.meta.enderecoSelecionado = addresses.find((address) => address.id === Number(value)) ?? cart.meta.enderecoSelecionado
       try {
         cart.meta.taxaEntrega = await getDistance(cart.meta.enderecoSelecionado, tenant.taxa_por_km ?? 0)
       } catch (error: unknown) {
        cart.meta.taxaEntrega = 0
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao calcular a distância';
        toast.error(errorMessage);
       } finally{
          isLoading = false
       }
      }}>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {#each addresses as address,index (address.id)}
          <div class="flex items-center space-x-4 rounded-lg border p-4">
            <RadioGroup.Item value={String(address.id)} id={String(address.id)} />
            <Label for={String(address.id)} class="flex-1 cursor-pointer">
              <div class="flex items-center gap-2">
                <MapPinHouse class="h-4 w-4" />
                <span class="font-medium">{index + 1}º Endereço</span>
              </div>
              <p class="text-sm text-gray-600">{formatAddress(address)}</p>
            </Label>
          </div>
        {/each}
      </div>
      </RadioGroup.Root>
    {/if}
  </div>

  <div class="flex items-center gap-4">
    <button
      class="flex items-center gap-2 btn btn-outline"
      onclick={()=>isOpenModal?.showModal()}
    >
      <PlusIcon class="h-4 w-4" />
      Adicionar novo endereço
    </button>
    <button class="flex-1 items-center justify-center btn btn-primary" onclick={onConfirm} disabled={cart.meta.enderecoSelecionado === undefined || isLoading}>
      <span>
        {#if !isLoading}
        Continuar para o pagamento
        {:else}
        <Loading/>
        {/if}
      </span>
    </button>
  </div>
</div>
