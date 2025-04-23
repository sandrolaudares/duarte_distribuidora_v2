<script lang="ts">
  import { CreditCard, MapPin, Truck, DollarSign } from 'lucide-svelte'
  import CurrencyInput from '../input/CurrencyInput.svelte'
  import type { SelectCustomer } from '$lib/server/db/schema'
  import { formatCurrency } from '$lib/utils'
  import { getCartContext } from '../../state/contextCashier/cartContext.svelte'
  import type { Snippet } from 'svelte'

  const cart = getCartContext()

  type Props = {
    desvincular: () => void
    distance: number
    isLoading: boolean
    children:Snippet
  }

  let { desvincular, distance, isLoading,children }: Props = $props()

  const formattedAddress = $derived.by(()=>{

    if(cart.meta.enderecoSelecionado) {
      return [
        cart.meta.enderecoSelecionado.cep
          ? `${cart.meta.enderecoSelecionado.cep}`
          : '',
        cart.meta.enderecoSelecionado.city,
        cart.meta.enderecoSelecionado.neighborhood,
        cart.meta.enderecoSelecionado.street,
        cart.meta.enderecoSelecionado.number,
        cart.meta.enderecoSelecionado.state,
      ]
        .filter(Boolean)
        .join(', ')
    } else {
      return null
    }
  })
</script>

<div class="w-full max-w-md overflow-hidden rounded-lg bg-base-200 shadow-lg">
  <div class="px-6 py-4">
    {#if cart.meta.clienteSelecionado}
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-start flex-col">
        <h2 class="text-xl font-bold">{cart.meta.clienteSelecionado.name}</h2>
        <h2>{cart.meta.clienteSelecionado.email}</h2>
      </div>
      <button class="btn btn-primary btn-sm" onclick={desvincular}>
        Desvincular
      </button>
    </div>
    {/if}
    <div class="space-y-4">
      <div class="flex items-center space-x-4 text-sm">
        <CreditCard class="h-4 w-4" />
        <span class="font-medium">Créditos disponiveis:</span>
        {@render children()}
      </div>
      {#if formattedAddress !==null}
      <div class="flex items-start space-x-4 text-sm">
        <MapPin class="mt-0.5 h-4 w-4" />
          <div class="">
            <span class="font-medium">Endereço:</span>
            <p class="">{formattedAddress}</p>
          </div>
        </div>
        {/if}
      {#if distance}
        <div class="flex items-center space-x-4 text-sm">
          <Truck class="h-4 w-4" />
          <span class="font-medium">Distancia:</span>
          <span>{(distance / 1000).toFixed(2)}Km</span>
        </div>
      {/if}
      {#if isLoading === true}
        Taxa de entrega carregando...
      {:else if cart.meta.taxaEntrega !== null}
        <div class="flex items-center space-x-4 text-sm">
          <DollarSign class="h-4 w-4" />
          <span class="font-medium">Taxa de entrega:</span>
          <span>{formatCurrency(cart.meta.taxaEntrega)}</span>
        </div>
        <div class="space-y-2">
          <label for="manual-fee" class="block text-sm font-medium">
            Ajuste a taxa de entrega
          </label>
          <CurrencyInput bind:value={cart.meta.taxaEntrega} />
        </div>
      {/if}
    </div>
  </div>
</div>
